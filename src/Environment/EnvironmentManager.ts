import Debug from 'debug';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Schema } from 'yup';
import {
  schema as defaultSchema,
  SchemaType as DefaultSchemaType,
} from './schema';

const debug = Debug('tq:cli:EnvironmentManager');
const defaultPath = path.resolve(process.cwd(), '.testquality');

export class EnvironmentManager<T> {
  private envPath: string;
  private envSchema: Schema<any>;
  private schemaDefaults: Record<string, any>;
  public env: T;

  constructor(envSchema: Schema<any>, envPath: string) {
    // Define the path to the config file
    this.envPath = envPath;
    
    // Define schema
    this.envSchema = envSchema;
    
    // Extract default values
    this.schemaDefaults = this.extractDefaultsFromSchema(this.envSchema);
    
    // Load environment variables
    this.loadEnvFile();
    
    // Build and validate environment object
    const envObject = this.buildEnvObject();
    debug('Loaded environment variables:', envObject);

    this.env = this.envSchema.validateSync(envObject);
  }

  /**
   * Load environment variables from .testquality file if it exists
   */
  private loadEnvFile(): void {
    if (fs.existsSync(this.envPath)) {
      const envFile = dotenv.config({ path: this.envPath });
      if (envFile.error) {
        console.error(envFile.error);
      }
    }
  }

  /**
   * Extract default values from schema
   */
  private extractDefaultsFromSchema(schema: Schema<any>): Record<string, any> {
    const defaults: Record<string, any> = {};
    
    if (schema.type === 'object') {
      const fields = (schema as any).fields || {};
      
      Object.entries(fields).forEach(([fieldName, fieldSchema]: [string, any]) => {
        // For object types, recursively extract defaults
        if (fieldSchema.type === 'object') {
          const nestedDefaults = this.extractDefaultsFromSchema(fieldSchema);
          if (Object.keys(nestedDefaults).length > 0) {
            defaults[fieldName] = nestedDefaults;
          }
        } 
        // For primitive types, get the default if defined
        else if (fieldSchema.spec?.default !== undefined) {
          defaults[fieldName] = fieldSchema.spec.default;
        }
      });
    }
    
    return defaults;
  }

  /**
   * Get environment variable value with type conversion
   */
  private getEnvVar(name: string): any {
    const value = process.env[name];
    if (value === undefined) return undefined;
    
    // Convert string boolean values to actual booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    return value;
  }

  /**
   * Extract environment variables based on schema metadata
   */
  private extractEnvVarsFromSchema(schema: Schema<any>): Record<string, any> {
    const result: Record<string, any> = {};
  
    // Handle object schema type
    if (schema.type === 'object') {
      const fields = (schema as any).fields || {};
      
      // Process each field in the object
      Object.entries(fields).forEach(([fieldName, fieldSchema]: [string, any]) => {
        // Recursive case: nested object
        if (fieldSchema.type === 'object') {
          const nestedResult = this.extractEnvVarsFromSchema(fieldSchema);
          
          if (Object.keys(nestedResult).length > 0) {
            result[fieldName] = nestedResult;
          }
        } 
        // Base case: primitive field with env metadata
        else {
          const envVarName = fieldSchema.spec?.meta?.env;
          if (envVarName) {
            const value = this.getEnvVar(envVarName);
            if (value !== undefined) {
              result[fieldName] = value;
            }
          }
        }
      });
    }
    
    return result;
  }

  /**
   * Build environment object from environment variables using schema metadata
   */
  private buildEnvObject(): Record<string, any> {
    return this.extractEnvVarsFromSchema(this.envSchema);
  }

  /**
   * Check if a value is different from its default
   */
  private isDifferentFromDefault(path: string[], value: any): boolean {
    // Navigate to the correct place in the defaults object
    let defaultValue = this.schemaDefaults;
    for (const key of path) {
      if (!defaultValue || typeof defaultValue !== 'object') return true;
      defaultValue = defaultValue[key];
    }
    
    // If no default found or values differ, return true
    return defaultValue === undefined || value !== defaultValue;
  }

  /**
   * Save environment variables to .testquality file
   * Only saves values that differ from defaults
   */
  public saveEnv(): void {
    let content = '';
    
    // Recursive function to extract env var names and values
    const extractEnvVars = (schema: Schema<any>, obj: any, path: string[] = []) => {
      if (schema.type === 'object' && obj) {
        const fields = (schema as any).fields || {};
        
        Object.entries(fields).forEach(([fieldName, fieldSchema]: [string, any]) => {
          const fieldValue = obj[fieldName];
          const newPath = [...path, fieldName];
          
          if (fieldSchema.type === 'object' && fieldValue) {
            // Recursive case for nested objects
            extractEnvVars(fieldSchema, fieldValue, newPath);
          } else {
            // Get env var name from metadata
            const envVarName = fieldSchema.spec?.meta?.env;
            
            // Only save if the value differs from default and is defined
            if (envVarName && fieldValue !== undefined && 
                this.isDifferentFromDefault(newPath, fieldValue)) {
              content += `${envVarName}=${fieldValue}\n`;
            }
          }
        });
      }
    };    
    extractEnvVars(this.envSchema, this.env);

    debug('saveEnv', content);
    fs.writeFileSync(this.envPath, content, { encoding: 'utf-8', flag: 'w' });
  }
}

// Create singleton instance
const environmentManager = new EnvironmentManager<DefaultSchemaType>(defaultSchema, defaultPath);

// Export env and saveEnv for backward compatibility
export const env = environmentManager.env;
export const saveEnv = (): void => environmentManager.saveEnv();
