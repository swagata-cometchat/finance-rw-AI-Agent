# Expense Approvals Workflow Agent

An intelligent AI-powered expense approval workflow agent built with Mastra that automates expense report processing, policy validation, approval routing, and payment processing.

## Overview

This Expense Approvals Workflow Agent streamlines the entire expense approval process from submission through payment. It handles expense validation, receipt processing, policy compliance checks, multi-level approvals, and automated payment processing while ensuring compliance with company policies and regulations.

## Features

### 💰 Expense Management
- **Expense Report Submission**: Streamlined submission process with validation
- **Receipt Processing**: OCR-powered receipt extraction and validation
- **Policy Validation**: Automated checking against company expense policies
- **Compliance Verification**: Tax and audit compliance checking

### 🔍 Intelligent Validation
- **Amount Limits**: Automatic checking against category and role-based limits
- **Receipt Requirements**: Enforce receipt submission for expenses over thresholds
- **Business Purpose**: Validate business justification for all expenses
- **Merchant Validation**: Flag suspicious or non-business merchants
- **Duplicate Detection**: Identify potential duplicate expense submissions

### 🚀 Automated Approval Workflow
- **Smart Routing**: Automatic routing based on amount and category
- **Multi-level Approval**: Manager → Finance → Admin approval chain
- **Auto-approval**: Small expenses auto-approved when policy compliant
- **Escalation Handling**: Automatic escalation for policy violations

### 💳 Payment Processing
- **Multiple Payment Methods**: Direct deposit, check, expense card credit
- **Transaction Tracking**: Complete audit trail for all payments
- **Payment Notifications**: Automated confirmation to employees and finance
- **Integration Ready**: Designed for integration with payroll and accounting systems

### 📱 Notifications & Communication
- **Real-time Updates**: Status notifications to all stakeholders
- **Approval Requests**: Automated notifications to approvers
- **Violation Alerts**: Immediate alerts for policy violations
- **Payment Confirmations**: Transaction confirmations and receipts

## Architecture

```
expense-approvals-workflow-agent/
├── src/
│   ├── mastra/
│   │   ├── agents/
│   │   │   └── expense-approval-agent.ts    # AI agents for expense workflow
│   │   ├── tools/
│   │   │   ├── expense-tools.ts             # Expense processing tools
│   │   │   └── index.ts
│   │   ├── server/
│   │   │   ├── routes/
│   │   │   │   └── expense-approval.ts      # API route handlers
│   │   │   ├── util/
│   │   │   │   └── safeErrorMessage.ts      # Error handling utilities
│   │   │   └── routes.ts                    # Route configuration
│   │   └── index.ts                         # Main Mastra configuration
│   └── types/
│       └── expense.ts                       # TypeScript types and schemas
├── package.json
├── tsconfig.json
├── index.ts                                 # Server entry point
└── README.md
```

## API Endpoints

### Core Workflow Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses/submit` | Submit new expense report |
| POST | `/api/expenses/:reportId/validate` | Validate expense against policies |
| POST | `/api/expenses/:reportId/process-receipt` | Process receipt image with OCR |
| POST | `/api/expenses/:reportId/approve` | Process approval decision |
| POST | `/api/expenses/:reportId/pay` | Process payment for approved expense |
| POST | `/api/expenses/:reportId/check-compliance` | Verify compliance requirements |
| POST | `/api/expenses/:reportId/notify` | Send notifications to stakeholders |
| GET | `/api/expenses/:reportId/status` | Get expense status and progress |
| GET | `/api/expenses` | List expense reports with filters |

## Installation

1. **Navigate to the project directory**
   ```bash
   cd expense-approvals-workflow-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file or update existing one
   OPENAI_API_KEY=your_openai_api_key
   PORT=4111
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:4111`

## Usage Examples

### 1. Submit Expense Report

```bash
curl -X POST http://localhost:4111/api/expenses/submit \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Business Travel - Client Meeting",
    "employeeId": "emp-123",
    "employeeInfo": {
      "name": "John Doe",
      "email": "john.doe@company.com",
      "department": "Sales",
      "managerId": "mgr-456",
      "costCenter": "SALES-001"
    },
    "expenses": [
      {
        "id": "exp-001",
        "category": "travel",
        "description": "Flight to client meeting",
        "amount": 450.00,
        "currency": "USD",
        "date": "2024-12-15",
        "merchant": "Delta Airlines",
        "receiptUrl": "https://example.com/receipt1.jpg"
      },
      {
        "id": "exp-002", 
        "category": "meals",
        "description": "Client dinner",
        "amount": 120.50,
        "currency": "USD",
        "date": "2024-12-15",
        "merchant": "The Steakhouse",
        "receiptUrl": "https://example.com/receipt2.jpg"
      }
    ],
    "totalAmount": 570.50,
    "businessPurpose": "Quarterly business review meeting with ABC Corp to discuss 2025 contract renewal"
  }'
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt-123e4567-e89b-12d3-a456-426614174000",
  "workflowId": "wf-987e6543-e21b-12d3-a456-426614174000",
  "status": "submitted",
  "message": "Expense report submitted successfully",
  "nextSteps": [
    "Policy validation check",
    "Receipt processing",
    "Compliance verification",
    "Approval routing"
  ]
}
```

### 2. Validate Expense Report

```bash
curl -X POST http://localhost:4111/api/expenses/rpt-123e4567-e89b-12d3-a456-426614174000/validate \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt-123e4567-e89b-12d3-a456-426614174000",
  "passed": true,
  "violations": [],
  "autoApprovable": false,
  "requiredApprovers": ["manager", "finance"],
  "estimatedProcessingTime": "3 hours",
  "validationScore": 100,
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

### 3. Process Receipt

```bash
curl -X POST http://localhost:4111/api/expenses/rpt-123e4567-e89b-12d3-a456-426614174000/process-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "expenseId": "exp-001",
    "receiptImage": "base64_encoded_image_data",
    "expectedAmount": 450.00
  }'
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt-123e4567-e89b-12d3-a456-426614174000",
  "expenseId": "exp-001",
  "extractedData": {
    "merchant": "Delta Airlines",
    "amount": 450.00,
    "date": "2024-12-15",
    "tax": 36.00,
    "currency": "USD",
    "paymentMethod": "Credit Card",
    "receiptNumber": "R12345678"
  },
  "confidenceScore": 95,
  "amountMatch": true,
  "discrepancy": 0,
  "needsReview": false,
  "timestamp": "2024-12-19T10:35:00.000Z"
}
```

### 4. Process Manager Approval

```bash
curl -X POST http://localhost:4111/api/expenses/rpt-123e4567-e89b-12d3-a456-426614174000/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approverRole": "manager",
    "approverId": "mgr-456",
    "action": "approve",
    "comments": "Legitimate business expense for important client meeting"
  }'
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt-123e4567-e89b-12d3-a456-426614174000",
  "approved": true,
  "rejected": false,
  "infoRequested": false,
  "approverRole": "manager",
  "approverId": "mgr-456",
  "comments": "Legitimate business expense for important client meeting",
  "nextApprover": "finance",
  "requiresAdditionalApproval": true,
  "finalApproval": false,
  "timestamp": "2024-12-19T10:45:00.000Z"
}
```

### 5. Process Payment

```bash
curl -X POST http://localhost:4111/api/expenses/rpt-123e4567-e89b-12d3-a456-426614174000/pay \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "direct_deposit"
  }'
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt-123e4567-e89b-12d3-a456-426614174000",
  "processed": true,
  "paymentMethod": "direct_deposit",
  "transactionId": "TXN17345678901234",
  "paymentAmount": 570.50,
  "estimatedPaymentDate": "2024-12-21",
  "actualPaymentDate": "2024-12-19",
  "paymentStatus": "processed",
  "beneficiary": {
    "name": "John Doe",
    "email": "john.doe@company.com"
  },
  "timestamp": "2024-12-19T11:00:00.000Z"
}
```

### 6. Check Expense Status

```bash
curl -X GET http://localhost:4111/api/expenses/rpt-123e4567-e89b-12d3-a456-426614174000/status \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt-123e4567-e89b-12d3-a456-426614174000",
  "workflowId": "wf-987e6543-e21b-12d3-a456-426614174000",
  "status": "paid",
  "progress": {
    "submitted": true,
    "policyChecked": true,
    "complianceChecked": true,
    "managerApproved": true,
    "financeApproved": true,
    "adminApproved": false,
    "paymentProcessed": true
  },
  "expenseReport": {
    "id": "rpt-123e4567-e89b-12d3-a456-426614174000",
    "title": "Business Travel - Client Meeting",
    "totalAmount": 570.50,
    "status": "paid"
  },
  "paymentDetails": {
    "transactionId": "TXN17345678901234",
    "paymentMethod": "direct_deposit",
    "paymentDate": "2024-12-19",
    "amount": 570.50
  },
  "createdAt": "2024-12-19T09:00:00.000Z",
  "updatedAt": "2024-12-19T11:00:00.000Z"
}
```

## Approval Workflow

The expense approval process follows these rules:

### Approval Thresholds
1. **≤ $50**: Auto-approval if policy compliant
2. **$51 - $1,000**: Manager approval required
3. **$1,001 - $5,000**: Manager + Finance approval required
4. **> $5,000**: Manager + Finance + Admin approval required

### Policy Requirements
- Receipt required for expenses > $25
- Business purpose documentation required for all expenses
- Expenses must be submitted within 90 days
- Valid business merchants only
- Category-specific limits enforced

### Status Flow
1. **submitted** → Expense report submitted
2. **policy_check_completed** → Policy validation passed
3. **manager_approval_pending** → Awaiting manager approval
4. **finance_approval_pending** → Awaiting finance approval
5. **admin_approval_pending** → Awaiting admin approval (if needed)
6. **approved** → All required approvals obtained
7. **paid** → Payment processed

**Error States:**
- **rejected** → Approval denied
- **policy_violation_detected** → Policy violations found
- **requires_additional_info** → Additional information requested

## AI Agents

### Expense Approval Agent
- Orchestrates the entire expense approval workflow
- Validates expenses against company policies
- Routes approvals to appropriate personnel
- Processes payments and notifications
- Ensures compliance with regulations

### Finance Approval Agent
- Reviews expenses from financial perspective
- Analyzes budget impact and reasonableness
- Makes approval decisions for $1,000+ expenses
- Monitors spending patterns and compliance

### Manager Approval Agent
- Reviews expenses from direct reports
- Validates business necessity and appropriateness
- Ensures alignment with team activities
- Provides guidance on expense policies

## Security & Compliance

### Data Protection
- All financial data validated using Zod schemas
- Secure handling of payment information
- Audit trails maintained for all transactions
- Receipt images processed but not permanently stored

### Financial Controls
- Multi-level approval requirements
- Policy violation detection and prevention
- Spending limit enforcement
- Budget monitoring and alerts

### Audit Requirements
- Complete transaction history
- Approval decision tracking
- Compliance verification records
- Payment confirmation documentation

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5+
- OpenAI API key

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npx tsc --noEmit
```

### Testing the Agent

Use the provided curl examples to test the complete workflow:

1. Submit an expense report with `/api/expenses/submit`
2. Validate policies with `/api/expenses/:id/validate`
3. Process receipts with `/api/expenses/:id/process-receipt`
4. Handle approvals with `/api/expenses/:id/approve`
5. Process payments with `/api/expenses/:id/pay`
6. Check status with `/api/expenses/:id/status`

## Production Deployment

### Environment Variables
```bash
OPENAI_API_KEY=your_production_openai_key
PORT=4111
NODE_ENV=production
DATABASE_URL=your_database_connection_string
PAYMENT_GATEWAY_URL=your_payment_gateway_endpoint
```

### Database Integration
For production, replace the in-memory storage with a proper database:
- PostgreSQL for transactional data
- MongoDB for document storage
- Redis for caching and sessions

### Payment Integration
- Integrate with payroll systems (ADP, Workday)
- Connect to accounting software (QuickBooks, SAP)
- Support corporate banking APIs
- Implement fraud detection systems

### Security Considerations
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Encrypt sensitive financial data
- Regular security audits and penetration testing
- Implement rate limiting and DDoS protection
- Comply with financial regulations (SOX, PCI DSS)
