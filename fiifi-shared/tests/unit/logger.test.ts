import { Logger, defaultLogger } from '../../src/logger';

// Mock winston to avoid console output during tests
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    log: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

describe('Logger Tests', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('test-service', { service: 'test-service' });
  });

  describe('Logger Instance', () => {
    it('should create logger with service name', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should have log methods', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should call winston log method for info', () => {
      const mockLog = jest.fn();
      (logger as any).log = mockLog;
      logger.info('Test message');
      expect(mockLog).toHaveBeenCalledWith('info', 'Test message', {});
    });

    it('should call winston log method for error', () => {
      const mockLog = jest.fn();
      (logger as any).log = mockLog;
      logger.error('Test error');
      expect(mockLog).toHaveBeenCalledWith('error', 'Test error', {});
    });

    it('should call winston log method for warn', () => {
      const mockLog = jest.fn();
      (logger as any).log = mockLog;
      logger.warn('Test warning');
      expect(mockLog).toHaveBeenCalledWith('warn', 'Test warning', {});
    });

    it('should call winston log method for debug', () => {
      const mockLog = jest.fn();
      (logger as any).log = mockLog;
      logger.debug('Test debug');
      expect(mockLog).toHaveBeenCalledWith('debug', 'Test debug', {});
    });
  });

  describe('Context Management', () => {
    it('should set context', () => {
      logger.setContext({ userId: '123', requestId: 'req-456' });
      const mockLog = jest.fn();
      (logger as any).log = mockLog;
      logger.info('Test message');
      expect(mockLog).toHaveBeenCalledWith('info', 'Test message', {});
    });

    it('should create child logger with additional context', () => {
      const childLogger = logger.child({ userId: '123' });
      expect(childLogger).toBeInstanceOf(Logger);
    });
  });

  describe('Error Logging', () => {
    it('should log error with stack trace', () => {
      const error = new Error('Test error');
      const mockLog = jest.fn();
      (logger as any).log = mockLog;
      logger.error('Error occurred', error);
      expect(mockLog).toHaveBeenCalledWith('error', 'Error occurred', {
        error: {
          name: 'Error',
          message: 'Test error',
          stack: expect.any(String),
        },
      });
    });

    it('should log error without stack trace when no error provided', () => {
      const mockLog = jest.fn();
      (logger as any).log = mockLog;
      logger.error('Error occurred');
      expect(mockLog).toHaveBeenCalledWith('error', 'Error occurred', {});
    });
  });

  describe('Default Logger', () => {
    it('should export default logger', () => {
      expect(defaultLogger).toBeInstanceOf(Logger);
    });
  });
});
