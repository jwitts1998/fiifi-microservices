# Fiifi Platform Rollback Plan
## Emergency Procedures & Risk Mitigation

**Document Version**: 1.0  
**Last Updated**: September 10, 2025  
**Emergency Contact**: [Your Contact Information]

---

## 🚨 **Emergency Rollback Procedures**

### **Immediate Rollback (0-5 minutes)**

#### **Step 1: Stop New Services**
```bash
# Stop microservices
docker-compose down

# Stop CI/CD pipeline
# (GitHub Actions will stop automatically)
```

#### **Step 2: Switch Traffic to Original System**
```bash
# Navigate to original system
cd ../fiifi_prototype

# Start original backend
cd server_api
npm start

# Start original frontend
cd ../site_main
npm run dev
```

#### **Step 3: Verify Original System**
- [ ] Check backend API endpoints
- [ ] Verify frontend dashboard loads
- [ ] Test critical user workflows
- [ ] Confirm database connectivity

---

## 🔄 **Gradual Rollback (5-30 minutes)**

### **If New System Has Partial Issues**

#### **Step 1: Identify Affected Services**
```bash
# Check service health
curl http://localhost:3000/health
curl http://localhost:3001/health

# Check logs
docker-compose logs fiifi-core-api
docker-compose logs fiifi-shared
```

#### **Step 2: Disable Problematic Features**
```bash
# Use feature flags to disable new functionality
export DISABLE_NEW_COMPANY_API=true
export USE_LEGACY_AUTH=true

# Restart services
docker-compose restart
```

#### **Step 3: Route Traffic Away from Problematic Services**
```bash
# Update load balancer configuration
# Route company API calls to original server_api
# Keep other services running
```

---

## 📊 **Rollback Decision Matrix**

| Issue Type | Severity | Rollback Action | Timeline |
|------------|----------|-----------------|----------|
| **Complete System Failure** | Critical | Immediate rollback | 0-5 minutes |
| **Data Loss/Corruption** | Critical | Immediate rollback | 0-5 minutes |
| **Security Breach** | Critical | Immediate rollback | 0-5 minutes |
| **Performance Degradation** | High | Gradual rollback | 5-15 minutes |
| **Feature Malfunction** | Medium | Feature flag disable | 5-30 minutes |
| **Minor Bug** | Low | Hot fix deployment | 30+ minutes |

---

## 🛡️ **Prevention Measures**

### **Before Each Deployment**

#### **Pre-Deployment Checklist**
- [ ] All tests passing (95%+ success rate)
- [ ] Integration tests with real database
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Backup created
- [ ] Rollback plan tested

#### **Deployment Strategy**
```bash
# Blue-Green Deployment
# 1. Deploy to staging environment
terraform apply -var="environment=staging"

# 2. Run full test suite
npm run test:full

# 3. Deploy to production
terraform apply -var="environment=production"

# 4. Monitor for 15 minutes
# 5. Switch traffic gradually
```

### **Monitoring & Alerting**

#### **Key Metrics to Monitor**
- **Response Time**: <200ms average
- **Error Rate**: <1% of requests
- **Uptime**: >99.9%
- **Memory Usage**: <80% of allocated
- **CPU Usage**: <70% of allocated

#### **Alert Thresholds**
- **Critical**: Response time >500ms, Error rate >5%
- **Warning**: Response time >300ms, Error rate >2%
- **Info**: Any service restart, New deployment

---

## 🔧 **Technical Rollback Procedures**

### **Database Rollback**

#### **If Data Migration Issues**
```bash
# Stop new services
docker-compose down

# Restore database from backup
mongorestore --db fiifi_production backup/latest/

# Verify data integrity
mongo fiifi_production --eval "db.companies.count()"
```

#### **If Schema Changes Issues**
```bash
# Revert schema changes
git checkout HEAD~1 -- migrations/

# Run rollback migration
npm run migrate:rollback

# Verify schema
mongo fiifi_production --eval "db.companies.getIndexes()"
```

### **Code Rollback**

#### **Git-Based Rollback**
```bash
# Rollback to previous stable commit
git checkout [previous-stable-commit]

# Force push to production
git push origin master --force

# Restart services
docker-compose restart
```

#### **Container Rollback**
```bash
# Rollback to previous container image
docker-compose down
docker-compose up -d --scale fiifi-core-api=0
docker-compose up -d --scale fiifi-core-api=1

# Verify rollback
curl http://localhost:3000/health
```

---

## 📋 **Communication Plan**

### **Emergency Contacts**
- **Technical Lead**: [Your Name] - [Phone] - [Email]
- **DevOps Team**: [DevOps Contact] - [Phone] - [Email]
- **Business Stakeholders**: [Business Contact] - [Phone] - [Email]

### **Communication Timeline**
1. **0-5 minutes**: Technical team notified
2. **5-10 minutes**: Business stakeholders notified
3. **10-15 minutes**: Status update to all stakeholders
4. **30 minutes**: Post-incident review scheduled

### **Status Updates**
- **Slack Channel**: #fiifi-migration-alerts
- **Email List**: fiifi-team@company.com
- **Status Page**: https://status.fiifi.com

---

## 🧪 **Rollback Testing**

### **Monthly Rollback Drills**

#### **Test Scenarios**
1. **Complete System Failure**
   - Simulate service crash
   - Test immediate rollback
   - Verify system recovery

2. **Data Corruption**
   - Simulate data loss
   - Test database restore
   - Verify data integrity

3. **Performance Issues**
   - Simulate high load
   - Test gradual rollback
   - Verify performance recovery

#### **Success Criteria**
- [ ] Rollback completed within 5 minutes
- [ ] All critical functionality restored
- [ ] No data loss
- [ ] Team communication effective

---

## 📚 **Documentation & Resources**

### **Runbooks**
- [Original System Startup](./fiifi_prototype/server_api/README.md)
- [Database Backup Procedures](./docs/database-backup.md)
- [Monitoring Setup](./docs/monitoring.md)

### **Tools & Scripts**
```bash
# Quick rollback script
./scripts/emergency-rollback.sh

# Health check script
./scripts/health-check.sh

# Database backup script
./scripts/backup-database.sh
```

### **External Resources**
- **MongoDB Documentation**: https://docs.mongodb.com/
- **Docker Documentation**: https://docs.docker.com/
- **GitHub Actions**: https://docs.github.com/en/actions

---

## 📝 **Post-Rollback Procedures**

### **Immediate Actions (0-30 minutes)**
1. **Document the Issue**
   - What went wrong?
   - When did it happen?
   - What was the impact?

2. **Stabilize System**
   - Ensure original system is stable
   - Monitor for additional issues
   - Communicate status to stakeholders

### **Investigation (30 minutes - 2 hours)**
1. **Root Cause Analysis**
   - Analyze logs and metrics
   - Identify root cause
   - Document findings

2. **Impact Assessment**
   - How many users affected?
   - What functionality was lost?
   - What data was impacted?

### **Recovery Planning (2-24 hours)**
1. **Fix Development**
   - Develop fix for identified issue
   - Test fix thoroughly
   - Plan re-deployment

2. **Process Improvement**
   - Update rollback procedures
   - Improve monitoring
   - Enhance testing

---

## 🔄 **Continuous Improvement**

### **Monthly Reviews**
- Review rollback procedures
- Update contact information
- Test rollback scenarios
- Improve documentation

### **Lessons Learned**
- Document all rollback incidents
- Share learnings with team
- Update procedures based on experience
- Train team on new procedures

---

**This rollback plan is reviewed monthly and updated based on system changes and lessons learned. All team members should be familiar with these procedures.**
