import { CompanyController } from '../../../src/controllers/CompanyController';
import { CompanyService } from '../../../src/services/CompanyService';
import { Context } from 'koa';

// Mock the CompanyService
jest.mock('../../../src/services/CompanyService');

describe('CompanyController', () => {
  let companyController: CompanyController;
  let mockCompanyService: jest.Mocked<CompanyService>;
  let mockContext: Partial<Context>;

  beforeEach(() => {
    companyController = new CompanyController();
    mockCompanyService = new CompanyService() as jest.Mocked<CompanyService>;
    (CompanyService as jest.Mock).mockImplementation(() => mockCompanyService);

    mockContext = {
      params: {},
      query: {},
      request: { body: {} } as any,
      state: { requestId: 'test-request-id' },
      status: 0,
      body: {},
      set: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    it('should create company successfully', async () => {
      const companyData = {
        name: 'Test Company',
        sector: 'Technology',
      };

      const mockResult = {
        success: true,
        data: { id: '123', ...companyData },
        message: 'Company created successfully',
        timestamp: expect.any(String),
      };

      // Mock the service method directly on the instance
      companyController['companyService'].createCompany = jest.fn().mockResolvedValue(mockResult);
      mockContext.request!.body = companyData;

      await companyController.createCompany(mockContext as Context);

      expect(companyController['companyService'].createCompany).toHaveBeenCalledWith(companyData);
      expect(mockContext.status).toBe(201);
      expect(mockContext.body).toEqual(mockResult);
    });

    it('should return 400 for validation error', async () => {
      const companyData = { name: '' };
      const mockResult = {
        success: false,
        error: 'Validation failed',
        message: 'Name is required',
        timestamp: expect.any(String),
      };

      companyController['companyService'].createCompany = jest.fn().mockResolvedValue(mockResult);
      mockContext.request!.body = companyData;

      await companyController.createCompany(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const companyData = { name: 'Test Company' };
      companyController['companyService'].createCompany = jest.fn().mockRejectedValue(new Error('Service error'));
      mockContext.request!.body = companyData;

      await companyController.createCompany(mockContext as Context);

      expect(mockContext.status).toBe(500);
      expect(mockContext.body).toEqual({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create company',
        timestamp: expect.any(String),
      });
    });
  });

  describe('getCompany', () => {
    it('should get company successfully', async () => {
      const companyId = '123';
      const mockResult = {
        success: true,
        data: { id: companyId, name: 'Test Company' },
        message: 'Company retrieved successfully',
        timestamp: expect.any(String),
      };

      companyController['companyService'].getCompanyById = jest.fn().mockResolvedValue(mockResult);
      mockContext.params = { id: companyId };

      await companyController.getCompany(mockContext as Context);

      expect(companyController['companyService'].getCompanyById).toHaveBeenCalledWith(companyId);
      expect(mockContext.status).toBe(200);
      expect(mockContext.body).toEqual(mockResult);
    });

    it('should return 404 for non-existent company', async () => {
      const companyId = '123';
      const mockResult = {
        success: false,
        error: 'Company not found',
        message: 'Company not found',
        timestamp: expect.any(String),
      };

      companyController['companyService'].getCompanyById = jest.fn().mockResolvedValue(mockResult);
      mockContext.params = { id: companyId };

      await companyController.getCompany(mockContext as Context);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toEqual(mockResult);
    });
  });

  describe('getCompanies', () => {
    it('should get companies with pagination', async () => {
      const mockResult = {
        success: true,
        data: [{ id: '1', name: 'Company 1' }],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
        message: 'Companies retrieved successfully',
        timestamp: expect.any(String),
      };

      companyController['companyService'].getCompanies = jest.fn().mockResolvedValue(mockResult);
      mockContext.query = { page: '1', limit: '20' };

      await companyController.getCompanies(mockContext as Context);

      expect(companyController['companyService'].getCompanies).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      );
      expect(mockContext.status).toBe(200);
      expect(mockContext.body).toEqual(mockResult);
    });

    it('should handle filters', async () => {
      const mockResult = {
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        message: 'Companies retrieved successfully',
        timestamp: expect.any(String),
      };

      companyController['companyService'].getCompanies = jest.fn().mockResolvedValue(mockResult);
      mockContext.query = { status: 'active', sector: 'Technology' };

      await companyController.getCompanies(mockContext as Context);

      expect(companyController['companyService'].getCompanies).toHaveBeenCalledWith(
        { status: 'active', sector: 'Technology' },
        expect.any(Object)
      );
    });

    it('should return 400 for invalid pagination', async () => {
      // Test with invalid page and limit values that should fail validation
      mockContext.query = { page: 'not-a-number', limit: 'also-not-a-number' };

      await companyController.getCompanies(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual({
        success: false,
        error: 'Invalid pagination parameters',
        message: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });

  describe('updateCompany', () => {
    it('should update company successfully', async () => {
      const companyId = '123';
      const updateData = { name: 'Updated Company' };
      const mockResult = {
        success: true,
        data: { id: companyId, ...updateData },
        message: 'Company updated successfully',
        timestamp: expect.any(String),
      };

      companyController['companyService'].updateCompany = jest.fn().mockResolvedValue(mockResult);
      mockContext.params = { id: companyId };
      mockContext.request!.body = updateData;

      await companyController.updateCompany(mockContext as Context);

      expect(companyController['companyService'].updateCompany).toHaveBeenCalledWith(companyId, updateData);
      expect(mockContext.status).toBe(200);
      expect(mockContext.body).toEqual(mockResult);
    });

    it('should return 404 for non-existent company', async () => {
      const companyId = '123';
      const updateData = { name: 'Updated Company' };
      const mockResult = {
        success: false,
        error: 'Company not found',
        message: 'Company not found',
        timestamp: expect.any(String),
      };

      companyController['companyService'].updateCompany = jest.fn().mockResolvedValue(mockResult);
      mockContext.params = { id: companyId };
      mockContext.request!.body = updateData;

      await companyController.updateCompany(mockContext as Context);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toEqual(mockResult);
    });
  });

  describe('deleteCompany', () => {
    it('should delete company successfully', async () => {
      const companyId = '123';
      const mockResult = {
        success: true,
        data: null,
        message: 'Company deleted successfully',
        timestamp: expect.any(String),
      };

      companyController['companyService'].deleteCompany = jest.fn().mockResolvedValue(mockResult);
      mockContext.params = { id: companyId };

      await companyController.deleteCompany(mockContext as Context);

      expect(companyController['companyService'].deleteCompany).toHaveBeenCalledWith(companyId);
      expect(mockContext.status).toBe(200);
      expect(mockContext.body).toEqual(mockResult);
    });

    it('should return 404 for non-existent company', async () => {
      const companyId = '123';
      const mockResult = {
        success: false,
        error: 'Company not found',
        message: 'Company not found',
        timestamp: expect.any(String),
      };

      companyController['companyService'].deleteCompany = jest.fn().mockResolvedValue(mockResult);
      mockContext.params = { id: companyId };

      await companyController.deleteCompany(mockContext as Context);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toEqual(mockResult);
    });
  });

  describe('updateCompanyRating', () => {
    it('should update company rating successfully', async () => {
      const companyId = '123';
      const rating = 4.5;
      const mockResult = {
        success: true,
        data: { id: companyId, rating },
        message: 'Company rating updated successfully',
        timestamp: expect.any(String),
      };

      companyController['companyService'].updateCompanyRating = jest.fn().mockResolvedValue(mockResult);
      mockContext.params = { id: companyId };
      mockContext.request!.body = { rating };

      await companyController.updateCompanyRating(mockContext as Context);

      expect(companyController['companyService'].updateCompanyRating).toHaveBeenCalledWith(companyId, rating);
      expect(mockContext.status).toBe(200);
      expect(mockContext.body).toEqual(mockResult);
    });

    it('should return 400 for invalid rating', async () => {
      const companyId = '123';
      mockContext.params = { id: companyId };
      mockContext.request!.body = { rating: 'invalid' };

      await companyController.updateCompanyRating(mockContext as Context);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toEqual({
        success: false,
        error: 'Invalid rating',
        message: 'Rating must be a number',
        timestamp: expect.any(String),
      });
    });
  });

  describe('getCompanyStats', () => {
    it('should get company statistics successfully', async () => {
      const mockResult = {
        success: true,
        data: {
          totalCompanies: 100,
          avgRating: 4.2,
          statusBreakdown: { active: 80, inactive: 20 },
        },
        message: 'Company statistics retrieved successfully',
        timestamp: expect.any(String),
      };

      companyController['companyService'].getCompanyStats = jest.fn().mockResolvedValue(mockResult);

      await companyController.getCompanyStats(mockContext as Context);

      expect(companyController['companyService'].getCompanyStats).toHaveBeenCalled();
      expect(mockContext.status).toBe(200);
      expect(mockContext.body).toEqual(mockResult);
    });
  });
});
