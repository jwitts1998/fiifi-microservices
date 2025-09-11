import request from 'supertest';
import { createApp } from '../../src/server';

const app = createApp();

describe('Company Integration Tests', () => {
  let companyId: string;

  beforeAll(async () => {
    // Set up test data
    const response = await request(app.callback())
      .post('/companies')
      .send({
        name: 'Test Company',
        sector: 'Technology',
        status: 'active',
        stage: 'Series A',
        geography: 'US',
        description: 'A test company',
        website: 'https://test.com',
        foundedYear: 2020,
        employeeCount: 50,
        revenue: 1000000,
        valuation: 10000000,
        rating: 4.5,
        tags: ['tech', 'startup'],
        contactInfo: {
          email: 'test@test.com',
          phone: '+1234567890',
          address: '123 Test St, Test City, TS 12345'
        },
        socialMedia: {
          linkedin: 'https://linkedin.com/company/test',
          twitter: 'https://twitter.com/test',
          facebook: 'https://facebook.com/test'
        },
        financials: {
          revenue: 1000000,
          profit: 100000,
          assets: 5000000,
          liabilities: 2000000,
          equity: 3000000
        },
        metrics: {
          monthlyActiveUsers: 10000,
          customerAcquisitionCost: 100,
          lifetimeValue: 1000,
          churnRate: 0.05
        }
      });

    if (response.body.success) {
      companyId = response.body.data._id;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (companyId) {
      await request(app.callback()).delete(`/companies/${companyId}`);
    }
  });

  describe('POST /companies', () => {
    it('should create a new company', async () => {
      const companyData = {
        name: 'New Test Company',
        sector: 'Healthcare',
        status: 'active',
        stage: 'Seed',
        geography: 'US',
        description: 'A new test company',
        website: 'https://newtest.com',
        foundedYear: 2021,
        employeeCount: 25,
        revenue: 500000,
        valuation: 5000000,
        rating: 4.0,
        tags: ['healthcare', 'startup'],
        contactInfo: {
          email: 'newtest@test.com',
          phone: '+1234567891',
          address: '456 New Test St, New Test City, NTS 67890'
        }
      };

      const response = await request(app.callback())
        .post('/companies')
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(companyData);
    });

    it('should return 400 for invalid company data', async () => {
      const response = await request(app.callback())
        .post('/companies')
        .send({
          name: '', // Invalid: empty name
          sector: 'Technology'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /companies/:id', () => {
    it('should get a company by ID', async () => {
      if (!companyId) {
        // Skip if no company was created
        return;
      }

      const response = await request(app.callback())
        .get(`/companies/${companyId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(companyId);
    });

    it('should return 404 for non-existent company', async () => {
      const response = await request(app.callback())
        .get('/companies/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /companies', () => {
    it('should get all companies with default pagination', async () => {
      const response = await request(app.callback())
        .get('/companies');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('companies');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should get companies with filters', async () => {
      const response = await request(app.callback())
        .get('/companies?sector=Technology&status=active');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid pagination', async () => {
      const response = await request(app.callback())
        .get('/companies?page=invalid&limit=not-a-number');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /companies/:id', () => {
    it('should update a company', async () => {
      if (!companyId) {
        // Skip if no company was created
        return;
      }

      const updateData = {
        name: 'Updated Test Company',
        description: 'Updated description'
      };

      const response = await request(app.callback())
        .put(`/companies/${companyId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent company', async () => {
      const response = await request(app.callback())
        .put('/companies/507f1f77bcf86cd799439011')
        .send({ name: 'Updated Company' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /companies/:id', () => {
    it('should delete a company', async () => {
      if (!companyId) {
        // Skip if no company was created
        return;
      }

      const response = await request(app.callback())
        .delete(`/companies/${companyId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent company', async () => {
      const response = await request(app.callback())
        .delete('/companies/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /companies/:id/rating', () => {
    it('should update company rating', async () => {
      if (!companyId) {
        // Skip if no company was created
        return;
      }

      const response = await request(app.callback())
        .patch(`/companies/${companyId}/rating`)
        .send({ rating: 4.8 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(4.8);
    });

    it('should return 400 for invalid rating', async () => {
      if (!companyId) {
        // Skip if no company was created
        return;
      }

      const response = await request(app.callback())
        .patch(`/companies/${companyId}/rating`)
        .send({ rating: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /companies/stats', () => {
    it('should get company statistics', async () => {
      const response = await request(app.callback())
        .get('/companies/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCompanies');
      expect(response.body.data).toHaveProperty('companiesByStatus');
      expect(response.body.data).toHaveProperty('companiesBySector');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.callback())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
