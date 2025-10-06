import { safeErrorMessage } from '../util/safeErrorMessage';
import { ExpenseWorkflowSchema, ExpenseReportSchema } from '../../../types/expense';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo (use database in production)
const expenseWorkflows = new Map<string, any>();

export const submitExpenseReportHandler = async (c: any) => {
  try {
    const body = await c.req.json();
    const reportId = uuidv4();
    
    // Validate expense report
    const expenseReport = ExpenseReportSchema.parse({
      ...body,
      id: reportId,
      submissionDate: new Date().toISOString(),
      status: 'submitted'
    });
    
    const workflowRecord = {
      id: uuidv4(),
      reportId,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expenseReport,
    };
    
    expenseWorkflows.set(reportId, workflowRecord);
    
    return c.json({
      success: true,
      reportId,
      workflowId: workflowRecord.id,
      status: 'submitted',
      message: 'Expense report submitted successfully',
      nextSteps: [
        'Policy validation check',
        'Receipt processing',
        'Compliance verification',
        'Approval routing'
      ]
    });
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 400);
  }
};

export const validateExpenseHandler = async (c: any) => {
  try {
    const { reportId } = c.req.param();
    
    if (!expenseWorkflows.has(reportId)) {
      return c.json({ error: 'Expense report not found' }, 404);
    }
    
    const workflow = expenseWorkflows.get(reportId);
    const expenseReport = workflow.expenseReport;
    
    // Simulate expense validation without tools for now
    const violations = [];
    let autoApprovable = true;
    const requiredApprovers = [];
    
    // Simple validation logic
    for (const expense of expenseReport.expenses) {
      if (expense.amount > 1000) {
        violations.push({
          type: 'exceeds_limit',
          severity: 'medium',
          description: `Expense of $${expense.amount} exceeds single item limit of $1000`,
          suggestedAction: 'Require manager approval',
        });
        autoApprovable = false;
      }
      
      if (expense.amount > 25 && !expense.receiptUrl) {
        violations.push({
          type: 'missing_receipt',
          severity: 'high',
          description: `Receipt required for expense of $${expense.amount}`,
          suggestedAction: 'Request receipt upload',
        });
        autoApprovable = false;
      }
    }
    
    if (expenseReport.totalAmount > 50) {
      requiredApprovers.push('manager');
      autoApprovable = false;
    }
    if (expenseReport.totalAmount > 1000) {
      requiredApprovers.push('finance');
    }
    if (expenseReport.totalAmount > 5000) {
      requiredApprovers.push('admin');
    }
    
    const result = {
      success: true,
      reportId,
      passed: violations.length === 0,
      violations,
      autoApprovable,
      requiredApprovers,
      estimatedProcessingTime: `${Math.ceil(1 + violations.length * 0.5)} hours`,
      validationScore: Math.max(0, 100 - (violations.length * 20)),
      timestamp: new Date().toISOString(),
    };
    
    workflow.policyViolations = result.violations;
    workflow.status = result.passed ? 'policy_check_completed' : 'policy_violation_detected';
    workflow.updatedAt = new Date().toISOString();
    
    expenseWorkflows.set(reportId, workflow);
    
    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const processApprovalHandler = async (c: any) => {
  try {
    const { reportId } = c.req.param();
    const { approverRole, approverId, action, comments } = await c.req.json();
    
    if (!expenseWorkflows.has(reportId)) {
      return c.json({ error: 'Expense report not found' }, 404);
    }
    
    const workflow = expenseWorkflows.get(reportId);
    const expenseReport = workflow.expenseReport;
    
    // Simple approval processing
    let requiresAdditionalApproval = false;
    let nextApprover = undefined;
    
    if (action === 'approve') {
      if (approverRole === 'manager' && expenseReport.totalAmount > 1000) {
        requiresAdditionalApproval = true;
        nextApprover = 'finance';
      } else if (approverRole === 'finance' && expenseReport.totalAmount > 5000) {
        requiresAdditionalApproval = true;
        nextApprover = 'admin';
      }
    }
    
    const result = {
      success: true,
      reportId,
      approved: action === 'approve',
      rejected: action === 'reject',
      infoRequested: action === 'request_info',
      approverRole,
      approverId,
      comments: comments || (action === 'approve' ? 'Approved as per policy' : 
                           action === 'reject' ? 'Does not meet approval criteria' : 
                           'Additional information required'),
      nextApprover,
      requiresAdditionalApproval,
      timestamp: new Date().toISOString(),
      finalApproval: !requiresAdditionalApproval && action === 'approve',
    };
    
    // Update approval history
    expenseReport.approvalHistory = expenseReport.approvalHistory || [];
    expenseReport.approvalHistory.push({
      approvedBy: approverId,
      approverRole,
      action,
      timestamp: result.timestamp,
      comments: result.comments
    });
    
    // Update status based on approval result
    if (result.rejected) {
      workflow.status = 'rejected';
      expenseReport.status = 'rejected';
      expenseReport.rejectionReason = result.comments;
    } else if (result.infoRequested) {
      workflow.status = 'requires_additional_info';
      expenseReport.status = 'requires_additional_info';
      expenseReport.additionalInfoRequested = result.comments;
    } else if (result.approved) {
      if (result.requiresAdditionalApproval) {
        workflow.status = `${result.nextApprover}_approval_pending`;
        expenseReport.status = `pending_${result.nextApprover}_approval`;
      } else {
        workflow.status = 'approved';
        expenseReport.status = 'approved';
      }
    }
    
    workflow.updatedAt = new Date().toISOString();
    expenseWorkflows.set(reportId, workflow);
    
    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const processPaymentHandler = async (c: any) => {
  try {
    const { reportId } = c.req.param();
    const body = await c.req.json();
    
    if (!expenseWorkflows.has(reportId)) {
      return c.json({ error: 'Expense report not found' }, 404);
    }
    
    const workflow = expenseWorkflows.get(reportId);
    const expenseReport = workflow.expenseReport;
    
    if (workflow.status !== 'approved') {
      return c.json({ error: 'Expense report must be approved before payment' }, 400);
    }
    
    // Simulate payment processing
    const transactionId = `TXN${Date.now()}${Math.random().toString().substr(2, 4)}`;
    const currentDate = new Date();
    
    const result = {
      success: true,
      reportId,
      processed: true,
      paymentMethod: body.paymentMethod || 'direct_deposit',
      transactionId,
      paymentAmount: expenseReport.totalAmount,
      estimatedPaymentDate: new Date(currentDate.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      actualPaymentDate: currentDate.toISOString().split('T')[0],
      paymentStatus: 'processed',
      beneficiary: {
        name: expenseReport.employeeInfo.name,
        email: expenseReport.employeeInfo.email,
      },
      timestamp: new Date().toISOString(),
    };
    
    workflow.status = 'paid';
    expenseReport.status = 'paid';
    workflow.paymentDetails = {
      transactionId: result.transactionId,
      paymentMethod: result.paymentMethod,
      paymentDate: result.actualPaymentDate,
      amount: result.paymentAmount
    };
    workflow.updatedAt = new Date().toISOString();
    expenseWorkflows.set(reportId, workflow);
    
    return c.json(result);
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const getExpenseStatusHandler = async (c: any) => {
  try {
    const { reportId } = c.req.param();
    
    if (!expenseWorkflows.has(reportId)) {
      return c.json({ error: 'Expense report not found' }, 404);
    }
    
    const workflow = expenseWorkflows.get(reportId);
    
    return c.json({
      success: true,
      reportId,
      workflowId: workflow.id,
      status: workflow.status,
      progress: {
        submitted: true,
        policyChecked: !!workflow.policyViolations,
        managerApproved: workflow.expenseReport.approvalHistory?.some((a: any) => a.approverRole === 'manager' && a.action === 'approved'),
        financeApproved: workflow.expenseReport.approvalHistory?.some((a: any) => a.approverRole === 'finance' && a.action === 'approved'),
        adminApproved: workflow.expenseReport.approvalHistory?.some((a: any) => a.approverRole === 'admin' && a.action === 'approved'),
        paymentProcessed: workflow.status === 'paid'
      },
      expenseReport: workflow.expenseReport,
      policyViolations: workflow.policyViolations,
      paymentDetails: workflow.paymentDetails,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt
    });
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};

export const listExpenseReportsHandler = async (c: any) => {
  try {
    const { status, employeeId } = c.req.query();
    
    let workflows = Array.from(expenseWorkflows.values());
    
    if (status) {
      workflows = workflows.filter(w => w.status === status);
    }
    
    if (employeeId) {
      workflows = workflows.filter(w => w.expenseReport.employeeId === employeeId);
    }
    
    const reports = workflows.map(w => ({
      reportId: w.reportId,
      workflowId: w.id,
      title: w.expenseReport.title,
      employeeName: w.expenseReport.employeeInfo.name,
      department: w.expenseReport.employeeInfo.department,
      totalAmount: w.expenseReport.totalAmount,
      status: w.status,
      submissionDate: w.expenseReport.submissionDate,
      updatedAt: w.updatedAt
    }));
    
    return c.json({
      success: true,
      reports,
      total: reports.length
    });
  } catch (err) {
    return c.json({ error: safeErrorMessage(err) }, 500);
  }
};