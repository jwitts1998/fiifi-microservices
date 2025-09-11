import Joi from 'joi';

// Pagination validation
export const validatePagination = (data: any) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('name', 'created', 'modified', 'rating').default('modified'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  });

  const { error, value } = schema.validate(data);
  return {
    isValid: !error,
    data: value,
    errors: error ? error.details.map(d => d.message) : [],
  };
};

// Company validation - matches the actual Company model
export const validateCompany = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required().min(1).max(200),
    sector: Joi.string().max(100),
    status: Joi.string().valid('active', 'inactive', 'pending', 'archived').max(50),
    stage: Joi.string().max(50),
    geography: Joi.string().max(100),
    description: Joi.string().max(2000),
    logoUrl: Joi.string().uri(),
    rating: Joi.number().min(0).max(5),
    contacts: Joi.string().max(500),
    contactEmail: Joi.string().email(),
    dataStatus: Joi.string().max(50),
    foundingDate: Joi.string(),
    companyType: Joi.string().max(100),
    categoryData: Joi.string().max(200),
    headquarters: Joi.string().max(200),
    employeeCount: Joi.string().max(50),
    website: Joi.string().uri(),
    facebook: Joi.string().uri(),
    linkedin: Joi.string().uri(),
    twitter: Joi.string().uri(),
    permalink: Joi.string().max(200),
    estimatedRevenueRange: Joi.string().max(100),
    ipoStatus: Joi.string().max(50),
    fundingRounds: Joi.object({
      numberOfFundingRounds: Joi.string(),
      totalFundingAmount: Joi.string(),
      phrase: Joi.string(),
      list: Joi.array().items(Joi.object()),
    }),
  });

  const { error, value } = schema.validate(data);
  return {
    isValid: !error,
    data: value,
    errors: error ? error.details.map(d => d.message) : [],
  };
};

// Investment validation
export const validateInvestment = (data: any) => {
  const schema = Joi.object({
    companyId: Joi.string().required(),
    investorId: Joi.string().required(),
    amount: Joi.number().required().min(0),
    equity: Joi.number().min(0).max(100),
    valuation: Joi.number().min(0),
    date: Joi.date().default(Date.now),
    stage: Joi.string().valid('Idea', 'MVP', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Series E', 'IPO', 'Acquired').required(),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'completed').default('pending'),
    notes: Joi.string().max(2000),
  });

  const { error, value } = schema.validate(data);
  return {
    isValid: !error,
    data: value,
    errors: error ? error.details.map(d => d.message) : [],
  };
};

// User validation
export const validateUser = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(8).max(128).required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    role: Joi.string().valid('admin', 'user', 'investor', 'analyst').default('user'),
    status: Joi.string().valid('active', 'inactive', 'pending').default('active'),
    phone: Joi.string().max(50),
    company: Joi.string().max(255),
    title: Joi.string().max(255),
  });

  const { error, value } = schema.validate(data);
  return {
    isValid: !error,
    data: value,
    errors: error ? error.details.map(d => d.message) : [],
  };
};

// Portfolio validation
export const validatePortfolio = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required().min(1).max(255),
    description: Joi.string().max(2000),
    investorId: Joi.string().required(),
    companies: Joi.array().items(Joi.string()),
    totalValue: Joi.number().min(0),
    totalInvested: Joi.number().min(0),
    performance: Joi.object({
      totalReturn: Joi.number(),
      annualizedReturn: Joi.number(),
      irr: Joi.number(),
    }),
  });

  const { error, value } = schema.validate(data);
  return {
    isValid: !error,
    data: value,
    errors: error ? error.details.map(d => d.message) : [],
  };
};
