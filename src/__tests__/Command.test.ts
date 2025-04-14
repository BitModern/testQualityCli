// Import the module to test
import { Command } from '../Command';

// Mock modules before importing them
jest.mock('../Environment', () => ({
  env: {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    api: {
      url: 'https://test-api.com',
      xDebug: false,
    },
    variables: {
      username: 'stored-username',
      password: 'stored-password',
      accessToken: 'stored-access-token',
      expiresAt: 'stored-expires-at',
      refreshToken: 'stored-refresh-token',
      projectId: '1',
    },
    auth: {
      token: '',
    },
  },
  saveEnv: jest.fn(),
  EnvironmentStorage: jest.fn(),
}));

// Mock the Logger to avoid console output in tests
jest.mock('../Logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import Environment after mocking
const Environment = require('../Environment');

// Create test token response
const mockTokenResponse = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: '2099-12-31T23:59:59Z',
};

describe('Command', () => {
  let command: Command;
  let mockLogin: jest.Mock;
  let mockSetToken: jest.Mock;
  
  // Setup before tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockLogin = jest.fn().mockResolvedValue(mockTokenResponse);
    mockSetToken = jest.fn();
    
    // Create a new Command instance for each test
    command = new Command(
      'test-command',
      'Test command description',
      jest.fn(),
      jest.fn()
    );
    
    // Directly mock the client field after instance creation
    command.client = {
      getAuth: jest.fn().mockReturnValue({
        login: mockLogin,
        setToken: mockSetToken,
      }),
    } as any;
  });
  
  describe('reLogin method', () => {
    it('should authenticate with username and password from args', async () => {
      // Arrange
      const args = {
        username: 'test-user',
        password: 'test-password',
        save: true,
      };
      
      // Act
      const result = await command.reLogin(args);
      
      // Assert
      expect(mockLogin).toHaveBeenCalledWith(
        'test-user',
        'test-password',
        true
      );
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should authenticate with username and password from env if not in args', async () => {
      // Arrange
      const args = { save: false };
      
      // Act
      const result = await command.reLogin(args);
      
      // Assert
      expect(mockLogin).toHaveBeenCalledWith(
        'stored-username',
        'stored-password',
        false
      );
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should authenticate with access token from args', async () => {
      // Arrange
      const args = {
        access_token: 'args-access-token',
        expires_at: 'args-expires-at',
        refresh_token: 'args-refresh-token',
        save: true,
      };
      
      // Override the environment variables
      Environment.env.variables.username = undefined;
      Environment.env.variables.password = undefined;
      
      // Act
      await command.reLogin(args);
      
      // Assert
      expect(mockSetToken).toHaveBeenCalledWith(
        {
          access_token: 'args-access-token',
          expires_at: 'args-expires-at',
          refresh_token: 'args-refresh-token',
        },
        true
      );
    });
    
    it('should use token from auth token if available', async () => {
      // Arrange
      const args = { save: true };
      
      // Override environment variables
      Environment.env.variables.username = undefined;
      Environment.env.variables.password = undefined;
      Environment.env.variables.accessToken = undefined;
      Environment.env.auth.token = JSON.stringify({ 
        access_token: 'auth-token',
        expires_at: '2099-01-01'
      });
      
      // Act
      await command.reLogin(args);
      
      // Assert
      expect(mockSetToken).toHaveBeenCalledWith(
        {
          access_token: 'auth-token',
          expires_at: '2099-01-01'
        },
        true
      );
    });
    
    it('should handle JSON parse error for auth token', async () => {
      // Arrange
      const args = {};
      
      // Override environment variables
      Environment.env.variables.username = undefined;
      Environment.env.variables.password = undefined;
      Environment.env.variables.accessToken = undefined;
      Environment.env.auth.token = 'invalid-json';
      
      // Mock warn to silence output
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Act & Assert
      await expect(command.reLogin(args)).rejects.toThrow();
      
      // Cleanup
      warnSpy.mockRestore();
    });
    
    it('should resolve with undefined if no credentials available', async () => {
      // Arrange
      const args = {};
      
      // Override environment variables
      Environment.env.variables.username = undefined;
      Environment.env.variables.password = undefined;
      Environment.env.variables.accessToken = undefined;
      Environment.env.auth.token = undefined;
      
      // Act
      const result = await command.reLogin(args);
      
      // Assert
      expect(result).toBeUndefined();
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockSetToken).not.toHaveBeenCalled();
    });
  });
}); 