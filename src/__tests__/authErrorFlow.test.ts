// Mock dependencies before importing
jest.mock('../Logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import the dependencies
import { logger } from '../Logger';
import { logError } from '../logError';
import { Command } from '../Command';

jest.mock('@testquality/sdk', () => {
  // Create mocks inside the factory function
  const mockLogin = jest.fn();
  const mockSetToken = jest.fn();
  const mockRefreshToken = jest.fn();
  const mockGetResponse = jest.fn();

  // Store mock functions on a global object so we can access them in tests
  (global as any).testSdkMocks = {
    mockLogin,
    mockSetToken,
    mockRefreshToken,
    mockGetResponse,
  };

  return {
    ClientSdk: jest.fn().mockImplementation(() => ({
      getAuth: jest.fn().mockReturnValue({
        login: mockLogin,
        setToken: mockSetToken,
        refreshToken: mockRefreshToken,
      }),
      api: mockGetResponse,
    })),
    setGlobalClient: jest.fn(),
    getResponse: mockGetResponse,
    HttpError: jest.fn().mockImplementation((message, statusCode, error) => ({
      message,
      statusCode,
      error,
    })),
  };
});

// Get mock references from global object
const { mockLogin, mockSetToken, mockRefreshToken, mockGetResponse } = (
  global as any
).testSdkMocks;

// Mock Environment
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
  EnvironmentStorage: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
  })),
}));

describe('Authentication Error Flow', () => {
  let command: Command;

  // Store original console.log
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock console.log to prevent output during tests
    console.log = jest.fn();

    // Clear mocks before each test
    jest.clearAllMocks();

    // Create a command instance for testing
    command = new Command(
      'test-command',
      'Test command description',
      jest.fn(),
      jest.fn()
    );

    // Mock the client directly since we can't use spyOn with a getter
    (command as any).client = {
      getAuth: () => ({
        login: mockLogin,
        setToken: mockSetToken,
        refreshToken: mockRefreshToken,
      }),
      api: mockGetResponse,
    };
  });

  afterAll(() => {
    // Restore console.log after tests
    console.log = originalConsoleLog;
  });

  describe('Error flow in login process', () => {
    it('should handle invalid credentials during login', async () => {
      // Setup mock to simulate a login failure
      const loginError = {
        message: 'Unauthenticated.',
        statusCode: 401,
        error: 'Invalid credentials',
      };
      mockLogin.mockRejectedValue(loginError);

      // Act - Simulate login with bad credentials
      try {
        await command.reLogin({
          username: 'bad-user',
          password: 'wrong-password',
        });
        fail('Should have thrown an error');
      } catch (error) {
        // Assert the error is passed to logError correctly
        logError(error);
        expect(logger.error).toHaveBeenCalledWith(
          'There was an authentication issue.',
          loginError
        );
      }
    });

    it('should handle expired refresh token during API call', async () => {
      // Simulate a command that tries to refresh an expired token
      const refreshTokenError = {
        id: 'REFRESH_TOKEN_ERROR',
        message: 'Error refreshing token',
        statusCode: 401,
      };
      mockRefreshToken.mockRejectedValue(refreshTokenError);

      // Use mockRefreshToken directly since we know it's correctly mocked
      try {
        await mockRefreshToken();
        fail('Should have thrown an error');
      } catch (error) {
        // Handle the error as it would be in a real command
        logError(error);
        expect(logger.error).toHaveBeenCalledWith(
          'There was an authentication issue.',
          refreshTokenError
        );
      }
    });

    it('should handle missing refresh token', async () => {
      // Simulate a command that fails due to missing refresh token
      const noRefreshTokenError = {
        id: 'NO_REFRESH_TOKEN',
        message: 'No refresh token available',
        statusCode: 401,
      };

      // Act - Simulate the error being passed to logError
      logError(noRefreshTokenError);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        noRefreshTokenError
      );
    });
  });

  describe('Error handling in HTTP requests', () => {
    // Create a simulated method that makes API calls like a real command would
    const simulateApiRequest = async () => {
      try {
        // This is how most commands call the API and get errors
        const result = await mockGetResponse({
          method: 'get',
          url: '/test-endpoint',
        });
        return result;
      } catch (error) {
        // Commands typically pass errors directly to logError
        logError(error);
        throw error;
      }
    };

    it('should handle authentication errors from API calls', async () => {
      // Setup mock to simulate an authentication error from an API call
      const apiAuthError = {
        message: 'Unauthenticated.',
        statusCode: 401,
      };
      mockGetResponse.mockRejectedValue(apiAuthError);

      // Act - Try to make a request that will fail with auth error
      try {
        await simulateApiRequest();
        fail('Should have thrown an error');
      } catch (error) {
        // Assert the error is handled correctly by logError
        expect(logger.error).toHaveBeenCalledWith(
          'There was an authentication issue.',
          apiAuthError
        );
      }
    });
  });
});
