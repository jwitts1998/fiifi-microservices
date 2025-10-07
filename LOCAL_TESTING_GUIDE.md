# 🐳 Local Docker Deployment Testing Guide

## 🎯 Current Status

**✅ PRODUCTION API: FULLY WORKING**
- URL: https://fiifi-core-api-dev-119659061108.us-east1.run.app
- All CRUD operations functional
- MongoDB Atlas connected
- Ready for development

**⚠️ LOCAL SETUP: NEEDS DOCKER DESKTOP**

## 🚀 Option 1: Docker Compose (Recommended)

### Prerequisites
1. **Start Docker Desktop**:
   - Open Applications folder
   - Double-click "Docker" app
   - Wait for Docker to start (whale icon in menu bar)

### Commands
```bash
# Check Docker is running
docker --version
docker-compose --version

# Start local environment
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f core-api

# Stop services
docker-compose down
```

### Access Points
- **API**: http://localhost:3000
- **Dashboard**: http://localhost:3000/index.html
- **Health**: http://localhost:3000/health
- **MongoDB**: localhost:27017

## 🔧 Option 2: Manual Setup (Alternative)

### Prerequisites
- Node.js 18+
- MongoDB Atlas access

### Commands
```bash
# Install dependencies
cd fiifi-core-api
npm install

# Build application
npm run build

# Set environment variables
export MONGODB_URI="mongodb+srv://fiifi-dev-v2:y7LYAZGR5zoK16yp@fiifi-dev.h3qwt.mongodb.net/?retryWrites=true&w=majority&appName=fiifi-dev"
export NODE_ENV="development"
export PORT="3000"

# Start server
npm run dev
```

## 🌐 Option 3: Use Production API (Immediate Solution)

### Why This Works Best Right Now
- ✅ Fully functional
- ✅ MongoDB Atlas connected
- ✅ All endpoints working
- ✅ No local setup required

### Test Commands
```bash
# Health check
curl https://fiifi-core-api-dev-119659061108.us-east1.run.app/health

# Get companies
curl https://fiifi-core-api-dev-119659061108.us-east1.run.app/companies

# Create company
curl -X POST https://fiifi-core-api-dev-119659061108.us-east1.run.app/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "sector": "Technology",
    "status": "active",
    "stage": "Seed",
    "geography": "US",
    "description": "Test company"
  }'
```

## 🎨 Frontend Development

### Dashboard Features
- Real-time company management
- Add/Edit/Delete companies
- Statistics dashboard
- Responsive design
- Auto-detects environment

### Integration Example
```javascript
// Auto-detects local vs production
const API_BASE = window.location.origin;

// Fetch companies
const companies = await fetch(`${API_BASE}/companies`).then(r => r.json());

// Create company
const newCompany = await fetch(`${API_BASE}/companies`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Company',
    sector: 'Technology',
    status: 'active',
    stage: 'Seed',
    geography: 'US',
    description: 'A new company'
  })
}).then(r => r.json());
```

## 🧪 Testing Checklist

### Docker Compose Testing
- [ ] Docker Desktop started
- [ ] `docker-compose up -d` successful
- [ ] Services running (`docker-compose ps`)
- [ ] API accessible (`curl http://localhost:3000/health`)
- [ ] Dashboard accessible (`http://localhost:3000/index.html`)
- [ ] MongoDB connected
- [ ] CRUD operations working

### Manual Setup Testing
- [ ] Dependencies installed
- [ ] Application built
- [ ] Environment variables set
- [ ] Server started
- [ ] MongoDB connected
- [ ] API endpoints responding

### Production API Testing
- [ ] Health check responding
- [ ] Companies endpoint working
- [ ] Create company successful
- [ ] Update company working
- [ ] Delete company working

## 🔍 Troubleshooting

### Docker Issues
```bash
# Check Docker status
docker info

# Restart Docker Desktop
# Kill Docker process and restart

# Clean up containers
docker-compose down
docker system prune -f
```

### Manual Setup Issues
```bash
# Check Node.js version
node --version

# Check MongoDB connection
# Test connection string in MongoDB Compass

# Check port availability
lsof -i :3000
```

### Production API Issues
```bash
# Check service status
gcloud run services describe fiifi-core-api-dev --region=us-east1

# View logs
gcloud run services logs read fiifi-core-api-dev --region=us-east1
```

## 🎯 Recommended Approach

**For Immediate Testing**: Use the production API
- All endpoints working
- MongoDB Atlas connected
- No setup required

**For Full Local Development**: Use Docker Compose
- Complete local environment
- Dashboard UI available
- Full control over environment

**For Custom Frontend**: Use production API
- Stable and reliable
- Perfect for frontend development
- No local setup complexity

---

**The production API is fully functional and ready for development! 🚀**
