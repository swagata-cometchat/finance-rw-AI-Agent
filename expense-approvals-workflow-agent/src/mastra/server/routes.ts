import { 
  submitExpenseReportHandler,
  validateExpenseHandler,
  processApprovalHandler,
  processPaymentHandler,
  getExpenseStatusHandler,
  listExpenseReportsHandler
} from './routes/expense-approval';

const rootRoute = {
  method: 'GET',
  path: '/',
  handler: (c: any) => c.text('Expense Approvals Workflow Agent - OK'),
};

export const apiRoutes: Array<any> = [
  rootRoute,
  // Expense workflow routes
  {
    method: 'POST',
    path: '/api/expenses/submit',
    handler: submitExpenseReportHandler,
  },
  {
    method: 'POST',
    path: '/api/expenses/:reportId/validate',
    handler: validateExpenseHandler,
  },
  {
    method: 'POST',
    path: '/api/expenses/:reportId/approve',
    handler: processApprovalHandler,
  },
  {
    method: 'POST',
    path: '/api/expenses/:reportId/pay',
    handler: processPaymentHandler,
  },
  {
    method: 'GET',
    path: '/api/expenses/:reportId/status',
    handler: getExpenseStatusHandler,
  },
  {
    method: 'GET',
    path: '/api/expenses',
    handler: listExpenseReportsHandler,
  },
];