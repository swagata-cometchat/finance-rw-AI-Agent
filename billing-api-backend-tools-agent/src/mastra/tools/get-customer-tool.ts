import { createTool } from '@mastra/core';
import { z } from 'zod';

// Simulated customers database
const CUSTOMERS_DATABASE = [
  {
    id: 'CUST-001',
    customerId: 'CUST-001',
    customerName: 'TechCorp Inc.',
    email: 'billing@techcorp.com',
    phone: '+1-555-0123',
    address: '123 Tech Street, Silicon Valley, CA 94105',
    billingCycle: 'monthly',
    paymentMethod: 'credit_card',
    status: 'active',
    createdAt: '2023-01-15T00:00:00Z',
    lastPayment: '2025-09-01T10:30:00Z',
    outstandingBalance: 2450.00,
    currency: 'USD',
    taxId: 'TAX-001',
    billingContact: 'John Smith',
  },
  {
    id: 'CUST-002',
    customerId: 'CUST-002',
    customerName: 'StartupHub LLC',
    email: 'finance@startuphub.com',
    phone: '+1-555-0456',
    address: '456 Innovation Drive, Austin, TX 78701',
    billingCycle: 'quarterly',
    paymentMethod: 'bank_transfer',
    status: 'active',
    createdAt: '2023-03-20T00:00:00Z',
    lastPayment: '2025-07-01T14:15:00Z',
    outstandingBalance: 0.00,
    currency: 'USD',
    taxId: 'TAX-002',
    billingContact: 'Sarah Johnson',
  },
  {
    id: 'CUST-003',
    customerId: 'CUST-003',
    customerName: 'Global Solutions Ltd.',
    email: 'accounts@globalsolutions.com',
    phone: '+1-555-0789',
    address: '789 Business Park, New York, NY 10001',
    billingCycle: 'monthly',
    paymentMethod: 'credit_card',
    status: 'active',
    createdAt: '2023-06-10T00:00:00Z',
    lastPayment: '2025-09-15T09:45:00Z',
    outstandingBalance: 875.50,
    currency: 'USD',
    taxId: 'TAX-003',
    billingContact: 'Michael Brown',
  },
  {
    id: 'CUST-004',
    customerId: 'CUST-004',
    customerName: 'Digital Agency Pro',
    email: 'billing@digitalagencypro.com',
    phone: '+1-555-0321',
    address: '321 Creative Lane, Los Angeles, CA 90210',
    billingCycle: 'monthly',
    paymentMethod: 'paypal',
    status: 'suspended',
    createdAt: '2024-01-05T00:00:00Z',
    lastPayment: '2025-08-01T16:20:00Z',
    outstandingBalance: 1200.00,
    currency: 'USD',
    taxId: 'TAX-004',
    billingContact: 'Emma Davis',
  },
];

export const getCustomerTool = createTool({
  id: 'get-customer',
  description: 'Get customer billing information by customer ID or list all customers with optional filtering',
  inputSchema: z.object({
    customerId: z.string().optional().describe('Specific customer ID to retrieve (if not provided, returns all customers)'),
    status: z.string().optional().describe('Filter customers by status (active, suspended, cancelled)'),
    billingCycle: z.string().optional().describe('Filter customers by billing cycle (monthly, quarterly, annual)'),
    paymentMethod: z.string().optional().describe('Filter customers by payment method (credit_card, bank_transfer, paypal)'),
    hasOutstandingBalance: z.boolean().optional().describe('Filter customers with outstanding balances'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    customers: z.array(z.object({
      id: z.string(),
      customerId: z.string(),
      customerName: z.string(),
      email: z.string(),
      phone: z.string(),
      address: z.string(),
      billingCycle: z.string(),
      paymentMethod: z.string(),
      status: z.string(),
      createdAt: z.string(),
      lastPayment: z.string(),
      outstandingBalance: z.number(),
      currency: z.string(),
      taxId: z.string(),
      billingContact: z.string(),
      displayOutstandingBalance: z.string(),
      displayCreatedAt: z.string(),
      displayLastPayment: z.string(),
    })),
    message: z.string(),
    total: z.number(),
    totalOutstandingBalance: z.number(),
  }),
  execute: async ({ context }) => {
    const { customerId, status, billingCycle, paymentMethod, hasOutstandingBalance } = context as { 
      customerId?: string; 
      status?: string; 
      billingCycle?: string;
      paymentMethod?: string;
      hasOutstandingBalance?: boolean;
    };

    let filteredCustomers = [...CUSTOMERS_DATABASE];

    // Filter by specific customer ID
    if (customerId) {
      filteredCustomers = filteredCustomers.filter(c => c.customerId === customerId);
      if (filteredCustomers.length === 0) {
        return {
          success: false,
          customers: [],
          message: `Customer ${customerId} not found`,
          total: 0,
          totalOutstandingBalance: 0,
        };
      }
    }

    // Filter by status if provided
    if (status) {
      filteredCustomers = filteredCustomers.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by billing cycle if provided
    if (billingCycle) {
      filteredCustomers = filteredCustomers.filter(c => c.billingCycle.toLowerCase() === billingCycle.toLowerCase());
    }

    // Filter by payment method if provided
    if (paymentMethod) {
      filteredCustomers = filteredCustomers.filter(c => c.paymentMethod.toLowerCase() === paymentMethod.toLowerCase());
    }

    // Filter by outstanding balance if provided
    if (hasOutstandingBalance !== undefined) {
      if (hasOutstandingBalance) {
        filteredCustomers = filteredCustomers.filter(c => c.outstandingBalance > 0);
      } else {
        filteredCustomers = filteredCustomers.filter(c => c.outstandingBalance === 0);
      }
    }

    // Transform customers for display
    const customers = filteredCustomers.map(customer => ({
      ...customer,
      displayOutstandingBalance: `${customer.currency} ${customer.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      displayCreatedAt: new Date(customer.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      displayLastPayment: new Date(customer.lastPayment).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    const totalOutstandingBalance = filteredCustomers.reduce((sum, customer) => sum + customer.outstandingBalance, 0);

    let message = '';
    if (customerId) {
      message = `Found customer ${customerId}`;
    } else if (status) {
      message = `Found ${customers.length} ${status} customers`;
    } else if (billingCycle) {
      message = `Found ${customers.length} customers with ${billingCycle} billing cycle`;
    } else if (paymentMethod) {
      message = `Found ${customers.length} customers using ${paymentMethod}`;
    } else if (hasOutstandingBalance !== undefined) {
      message = hasOutstandingBalance 
        ? `Found ${customers.length} customers with outstanding balances`
        : `Found ${customers.length} customers with no outstanding balance`;
    } else {
      message = `Found ${customers.length} total customers`;
    }

    return {
      success: true,
      customers,
      message,
      total: customers.length,
      totalOutstandingBalance,
    };
  },
});