import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  generateId,
  generateUUID,
  slugify,
  formatDate,
  parseDate,
  pick,
  omit,
  sleep,
  timeout,
  isValidEmail,
  isValidUrl,
  calculateOffset,
  calculateTotalPages,
} from '../../src/utils';

describe('Utils Tests', () => {
  describe('API Response Utilities', () => {
    it('should create success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data, 'Success message');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success message');
      expect(response.timestamp).toBeDefined();
    });

    it('should create error response', () => {
      const response = createErrorResponse('Error occurred', 'Error message');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Error occurred');
      expect(response.message).toBe('Error message');
      expect(response.timestamp).toBeDefined();
    });

    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, 1, 10, 25, 'Data retrieved');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });

  describe('Error Utilities', () => {
    it('should create custom error', () => {
      const error = createError('Test error', 400, 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should create validation error', () => {
      const error = createValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create not found error', () => {
      const error = createNotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create unauthorized error', () => {
      const error = createUnauthorizedError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create forbidden error', () => {
      const error = createForbiddenError('Insufficient permissions');

      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('String Utilities', () => {
    it('should generate ID', () => {
      const id = generateId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(9);
    });

    it('should generate UUID', () => {
      const uuid = generateUUID();
      expect(uuid).toBeDefined();
      expect(typeof uuid).toBe('string');
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should slugify text', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('Test@#$%^&*()')).toBe('test');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });

  describe('Date Utilities', () => {
    it('should format date', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should parse valid date', () => {
      const dateString = '2023-01-01T00:00:00.000Z';
      const parsed = parseDate(dateString);
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.toISOString()).toBe(dateString);
    });

    it('should throw error for invalid date', () => {
      expect(() => parseDate('invalid-date')).toThrow('Invalid date format');
    });
  });

  describe('Object Utilities', () => {
    const testObj = {
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      password: 'secret',
    };

    it('should pick specified keys', () => {
      const picked = pick(testObj, ['id', 'name']);
      expect(picked).toEqual({ id: 1, name: 'Test' });
    });

    it('should omit specified keys', () => {
      const omitted = omit(testObj, ['password', 'email']);
      expect(omitted).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('Async Utilities', () => {
    it('should sleep for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });

    it('should timeout after specified time', async () => {
      const slowPromise = new Promise(resolve => setTimeout(resolve, 200));
      await expect(timeout(slowPromise, 100)).rejects.toThrow('Operation timed out');
    });

    it('should resolve before timeout', async () => {
      const fastPromise = Promise.resolve('success');
      const result = await timeout(fastPromise, 100);
      expect(result).toBe('success');
    });
  });

  describe('Validation Utilities', () => {
    it('should validate email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should validate URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('Pagination Utilities', () => {
    it('should calculate offset', () => {
      expect(calculateOffset(1, 10)).toBe(0);
      expect(calculateOffset(2, 10)).toBe(10);
      expect(calculateOffset(3, 5)).toBe(10);
    });

    it('should calculate total pages', () => {
      expect(calculateTotalPages(25, 10)).toBe(3);
      expect(calculateTotalPages(20, 10)).toBe(2);
      expect(calculateTotalPages(15, 10)).toBe(2);
      expect(calculateTotalPages(0, 10)).toBe(0);
    });
  });
});
