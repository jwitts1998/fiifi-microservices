// Test setup file
import mongoose from 'mongoose';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/fiifi-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Global test timeout
jest.setTimeout(10000);

// Mock mongoose for unit tests
jest.mock('mongoose', () => {
  const mockSchema = {
    index: jest.fn(),
    statics: {},
    methods: {},
  };
  
  const mockModel = jest.fn(() => mockSchema) as any;
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  mockModel.countDocuments = jest.fn();
  mockModel.aggregate = jest.fn();
  mockModel.findOne = jest.fn();
  mockModel.findByNameAndSector = jest.fn();
  mockModel.findByStatus = jest.fn();
  mockModel.findBySector = jest.fn();
  
  return {
    connect: jest.fn(),
    connection: {
      readyState: 0,
      dropDatabase: jest.fn(),
      close: jest.fn(),
    },
    model: jest.fn(() => mockModel),
    Schema: jest.fn(() => mockSchema),
    Types: {
      Mixed: Object,
    },
  };
});

// Setup and teardown for database tests (only for integration tests)
if (process.env.NODE_ENV === 'integration') {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });

  // Clean up after each test
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });
}
