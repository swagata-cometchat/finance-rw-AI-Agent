# Budget Requests Coordinator Agent

A Mastra-powered AI agent that streamlines budget requests and automates approval workflows by intelligently routing requests to appropriate approvers based on amount and category.

## What you'll build

- A budget request coordinator that analyzes employee budget requests
- Intelligent routing to appropriate approvers:
  - **Auto-Approved** for small expenses under $500 (office supplies, meals, etc.)
  - **Department Manager** for routine departmental expenses ($500-$5,000)
  - **Finance Manager** for high-value or strategic expenses ($5,000+, equipment, hiring)
  - **Documentation Required** for requests needing detailed justification or vendor quotes
- Automated budget processing with approval status and next steps
- Budget management workflow with priority classification

## Features

- 💰 **Smart Budget Routing**: Automatically routes requests to the right approver
- ⚡ **Auto-Approval**: Instantly approves small operational expenses
- 📋 **Documentation Tracking**: Identifies when additional paperwork is needed
- 👥 **Multi-Level Approval**: Routes to department managers or finance based on amount/type
- 📊 **Priority Classification**: Classifies requests by priority (low, medium, high)
- 🔄 **Workflow Automation**: Streamlines the entire approval process

## Prerequisites

- Node.js 20.9.0 or higher
- OpenAI API key
- Basic understanding of Mastra framework

## Quickstart

1. Install dependencies and run locally:

```bash
cd budget-requests-coordinator-agent
npm install
npx mastra dev
```

2. Test the budget request coordinator (agent id is `budgetRequestCoordinatorAgent`):

### Small expense request:
```bash
curl -s -X POST http://localhost:4111/api/agents/budgetRequestCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need $200 for office supplies"}]}'
```

### Departmental request:
```bash
curl -s -X POST http://localhost:4111/api/agents/budgetRequestCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need $2,500 for team training workshop"}]}'
```

### High-value request:
```bash
curl -s -X POST http://localhost:4111/api/agents/budgetRequestCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need $15,000 for new equipment purchase"}]}'
```

The response includes approval status, routing information, and a summary line like `([routedTo] | approved: yes/no | priority: [priority])`.

## How it works

1. **Request Analysis**: The coordinator analyzes the budget request to understand the amount and category
2. **Smart Routing**: Amount thresholds and keywords determine the appropriate approver:
   - Small expenses (< $500) → Auto-Approved
   - Routine expenses ($500-$5,000) → Department Manager
   - High-value/Strategic (> $5,000) → Finance Manager
   - Complex requests → Documentation Required
3. **Approval Processing**: The system processes approvals with realistic timing and provides confirmation details
4. **Next Steps**: Employees receive detailed instructions for completing their budget process

## Budget Routing Logic

### Auto-Approved (Low Priority)
- Amounts under $500
- Office supplies
- Meals and refreshments
- Parking/transportation
- Small operational expenses

### Department Manager (Medium Priority)
- Amounts $500-$5,000
- Team training and development
- Department equipment
- Software subscriptions
- Routine operational expenses

### Finance Manager (High Priority)
- Amounts $5,000+
- Capital expenditures (CAPEX)
- Equipment purchases
- Infrastructure upgrades
- Technology investments
- Hiring and contractor costs
- Marketing campaigns
- Software licenses

### Documentation Required
- Amounts $10,000+
- Vendor quotes needed
- Business case required
- ROI analysis needed
- Contract negotiations

## API Endpoints

- `POST /api/agents/budgetRequestCoordinatorAgent/generate` — Process budget requests and receive approval routing

Expected local base: `http://localhost:4111/api`

## Project Structure

```
budget-requests-coordinator-agent/
├── src/mastra/
│   ├── index.ts                              # Main Mastra configuration
│   ├── agents/
│   │   ├── budget-request-coordinator-agent.ts  # Main coordination logic
│   │   ├── department-manager-agent.ts          # Department approval logic
│   │   └── finance-manager-agent.ts             # Finance approval logic
│   ├── tools/
│   │   └── budget-request-coordinator-tool.ts   # Budget processing tool
│   └── workflows/
│       └── budget-request-workflow.ts           # Approval workflow
├── package.json                              # Project dependencies
├── tsconfig.json                             # TypeScript configuration
└── README.md                                # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Sample Responses

### Small Expense (Auto-Approved)
```json
{
  "message": "Your budget request for $200.00 has been automatically approved. Small operational expenses under $500 are pre-approved for efficiency.",
  "routedTo": "auto-approved",
  "approved": true,
  "budgetDetails": {
    "requestDate": "2025-10-06",
    "approvalDate": "2025-10-06",
    "type": "office supplies",
    "amount": "$200.00",
    "approver": "Automated System",
    "requestId": "AUTO-1758540030805"
  },
  "priority": "low",
  "nextSteps": [
    "Proceed with the purchase using company guidelines",
    "Keep receipts for expense reporting",
    "Update budget tracking spreadsheet",
    "Notify team if purchase affects shared resources"
  ]
}
```

### Department Request (Department Manager)
```json
{
  "message": "Your budget request has been reviewed and approved by Jennifer Martinez, Department Manager. Your team training workshop request for $2,500.00 is confirmed...",
  "routedTo": "department-manager",
  "approved": true,
  "budgetDetails": {
    "requestDate": "2025-10-06",
    "approvalDate": "2025-10-08",
    "type": "team training workshop",
    "amount": "$2,500.00",
    "approver": "Jennifer Martinez, Department Manager",
    "requestId": "DEPT-1758540142444"
  },
  "priority": "medium",
  "nextSteps": [
    "Proceed with vendor selection and procurement",
    "Submit purchase requisition through company portal",
    "Ensure compliance with company purchasing policies",
    "Update department budget tracking",
    "Notify team of approved budget allocation"
  ]
}
```

### High-Value Request (Finance Manager)
```json
{
  "message": "Your budget request has been reviewed and approved by Robert Chen, Finance Manager. Your new equipment purchase request for $15,000.00 has been approved...",
  "routedTo": "finance-manager",
  "approved": true,
  "budgetDetails": {
    "requestDate": "2025-10-06",
    "approvalDate": "2025-10-11",
    "type": "new equipment purchase",
    "amount": "$15,000.00",
    "approver": "Robert Chen, Finance Manager",
    "requestId": "FIN-1758540198765"
  },
  "priority": "high",
  "nextSteps": [
    "Await budget allocation confirmation from finance team",
    "Prepare detailed implementation timeline",
    "Coordinate with procurement for vendor negotiations",
    "Schedule quarterly budget review meeting",
    "Submit progress reports to executive committee"
  ]
}
```

## Connect to CometChat

1. In CometChat Dashboard → AI Agents, set Provider = Mastra
2. Agent ID = `budgetRequestCoordinatorAgent`
3. Deployment URL = your public `/api/agents/budgetRequestCoordinatorAgent/generate`
4. Enable and save

## Testing Scenarios

### Test Auto-Approval
```bash
curl -X POST http://localhost:4111/api/agents/budgetRequestCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need $300 for office supplies"}]}'
```

### Test Department Manager Routing
```bash
curl -X POST http://localhost:4111/api/agents/budgetRequestCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need $1,800 for team training"}]}'
```

### Test Finance Manager Routing
```bash
curl -X POST http://localhost:4111/api/agents/budgetRequestCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need $8,000 for software licensing"}]}'
```

### Test Documentation Required
```bash
curl -X POST http://localhost:4111/api/agents/budgetRequestCoordinatorAgent/generate \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"I need $25,000 for infrastructure upgrade with vendor quotes"}]}'
```

## Troubleshooting

- **Wrong routing**: Check amount thresholds and keyword detection logic in `budget-request-coordinator-agent.ts`
- **Agent not found**: Verify agent registration in `index.ts`
- **No response**: Check server logs and ensure all dependencies are installed
- **OpenAI errors**: Verify your API key is valid and has sufficient credits

## Customization

### Adjusting Amount Thresholds
Edit the thresholds in `budget-request-coordinator-agent.ts`:
- Auto-approval limit (currently $500)
- Finance manager threshold (currently $5,000)
- Documentation requirement threshold (currently $10,000)

### Adding New Categories
Edit the keyword arrays in `budget-request-coordinator-agent.ts`:
- `financeManagerTypes`: For categories requiring finance approval
- `autoApprovedTypes`: For simple expenses that can be auto-approved
- `documentationRequired`: For requests needing additional paperwork

### Modifying Approvers
Update the approval logic in individual agent files to adjust:
- Approver names and titles
- Default approval timeframes
- Next steps and instructions
- Company-specific policies

### Custom Business Rules
Modify the `processBudgetRequest` method in `BudgetRequestCoordinatorAgent` class to implement:
- Department-specific thresholds
- Time-based approval rules
- Project-based routing
- Multi-stage approval processes

## Performance Considerations

- **Response Time**: Budget processing typically completes in 1-3 seconds
- **Rate Limits**: Respect OpenAI API rate limits for production use
- **Concurrent Users**: Scale appropriately for expected employee load
- **Database Storage**: Consider using persistent storage for budget tracking

## Security & Compliance

- **Data Privacy**: Secure handling of financial information
- **Audit Trails**: Log all budget requests and approvals for compliance
- **Access Control**: Implement proper authorization for sensitive budget data
- **Financial Controls**: Ensure alignment with company financial policies

## License

ISC

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Mastra documentation: [https://mastra.ai/docs](https://mastra.ai/docs)
- Verify your environment setup and API keys