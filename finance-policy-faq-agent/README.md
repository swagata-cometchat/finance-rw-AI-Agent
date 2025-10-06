# Finance Policy FAQ Agent with Billing API Integration

A Mastra-powered AI agent that provides comprehensive finance policy information and billing API operations, combining knowledge base search with backend billing tools for invoice generation, payment processing, subscription management, and expense tracking.

## What you'll build

- A finance policy knowledge agent that searches through finance documents to answer policy questions
- Billing API integration for invoice generation, payment processing, and subscription management
- Expense tracking and financial reporting capabilities
- Professional finance guidance with appropriate disclaimers

## Features

- **Knowledge Base Search**: Searches through finance policy documents using intelligent text matching
- **Invoice Generation**: Create detailed invoices with line items, taxes, and payment terms
- **Payment Processing**: Process payments and update payment status for invoices
- **Subscription Management**: Manage recurring subscriptions and billing cycles
- **Expense Tracking**: Track and categorize business expenses for financial reporting
- **Policy Information**: Provides detailed answers about finance policies and procedures
- **Professional Disclaimers**: Includes appropriate finance disclaimers and guidance
- **Document Sources**: Always cites source documents for transparency

## Prerequisites

- Node.js 20.9.0 or higher
- OpenAI API key
- Basic understanding of Mastra framework

## Quickstart

1. Install dependencies and run locally:

```bash
cd finance-policy-faq-agent
npm install
npx mastra dev
```

2. Test the finance policy agent (agent id is `finance-policy`):

### Finance Policy Questions:
```bash
curl -s -X POST http://localhost:4111/api/agents/finance-policy/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"What are the expense reimbursement limits for meals?"}]}'
```

### Invoice Generation:
```bash
curl -s -X POST http://localhost:4111/api/agents/finance-policy/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Generate an invoice for customer ABC Corp with line items: consulting services $5000, software license $1200"}]}'
```

### Payment Processing:
```bash
curl -s -X POST http://localhost:4111/api/agents/finance-policy/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Process a credit card payment of $6480 for invoice INV-123456"}]}'
```

### Subscription Management:
```bash
curl -s -X POST http://localhost:4111/api/agents/finance-policy/generate \
	-H 'Content-Type: application/json' \
	-d '{"messages":[{"role":"user","content":"Create a monthly subscription for customer CUST-789 with plan PRO-MONTHLY"}]}'
```

The response will include relevant policy information or billing operation results.

## How it works

1. **Query Analysis**: The agent analyzes whether the request is for policy information or billing operations
2. **Policy Search**: For policy questions, uses `financeDocsRetriever` to search finance knowledge base
3. **Billing Operations**: For billing requests, uses appropriate billing API tools
4. **Information Processing**: Extracts relevant information and performs requested operations
5. **Professional Response**: Provides clear, professional answers with appropriate disclaimers
6. **Source Citation**: Always includes source documents for policy information

## Billing API Tools

### Invoice Generator Tool
- Create detailed invoices with customer information
- Support for multiple line items with quantities and prices
- Automatic tax calculation and payment terms
- Generate unique invoice numbers and due dates

### Payment Processor Tool
- Process payments via multiple methods (credit card, bank transfer, check, cash)
- Calculate processing fees and net amounts
- Generate payment confirmation and references
- Update payment status tracking

### Subscription Manager Tool
- Create, update, cancel, pause, and resume subscriptions
- Support for monthly, quarterly, and annual billing cycles
- Automatic next billing date calculation
- Subscription status tracking

### Expense Tracker Tool
- Add and categorize business expenses
- Generate expense reports by date range
- Support for multiple expense categories
- Track vendors and receipt information

## Knowledge Base

The agent searches through finance policy documents in the `knowledge/finance/` directory:

### Current Finance Documents:
- **finance-policies-procedures.md** - Expense reimbursement, invoice policies, budget management, financial reporting

### Document Format:
- Markdown (.md) files for easy reading and editing
- Structured sections for different policy areas
- Clear headings and bullet points for key information
- Regular policy updates through document maintenance

## API Endpoints

- `POST /api/agents/finance-policy/generate` — Ask finance policy questions or perform billing operations

Expected local base: `http://localhost:4111/api`

## Project Structure

```
finance-policy-faq-agent/
├── knowledge/finance/                    # Finance policy knowledge base
│   └── finance-policies-procedures.md   # Finance policies and procedures
├── src/mastra/
│   ├── index.ts                         # Main Mastra configuration
│   ├── agents/
│   │   └── finance-policy-agent.ts      # Finance policy AI agent
│   └── tools/
│       ├── index.ts                     # Tools exports
│       ├── docs-retriever.ts            # Document search and retrieval
│       └── billing-api-tools.ts         # Billing API integration tools
├── package.json                         # Project dependencies
├── tsconfig.json                        # TypeScript configuration
└── README.md                           # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Sample Interactions

### Finance Policy Query
```
Input: "What are the meal expense limits for business travel?"
Response: Based on company policy, meal expense limits are:
- Domestic travel: $75 per day
- International travel: $100 per day

These limits apply to business travel and must be supported by receipts for expenses over $25. All expense submissions require manager approval and must be submitted within 30 days.

This information is based on general company financial policies and may vary by location or specific circumstances. For personalized guidance, contact the Finance department directly.

Sources: finance-policies-procedures.md
```

### Invoice Generation
```
Input: "Create an invoice for Acme Corp for web development services $8000"
Response: I've successfully generated an invoice for Acme Corp:

Invoice Details:
- Invoice Number: INV-1696608234567
- Customer: Acme Corp
- Line Items: Web development services - $8,000.00
- Subtotal: $8,000.00
- Tax (8%): $640.00
- Total Amount: $8,640.00
- Payment Terms: Net 30
- Due Date: 2024-11-06

The invoice has been created in draft status. You can now send it to the customer or process payment when received.
```

### Payment Processing
```
Input: "Process payment of $8640 by credit card for invoice INV-1696608234567"
Response: Payment has been successfully processed:

Payment Details:
- Payment ID: PAY-1696608334567
- Invoice: INV-1696608234567
- Amount: $8,640.00
- Processing Fee: $250.56
- Net Amount: $8,389.44
- Payment Method: Credit Card
- Status: Completed
- Processed: 2024-10-06T20:25:34.567Z

The payment has been applied to the invoice. A payment confirmation will be sent to the customer.
```

## Connect to CometChat

1. In CometChat Dashboard → AI Agents, set Provider = Mastra
2. Agent ID = `finance-policy`
3. Deployment URL = your public `/api/agents/finance-policy/generate`
4. Enable and save

## Finance Compliance & Disclaimers

⚠️ **Important Finance Disclaimer**: This AI agent provides general policy information and billing operations based on company procedures. It is not a substitute for professional financial, tax, or legal advice. All financial matters should ultimately be confirmed with the Finance department. For complex issues, compliance matters, or specific circumstances, contact qualified financial professionals.

## Testing Scenarios

### Test Policy Retrieval
```bash
# Should return expense policy information
curl -X POST http://localhost:4111/api/agents/finance-policy/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What are the requirements for expense submission?"}]}'
```

### Test Invoice Generation
```bash
# Should create a new invoice
curl -X POST http://localhost:4111/api/agents/finance-policy/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Generate invoice for Beta Inc: Consulting $3000, Training $1500"}]}'
```

### Test Subscription Management
```bash
# Should create a subscription
curl -X POST http://localhost:4111/api/agents/finance-policy/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Create quarterly subscription for customer C123 with plan ENTERPRISE"}]}'
```

## Troubleshooting

- **No results found**: Check if knowledge base documents exist in `knowledge/finance/`
- **Agent not found**: Verify agent registration in `index.ts`
- **Search not working**: Ensure document format is `.md` and contains searchable text
- **Billing operations failing**: Check tool parameters and input validation
- **OpenAI errors**: Verify your API key is valid and has sufficient credits

## Customization

### Adding New Finance Topics
1. Create new markdown files in `knowledge/finance/`
2. Follow existing document structure and format
3. Test with relevant finance questions

### Modifying Billing Tools
Edit `billing-api-tools.ts` to adjust:
- Invoice calculation logic
- Payment processing rules
- Subscription management features
- Expense categorization

### Customizing Agent Responses
Modify `finance-policy-agent.ts` to adjust:
- Response tone and style
- Disclaimer text and frequency
- Source citation format
- Billing operation confirmations

## Performance Considerations

- **Search Speed**: Document search typically completes in 200-500ms
- **Knowledge Base Size**: Optimized for finance document collections up to 50MB
- **Billing Operations**: API tools execute in 100-300ms
- **Concurrent Users**: Scales appropriately for business user load

## Security & Compliance

- **Financial Data**: Ensure billing operations use proper encryption
- **Access Control**: Implement appropriate authentication for finance systems
- **Audit Logging**: Track all financial operations for compliance purposes
- **Data Retention**: Manage financial records according to company policy

## License

ISC

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Mastra documentation: [https://mastra.ai/docs](https://mastra.ai/docs)
- Verify your environment setup and API keys

---

**Remember**: This is a combined finance policy assistant and billing API tool. For sensitive financial matters, complex compliance issues, or specific business circumstances, always consult with qualified finance professionals.