# 🚀 Fiifi Developer Guide

## 📋 Overview
This guide covers how to run the Fiifi application locally and work with the development environment.

## 🏗️ Architecture
- **Backend**: Node.js + TypeScript + Koa.js
- **Database**: MongoDB Atlas (us-east-1)
- **Frontend**: Single Page Application (SPA)
- **Deployment**: Google Cloud Run
- **Security**: Google Secret Manager

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+
- npm
- Docker & Docker Compose (optional)
- MongoDB Atlas access

### Method 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd fiifi-microservices-1

# Start all services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f core-api
```

**Services Started**:
- MongoDB: `localhost:27017`
- Core API: `localhost:3000`
- Dashboard: `http://localhost:3000/index.html`

### Method 2: Manual Setup

```bash
# Install dependencies
cd fiifi-core-api
npm install

# Build the application
npm run build

# Set environment variables
export MONGODB_URI="mongodb+srv://fiifi-dev-v2:<password>@fiifi-dev.h3qwt.mongodb.net/?retryWrites=true&w=majority&appName=fiifi-dev"
export NODE_ENV="development"
export PORT="3000"

# Start the server
npm run dev
```

## 🌐 API Endpoints

### Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://fiifi-core-api-dev-119659061108.us-east1.run.app`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API information |
| GET | `/companies` | List all companies |
| POST | `/companies` | Create new company |
| GET | `/companies/:id` | Get specific company |
| PUT | `/companies/:id` | Update company |
| DELETE | `/companies/:id` | Delete company |
| GET | `/companies/stats` | Company statistics |
| GET | `/index.html` | Dashboard UI |

### Example API Usage

```bash
# Health check
curl http://localhost:3000/health

# Get companies
curl http://localhost:3000/companies

# Create company
curl -X POST http://localhost:3000/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "sector": "Technology",
    "status": "active",
    "stage": "Seed",
    "geography": "US",
    "description": "A test company"
  }'
```

## 🎨 Frontend Development

### Dashboard Features
- Real-time company management
- Statistics dashboard
- Add/Edit/Delete companies
- Responsive design
- Auto-detects local vs production environment

### Frontend Integration
The dashboard automatically detects the environment:
- **Local**: Uses `http://localhost:3000`
- **Production**: Uses the deployed Cloud Run URL

### Custom Frontend Development
You can build your own frontend using the API:

```javascript
const API_BASE = 'http://localhost:3000'; // or production URL

// Fetch companies
const companies = await fetch(`${API_BASE}/companies`).then(r => r.json());

// Create company
const newCompany = await fetch(`${API_BASE}/companies`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(companyData)
}).then(r => r.json());
```

## 🧪 Testing

### Run Tests
```bash
cd fiifi-core-api

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Test Database
- Uses MongoDB Atlas dev cluster
- Test data is isolated
- Cleanup endpoints available

## 🚀 Deployment

### Deploy to Cloud Run
```bash
# Deploy to dev environment
./deploy.sh

# Check deployment status
gcloud run services describe fiifi-core-api-dev --region=us-east1
```

### Environment Variables
Production uses Google Secret Manager:
- `MONGODB_USERNAME`: Database username
- `MONGODB_PASSWORD`: Database password
- `MONGODB_HOST`: Database host
- `MONGODB_OPTIONS`: Connection options

## 🔧 Development Workflow

### 1. Start Local Environment
```bash
docker-compose up -d
```

### 2. Make Changes
- Edit code in `fiifi-core-api/src/`
- Frontend changes in `fiifi-core-api/public/`

### 3. Test Changes
```bash
# Test API
curl http://localhost:3000/health

# Test frontend
open http://localhost:3000/index.html
```

### 4. Deploy Changes
```bash
./deploy.sh
```

## 📊 Monitoring & Debugging

### View Logs
```bash
# Local logs
docker-compose logs -f core-api

# Production logs
gcloud run services logs read fiifi-core-api-dev --region=us-east1
```

### Health Checks
- **Local**: `http://localhost:3000/health`
- **Production**: `https://fiifi-core-api-dev-119659061108.us-east1.run.app/health`

## 🗄️ Database Management

### MongoDB Atlas
- **Cluster**: fiifi-dev (us-east-1)
- **Database**: fiifi
- **User**: fiifi-dev-v2
- **Storage**: 275.06 MB / 512 MB (54% capacity)

### Database Operations
```bash
# Connect to database
mongosh "mongodb+srv://fiifi-dev-v2:<password>@fiifi-dev.h3qwt.mongodb.net/"

# Use fiifi database
use('fiifi');

# List collections
db.getCollectionNames();

# View companies
db.companies.find().limit(5);
```

## 🔐 Security

### Production Security
- Google Secret Manager for credentials
- CORS properly configured
- Non-root Docker user
- Health checks enabled

### Local Development Security
- Environment variables for sensitive data
- Local MongoDB or Atlas dev cluster
- No production credentials in code

## 📝 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check credentials in Secret Manager
   - Verify network access
   - Check MongoDB Atlas cluster status

2. **Static Files Not Loading**
   - Verify Dockerfile includes public directory
   - Check Cloud Run logs
   - Use API endpoints directly

3. **CORS Issues**
   - Verify CORS middleware configuration
   - Check browser console for errors
   - Test with curl first

### Getting Help
- Check logs: `gcloud run services logs read fiifi-core-api-dev --region=us-east1`
- Test API: `curl https://fiifi-core-api-dev-119659061108.us-east1.run.app/health`
- Verify deployment: `gcloud run services describe fiifi-core-api-dev --region=us-east1`

## 🎯 Next Steps

1. **Fix Static File Serving**: Configure Cloud Run to serve static files
2. **Add Authentication**: Implement user authentication
3. **Expand API**: Add more microservices
4. **Improve Frontend**: Enhance dashboard with more features
5. **Add Monitoring**: Implement proper monitoring and alerting

---

**Happy Coding! 🚀**
