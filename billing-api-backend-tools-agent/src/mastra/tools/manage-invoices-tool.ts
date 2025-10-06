import { createTool } from '@mastra/core';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Simulated invoices database
const INVOICES_DATABASE: Array<{
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  taxAmount: number;
  subtotal: number;
  paymentMethod?: string;
}> = [];

// Pre-populate with sample invoices
INVOICES_DATABASE.push(
  {
    id: 'INV-001',
    invoiceNumber: 'INV-2025-001',
    customerId: 'CUST-001',
    customerName: 'TechCorp Inc.',
    amount: 2450.00,
    currency: 'USD',
    status: 'pending',
    dueDate: '2025-10-15T00:00:00Z',
    issueDate: '2025-09-15T00:00:00Z',
    description: 'Monthly subscription and setup fees',
    items: [
      { name: 'Premium Plan Subscription', quantity: 1, unitPrice: 1999.00, total: 1999.00 },
      { name: 'Setup Fee', quantity: 1, unitPrice: 250.00, total: 250.00 },
      { name: 'Additional Storage', quantity: 2, unitPrice: 75.00, total: 150.00 }
    ],
    taxAmount: 51.00,
    subtotal: 2399.00,
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-2025-002',
    customerId: 'CUST-002',
    customerName: 'StartupHub LLC',
    amount: 750.00,
    currency: 'USD',
    status: 'paid',
    dueDate: '2025-10-01T00:00:00Z',
    issueDate: '2025-09-01T00:00:00Z',
    paidDate: '2025-09-28T14:30:00Z',
    description: 'Quarterly service package',
    items: [
      { name: 'Business Plan (Q4)', quantity: 1, unitPrice: 697.67, total: 697.67 }
    ],
    taxAmount: 52.33,
    subtotal: 697.67,
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-2025-003',
    customerId: 'CUST-003',
    customerName: 'Global Solutions Ltd.',
    amount: 875.50,
    currency: 'USD',
    status: 'overdue',
    dueDate: '2025-09-30T00:00:00Z',
    issueDate: '2025-08-30T00:00:00Z',
    description: 'Enterprise services and consulting',
    items: [
      { name: 'Enterprise Plan', quantity: 1, unitPrice: 599.00, total: 599.00 },
      { name: 'Consulting Hours', quantity: 5, unitPrice: 50.00, total: 250.00 }
    ],
    taxAmount: 26.50,
    subtotal: 849.00,
  },
);

export const manageInvoicesTool = createTool({
  id: 'manage-invoices',
  description: 'Create, retrieve, update, or list invoices with filtering and status management',
  inputSchema: z.object({
    action: z.enum(['create', 'get', 'update', 'list', 'mark_paid']).describe('Action to perform on invoices'),
    invoiceId: z.string().optional().describe('Invoice ID for get, update, or mark_paid actions'),
    customerId: z.string().optional().describe('Customer ID for creating invoice or filtering'),
    amount: z.number().optional().describe('Invoice amount for creating invoice'),
    description: z.string().optional().describe('Invoice description for creating invoice'),
    dueDate: z.string().optional().describe('Due date for invoice (YYYY-MM-DD) for creating invoice'),
    status: z.string().optional().describe('Filter invoices by status (pending, paid, overdue, cancelled)'),
    paymentMethod: z.string().optional().describe('Payment method when marking as paid'),
    items: z.array(z.object({
      name: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    })).optional().describe('Invoice line items for creating invoice'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    invoices: z.array(z.object({
      id: z.string(),
      invoiceNumber: z.string(),
      customerId: z.string(),
      customerName: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      dueDate: z.string(),
      issueDate: z.string(),
      paidDate: z.string().optional(),
      description: z.string(),
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        total: z.number(),
      })),
      taxAmount: z.number(),
      subtotal: z.number(),
      paymentMethod: z.string().optional(),
      displayAmount: z.string(),
      displayDueDate: z.string(),
      displayIssueDate: z.string(),
      displayPaidDate: z.string().optional(),
      daysOverdue: z.number().optional(),
    })).optional(),
    invoice: z.object({
      id: z.string(),
      invoiceNumber: z.string(),
      customerId: z.string(),
      customerName: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      dueDate: z.string(),
      issueDate: z.string(),
      paidDate: z.string().optional(),
      description: z.string(),
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        total: z.number(),
      })),
      taxAmount: z.number(),
      subtotal: z.number(),
      paymentMethod: z.string().optional(),
      displayAmount: z.string(),
      displayDueDate: z.string(),
      displayIssueDate: z.string(),
      displayPaidDate: z.string().optional(),
    }).optional(),
    message: z.string(),
    total: z.number().optional(),
    totalAmount: z.number().optional(),
  }),
  execute: async ({ context }: { context: any }) => {
    const { action, invoiceId, customerId, amount, description, dueDate, status, paymentMethod, items } = context as { 
      action: string;
      invoiceId?: string;
      customerId?: string;
      amount?: number;
      description?: string;
      dueDate?: string;
      status?: string;
      paymentMethod?: string;
      items?: Array<{ name: string; quantity: number; unitPrice: number; }>;
    };

    const currentDate = new Date();
    
    // Helper function to transform invoice for display
    const transformInvoice = (invoice: any) => {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = currentDate > dueDate && invoice.status === 'pending';
      const daysOverdue = isOverdue ? Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;

      return {
        ...invoice,
        displayAmount: `${invoice.currency} ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        displayDueDate: new Date(invoice.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        displayIssueDate: new Date(invoice.issueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        displayPaidDate: invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) : undefined,
        daysOverdue,
      };
    };

    switch (action) {
      case 'create':
        if (!customerId || !amount || !description || !dueDate) {
          return {
            success: false,
            message: 'Missing required fields: customerId, amount, description, and dueDate are required for creating an invoice',
            total: 0,
          };
        }

        // Find customer to get name
        const customer = [
          { id: 'CUST-001', name: 'TechCorp Inc.' },
          { id: 'CUST-002', name: 'StartupHub LLC' },
          { id: 'CUST-003', name: 'Global Solutions Ltd.' },
          { id: 'CUST-004', name: 'Digital Agency Pro' },
        ].find(c => c.id === customerId);

        if (!customer) {
          return {
            success: false,
            message: `Customer ${customerId} not found`,
            total: 0,
          };
        }

        const invoiceItems = items || [{ name: description, quantity: 1, unitPrice: amount }];
        const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = subtotal * 0.08; // 8% tax
        const invoiceTotalAmount = subtotal + taxAmount;

        const newInvoice = {
          id: `INV-${uuidv4().substring(0, 8).toUpperCase()}`,
          invoiceNumber: `INV-2025-${String(INVOICES_DATABASE.length + 1).padStart(3, '0')}`,
          customerId,
          customerName: customer.name,
          amount: invoiceTotalAmount,
          currency: 'USD',
          status: 'pending',
          dueDate: new Date(dueDate).toISOString(),
          issueDate: new Date().toISOString(),
          description,
          items: invoiceItems.map(item => ({
            ...item,
            total: item.quantity * item.unitPrice,
          })),
          taxAmount,
          subtotal,
        };

        INVOICES_DATABASE.push(newInvoice);

        return {
          success: true,
          invoice: transformInvoice(newInvoice),
          message: `Invoice ${newInvoice.invoiceNumber} created successfully`,
        };

      case 'get':
        if (!invoiceId) {
          return {
            success: false,
            message: 'Invoice ID is required for get action',
            total: 0,
          };
        }

        const invoice = INVOICES_DATABASE.find(inv => inv.id === invoiceId);
        if (!invoice) {
          return {
            success: false,
            message: `Invoice ${invoiceId} not found`,
            total: 0,
          };
        }

        return {
          success: true,
          invoice: transformInvoice(invoice),
          message: `Found invoice ${invoice.invoiceNumber}`,
        };

      case 'mark_paid':
        if (!invoiceId) {
          return {
            success: false,
            message: 'Invoice ID is required for mark_paid action',
            total: 0,
          };
        }

        const invoiceToUpdate = INVOICES_DATABASE.find(inv => inv.id === invoiceId);
        if (!invoiceToUpdate) {
          return {
            success: false,
            message: `Invoice ${invoiceId} not found`,
            total: 0,
          };
        }

        if (invoiceToUpdate.status === 'paid') {
          return {
            success: false,
            message: `Invoice ${invoiceToUpdate.invoiceNumber} is already marked as paid`,
            total: 0,
          };
        }

        invoiceToUpdate.status = 'paid';
        invoiceToUpdate.paidDate = new Date().toISOString();
        if (paymentMethod) {
          invoiceToUpdate.paymentMethod = paymentMethod;
        }

        return {
          success: true,
          invoice: transformInvoice(invoiceToUpdate),
          message: `Invoice ${invoiceToUpdate.invoiceNumber} marked as paid`,
        };

      case 'list':
      default:
        let filteredInvoices = [...INVOICES_DATABASE];

        // Filter by customer ID if provided
        if (customerId) {
          filteredInvoices = filteredInvoices.filter(inv => inv.customerId === customerId);
        }

        // Filter by status if provided
        if (status) {
          if (status === 'overdue') {
            filteredInvoices = filteredInvoices.filter(inv => {
              const dueDate = new Date(inv.dueDate);
              return currentDate > dueDate && inv.status === 'pending';
            });
          } else {
            filteredInvoices = filteredInvoices.filter(inv => inv.status.toLowerCase() === status.toLowerCase());
          }
        }

        // Sort by issue date (newest first)
        filteredInvoices = filteredInvoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

        // Transform invoices for display
        const invoices = filteredInvoices.map(transformInvoice);
        const listTotalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        let message = '';
        if (customerId) {
          message = `Found ${invoices.length} invoices for customer ${customerId}`;
        } else if (status) {
          message = `Found ${invoices.length} ${status} invoices`;
        } else {
          message = `Found ${invoices.length} total invoices`;
        }

        return {
          success: true,
          invoices,
          message,
          total: invoices.length,
          totalAmount: listTotalAmount,
        };
    }
  },
});