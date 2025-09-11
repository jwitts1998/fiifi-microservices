import { Context } from 'koa';
import { CompanyService } from '../services/CompanyService';
import { validatePagination } from '../shared/validation';
import { Logger } from '../shared/logger';

export class CompanyController {
  private companyService: CompanyService;
  private logger: Logger;

  constructor() {
    this.companyService = new CompanyService();
    this.logger = new Logger('CompanyController');
  }

  async createCompany(ctx: Context) {
    try {
      this.logger.info('Creating company', { 
        requestId: ctx.state.requestId,
        body: ctx.request.body 
      });

      const result = await this.companyService.createCompany(ctx.request.body);
      
      if (result.success) {
        ctx.status = 201;
        ctx.body = result;
      } else {
        ctx.status = 400;
        ctx.body = result;
      }
    } catch (error: any) {
      this.logger.error('Error creating company', error, {
        requestId: ctx.state.requestId,
        body: ctx.request.body
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create company',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCompany(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      this.logger.info('Getting company', { 
        requestId: ctx.state.requestId,
        companyId: id 
      });

      const result = await this.companyService.getCompanyById(id);
      
      if (result.success) {
        ctx.status = 200;
        ctx.body = result;
      } else {
        ctx.status = 404;
        ctx.body = result;
      }
    } catch (error: any) {
      this.logger.error('Error getting company', error, {
        requestId: ctx.state.requestId,
        companyId: ctx.params.id
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve company',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCompanies(ctx: Context) {
    try {
      const filters = {
        status: ctx.query.status,
        sector: ctx.query.sector,
        geography: ctx.query.geography,
        stage: ctx.query.stage,
        search: ctx.query.search,
      };

      // Parse pagination parameters with proper validation
      const pageStr = ctx.query.page as string;
      const limitStr = ctx.query.limit as string;
      
      const page = pageStr ? parseInt(pageStr, 10) : 1;
      const limit = limitStr ? parseInt(limitStr, 10) : 20;
      
      // Check if parsing resulted in NaN
      if (isNaN(page) || isNaN(limit)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid pagination parameters',
          message: 'Page and limit must be valid numbers',
          timestamp: new Date().toISOString(),
        };
        return;
      }

      const pagination = {
        page,
        limit,
        sortBy: ctx.query.sortBy as string || 'modified',
        sortOrder: ctx.query.sortOrder as string || 'desc',
      };

      // Validate pagination
      const paginationValidation = validatePagination(pagination);
      if (!paginationValidation.isValid) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid pagination parameters',
          message: paginationValidation.errors.join(', '),
          timestamp: new Date().toISOString(),
        };
        return;
      }

      this.logger.info('Getting companies', { 
        requestId: ctx.state.requestId,
        filters,
        pagination: paginationValidation.data
      });

      const result = await this.companyService.getCompanies(filters, paginationValidation.data);
      
      ctx.status = 200;
      ctx.body = result;
    } catch (error: any) {
      this.logger.error('Error getting companies', error, {
        requestId: ctx.state.requestId,
        query: ctx.query
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve companies',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateCompany(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      this.logger.info('Updating company', { 
        requestId: ctx.state.requestId,
        companyId: id,
        body: ctx.request.body
      });

      const result = await this.companyService.updateCompany(id, ctx.request.body);
      
      if (result.success) {
        ctx.status = 200;
        ctx.body = result;
      } else {
        ctx.status = result.error?.includes('not found') ? 404 : 400;
        ctx.body = result;
      }
    } catch (error: any) {
      this.logger.error('Error updating company', error, {
        requestId: ctx.state.requestId,
        companyId: ctx.params.id,
        body: ctx.request.body
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update company',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async deleteCompany(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      this.logger.info('Deleting company', { 
        requestId: ctx.state.requestId,
        companyId: id
      });

      const result = await this.companyService.deleteCompany(id);
      
      if (result.success) {
        ctx.status = 200;
        ctx.body = result;
      } else {
        ctx.status = 404;
        ctx.body = result;
      }
    } catch (error: any) {
      this.logger.error('Error deleting company', error, {
        requestId: ctx.state.requestId,
        companyId: ctx.params.id
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete company',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateCompanyRating(ctx: Context) {
    try {
      const { id } = ctx.params;
      const body = ctx.request.body as any;
      const { rating } = body;
      
      this.logger.info('Updating company rating', { 
        requestId: ctx.state.requestId,
        companyId: id,
        rating
      });

      if (typeof rating !== 'number') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid rating',
          message: 'Rating must be a number',
          timestamp: new Date().toISOString(),
        };
        return;
      }

      const result = await this.companyService.updateCompanyRating(id, rating);
      
      if (result.success) {
        ctx.status = 200;
        ctx.body = result;
      } else {
        ctx.status = result.error?.includes('not found') ? 404 : 400;
        ctx.body = result;
      }
    } catch (error: any) {
      this.logger.error('Error updating company rating', error, {
        requestId: ctx.state.requestId,
        companyId: ctx.params.id,
        rating: (ctx.request.body as any)?.rating
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update company rating',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCompanyStats(ctx: Context) {
    try {
      this.logger.info('Getting company statistics', { 
        requestId: ctx.state.requestId
      });

      const result = await this.companyService.getCompanyStats();
      
      ctx.status = 200;
      ctx.body = result;
    } catch (error: any) {
      this.logger.error('Error getting company statistics', error, {
        requestId: ctx.state.requestId
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve company statistics',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
