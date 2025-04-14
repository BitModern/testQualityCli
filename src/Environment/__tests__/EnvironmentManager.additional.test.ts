import * as fs from 'fs';
import { object, string, boolean, number, InferType } from 'yup';
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

describe('EnvironmentManager - Additional Tests', () => {
  // Setup a more complex test schema
  const complexSchema = object({
    api: object({
      url: string()
        .default('https://test-api.com')
        .meta({ env: 'TEST_API_URL' }),
      timeout: number().default(5000).meta({ env: 'TEST_API_TIMEOUT' }),
      retry: object({
        count: number().default(3).meta({ env: 'TEST_RETRY_COUNT' }),
        enabled: boolean().default(true).meta({ env: 'TEST_RETRY_ENABLED' }),
      }),
    }),
    features: object({
      logging: boolean().default(true).meta({ env: 'TEST_LOGGING' }),
      advanced: object({
        mode: string().default('standard').meta({ env: 'TEST_ADVANCED_MODE' }),
      }),
    }),
  });

  type ComplexSchemaType = InferType<typeof complexSchema>;

  const testEnvPath = '/tmp/.testquality-complex';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {};
  });

  describe('private method: getEnvVar', () => {
    it('should convert "true" and "false" string values to booleans', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_RETRY_ENABLED = 'false';
      process.env.TEST_LOGGING = 'true';

      // Execute
      const manager = new EnvironmentManager<ComplexSchemaType>(
        complexSchema,
        testEnvPath
      );

      // Verify through public API to avoid exposing private methods
      expect(manager.env.api.retry.enabled).toBe(false);
      expect(manager.env.features.logging).toBe(true);
    });

    it('should handle numeric values correctly', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_API_TIMEOUT = '10000';
      process.env.TEST_RETRY_COUNT = '5';

      // Execute
      const manager = new EnvironmentManager<ComplexSchemaType>(
        complexSchema,
        testEnvPath
      );

      // Verify
      expect(manager.env.api.timeout).toBe(10000);
      expect(manager.env.api.retry.count).toBe(5);
    });
  });

  describe('nested schema handling', () => {
    it('should handle deeply nested schema properties', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_ADVANCED_MODE = 'expert';

      // Execute
      const manager = new EnvironmentManager<ComplexSchemaType>(
        complexSchema,
        testEnvPath
      );

      // Verify
      expect(manager.env.features.advanced.mode).toBe('expert');
    });

    it('should handle default objects correctly', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Execute
      const manager = new EnvironmentManager<ComplexSchemaType>(
        complexSchema,
        testEnvPath
      );

      // Verify that default objects exist
      expect(manager.env.features).toBeDefined();
      expect(manager.env.features.advanced).toBeDefined();
      expect(manager.env.features.advanced.mode).toBe('standard');
    });
  });

  describe('error handling', () => {
    it('should handle errors when env file has issues', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      require('dotenv').config.mockReturnValue({
        error: new Error('Test error'),
      });

      // Execute
      new EnvironmentManager<ComplexSchemaType>(complexSchema, testEnvPath);

      // Verify
      expect(consoleSpy).toHaveBeenCalled();

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('saveEnv behavior', () => {
    it('should correctly format the saved environment file', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      process.env.TEST_API_URL = 'https://custom-api.com';
      process.env.TEST_RETRY_COUNT = '5';
      process.env.TEST_ADVANCED_MODE = 'expert';

      const manager = new EnvironmentManager<ComplexSchemaType>(
        complexSchema,
        testEnvPath
      );

      // Execute
      manager.saveEnv();

      // Verify
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const content = writeCall[1];

      expect(content).toContain('TEST_API_URL=https://custom-api.com');
      expect(content).toContain('TEST_RETRY_COUNT=5');
      expect(content).toContain('TEST_ADVANCED_MODE=expert');

      // Each entry should be on its own line
      const lines = content.split('\n').filter(Boolean);
      expect(lines.length).toBe(3);
    });

    it('should not save undefined values', () => {
      // Setup
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Create a manager with default values
      const manager = new EnvironmentManager<ComplexSchemaType>(
        complexSchema,
        testEnvPath
      );

      // Manually set a property to undefined
      (manager.env as any).api.url = undefined;

      // Execute
      manager.saveEnv();

      // Verify
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const content = writeCall ? writeCall[1] : '';

      expect(content).not.toContain('TEST_API_URL=undefined');
    });
  });
});
