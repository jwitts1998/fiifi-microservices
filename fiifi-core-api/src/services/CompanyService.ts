import { Company, CompanyDocument } from '../models/Company';
import mongoose from 'mongoose';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createPaginatedResponse,
  createNotFoundError,
  createValidationError,
  calculateOffset,
  calculateTotalPages
} from '../shared/utils';
import { validateCompany } from '../shared/validation';

export class CompanyService {
  private isDatabaseConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private getMockCompanies() {
    return [
      {
        _id: 'mock-1',
        name: 'TechCorp Inc.',
        sector: 'Technology',
        status: 'active',
        stage: 'Series A',
        geography: 'US',
        description: 'A leading technology company',
        rating: 4.5,
        modified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'mock-2',
        name: 'HealthTech Solutions',
        sector: 'Healthcare',
        status: 'active',
        stage: 'Seed',
        geography: 'US',
        description: 'Innovative healthcare technology',
        rating: 4.2,
        modified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getMockStats() {
    return {
      totalCompanies: 2,
      avgRating: 4.35,
      statusBreakdown: {
        active: 2
      },
      sectorBreakdown: {
        Technology: 1,
        Healthcare: 1
      }
    };
  }

  async createCompany(companyData: any) {
    try {
      // Validate input data
      const validation = validateCompany(companyData);
      if (!validation.isValid) {
        throw createValidationError(validation.errors.join(', '));
      }

      if (!this.isDatabaseConnected()) {
        return createSuccessResponse(
          { ...validation.data, _id: 'mock-' + Date.now() }, 
          'Company created successfully (mock mode)'
        );
      }

      // Check if company already exists
      const existingCompany = await (Company as any).findByNameAndSector(
        validation.data!.name,
        validation.data!.sector || ''
      );

      if (existingCompany) {
        return createSuccessResponse(existingCompany, 'Company already exists');
      }

      // Create new company
      const company = new Company(validation.data);
      await company.save();

      return createSuccessResponse(company, 'Company created successfully');
    } catch (error: any) {
      if (error.isOperational) {
        return createErrorResponse(error.message);
      }
      return createErrorResponse('Failed to create company', error.message);
    }
  }

  async getCompanyById(id: string) {
    try {
      if (!this.isDatabaseConnected()) {
        const mockCompanies = this.getMockCompanies();
        const company = mockCompanies.find(c => c._id === id);
        if (!company) {
          return createErrorResponse('Company not found', createNotFoundError('Company').message);
        }
        return createSuccessResponse(company, 'Company retrieved successfully (mock mode)');
      }

      const company = await Company.findById(id);
      if (!company) {
        return createErrorResponse('Company not found', createNotFoundError('Company').message);
      }

      return createSuccessResponse(company, 'Company retrieved successfully');
    } catch (error: any) {
      return createErrorResponse('Failed to retrieve company', error.message);
    }
  }

  async getCompanies(filters: any = {}, pagination: any = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'modified',
        sortOrder = 'desc',
        ...searchFilters
      } = pagination;

      if (!this.isDatabaseConnected()) {
        const mockCompanies = this.getMockCompanies();
        const total = mockCompanies.length;
        const totalPages = calculateTotalPages(total, limit);
        const offset = calculateOffset(page, limit);
        const paginatedCompanies = mockCompanies.slice(offset, offset + limit);

        return createPaginatedResponse(
          paginatedCompanies,
          page,
          limit,
          total,
          'Companies retrieved successfully (mock mode)'
        );
      }

      // Build query
      const query: any = {};
      
      if (searchFilters.status) {
        query.status = searchFilters.status;
      }
      if (searchFilters.sector) {
        query.sector = searchFilters.sector;
      }
      if (searchFilters.geography) {
        query.geography = searchFilters.geography;
      }
      if (searchFilters.stage) {
        query.stage = searchFilters.stage;
      }
      if (searchFilters.search) {
        query.$or = [
          { name: { $regex: searchFilters.search, $options: 'i' } },
          { description: { $regex: searchFilters.search, $options: 'i' } },
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const offset = calculateOffset(page, limit);
      const [companies, total] = await Promise.all([
        Company.find(query)
          .sort(sort)
          .skip(offset)
          .limit(limit)
          .lean(),
        Company.countDocuments(query),
      ]);

      const totalPages = calculateTotalPages(total, limit);

      return createPaginatedResponse(
        companies,
        page,
        limit,
        total,
        'Companies retrieved successfully'
      );
    } catch (error: any) {
      return createErrorResponse('Failed to retrieve companies', error.message);
    }
  }

  async updateCompany(id: string, updateData: any) {
    try {
      // Validate update data
      const validation = validateCompany(updateData);
      if (!validation.isValid) {
        throw createValidationError(validation.errors.join(', '));
      }

      if (!this.isDatabaseConnected()) {
        return createSuccessResponse(
          { ...validation.data, _id: id, modified: new Date() }, 
          'Company updated successfully (mock mode)'
        );
      }

      const company = await Company.findByIdAndUpdate(
        id,
        { ...validation.data, modified: new Date() },
        { new: true, runValidators: true }
      );

      if (!company) {
        return createErrorResponse('Company not found', createNotFoundError('Company').message);
      }

      return createSuccessResponse(company, 'Company updated successfully');
    } catch (error: any) {
      if (error.isOperational) {
        return createErrorResponse(error.message);
      }
      return createErrorResponse('Failed to update company', error.message);
    }
  }

  async deleteCompany(id: string) {
    try {
      if (!this.isDatabaseConnected()) {
        return createSuccessResponse(null, 'Company deleted successfully (mock mode)');
      }

      const company = await Company.findByIdAndDelete(id);
      if (!company) {
        return createErrorResponse('Company not found', createNotFoundError('Company').message);
      }

      return createSuccessResponse(null, 'Company deleted successfully');
    } catch (error: any) {
      return createErrorResponse('Failed to delete company', error.message);
    }
  }

  async updateCompanyRating(id: string, rating: number) {
    try {
      if (rating < 0 || rating > 5) {
        throw createValidationError('Rating must be between 0 and 5');
      }

      if (!this.isDatabaseConnected()) {
        return createSuccessResponse(
          { _id: id, rating, modified: new Date() }, 
          'Company rating updated successfully (mock mode)'
        );
      }

      const company = await Company.findById(id);
      if (!company) {
        return createErrorResponse('Company not found', createNotFoundError('Company').message);
      }

      await (company as any).updateRating(rating);
      return createSuccessResponse(company, 'Company rating updated successfully');
    } catch (error: any) {
      if (error.isOperational) {
        return createErrorResponse(error.message);
      }
      return createErrorResponse('Failed to update company rating', error.message);
    }
  }

  async getCompanyStats() {
    try {
      if (!this.isDatabaseConnected()) {
        return createSuccessResponse(this.getMockStats(), 'Company statistics retrieved successfully (mock mode)');
      }

      const stats = await Company.aggregate([
        {
          $group: {
            _id: null,
            totalCompanies: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            byStatus: {
              $push: {
                status: '$status',
                count: 1,
              },
            },
            bySector: {
              $push: {
                sector: '$sector',
                count: 1,
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalCompanies: 1,
            avgRating: { $round: ['$avgRating', 2] },
            statusBreakdown: {
              $reduce: {
                input: '$byStatus',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [
                          {
                            k: '$$this.status',
                            v: { $sum: ['$$this.count', { $ifNull: ['$$value.$$this.status', 0] }] },
                          },
                        ],
                      ],
                    },
                  ],
                },
              },
            },
            sectorBreakdown: {
              $reduce: {
                input: '$bySector',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [
                          {
                            k: '$$this.sector',
                            v: { $sum: ['$$this.count', { $ifNull: ['$$value.$$this.sector', 0] }] },
                          },
                        ],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      ]);

      return createSuccessResponse(stats[0] || {}, 'Company statistics retrieved successfully');
    } catch (error: any) {
      return createErrorResponse('Failed to retrieve company statistics', error.message);
    }
  }
}
