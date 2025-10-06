import { createStep, createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { BudgetRequestCoordinatorAgent, BudgetApprovalResult } from '../agents/budget-request-coordinator-agent';

const internalBudgetRequestCoordinator = new BudgetRequestCoordinatorAgent();

const processBudgetRequest = createStep({
  id: 'process-budget-request',
  description: 'Process budget request and route to appropriate approver based on amount and category.',
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
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('Missing input');
    
    const result: BudgetApprovalResult = await internalBudgetRequestCoordinator.processBudgetRequest(
      inputData.request,
      inputData.amount,
      inputData.category
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

export const budgetRequestWorkflow = createWorkflow({
  id: 'budget-request-workflow',
  inputSchema: z.object({
    request: z.string().min(3),
    amount: z.string().optional(),
    category: z.string().optional(),
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
})
  .then(processBudgetRequest)
  .commit();