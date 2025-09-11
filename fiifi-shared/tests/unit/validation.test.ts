import { validateUser, validateCompany, validateInvestment, validatePagination } from '../../src/validation';

describe('Validation Tests', () => {
  describe('User Validation', () => {
    it('should validate a valid user', () => {
      const validUser = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        accountId: 12345,
      };

      const result = validateUser(validUser);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    it('should reject user with invalid email', () => {
      const invalidUser = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        accountId: 12345,
      };

      const result = validateUser(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"email" must be a valid email');
    });

    it('should reject user with missing required fields', () => {
      const incompleteUser = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = validateUser(incompleteUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"uuid" is required');
      expect(result.errors).toContain('"email" is required');
      expect(result.errors).toContain('"accountId" is required');
    });

    it('should set default values for optional fields', () => {
      const userWithDefaults = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        accountId: 12345,
      };

      const result = validateUser(userWithDefaults);
      expect(result.isValid).toBe(true);
      expect(result.data?.isDelete).toBe(false);
      expect(result.data?.activatePro).toBe(0);
      expect(result.data?.created).toBeInstanceOf(Date);
      expect(result.data?.modified).toBeInstanceOf(Date);
    });
  });

  describe('Company Validation', () => {
    it('should validate a valid company', () => {
      const validCompany = {
        name: 'Test Company',
        sector: 'Technology',
        description: 'A test company',
        website: 'https://testcompany.com',
      };

      const result = validateCompany(validCompany);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject company with invalid website URL', () => {
      const invalidCompany = {
        name: 'Test Company',
        website: 'not-a-valid-url',
      };

      const result = validateCompany(invalidCompany);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"website" must be a valid uri');
    });

    it('should reject company with name too long', () => {
      const invalidCompany = {
        name: 'A'.repeat(201), // Exceeds max length of 200
      };

      const result = validateCompany(invalidCompany);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"name" length must be less than or equal to 200 characters long');
    });
  });

  describe('Investment Validation', () => {
    it('should validate a valid investment', () => {
      const validInvestment = {
        portfolioItem: 'portfolio-123',
        workspace: 'workspace-456',
        amount: '100000',
        investmentType: 'Equity',
        date: new Date(),
      };

      const result = validateInvestment(validInvestment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject investment with missing required fields', () => {
      const incompleteInvestment = {
        amount: '100000',
      };

      const result = validateInvestment(incompleteInvestment);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"portfolioItem" is required');
      expect(result.errors).toContain('"workspace" is required');
    });
  });

  describe('Pagination Validation', () => {
    it('should validate valid pagination parameters', () => {
      const validPagination = {
        page: 1,
        limit: 20,
        sortBy: 'created',
        sortOrder: 'desc',
      };

      const result = validatePagination(validPagination);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should set default values for pagination', () => {
      const emptyPagination = {};

      const result = validatePagination(emptyPagination);
      expect(result.isValid).toBe(true);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(20);
      expect(result.data?.sortOrder).toBe('desc');
    });

    it('should reject invalid sort order', () => {
      const invalidPagination = {
        sortOrder: 'invalid',
      };

      const result = validatePagination(invalidPagination);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"sortOrder" must be one of [asc, desc]');
    });

    it('should reject page less than 1', () => {
      const invalidPagination = {
        page: 0,
      };

      const result = validatePagination(invalidPagination);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"page" must be greater than or equal to 1');
    });

    it('should reject limit greater than 100', () => {
      const invalidPagination = {
        limit: 101,
      };

      const result = validatePagination(invalidPagination);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"limit" must be less than or equal to 100');
    });
  });
});
