import Router from 'koa-router';
import { CompanyController } from '../controllers/CompanyController';

const router = new Router();
const companyController = new CompanyController();

// Company routes - specific routes first, then parameterized routes
router.post('/companies', companyController.createCompany.bind(companyController));
router.get('/companies/stats', companyController.getCompanyStats.bind(companyController));
router.get('/companies/:id', companyController.getCompany.bind(companyController));
router.get('/companies', companyController.getCompanies.bind(companyController));
router.put('/companies/:id', companyController.updateCompany.bind(companyController));
router.delete('/companies/:id', companyController.deleteCompany.bind(companyController));
router.patch('/companies/:id/rating', companyController.updateCompanyRating.bind(companyController));

export default router;
