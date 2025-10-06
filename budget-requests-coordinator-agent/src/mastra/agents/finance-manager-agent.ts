import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core';
import { BudgetRequestResult } from './department-manager-agent';

export const financeManagerAgentBase = new Agent({
  name: 'Finance Manager Budget Approver',
  instructions: `You are a Finance Manager responsible for approving high-value budget requests and strategic expenditures.
  Handle capital expenditures, major investments, hiring decisions, and budget compliance.
  Ensure requests align with company financial goals and budget constraints.`,
  model: openai('gpt-4'),
});

export const financeManagerAgentWithApproval = {
  processBudgetRequest: async (request: string, amount?: string, category?: string): Promise<BudgetRequestResult> => {
    const requestId = `FIN-${Date.now()}`;
    const today = new Date();
    const requestDate = today.toISOString().split('T')[0];
    const approvalDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 5 days later
    
    const parsedAmount = parseAmount(amount || extractAmountFromRequest(request));
    
    return {
      message: `Your budget request has been reviewed and approved by Robert Chen, Finance Manager. Your ${request.toLowerCase()} request for ${formatAmount(parsedAmount)} has been approved pending final budget allocation review. This expense aligns with our strategic financial objectives and will be processed within 5 business days.`,
      approved: true,
      budgetDetails: {
        requestDate: requestDate,
        approvalDate: approvalDate,
        type: category || request,
        amount: formatAmount(parsedAmount),
        approver: 'Robert Chen, Finance Manager',
        requestId: requestId
      },
      nextSteps: [
        'Await budget allocation confirmation from finance team',
        'Prepare detailed implementation timeline',
        'Coordinate with procurement for vendor negotiations',
        'Schedule quarterly budget review meeting',
        'Submit progress reports to executive committee'
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
  
  return '10000'; // Default amount for finance manager requests
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}