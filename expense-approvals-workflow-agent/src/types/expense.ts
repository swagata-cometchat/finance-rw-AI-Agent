import { z } from 'zod';

// Expense Categories
export const ExpenseCategorySchema = z.enum([
  'travel',
  'meals',
  'office_supplies',
  'software',
  'training',
  'marketing',
  'equipment',
  'professional_services',
  'utilities',
  'other'
]);

// Expense Item Schema
export const ExpenseItemSchema = z.object({
  id: z.string().uuid(),
  category: ExpenseCategorySchema,
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  merchant: z.string().min(1, 'Merchant name is required'),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

// Expense Report Schema
export const ExpenseReportSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  employeeId: z.string().uuid(),
  employeeInfo: z.object({
    name: z.string().min(1, 'Employee name is required'),
    email: z.string().email('Invalid email address'),
    department: z.string().min(1, 'Department is required'),
    managerId: z.string().optional(),
    costCenter: z.string().optional(),
  }),
  expenses: z.array(ExpenseItemSchema).min(1, 'At least one expense item is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  submissionDate: z.string().datetime(),
  businessPurpose: z.string().min(1, 'Business purpose is required'),
  status: z.enum([
    'draft',
    'submitted',
    'pending_manager_approval',
    'pending_finance_approval',
    'approved',
    'rejected',
    'paid',
    'requires_additional_info'
  ]),
  approvalHistory: z.array(z.object({
    approvedBy: z.string(),
    approverRole: z.enum(['manager', 'finance', 'admin']),
    action: z.enum(['approved', 'rejected', 'requested_info']),
    timestamp: z.string().datetime(),
    comments: z.string().optional(),
  })).optional(),
  rejectionReason: z.string().optional(),
  additionalInfoRequested: z.string().optional(),
});

// Approval Rules Schema
export const ApprovalRulesSchema = z.object({
  maxManagerApproval: z.number().positive().default(1000),
  maxFinanceApproval: z.number().positive().default(5000),
  requiresAdminApproval: z.number().positive().default(10000),
  categoryLimits: z.record(ExpenseCategorySchema, z.number().positive()).optional(),
  autoApprovalThreshold: z.number().positive().default(50),
  requiresReceiptThreshold: z.number().positive().default(25),
});

// Policy Violation Schema
export const PolicyViolationSchema = z.object({
  type: z.enum([
    'exceeds_limit',
    'missing_receipt',
    'invalid_category',
    'duplicate_expense',
    'outdated_expense',
    'invalid_merchant',
    'policy_breach'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  suggestedAction: z.string(),
});

// Workflow Status Schema
export const WorkflowStatusSchema = z.enum([
  'draft',
  'submitted',
  'policy_check_pending',
  'policy_check_completed',
  'manager_approval_pending',
  'manager_approved',
  'finance_approval_pending',
  'finance_approved',
  'admin_approval_pending',
  'approved',
  'rejected',
  'paid',
  'requires_additional_info',
  'policy_violation_detected'
]);

// Expense Workflow Record Schema
export const ExpenseWorkflowSchema = z.object({
  id: z.string().uuid(),
  reportId: z.string().uuid(),
  status: WorkflowStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expenseReport: ExpenseReportSchema.optional(),
  policyViolations: z.array(PolicyViolationSchema).optional(),
  approvalRules: ApprovalRulesSchema.optional(),
  estimatedApprovalTime: z.string().optional(),
  notifications: z.array(z.object({
    recipient: z.string().email(),
    type: z.enum(['approval_request', 'status_update', 'violation_alert', 'payment_notification']),
    sentAt: z.string().datetime(),
    status: z.enum(['sent', 'delivered', 'failed']),
  })).optional(),
});

// Type exports
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;
export type ExpenseItem = z.infer<typeof ExpenseItemSchema>;
export type ExpenseReport = z.infer<typeof ExpenseReportSchema>;
export type ApprovalRules = z.infer<typeof ApprovalRulesSchema>;
export type PolicyViolation = z.infer<typeof PolicyViolationSchema>;
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export type ExpenseWorkflow = z.infer<typeof ExpenseWorkflowSchema>;

// Response Types
export interface PolicyCheckResponse {
  passed: boolean;
  violations: PolicyViolation[];
  autoApprovable: boolean;
  requiredApprovers: string[];
  estimatedProcessingTime: string;
}

export interface ApprovalResponse {
  approved: boolean;
  approverRole: 'manager' | 'finance' | 'admin';
  comments?: string;
  nextApprover?: string;
  requiresAdditionalApproval: boolean;
  timestamp: string;
}

export interface PaymentResponse {
  processed: boolean;
  paymentMethod: string;
  transactionId?: string;
  estimatedPaymentDate: string;
  paymentAmount: number;
}