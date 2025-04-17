import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Define the path to the environment file - keep this at module level as it's used elsewhere
const envPath = path.resolve(process.cwd(), '.testquality');

/**
 * Environment source interface
 * Abstracts how environment variables are retrieved and stored
 */
export interface EnvironmentSource {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  save(): void;
}

/**
 * Dotenv implementation of environment source
 */
class DotenvSource implements EnvironmentSource {
  private configPath: string;

  constructor(configPath: string) {
    this.configPath = configPath;
    console.log(`Loading env vars from ${configPath} file`);
    if (fs.existsSync(configPath)) {
      const envFile = dotenv.config({ path: configPath });
      if (envFile.error) {
        console.error(envFile.error);
      }
    }
  }

  get(key: string): string | undefined {
    if (process.env[key]) {
      return process.env[key] as string;
    }
    return undefined;
  }

  set(key: string, value: string): void {
    process.env[key] = value;
  }

  save(): void {
    // Collect environment variable keys from the mappings
    const keysToSave = new Set<string>();

    // Add known environment variable keys from the mappings
    for (const mapping of Object.values(envMappings)) {
      keysToSave.add(mapping.envKey);
    }

    // Filter for only keys with values
    const content =
      Array.from(keysToSave)
        .filter(
          (key) => process.env[key] !== undefined && process.env[key] !== ''
        )
        .map((key) => `${key}=${process.env[key]}`)
        .join('\n') + '\n';

    // Write to the file
    fs.writeFileSync(this.configPath, content, {
      encoding: 'utf-8',
      flag: 'w',
    });
  }
}

/**
 * The environment source singleton
 */
const environmentSource: EnvironmentSource = new DotenvSource(envPath);

/**
 * Helper to map boolean values from environment variables
 */
function envToBool(value: string | undefined): boolean {
  return value === 'true';
}

/**
 * Generic environment adapter class
 * Maps between raw environment variables and a structured schema
 */
export class EnvironmentAdapter<T> {
  private cachedConfig: T | null = null;

  constructor(
    private source: EnvironmentSource,
    private schema: T,
    private mappings: Record<
      string,
      { envKey: string; transform?: (value: string | undefined) => any }
    >
  ) {}

  /**
   * Get the environment configuration as a structured object
   */
  getConfig(): T {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    // Create a deep copy of the schema to use as our config object
    const config = JSON.parse(JSON.stringify(this.schema)) as T;

    // Apply mappings to populate the config from environment variables
    for (const [path, mapping] of Object.entries(this.mappings)) {
      const value = this.source.get(mapping.envKey);
      const transformedValue = mapping.transform
        ? mapping.transform(value)
        : value;

      // Skip if the value is undefined (use the default from schema)
      if (transformedValue === undefined) continue;

      // Set the value at the nested path
      this.setNestedValue(config, path, transformedValue);
    }

    this.cachedConfig = config;
    return config;
  }

  /**
   * Save the environment back to the source
   */
  saveConfig(config: Partial<T>): void {
    // Merge with cached config
    this.cachedConfig = { ...this.getConfig(), ...config };

    // Only save environment variables that differ from defaults
    const contentParts: Record<string, string> = {};

    for (const [path, mapping] of Object.entries(this.mappings)) {
      const value = this.getNestedValue(this.cachedConfig, path);
      const defaultValue = this.getNestedValue(this.schema, path);

      // Only save if value is defined and different from default
      if (value !== undefined && value !== null && value !== defaultValue) {
        const stringValue = String(value);
        this.source.set(mapping.envKey, stringValue);
        contentParts[mapping.envKey] = stringValue;
      }
    }

    // Delegate saving to the source
    this.source.save();
  }

  /**
   * Helper to get a nested value from an object using a dot notation path
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Helper to set a nested value in an object using a dot notation path
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}

// Define schema type for better type checking
export type EnvironmentSchema = {
  api: {
    url: string;
    xDebug: boolean;
  };
  client_id: string;
  client_secret: string;
  variables: {
    username?: string;
    password?: string;
    project_id?: string;
    expires_at?: string;
    access_token?: string;
    refresh_token?: string;
  };
  auth: {
    username?: string;
    password?: string;
    token?: string;
    remember?: string;
    project_id?: string;
  };
  log: {
    level: string;
    levelInString: boolean;
    format: string;
    data: boolean;
  };
};

// Define default values
const defaultEnv: EnvironmentSchema = {
  api: {
    url: 'https://api.testquality.com',
    xDebug: false,
  },
  client_id: '2',
  client_secret: '93MBS86X7JrK4Mrr1mk4PKfo6b1zRVx9Mrmx0nTa',
  variables: {},
  auth: {},
  log: {
    level: 'info',
    levelInString: false,
    format: 'short',
    data: false,
  },
};

// Define mappings between schema paths and environment variables
const envMappings: Record<
  string,
  { envKey: string; transform?: (value: string | undefined) => any }
> = {
  'api.url': { envKey: 'TQ_HOST' },
  'api.xDebug': { envKey: 'APP_XDEBUG', transform: envToBool },
  client_id: { envKey: 'TQ_CLIENT_ID' },
  client_secret: { envKey: 'TQ_CLIENT_SECRET' },
  'variables.username': { envKey: 'TQ_USERNAME' },
  'variables.password': { envKey: 'TQ_PASSWORD' },
  'variables.project_id': { envKey: 'TQ_PROJECT_ID' },
  'variables.expires_at': { envKey: 'TQ_EXPIRES_AT' },
  'variables.access_token': { envKey: 'TQ_ACCESS_TOKEN' },
  'variables.refresh_token': { envKey: 'TQ_REFRESH_TOKEN' },
  'auth.username': { envKey: 'TQ_USERNAME' },
  'auth.password': { envKey: 'TQ_PASSWORD' },
  'auth.token': { envKey: 'TQ_TOKEN' },
  'auth.remember': { envKey: 'TQ_REMEMBER' },
  'auth.project_id': { envKey: 'TQ_PROJECT_ID' },
  'log.level': { envKey: 'LOG_LEVEL' },
  'log.levelInString': { envKey: 'LOG_LEVEL_IN_STRING', transform: envToBool },
  'log.format': { envKey: 'LOG_FORMAT' },
  'log.data': { envKey: 'LOG_DATA', transform: envToBool },
};

// Create the adapter with our schema, defaults and mappings
const envAdapter = new EnvironmentAdapter<EnvironmentSchema>(
  environmentSource,
  defaultEnv,
  envMappings
);

// Export the environment configuration
export const env = envAdapter.getConfig();

// Export save function
export const saveEnv = () => envAdapter.saveConfig(env);
