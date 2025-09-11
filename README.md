# Fiifi Platform - Microservices Architecture

A comprehensive investment platform built with a modern microservices architecture, designed for scalability, maintainability, and easy integration with other applications.

## 🏗️ Architecture Overview

This project is being migrated from a monolithic structure to a microservices architecture, with the following goals:

1. **Modularity**: Split functionality into independent, focused services
2. **Scalability**: Each service can be scaled independently
3. **Maintainability**: Easier to develop, test, and deploy individual services
4. **Integration**: Simple to integrate with external tools and applications
5. **Cloud-Native**: Designed to run on Google Cloud Platform (GCP)

## 🚀 Migration Phases

### Phase 1: Foundation ✅
- [x] Create shared library (`fiifi-shared`)
- [x] Set up core API microservice (`fiifi-core-api`)
- [x] Implement comprehensive testing framework
- [x] Establish TypeScript configuration
- [x] Set up logging and error handling

### Phase 2: Core Services (In Progress)
- [x] Company management service
- [ ] Investment management service
- [ ] User management service
- [ ] Authentication service
- [ ] Integration tests with real database
- [ ] GitHub Actions CI/CD pipeline

### Phase 3: Additional Services (Planned)
- [ ] Document processing service
- [ ] Email notification service
- [ ] Data aggregation service
- [ ] Analytics service

### Phase 4: Data Migration (Planned)
- [ ] Identify mission-critical data
- [ ] Migrate essential data to new architecture
- [ ] Archive non-essential data

### Phase 5: Environment Setup (Planned)
- [ ] Development environment
- [ ] Staging environment
- [ ] Production environment
- [ ] Terraform infrastructure management

## 📁 Project Structure

```
fiifi_prototype/
├── fiifi-shared/           # Shared utilities and types
├── fiifi-core-api/         # Core business logic API
├── data_core/              # Legacy data processing services
├── site_main/              # Legacy frontend (Vue.js)
├── server_api/             # Legacy backend API
└── README.md               # This file
```

## 🛠️ Technology Stack

### Core Technologies
- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Framework**: Koa.js (new), Express.js (legacy)
- **Database**: MongoDB with Mongoose
- **Testing**: Jest
- **Validation**: Joi
- **Logging**: Winston

### Infrastructure
- **Cloud Provider**: Google Cloud Platform (GCP)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Infrastructure as Code**: Terraform
- **Monitoring**: TBD

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/fiifi-app/fiifi-prototype.git
   cd fiifi-prototype
   ```

2. **Install dependencies for each service**
   ```bash
   # Shared library
   cd fiifi-shared
   npm install
   npm test

   # Core API
   cd ../fiifi-core-api
   npm install
   npm test
   ```

3. **Start development servers**
   ```bash
   # Core API
   cd fiifi-core-api
   npm run dev
   ```

## 🧪 Testing

Each microservice includes comprehensive testing:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints with real database
- **Shared Library Tests**: Test common utilities and types

Run tests:
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

## 📊 Current Status

### ✅ Completed
- Shared library with common types, utilities, and validation
- Core API service with company management
- Comprehensive unit testing (48 tests passing)
- TypeScript configuration and build setup
- Logging and error handling
- Input validation and sanitization

### 🔄 In Progress
- Integration testing setup
- GitHub Actions CI/CD pipeline
- Additional microservices

### 📋 Next Steps
1. Complete integration tests
2. Set up GitHub Actions
3. Create investment management service
4. Set up database connections
5. Deploy to GCP

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This project is currently in active development. The architecture is being migrated from a monolithic structure to microservices. Some features may not be fully functional during the transition period.
