import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentAdapter, EnvironmentSource } from '../env';

/**
 * Example of using the generic environment adapter with a custom schema
 */

// 1. Define your custom environment schema
type CustomEnvironmentSchema = {
  database: {
    host: string;
    port: number;
    user: string;
    password: string | undefined;
    ssl: boolean;
  };
  server: {
    port: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableCors: boolean;
  };
  features: {
    experimentalApi: boolean;
    cacheEnabled: boolean;
    maxCacheSize: number;
  };
};

// 2. Define default values for your schema
const defaultCustomEnv: CustomEnvironmentSchema = {
  database: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: undefined,
    ssl: false,
  },
  server: {
    port: 3000,
    logLevel: 'info',
    enableCors: true,
  },
  features: {
    experimentalApi: false,
    cacheEnabled: true,
    maxCacheSize: 100,
  },
};

// 3. Define mappings between schema paths and environment variable names
const customEnvMappings: Record<
  string,
  { envKey: string; transform?: (value: string | undefined) => any }
> = {
  'database.host': { envKey: 'DB_HOST' },
  'database.port': {
    envKey: 'DB_PORT',
    transform: (v) => (v ? parseInt(v, 10) : undefined),
  },
  'database.user': { envKey: 'DB_USER' },
  'database.password': { envKey: 'DB_PASSWORD' },
  'database.ssl': { envKey: 'DB_SSL', transform: (v) => v === 'true' },
  'server.port': {
    envKey: 'SERVER_PORT',
    transform: (v) => (v ? parseInt(v, 10) : undefined),
  },
  'server.logLevel': { envKey: 'LOG_LEVEL' },
  'server.enableCors': {
    envKey: 'ENABLE_CORS',
    transform: (v) => v !== 'false',
  },
  'features.experimentalApi': {
    envKey: 'EXPERIMENTAL_API',
    transform: (v) => v === 'true',
  },
  'features.cacheEnabled': {
    envKey: 'CACHE_ENABLED',
    transform: (v) => v !== 'false',
  },
  'features.maxCacheSize': {
    envKey: 'MAX_CACHE_SIZE',
    transform: (v) => (v ? parseInt(v, 10) : undefined),
  },
};

// 4. Create a simple environment source implementation (for demo purposes)
class SimpleEnvironmentSource implements EnvironmentSource {
  private envVars: Record<string, string> = {};
  private savePath: string;

  constructor(
    initialValues: Record<string, string> = {},
    savePath: string = path.join(process.cwd(), 'custom-env-config')
  ) {
    this.envVars = { ...initialValues };
    this.savePath = savePath;
  }

  get(key: string): string | undefined {
    return this.envVars[key];
  }

  set(key: string, value: string): void {
    this.envVars[key] = value;
  }

  save(): void {
    const content = Object.entries(this.envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    console.log('Would save the following environment variables:');
    console.log(content);
    
    // For demonstration, we're just logging the content instead of writing to a file
  }
}

// 5. Create an instance with some initial values
const initialEnvValues = {
  DB_HOST: 'production-db.example.com',
  DB_PORT: '5433',
  DB_USER: 'app_user',
  DB_PASSWORD: 'secret',
  SERVER_PORT: '8080',
  EXPERIMENTAL_API: 'true',
};

const customEnvSource = new SimpleEnvironmentSource(initialEnvValues);

// 6. Create the adapter
const customEnvAdapter = new EnvironmentAdapter<CustomEnvironmentSchema>(
  customEnvSource,
  defaultCustomEnv,
  customEnvMappings
);

// 7. Get the typed configuration
const config = customEnvAdapter.getConfig();

// Usage example (this would be actual application code)
function exampleUsage(): void {
  console.log(
    `Connecting to database at ${config.database.host}:${config.database.port}`
  );

  // Type-safe access to the configuration
  if (config.features.experimentalApi) {
    console.log('Experimental API is enabled');
  }

  // Update a value
  config.server.port = 9000;

  // Save the changes
  customEnvAdapter.saveConfig(config);
}

// Exposing for demonstration
export {
  CustomEnvironmentSchema,
  config as customConfig,
  exampleUsage,
  customEnvAdapter,
};
