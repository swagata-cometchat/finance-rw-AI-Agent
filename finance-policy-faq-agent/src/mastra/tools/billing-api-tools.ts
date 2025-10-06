import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const invoiceInputSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number()
  })),
  taxRate: z.number().default(0.08),
  paymentTerms: z.string().default("Net 30"),
  dueDate: z.string().optional()
});

export const invoiceGeneratorTool = createTool({
  id: "invoiceGenerator",
  description: "Generate invoices for customers with line items, taxes, and payment terms",
  inputSchema: invoiceInputSchema,

  execute: async (input: z.infer<typeof invoiceInputSchema>) => {
    const subtotal = input.lineItems.reduce((sum: number, item: any) => sum + item.total, 0);
    const taxAmount = subtotal * input.taxRate;
    const totalAmount = subtotal + taxAmount;
    
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toISOString().split('T')[0];
    const dueDate = input.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      success: true,
      invoice: {
        invoiceNumber,
        invoiceDate,
        dueDate,
        customer: {
          id: input.customerId,
          name: input.customerName,
          email: input.customerEmail
        },
        lineItems: input.lineItems,
        subtotal: Number(subtotal.toFixed(2)),
        taxRate: input.taxRate,
        taxAmount: Number(taxAmount.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        paymentTerms: input.paymentTerms,
        status: "draft"
      }
    };
  }
});

const paymentInputSchema = z.object({
  invoiceNumber: z.string(),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "check", "cash"]),
  amount: z.number(),
  paymentReference: z.string().optional(),
  notes: z.string().optional()
});

export const paymentProcessorTool = createTool({
  id: "paymentProcessor",
  description: "Process payments and update payment status for invoices",
  inputSchema: paymentInputSchema,

  execute: async (input: z.infer<typeof paymentInputSchema>) => {
    // Simulate payment processing
    const processingFee = input.paymentMethod === "credit_card" ? input.amount * 0.029 : 0;
    const netAmount = input.amount - processingFee;
    
    return {
      success: true,
      payment: {
        paymentId: `PAY-${Date.now()}`,
        invoiceNumber: input.invoiceNumber,
        amount: input.amount,
        processingFee: Number(processingFee.toFixed(2)),
        netAmount: Number(netAmount.toFixed(2)),
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference,
        processedAt: new Date().toISOString(),
        status: "completed",
        notes: input.notes
      }
    };
  }
});

const subscriptionInputSchema = z.object({
  action: z.enum(["create", "update", "cancel", "pause", "resume", "get_status"]),
  customerId: z.string(),
  subscriptionId: z.string().optional(),
  planId: z.string().optional(),
  billingCycle: z.enum(["monthly", "quarterly", "annual"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const subscriptionManagerTool = createTool({
  id: "subscriptionManager",
  description: "Manage customer subscriptions, billing cycles, and recurring payments",
  inputSchema: subscriptionInputSchema,

  execute: async (input: z.infer<typeof subscriptionInputSchema>) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    switch (input.action) {
      case "create":
        return {
          success: true,
          subscription: {
            subscriptionId: `SUB-${Date.now()}`,
            customerId: input.customerId,
            planId: input.planId,
            billingCycle: input.billingCycle,
            status: "active",
            startDate: input.startDate || currentDate,
            nextBillingDate: calculateNextBillingDate(input.billingCycle || "monthly"),
            createdAt: new Date().toISOString()
          }
        };
      
      case "get_status":
        return {
          success: true,
          subscription: {
            subscriptionId: input.subscriptionId,
            customerId: input.customerId,
            status: "active",
            currentPeriodStart: "2024-10-01",
            currentPeriodEnd: "2024-10-31",
            nextBillingDate: "2024-11-01"
          }
        };
      
      default:
        return {
          success: true,
          subscription: {
            subscriptionId: input.subscriptionId,
            action: input.action,
            status: input.action === "cancel" ? "cancelled" : "active",
            updatedAt: new Date().toISOString()
          }
        };
    }
  }
});

const expenseInputSchema = z.object({
  action: z.enum(["add_expense", "get_expenses", "categorize", "generate_report"]),
  expenseId: z.string().optional(),
  amount: z.number().optional(),
  description: z.string().optional(),
  category: z.enum(["office_supplies", "travel", "meals", "software", "marketing", "utilities", "other"]).optional(),
  date: z.string().optional(),
  vendor: z.string().optional(),
  receipt: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const expenseTrackerTool = createTool({
  id: "expenseTracker",
  description: "Track and categorize business expenses for financial reporting",
  inputSchema: expenseInputSchema,

  execute: async (input: z.infer<typeof expenseInputSchema>) => {
    switch (input.action) {
      case "add_expense":
        return {
          success: true,
          expense: {
            expenseId: `EXP-${Date.now()}`,
            amount: input.amount,
            description: input.description,
            category: input.category,
            vendor: input.vendor,
            date: input.date || new Date().toISOString().split('T')[0],
            receipt: input.receipt,
            status: "pending",
            createdAt: new Date().toISOString()
          }
        };
      
      case "generate_report":
        return {
          success: true,
          report: {
            reportId: `RPT-${Date.now()}`,
            period: `${input.startDate} to ${input.endDate}`,
            totalExpenses: 15750.00,
            expensesByCategory: {
              office_supplies: 2500.00,
              travel: 5250.00,
              meals: 1800.00,
              software: 3200.00,
              marketing: 2000.00,
              utilities: 1000.00
            },
            generatedAt: new Date().toISOString()
          }
        };
      
      default:
        return {
          success: true,
          expenses: [
            {
              expenseId: "EXP-001",
              amount: 250.00,
              description: "Office supplies",
              category: "office_supplies",
              date: "2024-10-01"
            }
          ]
        };
    }
  }
});

function calculateNextBillingDate(billingCycle: string): string {
  const now = new Date();
  switch (billingCycle) {
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
    case "quarterly":
      now.setMonth(now.getMonth() + 3);
      break;
    case "annual":
      now.setFullYear(now.getFullYear() + 1);
      break;
  }
  return now.toISOString().split('T')[0];
}