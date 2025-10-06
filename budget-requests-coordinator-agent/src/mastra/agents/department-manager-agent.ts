import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core';

export interface BudgetRequestResult {
  message: string;
  approved: boolean;
  budgetDetails?: {
    requestDate: string;
    approvalDate: string;
    type: string;
    amount: string;
    approver: string;
    requestId: string;
  };
  nextSteps: string[];
}

export const departmentManagerAgentBase = new Agent({
  name: 'Department Manager Budget Approver',
  instructions: `You are a department manager responsible for approving team budget requests.
  Handle routine departmental expenses, team resources, and operational budget planning.
  Ensure requests align with department goals and available budget allocation.`,
  model: openai('gpt-4'),
});

export const departmentManagerAgentWithApproval = {
  processBudgetRequest: async (request: string, amount?: string, category?: string): Promise<BudgetRequestResult> => {
    const requestId = `DEPT-${Date.now()}`;
    const today = new Date();
    const requestDate = today.toISOString().split('T')[0];
    const approvalDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 2 days later
    
    const parsedAmount = parseAmount(amount || extractAmountFromRequest(request));
    
    return {
      message: `Your budget request has been reviewed and approved by Jennifer Martinez, Department Manager. Your ${request.toLowerCase()} request for ${formatAmount(parsedAmount)} is confirmed and will be processed within 2 business days. Budget allocation has been reserved for this expense.`,
      approved: true,
      budgetDetails: {
        requestDate: requestDate,
        approvalDate: approvalDate,
        type: category || request,
        amount: formatAmount(parsedAmount),
        approver: 'Jennifer Martinez, Department Manager',
        requestId: requestId
      },
      nextSteps: [
        'Proceed with vendor selection and procurement',
        'Submit purchase requisition through company portal',
        'Ensure compliance with company purchasing policies',
        'Update department budget tracking',
        'Notify team of approved budget allocation'
      ]
    };
  }
};

function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;
  const cleaned = amountStr.replace(/[$,\s]/g, '');
  const match = cleaned.match(/(\d+(?:\.\d{2})?)/);
  return match ? parseFloat(match[1]) : 0;
}

function extractAmountFromRequest(request: string): string {
  const patterns = [
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|usd|\$)/i,
    /budget\s+of\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
  ];
  
  for (const pattern of patterns) {
    const match = request.match(pattern);
    if (match) return match[1];
  }
  
  return '1000'; // Default amount for department requests
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}