// Mock the Logger before importing logError
jest.mock('../Logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import after mocking
import { logError } from '../logError';
import { logger } from '../Logger';

describe('logError function', () => {
  // Store original console.log
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock console.log to prevent output during tests
    console.log = jest.fn();

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console.log after tests
    console.log = originalConsoleLog;
  });

  describe('Authentication error handling', () => {
    it('should handle NO_REFRESH_TOKEN error id', () => {
      // Arrange
      const error = { id: 'NO_REFRESH_TOKEN', message: 'Some error message' };

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        error
      );
      // Ensure it doesn't log the error in other formats
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle NO_REFRESH_TOKEN error code', () => {
      // Arrange
      const error = { code: 'NO_REFRESH_TOKEN', message: 'Some error message' };

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        error
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle REFRESH_TOKEN_ERROR error id', () => {
      // Arrange
      const error = {
        id: 'REFRESH_TOKEN_ERROR',
        message: 'Some error message',
      };

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        error
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle REFRESH_TOKEN_ERROR error code', () => {
      // Arrange
      const error = {
        code: 'REFRESH_TOKEN_ERROR',
        message: 'Some error message',
      };

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        error
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle "The refresh token is invalid." message (old SDK)', () => {
      // Arrange
      const error = { message: 'The refresh token is invalid.' };

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        error
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle "Unauthenticated." message', () => {
      // Arrange
      const error = { message: 'Unauthenticated.' };

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        error
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Non-authentication error handling', () => {
    it('should handle error with error property and statusCode', () => {
      // Arrange
      const error = {
        error: 'Detailed error message',
        statusCode: 500,
      };

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Status Code 500',
        'Detailed error message'
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle generic errors', () => {
      // Arrange
      const error = new Error('Generic error');

      // Act
      logError(error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle null error', () => {
      // Act
      logError(null);

      // Assert
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('Integration with Command auth flows', () => {
    it('should handle error from failed login', () => {
      // Simulate an error from Command.reLogin with invalid credentials
      const loginError = {
        message: 'Unauthenticated.',
        statusCode: 401,
        error: 'Invalid credentials',
      };

      // Act
      logError(loginError);

      // Assert - Should prioritize the authentication error path
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        loginError
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should handle error from expired token', () => {
      // Simulate an error from Command methods when token expires
      const expiredTokenError = {
        code: 'REFRESH_TOKEN_ERROR',
        statusCode: 401,
        error: 'Token has expired',
      };

      // Act
      logError(expiredTokenError);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'There was an authentication issue.',
        expiredTokenError
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
