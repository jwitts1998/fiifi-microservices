import { Company, CompanyDocument } from '../models/Company';
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
  async createCompany(companyData: any) {
    try {
      // Validate input data
      const validation = validateCompany(companyData);
      if (!validation.isValid) {
        throw createValidationError(validation.errors.join(', '));
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
