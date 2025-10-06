# Mastra Billing API Backend Tools Agent

Create a Mastra agent that connects with billing APIs through secure backend tools, providing comprehensive billing operations management including customer billing, invoice management, and payment processing.

## What you'll build

- A chat agent (`billingApiAgent`) that manages billing operations through backend API tools
- Backend tools for billing operations:
  - `get-customer` - Retrieve customer billing information and outstanding balances
  - `manage-invoices` - Create, update, and manage invoices with line items
  - `process-payment` - Process payments, handle refunds, and track payment history
- A chat endpoint that handles billing requests with tool-grounded responses

## Prerequisites

- Node.js installed (>=20.9.0)
- A Mastra project
- CometChat app (optional)
- Environment: `.env` with `OPENAI_API_KEY`

## Quickstart

1. Install dependencies and run locally:

```bash
npm install
npx mastra dev
```

2. Test the agent with various scenarios:

**Get customer billing information:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Show me billing details for customer CUST-001"}]}'
```

**Create a new invoice:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Create an invoice for customer CUST-002 for $1500 due 2025-11-15 for Monthly subscription services"}]}'
```

**List overdue invoices:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Show me all overdue invoices"}]}'
```

**Process a payment:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Process a $750 credit card payment for customer CUST-003"}]}'
```

**Mark invoice as paid:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Mark invoice INV-001 as paid with bank transfer"}]}'
```

**Get payment history:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Show payment history for customer CUST-001"}]}'
```

**List customers with outstanding balances:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"List all customers with outstanding balances"}]}'
```

**Process a refund:**
```bash
curl -s -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Process a refund for payment PAY-001"}]}'
```

## How it works

1. **Customer Management**: The agent uses `get-customer` to fetch customer billing details, outstanding balances, and billing preferences
2. **Invoice Operations**: The `manage-invoices` tool creates, retrieves, and updates invoices with automatic tax calculations
3. **Payment Processing**: The `process-payment` tool handles payment processing, refunds, and payment history tracking
4. **Smart Analytics**: The agent provides detailed financial insights and billing status reports

## API Endpoints

- POST `/api/agents/billingApiAgent/generate` — Chat with the billing API agent

Expected local base: `http://localhost:4111/api`

## Project Structure

```
src/
├── mastra/
│   ├── index.ts                          # Main Mastra configuration
│   ├── agents/
│   │   └── billing-api-agent.ts          # Billing API agent
│   └── tools/
│       ├── index.ts                      # Tools export
│       ├── get-customer-tool.ts          # Customer billing retrieval tool
│       ├── manage-invoices-tool.ts       # Invoice management tool
│       └── process-payment-tool.ts       # Payment processing tool
├── package.json
├── tsconfig.json
└── README.md
```

## Features

### Customer Billing Management
- **Customer Lookup**: Get specific customer by ID or list all customers
- **Billing Information**: Access billing cycles, payment methods, and contact details
- **Outstanding Balances**: Track unpaid amounts and payment history
- **Customer Filtering**: Filter by status, billing cycle, payment method, or outstanding balance

### Invoice Management
- **Invoice Creation**: Create invoices with multiple line items and automatic tax calculation
- **Invoice Retrieval**: Get specific invoices or list all invoices with filtering
- **Status Management**: Track invoice statuses (pending, paid, overdue, cancelled)
- **Payment Marking**: Mark invoices as paid with payment method tracking
- **Overdue Detection**: Automatically identify and track overdue invoices

### Payment Processing
- **Multiple Payment Methods**: Support for credit cards, bank transfers, PayPal, and crypto
- **Payment Validation**: Validate payment amounts and customer information
- **Transaction Tracking**: Generate unique transaction IDs for all payments
- **Refund Processing**: Handle refunds for completed payments
- **Payment History**: Track all payment activities with detailed records

## Sample Data

The agent comes with sample customers and billing data for testing:

### Customers
| Customer ID | Company | Outstanding Balance | Billing Cycle | Payment Method | Status |
|-------------|---------|-------------------|---------------|----------------|--------|
| CUST-001 | TechCorp Inc. | $2,450.00 | monthly | credit_card | active |
| CUST-002 | StartupHub LLC | $0.00 | quarterly | bank_transfer | active |
| CUST-003 | Global Solutions Ltd. | $875.50 | monthly | credit_card | active |
| CUST-004 | Digital Agency Pro | $1,200.00 | monthly | paypal | suspended |

### Sample Invoices
| Invoice | Customer | Amount | Status | Due Date |
|---------|----------|--------|---------|----------|
| INV-2025-001 | TechCorp Inc. | $2,450.00 | pending | Oct 15, 2025 |
| INV-2025-002 | StartupHub LLC | $750.00 | paid | Oct 1, 2025 |
| INV-2025-003 | Global Solutions Ltd. | $875.50 | overdue | Sep 30, 2025 |

## Environment Variables

Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Connect to CometChat

1. In CometChat Dashboard → AI Agents, set:
   - Provider = Mastra
   - Agent ID = `billingApiAgent`
   - Deployment URL = your public `/api/agents/billingApiAgent/generate`
2. Enable and save the configuration

## Business Rules

### Customer Management Rules
- Customer information includes billing cycles and payment preferences
- Outstanding balances are tracked across all invoices
- Customer status affects billing operations (suspended customers cannot receive new invoices)

### Invoice Management Rules
- Invoices automatically calculate taxes (8% default rate)
- Due dates must be in the future for new invoices
- Overdue invoices are automatically detected based on current date
- Invoice numbers are auto-generated in sequential format

### Payment Processing Rules
- Payments require valid customer ID, amount, and payment method
- Payment processing includes 90% success simulation for testing
- Refunds can only be processed for completed payments
- All transactions generate unique transaction IDs for tracking

## Security Considerations

- Add authentication (API keys/JWT) for production use
- Implement rate limiting for payment processing endpoints
- Add CORS restrictions for browser access
- Validate and sanitize all financial inputs
- Add audit logging for all billing operations
- Store sensitive payment data server-side only
- Implement proper access controls for customer billing data
- Add encryption for payment method information

## Testing Scenarios

### Customer Operations
```bash
# Get specific customer with outstanding balance
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What is the billing status of customer CUST-001?"}]}'

# List all customers with quarterly billing
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Show all customers with quarterly billing cycles"}]}'
```

### Invoice Operations
```bash
# Create detailed invoice with line items
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Create an invoice for CUST-001 with Premium Plan ($199), Setup Fee ($50), and 2 Additional Storage units at $25 each, due 2025-12-01"}]}'

# Get specific invoice details
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Show me details for invoice INV-001"}]}'
```

### Payment Operations
```bash
# Process payment for specific invoice
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Process a $2450 credit card payment for customer CUST-001 for invoice INV-001"}]}'

# List all failed payments
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Show me all failed payments"}]}'
```

### Error Scenarios
```bash
# Invalid customer for invoice creation
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Create an invoice for customer CUST-999"}]}'

# Payment for non-existent customer
curl -X POST http://localhost:4111/api/agents/billingApiAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Process payment for customer CUST-999"}]}'
```

## Troubleshooting

### Common Issues

**Agent not processing billing operations:**
- Verify tools are properly registered in the agent
- Check that OpenAI API key is set correctly
- Ensure the agent is using the correct tool names
- Verify customer and invoice data integrity

**Payment processing failures:**
- Check payment method format (credit_card, bank_transfer, paypal, crypto)
- Ensure customer exists and is active
- Verify payment amounts are positive numbers
- Check for valid currency format

**Invoice creation issues:**
- Verify customer ID exists in the system
- Check due date format (YYYY-MM-DD expected)
- Ensure amounts are positive numbers
- Validate line item calculations

### Development Tips

1. **Database Integration**: Replace simulated data with real database connections
2. **Payment Gateway Integration**: Connect with actual payment processors (Stripe, PayPal, etc.)
3. **Email Notifications**: Add automatic email delivery for invoices and payment confirmations
4. **Advanced Reporting**: Add tools for financial analytics and billing insights
5. **Multi-Currency Support**: Extend for international billing and currency conversion

## Advanced Features

### Custom Invoice Templates
- Add support for branded invoice templates
- Implement custom line item categories
- Add support for discounts and promotional codes
- Support multi-language invoice generation

### Automated Billing
- Scheduled recurring invoice generation
- Automatic payment retry mechanisms
- Dunning management for overdue accounts
- Integration with accounting systems (QuickBooks, Xero)

### Analytics and Reporting
- Revenue tracking and forecasting
- Customer lifetime value calculations
- Payment success rate analytics
- Aging reports for outstanding balances

### Integration Capabilities
- Webhook support for real-time billing events
- REST API for external system integration
- Export capabilities for accounting software
- Real-time dashboard for billing metrics

## Links

- [Mastra Core Documentation](https://docs.mastra.ai)
- [CometChat AI Agents Guide](https://www.cometchat.com/docs/ai-agents)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## License

ISC License - See package.json for details.