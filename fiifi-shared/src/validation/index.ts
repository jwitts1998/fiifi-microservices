import Joi from 'joi';
import { ValidationResult } from '../types';

// User validation schemas
export const userSchema = Joi.object({
  id: Joi.string().optional(),
  uuid: Joi.string().required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  image: Joi.string().uri().optional(),
  accountId: Joi.number().integer().positive().required(),
  lastLoggedIn: Joi.date().optional(),
  isDelete: Joi.boolean().default(false),
  aboutMe: Joi.string().max(1000).optional(),
  created: Joi.date().default(() => new Date()),
  modified: Joi.date().default(() => new Date()),
  activatePro: Joi.number().integer().min(0).default(0),
  s3Key: Joi.string().optional(),
});

// Company validation schemas
export const companySchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).max(200).required(),
  status: Joi.string().max(50).optional(),
  stage: Joi.string().max(50).optional(),
  sector: Joi.string().max(100).optional(),
  geography: Joi.string().max(100).optional(),
  description: Joi.string().max(2000).optional(),
  logoUrl: Joi.string().uri().optional(),
  modified: Joi.date().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  contacts: Joi.string().max(500).optional(),
  contactEmail: Joi.string().email().optional(),
  dataStatus: Joi.string().max(50).optional(),
  foundingDate: Joi.string().optional(),
  companyType: Joi.string().max(100).optional(),
  categoryData: Joi.string().max(200).optional(),
  headquarters: Joi.string().max(200).optional(),
  employeeCount: Joi.string().max(50).optional(),
  website: Joi.string().uri().optional(),
  facebook: Joi.string().uri().optional(),
  linkedin: Joi.string().uri().optional(),
  twitter: Joi.string().uri().optional(),
  permalink: Joi.string().max(200).optional(),
  estimatedRevenueRange: Joi.string().max(100).optional(),
  ipoStatus: Joi.string().max(50).optional(),
  fundingRounds: Joi.object({
    numberOfFundingRounds: Joi.string().optional(),
    totalFundingAmount: Joi.string().optional(),
    phrase: Joi.string().optional(),
    list: Joi.array().items(Joi.object()).optional(),
  }).optional(),
});

// Investment validation schemas
export const investmentSchema = Joi.object({
  id: Joi.string().optional(),
  portfolioItem: Joi.string().required(),
  workspace: Joi.string().required(),
  offering: Joi.string().max(200).optional(),
  direct: Joi.string().max(200).optional(),
  cohort: Joi.string().max(200).optional(),
  investmentType: Joi.string().max(100).optional(),
  term: Joi.string().max(100).optional(),
  date: Joi.date().optional(),
  amount: Joi.string().max(50).optional(),
  proceedsAmount: Joi.string().max(50).optional(),
  discount: Joi.string().max(50).optional(),
  interest: Joi.string().max(50).optional(),
  exercisePrice: Joi.string().max(50).optional(),
  coverage: Joi.string().max(50).optional(),
  maturityDate: Joi.date().optional(),
  security: Joi.string().max(100).optional(),
  interestRate: Joi.string().max(50).optional(),
  dueDate: Joi.date().optional(),
  pricePerShare: Joi.string().max(50).optional(),
  investmentProceedsType: Joi.string().max(100).optional(),
  noOfShares: Joi.string().max(50).optional(),
  termYears: Joi.string().max(50).optional(),
  cap: Joi.string().max(50).optional(),
  isProrata: Joi.boolean().optional(),
  isLeadInvestor: Joi.boolean().optional(),
  equity: Joi.string().max(50).optional(),
  equityStanding: Joi.string().optional(),
  notes: Joi.string().max(2000).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  boardSeat: Joi.boolean().optional(),
  informationRights: Joi.boolean().optional(),
  currentValue: Joi.string().max(50).optional(),
  modified: Joi.date().optional(),
  refer: Joi.object().optional(),
  created: Joi.date().optional(),
});

// API validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Validation utility functions
export function validateData<T>(schema: Joi.ObjectSchema, data: any): ValidationResult {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value as T,
  };
}

export function validateUser(userData: any): ValidationResult {
  return validateData(userSchema, userData);
}

export function validateCompany(companyData: any): ValidationResult {
  return validateData(companySchema, companyData);
}

export function validateInvestment(investmentData: any): ValidationResult {
  return validateData(investmentSchema, investmentData);
}

export function validatePagination(paginationData: any): ValidationResult {
  return validateData(paginationSchema, paginationData);
}
