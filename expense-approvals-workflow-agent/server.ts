import express from 'express';
import { config } from 'dotenv';
import { 
  submitExpenseReportHandler,
  validateExpenseHandler,
  processApprovalHandler,
  processPaymentHandler,
  getExpenseStatusHandler,
  listExpenseReportsHandler
} from './src/mastra/server/routes/expense-approval';

config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

// Create a context object that mimics the Mastra context
const createContext = (req: any, res: any) => ({
  req: {
    json: () => Promise.resolve(req.body),
    param: () => req.params,
    query: () => req.query,
  },
  json: (data: any, status?: number) => {
    if (status) res.status(status);
    return res.json(data);
  },
  text: (text: string) => res.send(text),
});

// Root route
app.get('/', (req, res) => {
  res.send('Expense Approvals Workflow Agent - OK');
});

// Expense workflow routes
app.post('/api/expenses/submit', async (req, res) => {
  const c = createContext(req, res);
  await submitExpenseReportHandler(c);
});

app.post('/api/expenses/:reportId/validate', async (req, res) => {
  const c = createContext(req, res);
  await validateExpenseHandler(c);
});

app.post('/api/expenses/:reportId/approve', async (req, res) => {
  const c = createContext(req, res);
  await processApprovalHandler(c);
});

app.post('/api/expenses/:reportId/pay', async (req, res) => {
  const c = createContext(req, res);
  await processPaymentHandler(c);
});

app.get('/api/expenses/:reportId/status', async (req, res) => {
  const c = createContext(req, res);
  await getExpenseStatusHandler(c);
});

app.get('/api/expenses', async (req, res) => {
  const c = createContext(req, res);
  await listExpenseReportsHandler(c);
});

app.listen(PORT, () => {
  console.log(`🚀 Expense Approvals Workflow Agent running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}`);
  console.log(`📋 Try: curl http://localhost:${PORT}/api/expenses`);
});

export default app;