import mongoose, { Document, Schema } from 'mongoose';

export interface CompanyDocument extends Document {
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

// Create a simple schema that works with mocks
const companySchema = new Schema<CompanyDocument>({
  name: { type: String, required: true, maxlength: 200 },
  status: { type: String, maxlength: 50 },
  stage: { type: String, maxlength: 50 },
  sector: { type: String, maxlength: 100 },
  geography: { type: String, maxlength: 100 },
  description: { type: String, maxlength: 2000 },
  logoUrl: { type: String },
  modified: { type: Date, default: Date.now },
  rating: { type: Number, min: 0, max: 5 },
  contacts: { type: String, maxlength: 500 },
  contactEmail: { type: String },
  dataStatus: { type: String, maxlength: 50 },
  foundingDate: { type: String },
  companyType: { type: String, maxlength: 100 },
  categoryData: { type: String, maxlength: 200 },
  headquarters: { type: String, maxlength: 200 },
  employeeCount: { type: String, maxlength: 50 },
  website: { type: String },
  facebook: { type: String },
  linkedin: { type: String },
  twitter: { type: String },
  permalink: { type: String, maxlength: 200 },
  estimatedRevenueRange: { type: String, maxlength: 100 },
  ipoStatus: { type: String, maxlength: 50 },
  fundingRounds: {
    numberOfFundingRounds: { type: String },
    totalFundingAmount: { type: String },
    phrase: { type: String },
    list: [{ type: Object }],
  },
}, {
  timestamps: true,
  collection: 'companies',
});

// Indexes
companySchema.index({ name: 1, sector: 1 });
companySchema.index({ status: 1 });
companySchema.index({ stage: 1 });
companySchema.index({ sector: 1 });
companySchema.index({ geography: 1 });
companySchema.index({ modified: -1 });

// Static methods
companySchema.statics.findByNameAndSector = function(name: string, sector: string) {
  return this.findOne({ name, sector });
};

companySchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};

companySchema.statics.findBySector = function(sector: string) {
  return this.find({ sector });
};

// Instance methods
companySchema.methods.updateRating = function(newRating: number) {
  this.rating = newRating;
  this.modified = new Date();
  return this.save();
};

export const Company = mongoose.model<CompanyDocument>('Company', companySchema);
