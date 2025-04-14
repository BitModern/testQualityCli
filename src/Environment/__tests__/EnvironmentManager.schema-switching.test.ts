import * as fs from 'fs';
import { object, string, boolean, number, InferType } from 'yup';
import { EnvironmentManager } from '../EnvironmentManager';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(
    () => 'TEST_AUTH_TOKEN=test-token\nTEST_API_URL=https://custom-api.com\n'
  ),
}));

// Mock dotenv module
jest.mock('dotenv', () => ({
  config: jest.fn(() => ({
    parsed: {
      TEST_AUTH_TOKEN: 'test-token',
      TEST_API_URL: 'https://custom-api.com',
    },
  })),
}));

describe('EnvironmentManager - Schema Switching Risks', () => {
  // Schema 1: Simple schema used to create the original env file
  const simpleSchema = object({
    api: object({
      url: string()
        .default('https://default-api.com')
        .meta({ env: 'TEST_API_URL' }),
    }),
    auth: object({
      token: string().meta({ env: 'TEST_AUTH_TOKEN' }),
    }),
  });

  type SimpleSchemaType = InferType<typeof simpleSchema>;

  // Schema 2: Different schema structure
  const differentSchema = object({
    api: object({
      endpoint: string()
        .default('https://api.different.com')
        .meta({ env: 'DIFFERENT_API_ENDPOINT' }),
      timeout: number().default(3000).meta({ env: 'DIFFERENT_API_TIMEOUT' }),
    }),
    logging: object({
      enabled: boolean()
        .default(true)
        .meta({ env: 'DIFFERENT_LOGGING_ENABLED' }),
    }),
  });

  type DifferentSchemaType = InferType<typeof differentSchema>;

  const testEnvPath = '/tmp/.testquality-switching';

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup environment to simulate a file created by the simple schema
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    process.env = {
      TEST_AUTH_TOKEN: 'test-token',
      TEST_API_URL: 'https://custom-api.com',
    };
  });

  it('should demonstrate data loss when switching schemas and saving', () => {
    // Step 1: Load with the simple schema to verify initial state
    const manager1 = new EnvironmentManager<SimpleSchemaType>(
      simpleSchema,
      testEnvPath
    );

    // Verify the values were loaded correctly
    expect(manager1.env.api.url).toBe('https://custom-api.com');
    expect(manager1.env.auth.token).toBe('test-token');

    // Step 2: Create a new manager with the different schema
    const manager2 = new EnvironmentManager<DifferentSchemaType>(
      differentSchema,
      testEnvPath
    );

    // The different schema doesn't extract the TEST_* variables
    expect(manager2.env.api.endpoint).toBe('https://api.different.com'); // Default value
    expect(manager2.env.logging.enabled).toBe(true); // Default value

    // Step 3: Save the environment with the different schema
    manager2.saveEnv();

    // Step 4: Verify what was written to the file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      testEnvPath,
      expect.not.stringContaining('TEST_AUTH_TOKEN'),
      expect.any(Object)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      testEnvPath,
      expect.not.stringContaining('TEST_API_URL'),
      expect.any(Object)
    );

    // Nothing should be written since all values are defaults
    const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
    expect(writeCall[1]).toBe('');
  });

  it('should warn users about potential data loss (demonstration)', () => {
    // This is a demonstration of how we might handle this in production code
    // Mock console.warn for this test
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // In a real implementation, we would add code to detect and warn about this situation
    // This is what a detection might look like:
    const originalContent =
      'TEST_AUTH_TOKEN=test-token\nTEST_API_URL=https://custom-api.com\n';
    const originalVars = originalContent
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('=')[0]);

    // Create manager with different schema - we don't need to use this directly
    new EnvironmentManager<DifferentSchemaType>(differentSchema, testEnvPath);

    // Before saving, check if any existing vars would be lost
    const schemaVars: string[] = [];
    const extractVarNames = (schema: any) => {
      if (schema.type === 'object') {
        const fields = schema.fields || {};
        Object.values(fields).forEach((fieldSchema: any) => {
          if (fieldSchema.type === 'object') {
            extractVarNames(fieldSchema);
          } else {
            const envVar = fieldSchema.spec?.meta?.env;
            if (envVar) schemaVars.push(envVar);
          }
        });
      }
    };

    extractVarNames(differentSchema);

    // Find vars that would be lost
    const varsToBeRemoved = originalVars.filter((v) => !schemaVars.includes(v));

    // Warn if needed
    if (varsToBeRemoved.length > 0) {
      console.warn(
        `WARNING: Saving with current schema will remove these variables: ${varsToBeRemoved.join(
          ', '
        )}`
      );
    }

    // Verify warning was shown
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'WARNING: Saving with current schema will remove these variables:'
      )
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('TEST_AUTH_TOKEN')
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('TEST_API_URL')
    );

    warnSpy.mockRestore();
  });
});
