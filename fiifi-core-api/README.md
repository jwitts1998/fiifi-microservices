# Fiifi Core API

Core API microservice for the Fiifi platform, built with Koa.js and TypeScript.

## Features

- Company management (CRUD operations)
- Advanced filtering and search
- Pagination support
- Rating system
- Statistics and analytics
- Comprehensive logging
- Input validation
- Error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Koa.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Build
npm run build

# Start production server
npm start
```

## API Endpoints

### Companies

- `POST /companies` - Create a new company
- `GET /companies/:id` - Get company by ID
- `GET /companies` - Get all companies (with filtering and pagination)
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company
- `PATCH /companies/:id/rating` - Update company rating
- `GET /companies/stats` - Get company statistics

### Health Check

- `GET /health` - Health check endpoint

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string

## Testing

The project includes comprehensive unit and integration tests:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints with real database

Run tests with:
```bash
npm test
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── shared/          # Shared utilities and types
└── server.ts        # Server setup
```
