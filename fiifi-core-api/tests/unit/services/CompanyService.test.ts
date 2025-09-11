import { CompanyService } from '../../../src/services/CompanyService';
import { Company } from '../../../src/models/Company';
import { createValidationError, createNotFoundError } from '../../../src/shared/utils';

// Mock the Company model
jest.mock('../../../src/models/Company');

describe('CompanyService', () => {
  let companyService: CompanyService;
  let mockCompany: any;

  beforeEach(() => {
    companyService = new CompanyService();
    mockCompany = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Company',
      sector: 'Technology',
      description: 'A test company',
      website: 'https://testcompany.com',
      rating: 4.5,
      modified: new Date(),
      save: jest.fn().mockResolvedValue(this),
      updateRating: jest.fn().mockResolvedValue(this),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    it('should create a new company successfully', async () => {
      const companyData = {
        name: 'Test Company',
        sector: 'Technology',
        description: 'A test company',
        website: 'https://testcompany.com',
      };

      (Company as any).findByNameAndSector = jest.fn().mockResolvedValue(null);
      (Company as any).mockImplementation(() => mockCompany);

      const result = await companyService.createCompany(companyData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCompany);
      expect(result.message).toBe('Company created successfully');
      expect((Company as any).findByNameAndSector).toHaveBeenCalledWith('Test Company', 'Technology');
    });

    it('should return existing company if already exists', async () => {
      const companyData = {
        name: 'Existing Company',
        sector: 'Technology',
      };

      (Company as any).findByNameAndSector = jest.fn().mockResolvedValue(mockCompany);

      const result = await companyService.createCompany(companyData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCompany);
      expect(result.message).toBe('Company already exists');
    });

    it('should return error for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        sector: 'Technology',
      };

      const result = await companyService.createCompany(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('is not allowed to be empty');
    });

    it('should handle database errors', async () => {
      const companyData = {
        name: 'Test Company',
        sector: 'Technology',
      };

      (Company as any).findByNameAndSector = jest.fn().mockRejectedValue(new Error('Database error'));

      const result = await companyService.createCompany(companyData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create company');
    });
  });

  describe('getCompanyById', () => {
    it('should return company if found', async () => {
      (Company.findById as jest.Mock).mockResolvedValue(mockCompany);

      const result = await companyService.getCompanyById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCompany);
      expect(result.message).toBe('Company retrieved successfully');
    });

    it('should return error if company not found', async () => {
      (Company.findById as jest.Mock).mockResolvedValue(null);

      const result = await companyService.getCompanyById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Company not found');
    });

    it('should handle database errors', async () => {
      (Company.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await companyService.getCompanyById('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve company');
    });
  });

  describe('getCompanies', () => {
    it('should return paginated companies', async () => {
      const companies = [mockCompany];
      const total = 1;

      (Company.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(companies),
      });
      (Company.countDocuments as jest.Mock).mockResolvedValue(total);

      const result = await companyService.getCompanies({}, { page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(companies);
      expect((result as any).pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter companies by status', async () => {
      const companies = [mockCompany];
      const total = 1;

      (Company.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(companies),
      });
      (Company.countDocuments as jest.Mock).mockResolvedValue(total);

      const result = await companyService.getCompanies(
        { status: 'active' },
        { page: 1, limit: 20 }
      );

      expect(result.success).toBe(true);
      // The filter is applied in the service, so we check the result
      expect(result.data).toEqual(companies);
    });

    it('should search companies by name and description', async () => {
      const companies = [mockCompany];
      const total = 1;

      (Company.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(companies),
      });
      (Company.countDocuments as jest.Mock).mockResolvedValue(total);

      const result = await companyService.getCompanies(
        { search: 'test' },
        { page: 1, limit: 20 }
      );

      expect(result.success).toBe(true);
      // The search is applied in the service, so we check the result
      expect(result.data).toEqual(companies);
    });
  });

  describe('updateCompany', () => {
    it('should update company successfully', async () => {
      const updateData = {
        name: 'Updated Company',
        sector: 'Technology',
      };

      const updatedCompany = { ...mockCompany, ...updateData };

      (Company.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedCompany);

      const result = await companyService.updateCompany('507f1f77bcf86cd799439011', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedCompany);
      expect(result.message).toBe('Company updated successfully');
    });

    it('should return error if company not found', async () => {
      const updateData = {
        name: 'Updated Company',
        sector: 'Technology',
      };

      (Company.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await companyService.updateCompany('507f1f77bcf86cd799439011', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Company not found');
    });

    it('should return error for invalid update data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
      };

      const result = await companyService.updateCompany('507f1f77bcf86cd799439011', invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('is not allowed to be empty');
    });
  });

  describe('deleteCompany', () => {
    it('should delete company successfully', async () => {
      (Company.findByIdAndDelete as jest.Mock).mockResolvedValue(mockCompany);

      const result = await companyService.deleteCompany('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Company deleted successfully');
    });

    it('should return error if company not found', async () => {
      (Company.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await companyService.deleteCompany('507f1f77bcf86cd799439011');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Company not found');
    });
  });

  describe('updateCompanyRating', () => {
    it('should update company rating successfully', async () => {
      (Company.findById as jest.Mock).mockResolvedValue(mockCompany);

      const result = await companyService.updateCompanyRating('507f1f77bcf86cd799439011', 4.5);

      expect(result.success).toBe(true);
      expect(mockCompany.updateRating).toHaveBeenCalledWith(4.5);
      expect(result.message).toBe('Company rating updated successfully');
    });

    it('should return error for invalid rating', async () => {
      const result = await companyService.updateCompanyRating('507f1f77bcf86cd799439011', 6);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rating must be between 0 and 5');
    });

    it('should return error if company not found', async () => {
      (Company.findById as jest.Mock).mockResolvedValue(null);

      const result = await companyService.updateCompanyRating('507f1f77bcf86cd799439011', 4.5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Company not found');
    });
  });

  describe('getCompanyStats', () => {
    it('should return company statistics', async () => {
      const mockStats = {
        totalCompanies: 100,
        avgRating: 4.2,
        statusBreakdown: { active: 80, inactive: 20 },
        sectorBreakdown: { Technology: 60, Finance: 40 },
      };

      (Company.aggregate as jest.Mock).mockResolvedValue([mockStats]);

      const result = await companyService.getCompanyStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(result.message).toBe('Company statistics retrieved successfully');
    });

    it('should handle empty statistics', async () => {
      (Company.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await companyService.getCompanyStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });

    it('should handle database errors', async () => {
      (Company.aggregate as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await companyService.getCompanyStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve company statistics');
    });
  });
});
