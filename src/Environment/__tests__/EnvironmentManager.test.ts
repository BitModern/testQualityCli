import * as fs from 'fs';
import { object, string, boolean, InferType } from 'yup';
import { EnvironmentManager } from '../EnvironmentManager';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock dotenv module
jest.mock('dotenv', () => ({
  config: jest.fn(() => ({ parsed: {} })),
}));

describe('EnvironmentManager', () => {
  // Setup test schema
  const testSchema = object({
    api: object({
      url: string()
        .default('https://test-api.com')
        .meta({ env: 'TEST_API_URL' }),
      debug: boolean().default(false).meta({ env: 'TEST_API_DEBUG' }),
    }),
    auth: object({
      token: string().meta({ env: 'TEST_AUTH_TOKEN' }),
    }),
  });

  type TestSchemaType = InferType<typeof testSchema>;

  const testEnvPath = '/tmp/.testquality-test';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset environment variables
    process.env = {};
  });

  describe('constructor', () => {
    it('should create instance with default values when no env vars exist', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Execute
      const manager = new EnvironmentManager<TestSchemaType>(
        testSchema,
        testEnvPath
      );

      // Verify
      expect(manager.env.api.url).toBe('https://test-api.com');
      expect(manager.env.api.debug).toBe(false);
      expect(manager.env.auth?.token).toBeUndefined();
      expect(manager).toBeTruthy();
    });

    it('should load values from environment variables', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_API_URL = 'https://override-api.com';
      process.env.TEST_AUTH_TOKEN = 'test-token';

      // Execute
      const manager = new EnvironmentManager<TestSchemaType>(
        testSchema,
        testEnvPath
      );

      // Verify
      expect(manager.env.api.url).toBe('https://override-api.com');
      expect(manager.env.api.debug).toBe(false); // Default value
      expect(manager.env.auth?.token).toBe('test-token');
      expect(manager).toBeTruthy();
    });

    it('should load values from env file if it exists', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      require('dotenv').config.mockReturnValue({
        parsed: {
          TEST_API_URL: 'https://from-file.com',
          TEST_API_DEBUG: 'true',
        },
      });

      // Execute
      const manager = new EnvironmentManager<TestSchemaType>(
        testSchema,
        testEnvPath
      );

      // Verify
      expect(require('dotenv').config).toHaveBeenCalledWith({
        path: testEnvPath,
      });
      expect(manager).toBeTruthy();
    });

    it('should convert string boolean values to actual booleans', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_API_DEBUG = 'true';

      // Execute
      const manager = new EnvironmentManager<TestSchemaType>(
        testSchema,
        testEnvPath
      );

      // Verify
      expect(manager.env.api.debug).toBe(true);
      expect(typeof manager.env.api.debug).toBe('boolean');
      expect(manager).toBeTruthy();
    });
  });

  describe('saveEnv', () => {
    it('should only save values that differ from defaults', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_API_URL = 'https://custom-api.com';
      process.env.TEST_AUTH_TOKEN = 'custom-token';

      const manager = new EnvironmentManager<TestSchemaType>(
        testSchema,
        testEnvPath
      );

      // Execute
      manager.saveEnv();

      // Verify
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testEnvPath,
        expect.stringContaining('TEST_API_URL=https://custom-api.com'),
        expect.any(Object)
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testEnvPath,
        expect.stringContaining('TEST_AUTH_TOKEN=custom-token'),
        expect.any(Object)
      );
      // Should not save default values
      const writeContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(writeContent).not.toContain('TEST_API_DEBUG=false');
      expect(manager).toBeTruthy();
    });

    it('should handle boolean values correctly when saving', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_API_DEBUG = 'true';

      const manager = new EnvironmentManager<TestSchemaType>(
        testSchema,
        testEnvPath
      );

      // Execute
      manager.saveEnv();

      // Verify
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testEnvPath,
        expect.stringContaining('TEST_API_DEBUG=true'),
        expect.any(Object)
      );
      expect(manager).toBeTruthy();
    });
  });

  describe('extractDefaultsFromSchema', () => {
    it('should correctly extract default values from schema', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Execute
      const manager = new EnvironmentManager<TestSchemaType>(
        testSchema,
        testEnvPath
      );

      // Access private method for testing (using any cast)
      const defaults = (manager as any).extractDefaultsFromSchema(testSchema);

      // Verify
      expect(defaults).toEqual({
        api: {
          url: 'https://test-api.com',
          debug: false,
        },
      });
      expect(manager).toBeTruthy();
    });
  });
});
