import { createTool } from '@mastra/core';
import { z } from 'zod';
import { BudgetRequestCoordinatorAgent, BudgetApprovalResult } from '../agents/budget-request-coordinator-agent';

const internalBudgetRequestCoordinator = new BudgetRequestCoordinatorAgent();

export const budgetRequestCoordinatorTool = createTool({
  id: 'budgetRequestCoordinator',
  description: 'Process budget requests and route them to appropriate approvers based on amount and category.',
  inputSchema: z.object({
    request: z.string().min(3).describe('Budget request description'),
    amount: z.string().optional().describe('Requested amount (e.g., "$5,000" or "5000")'),
    category: z.string().optional().describe('Budget category (e.g., "office supplies", "equipment", "training")'),
  }),
  outputSchema: z.object({
    message: z.string(),
    routedTo: z.enum(['department-manager', 'finance-manager', 'auto-approved', 'requires-documentation']),
    approved: z.boolean(),
    budgetDetails: z.object({
      requestDate: z.string(),
      approvalDate: z.string(),
      type: z.string(),
      amount: z.string(),
      approver: z.string(),
      requestId: z.string(),
    }).optional(),
    priority: z.enum(['low', 'medium', 'high']),
    nextSteps: z.array(z.string()),
  }),
  execute: async (params) => {
    console.log('Tool params received:', params);
    
    const { request, amount, category } = params;
    
    // Validate that request exists
    if (!request) {
      throw new Error('Request parameter is missing');
    }
    
    const result: BudgetApprovalResult = await internalBudgetRequestCoordinator.processBudgetRequest(
      request, 
      amount, 
      category
    );
    
    return {
      message: result.message,
      routedTo: result.routedTo,
      approved: result.approved,
      budgetDetails: result.budgetDetails,
      priority: result.priority,
      nextSteps: result.nextSteps,
    };
  },
});