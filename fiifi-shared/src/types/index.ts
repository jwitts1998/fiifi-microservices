// Core domain types
export interface User {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  accountId: number;
  lastLoggedIn?: Date;
  isDelete: boolean;
  aboutMe?: string;
  created: Date;
  modified: Date;
  activatePro: number;
  s3Key?: string;
}

export interface Company {
  id: string;
  name: string;
  status?: string;
  stage?: string;
  sector?: string;
  geography?: string;
  description?: string;
  logoUrl?: string;
  modified?: Date;
  rating?: number;
  contacts?: string;
  contactEmail?: string;
  dataStatus?: string;
  foundingDate?: string;
  companyType?: string;
  categoryData?: string;
  headquarters?: string;
  employeeCount?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  permalink?: string;
  estimatedRevenueRange?: string;
  ipoStatus?: string;
  fundingRounds?: {
    numberOfFundingRounds: string;
    totalFundingAmount: string;
    phrase: string;
    list: any[];
  };
}

export interface Investment {
  id: string;
  portfolioItem: string;
  workspace: string;
  offering?: string;
  direct?: string;
  cohort?: string;
  investmentType?: string;
  term?: string;
  date?: Date;
  amount?: string;
  proceedsAmount?: string;
  discount?: string;
  interest?: string;
  exercisePrice?: string;
  coverage?: string;
  maturityDate?: Date;
  security?: string;
  interestRate?: string;
  dueDate?: Date;
  pricePerShare?: string;
  investmentProceedsType?: string;
  noOfShares?: string;
  termYears?: string;
  cap?: string;
  isProrata?: boolean;
  isLeadInvestor?: boolean;
  equity?: string;
  equityStanding?: string;
  notes?: string;
  tags?: string[];
  boardSeat?: boolean;
  informationRights?: boolean;
  currentValue?: string;
  modified?: Date;
  refer?: any;
  created?: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  workspace: string;
  created: Date;
  modified: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Service configuration types
export interface ServiceConfig {
  port: number;
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  database: {
    uri: string;
    name: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  external: {
    [key: string]: any;
  };
}

// Error types
export class FiifiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

// Logging types
export interface LogContext {
  service: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  [key: string]: any;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
