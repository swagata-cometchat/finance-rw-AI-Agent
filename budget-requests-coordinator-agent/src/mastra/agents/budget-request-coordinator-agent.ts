import { departmentManagerAgentWithApproval } from './department-manager-agent';
import { financeManagerAgentWithApproval } from './finance-manager-agent';

export interface BudgetApprovalResult {
  message: string;
  routedTo: 'department-manager' | 'finance-manager' | 'auto-approved' | 'requires-documentation';
  approved: boolean;
  budgetDetails?: {
    requestDate: string;
    approvalDate: string;
    type: string;
    amount: string;
    approver: string;
    requestId: string;
  };
  priority: 'low' | 'medium' | 'high';
  nextSteps: string[];
}

export class BudgetRequestCoordinatorAgent {
  async processBudgetRequest(request: string, amount?: string, category?: string): Promise<BudgetApprovalResult> {
    // Ensure request is defined and has a value
    if (!request || typeof request !== 'string') {
      throw new Error('Budget request description is required');
    }
    
    const lower = request.toLowerCase();
    const requestAmount = this.parseAmount(amount || this.extractAmountFromRequest(request));
    
    // Finance Manager keywords - high-value or strategic budget requests
    const financeManagerTypes = [
      'capital expenditure', 'capex', 'equipment purchase', 'infrastructure', 'technology upgrade',
      'software license', 'hiring', 'headcount', 'salary increase', 'bonus', 'contractor',
      'marketing campaign', 'advertising', 'conference', 'training budget', 'consultant'
    ];
    
    // Auto-approved keywords - small operational expenses
    const autoApprovedTypes = [
      'office supplies', 'stationery', 'coffee', 'snacks', 'small expense',
      'petty cash', 'taxi fare', 'parking', 'meal expense'
    ];

    // Documentation required keywords - need additional paperwork
    const documentationRequired = [
      'vendor quote', 'three quotes', 'proposal', 'contract', 'purchase order',
      'justification', 'business case', 'roi analysis', 'cost benefit'
    ];

    // Check for auto-approval (small amounts under $500)
    if (requestAmount <= 500 || autoApprovedTypes.some(keyword => lower.includes(keyword))) {
      const requestId = `AUTO-${Date.now()}`;
      const today = new Date();
      const requestDate = today.toISOString().split('T')[0];
      
      return {
        message: `Your budget request for ${this.formatAmount(requestAmount)} has been automatically approved. Small operational expenses under $500 are pre-approved for efficiency.`,
        routedTo: 'auto-approved',
        approved: true,
        budgetDetails: {
          requestDate: requestDate,
          approvalDate: requestDate,
          type: category || request,
          amount: this.formatAmount(requestAmount),
          approver: 'Automated System',
          requestId: requestId
        },
        priority: 'low',
        nextSteps: [
          'Proceed with the purchase using company guidelines',
          'Keep receipts for expense reporting',
          'Update budget tracking spreadsheet',
          'Notify team if purchase affects shared resources'
        ]
      };
    }

    // Check for documentation requirements
    if (documentationRequired.some(keyword => lower.includes(keyword)) || requestAmount >= 10000) {
      return {
        message: `Your budget request for ${this.formatAmount(requestAmount)} requires additional documentation before approval. Please submit vendor quotes, business justification, and ROI analysis.`,
        routedTo: 'requires-documentation',
        approved: false,
        priority: 'high',
        nextSteps: [
          'Prepare business case with ROI analysis',
          'Obtain at least 3 vendor quotes for comparison',
          'Submit detailed budget justification',
          'Schedule presentation with finance committee if over $25,000'
        ]
      };
    }

    // Check for Finance Manager approval (high amounts or strategic types)
    if (requestAmount >= 5000 || financeManagerTypes.some(keyword => lower.includes(keyword))) {
      const result = await financeManagerAgentWithApproval.processBudgetRequest(request, amount, category);
      return {
        message: result.message,
        routedTo: 'finance-manager',
        approved: result.approved,
        budgetDetails: result.budgetDetails,
        priority: 'high',
        nextSteps: result.nextSteps
      };
    }

    // Default to department manager for routine budget requests
    const result = await departmentManagerAgentWithApproval.processBudgetRequest(request, amount, category);
    return {
      message: result.message,
      routedTo: 'department-manager',
      approved: result.approved,
      budgetDetails: result.budgetDetails,
      priority: 'medium',
      nextSteps: result.nextSteps
    };
  }

  private parseAmount(amountStr: string): number {
    if (!amountStr || typeof amountStr !== 'string') return 0;
    
    // Remove currency symbols and commas, extract numbers
    const cleaned = amountStr.replace(/[$,\s]/g, '');
    const match = cleaned.match(/(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private extractAmountFromRequest(request: string): string {
    if (!request || typeof request !== 'string') return '0';
    
    // Try to find amount patterns in the request
    const patterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|usd|\$)/i,
      /budget\s+of\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
    ];
    
    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match) return match[1];
    }
    
    return '0';
  }

  private formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}