import { createTool } from '@mastra/core';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Simulated payments database
const PAYMENTS_DATABASE: Array<{
  id: string;
  paymentId: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  processedAt: string;
  description: string;
  failureReason?: string;
}> = [];

// Pre-populate with sample payments
PAYMENTS_DATABASE.push(
  {
    id: 'PAY-001',
    paymentId: 'PAY-2025-001',
    customerId: 'CUST-002',
    customerName: 'StartupHub LLC',
    invoiceId: 'INV-002',
    amount: 750.00,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN-ABC123456',
    processedAt: '2025-09-28T14:30:00Z',
    description: 'Payment for invoice INV-2025-002',
  },
  {
    id: 'PAY-002',
    paymentId: 'PAY-2025-002',
    customerId: 'CUST-001',
    customerName: 'TechCorp Inc.',
    amount: 1500.00,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'credit_card',
    transactionId: 'TXN-DEF789012',
    processedAt: '2025-10-01T09:15:00Z',
    description: 'Partial payment for services',
  },
  {
    id: 'PAY-003',
    paymentId: 'PAY-2025-003',
    customerId: 'CUST-004',
    customerName: 'Digital Agency Pro',
    amount: 300.00,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'credit_card',
    transactionId: 'TXN-GHI345678',
    processedAt: '2025-09-30T11:45:00Z',
    description: 'Failed payment attempt',
    failureReason: 'Insufficient funds',
  },
);

export const processPaymentTool = createTool({
  id: 'process-payment',
  description: 'Process payments, retrieve payment history, or manage payment statuses',
  inputSchema: z.object({
    action: z.enum(['process', 'get', 'list', 'refund']).describe('Action to perform with payments'),
    paymentId: z.string().optional().describe('Payment ID for get or refund actions'),
    customerId: z.string().optional().describe('Customer ID for processing payment or filtering'),
    invoiceId: z.string().optional().describe('Invoice ID for payment processing'),
    amount: z.number().optional().describe('Payment amount for processing'),
    paymentMethod: z.enum(['credit_card', 'bank_transfer', 'paypal', 'crypto']).optional().describe('Payment method'),
    description: z.string().optional().describe('Payment description'),
    status: z.string().optional().describe('Filter payments by status (completed, pending, failed, refunded)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    payments: z.array(z.object({
      id: z.string(),
      paymentId: z.string(),
      customerId: z.string(),
      customerName: z.string(),
      invoiceId: z.string().optional(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      paymentMethod: z.string(),
      transactionId: z.string(),
      processedAt: z.string(),
      description: z.string(),
      failureReason: z.string().optional(),
      displayAmount: z.string(),
      displayProcessedAt: z.string(),
    })).optional(),
    payment: z.object({
      id: z.string(),
      paymentId: z.string(),
      customerId: z.string(),
      customerName: z.string(),
      invoiceId: z.string().optional(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      paymentMethod: z.string(),
      transactionId: z.string(),
      processedAt: z.string(),
      description: z.string(),
      failureReason: z.string().optional(),
      displayAmount: z.string(),
      displayProcessedAt: z.string(),
    }).optional(),
    message: z.string(),
    total: z.number().optional(),
    totalAmount: z.number().optional(),
  }),
  execute: async ({ context }) => {
    const { action, paymentId, customerId, invoiceId, amount, paymentMethod, description, status } = context as { 
      action: string;
      paymentId?: string;
      customerId?: string;
      invoiceId?: string;
      amount?: number;
      paymentMethod?: string;
      description?: string;
      status?: string;
    };

    // Helper function to transform payment for display
    const transformPayment = (payment: any) => ({
      ...payment,
      displayAmount: `${payment.currency} ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      displayProcessedAt: new Date(payment.processedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    switch (action) {
      case 'process':
        if (!customerId || !amount || !paymentMethod) {
          return {
            success: false,
            message: 'Missing required fields: customerId, amount, and paymentMethod are required for processing payment',
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

        // Simulate payment processing logic
        const isSuccessful = Math.random() > 0.1; // 90% success rate
        const paymentStatus = isSuccessful ? 'completed' : 'failed';
        const failureReason = !isSuccessful ? 'Payment gateway error' : undefined;

        const newPayment = {
          id: `PAY-${uuidv4().substring(0, 8).toUpperCase()}`,
          paymentId: `PAY-2025-${String(PAYMENTS_DATABASE.length + 1).padStart(3, '0')}`,
          customerId,
          customerName: customer.name,
          invoiceId,
          amount,
          currency: 'USD',
          status: paymentStatus,
          paymentMethod,
          transactionId: `TXN-${uuidv4().substring(0, 9).toUpperCase()}`,
          processedAt: new Date().toISOString(),
          description: description || (invoiceId ? `Payment for invoice ${invoiceId}` : 'General payment'),
          failureReason,
        };

        PAYMENTS_DATABASE.push(newPayment);

        return {
          success: isSuccessful,
          payment: transformPayment(newPayment),
          message: isSuccessful 
            ? `Payment ${newPayment.paymentId} processed successfully`
            : `Payment ${newPayment.paymentId} failed: ${failureReason}`,
        };

      case 'get':
        if (!paymentId) {
          return {
            success: false,
            message: 'Payment ID is required for get action',
            total: 0,
          };
        }

        const payment = PAYMENTS_DATABASE.find(pay => pay.id === paymentId);
        if (!payment) {
          return {
            success: false,
            message: `Payment ${paymentId} not found`,
            total: 0,
          };
        }

        return {
          success: true,
          payment: transformPayment(payment),
          message: `Found payment ${payment.paymentId}`,
        };

      case 'refund':
        if (!paymentId) {
          return {
            success: false,
            message: 'Payment ID is required for refund action',
            total: 0,
          };
        }

        const paymentToRefund = PAYMENTS_DATABASE.find(pay => pay.id === paymentId);
        if (!paymentToRefund) {
          return {
            success: false,
            message: `Payment ${paymentId} not found`,
            total: 0,
          };
        }

        if (paymentToRefund.status !== 'completed') {
          return {
            success: false,
            message: `Cannot refund payment ${paymentToRefund.paymentId} - only completed payments can be refunded`,
            total: 0,
          };
        }

        if (paymentToRefund.status === 'refunded') {
          return {
            success: false,
            message: `Payment ${paymentToRefund.paymentId} has already been refunded`,
            total: 0,
          };
        }

        // Create refund record
        const refundPayment = {
          id: `PAY-${uuidv4().substring(0, 8).toUpperCase()}`,
          paymentId: `REF-2025-${String(PAYMENTS_DATABASE.length + 1).padStart(3, '0')}`,
          customerId: paymentToRefund.customerId,
          customerName: paymentToRefund.customerName,
          invoiceId: paymentToRefund.invoiceId,
          amount: -paymentToRefund.amount, // Negative amount for refund
          currency: paymentToRefund.currency,
          status: 'completed',
          paymentMethod: paymentToRefund.paymentMethod,
          transactionId: `TXN-${uuidv4().substring(0, 9).toUpperCase()}`,
          processedAt: new Date().toISOString(),
          description: `Refund for payment ${paymentToRefund.paymentId}`,
        };

        paymentToRefund.status = 'refunded';
        PAYMENTS_DATABASE.push(refundPayment);

        return {
          success: true,
          payment: transformPayment(refundPayment),
          message: `Refund ${refundPayment.paymentId} processed successfully for payment ${paymentToRefund.paymentId}`,
        };

      case 'list':
      default:
        let filteredPayments = [...PAYMENTS_DATABASE];

        // Filter by customer ID if provided
        if (customerId) {
          filteredPayments = filteredPayments.filter(pay => pay.customerId === customerId);
        }

        // Filter by status if provided
        if (status) {
          filteredPayments = filteredPayments.filter(pay => pay.status.toLowerCase() === status.toLowerCase());
        }

        // Sort by processed date (newest first)
        filteredPayments = filteredPayments.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());

        // Transform payments for display
        const payments = filteredPayments.map(transformPayment);
        const totalAmount = filteredPayments.reduce((sum, pay) => sum + pay.amount, 0);

        let message = '';
        if (customerId) {
          message = `Found ${payments.length} payments for customer ${customerId}`;
        } else if (status) {
          message = `Found ${payments.length} ${status} payments`;
        } else {
          message = `Found ${payments.length} total payments`;
        }

        return {
          success: true,
          payments,
          message,
          total: payments.length,
          totalAmount,
        };
    }
  },
});