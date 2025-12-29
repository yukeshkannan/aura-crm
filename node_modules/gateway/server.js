const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());

// Define Service URLs with internal Docker names
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
const CONTACT_URL = process.env.CONTACT_SERVICE_URL || 'http://contact-service:5002';
const OPP_URL = process.env.OPPORTUNITY_SERVICE_URL || 'http://opportunity-service:5003';
const TASK_URL = process.env.TASK_SERVICE_URL || 'http://task-service:5004';
const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5005';
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:5006';
const DOC_URL = process.env.DOCUMENT_SERVICE_URL || 'http://document-service:5007';
const PROD_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:5008';
const INV_URL = process.env.INVOICE_SERVICE_URL || 'http://invoice-service:5009';
const TICKET_URL = process.env.TICKET_SERVICE_URL || 'http://ticket-service:5010';
const SEARCH_URL = process.env.SEARCH_SERVICE_URL || 'http://search-service:5011';
const HR_URL = process.env.HR_SERVICE_URL || 'http://hr-service:5012';

// Helper for Proxy Routing
const createProxy = (path, target) => {
    app.use(path, proxy(target, {
        proxyReqPathResolver: (req) => `${path}${req.url}`,
        proxyErrorHandler: (err, res, next) => {
            console.error(`[Gateway Error] Source: ${path} -> ${err.message}`);
            res.status(502).send({ success: false, message: 'Service Temporarily Unavailable' });
        }
    }));
};

// Mount Proxies
createProxy('/api/auth', AUTH_URL);
createProxy('/api/contacts', CONTACT_URL);
createProxy('/api/opportunities', OPP_URL);
createProxy('/api/tasks', TASK_URL);
createProxy('/api/notifications', NOTIF_URL);
createProxy('/api/analytics', ANALYTICS_URL);
createProxy('/api/documents', DOC_URL);
createProxy('/api/products', PROD_URL);
createProxy('/api/invoices', INV_URL);
createProxy('/api/payments', INV_URL);
createProxy('/api/tickets', TICKET_URL);
createProxy('/api/search', SEARCH_URL);
createProxy('/api/attendance', HR_URL);
createProxy('/api/payroll', HR_URL);

app.use(express.json());

app.get('/', (req, res) => res.json({ message: "Aura Gateway Active 🚀" }));
app.get('/api', (req, res) => res.json({ message: "Aura API Active ✨" }));

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Gateway running on Port ${PORT}`));
