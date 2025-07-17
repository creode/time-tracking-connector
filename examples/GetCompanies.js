import { ProductiveApi } from '../src/ProductiveApi';

const productiveApi = new ProductiveApi(process.env.PRODUCTIVE_API_KEY);

const companies = productiveApi.getCompanies();

console.log(companies);