import { Request, Response } from 'express';
import { ReturnWorkflowService } from '../services/returnWorkflow.service';
import prisma from '../../configs/prisma.client';

export const workflowController = {
  /**
   * Get all workflow steps for a return request
   * @param req - Express request object
   * @param res - Express response object
   */
  async getWorkflowSteps(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const steps = await ReturnWorkflowService.getWorkflowSteps(
        Number(requestId)
      );

      res.json({
        message: 'Workflow steps retrieved successfully',
        data: steps,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Execute workflow action (approve, reject, process, complete)
   * @param req - Express request object containing action, remarks, actionBy in body
   * @param res - Express response object
   */
  async executeWorkflowAction(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { action, remarks, actionBy } = req.body;
      const userId = req.user?.id || 1;

      // Get current return request
      const returnRequest = await prisma.return_requests.findUnique({
        where: { id: Number(requestId) },
        include: {
          return_requests_users: true,
        },
      });

      if (!returnRequest) {
        return res.status(404).json({ message: 'Return request not found' });
      }

      // Check if return request is in a final state
      const finalStates = ['completed', 'rejected', 'cancelled'];
      if (returnRequest.status && finalStates.includes(returnRequest.status)) {
        return res.status(400).json({
          message: `Cannot perform workflow actions on ${returnRequest.status} return request`,
        });
      }

      let newStatus = returnRequest.status;
      let stepName = '';
      let stepStatus = 'completed';

      // Determine action and update status
      switch (action) {
        case 'approve':
          newStatus = 'approved';
          stepName = 'Approval Decision';
          break;
        case 'reject':
          newStatus = 'rejected';
          stepName = 'Approval Decision';
          break;
        case 'start_processing':
          newStatus = 'processing';
          stepName = 'Processing';
          stepStatus = 'in_progress';
          break;
        case 'complete':
          newStatus = 'completed';
          stepName = 'Completion';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          stepName = 'Cancellation';
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      // Update return request status
      const updatedRequest = await prisma.return_requests.update({
        where: { id: Number(requestId) },
        data: {
          status: newStatus,
          approved_by:
            action === 'approve'
              ? actionBy || userId
              : returnRequest.approved_by,
          approved_date:
            action === 'approve' ? new Date() : returnRequest.approved_date,
          resolution_notes: remarks || returnRequest.resolution_notes,
          updatedate: new Date(),
          updatedby: userId,
        },
        include: {
          return_requests_users: true,
          return_requests_customers: true,
          return_requests_products: true,
          return_requests_serial_numbers: true,
        },
      });

      // Update or create workflow step
      const existingStep = await ReturnWorkflowService.getWorkflowStepByStep(
        Number(requestId),
        stepName
      );

      if (existingStep) {
        await ReturnWorkflowService.updateWorkflowStep(
          existingStep.id,
          stepStatus,
          remarks,
          actionBy || userId
        );
      } else {
        await ReturnWorkflowService.addWorkflowStep(
          Number(requestId),
          stepName,
          stepStatus,
          remarks,
          actionBy || userId,
          userId
        );
      }

      // Get updated workflow steps
      const workflowSteps = await ReturnWorkflowService.getWorkflowSteps(
        Number(requestId)
      );

      res.json({
        message: `Return request ${action}d successfully`,
        data: {
          returnRequest: updatedRequest,
          workflowSteps,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get workflow templates
   * @param req - Express request object
   * @param res - Express response object
   */
  async getWorkflowTemplates(req: Request, res: Response) {
    try {
      const templates = [
        {
          id: 'standard_return',
          name: 'Standard Return Process',
          description: 'Standard workflow for product returns',
          steps: [
            { step: 'Request Submitted', status: 'completed', order: 1 },
            { step: 'Initial Review', status: 'in_progress', order: 2 },
            { step: 'Approval Decision', status: 'pending', order: 3 },
            { step: 'Processing', status: 'pending', order: 4 },
            { step: 'Completion', status: 'pending', order: 5 },
          ],
        },
        {
          id: 'urgent_return',
          name: 'Urgent Return Process',
          description: 'Expedited workflow for urgent returns',
          steps: [
            { step: 'Request Submitted', status: 'completed', order: 1 },
            { step: 'Priority Review', status: 'in_progress', order: 2 },
            { step: 'Fast Approval', status: 'pending', order: 3 },
            { step: 'Express Processing', status: 'pending', order: 4 },
            { step: 'Completion', status: 'pending', order: 5 },
          ],
        },
        {
          id: 'warranty_return',
          name: 'Warranty Return Process',
          description: 'Workflow for warranty-related returns',
          steps: [
            { step: 'Request Submitted', status: 'completed', order: 1 },
            { step: 'Warranty Verification', status: 'in_progress', order: 2 },
            { step: 'Technical Review', status: 'pending', order: 3 },
            { step: 'Approval Decision', status: 'pending', order: 4 },
            { step: 'Replacement/Refund', status: 'pending', order: 5 },
          ],
        },
      ];

      res.json({
        message: 'Workflow templates retrieved successfully',
        data: templates,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Apply workflow template to a return request
   * @param req - Express request object containing templateId in body
   * @param res - Express response object
   */
  async applyWorkflowTemplate(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { templateId } = req.body;
      const userId = req.user?.id || 1;

      // Get template
      const templates = [
        {
          id: 'standard_return',
          steps: [
            'Request Submitted',
            'Initial Review',
            'Approval Decision',
            'Processing',
            'Completion',
          ],
        },
        {
          id: 'urgent_return',
          steps: [
            'Request Submitted',
            'Priority Review',
            'Fast Approval',
            'Express Processing',
            'Completion',
          ],
        },
        {
          id: 'warranty_return',
          steps: [
            'Request Submitted',
            'Warranty Verification',
            'Technical Review',
            'Approval Decision',
            'Replacement/Refund',
          ],
        },
      ];

      const template = templates.find(t => t.id === templateId);
      if (!template) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }

      // Check if return request exists and is not in final state
      const returnRequest = await prisma.return_requests.findUnique({
        where: { id: Number(requestId) },
      });

      if (!returnRequest) {
        return res.status(404).json({ message: 'Return request not found' });
      }

      const finalStates = ['completed', 'rejected', 'cancelled'];
      if (returnRequest.status && finalStates.includes(returnRequest.status)) {
        return res.status(400).json({
          message: `Cannot apply workflow template to ${returnRequest.status} return request`,
        });
      }

      // Clear existing workflow steps
      await prisma.return_workflow.deleteMany({
        where: {
          request_id: Number(requestId),
          request_type: 'return_request',
        },
      });

      // Create new workflow steps from template
      const workflowSteps = [];
      for (let i = 0; i < template.steps.length; i++) {
        const step = template.steps[i];
        const status =
          i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'pending';

        const newStep = await ReturnWorkflowService.addWorkflowStep(
          Number(requestId),
          step,
          status,
          i === 0 ? 'Return request submitted by customer' : '',
          i === 0 ? userId : 1,
          userId
        );

        workflowSteps.push(newStep);
      }

      res.json({
        message: 'Workflow template applied successfully',
        data: workflowSteps,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Execute full workflow flow - automatically progress through all steps
   * @param req - Express request object containing templateId in body
   * @param res - Express response object
   */
  async executeFullWorkflowFlow(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { templateId } = req.body;
      const userId = req.user?.id || 1;

      // Check if return request exists and is not in final state
      const returnRequest = await prisma.return_requests.findUnique({
        where: { id: Number(requestId) },
      });

      if (!returnRequest) {
        return res.status(404).json({ message: 'Return request not found' });
      }

      const finalStates = ['completed', 'rejected', 'cancelled'];
      if (returnRequest.status && finalStates.includes(returnRequest.status)) {
        return res.status(400).json({
          message: `Cannot execute workflow flow on ${returnRequest.status} return request`,
        });
      }

      const workflowSteps = await ReturnWorkflowService.executeFullWorkflowFlow(
        Number(requestId),
        userId,
        templateId || 'standard_return'
      );

      res.json({
        message: 'Full workflow flow executed successfully',
        data: workflowSteps,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Reject return request with reason
   * @param req - Express request object
   * @param res - Express response object
   */
  async rejectReturnRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { rejectionReason } = req.body;
      const userId = req.user?.id || 1;

      if (!rejectionReason || rejectionReason.trim() === '') {
        return res.status(400).json({
          message: 'Rejection reason is required',
        });
      }

      // Check if return request exists and is not in final state
      const returnRequest = await prisma.return_requests.findUnique({
        where: { id: Number(requestId) },
      });

      if (!returnRequest) {
        return res.status(404).json({ message: 'Return request not found' });
      }

      const finalStates = ['completed', 'rejected', 'cancelled'];
      if (returnRequest.status && finalStates.includes(returnRequest.status)) {
        return res.status(400).json({
          message: `Cannot reject ${returnRequest.status} return request`,
        });
      }

      const rejectionStep = await ReturnWorkflowService.rejectReturnRequest(
        Number(requestId),
        userId,
        rejectionReason.trim()
      );

      res.json({
        message: 'Return request rejected successfully',
        data: rejectionStep,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Execute next workflow step automatically
   * @param req - Express request object
   * @param res - Express response object
   */
  async executeNextWorkflowStep(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id || 1;

      // Check if return request exists and is not in final state
      const returnRequest = await prisma.return_requests.findUnique({
        where: { id: Number(requestId) },
      });

      if (!returnRequest) {
        return res.status(404).json({ message: 'Return request not found' });
      }

      const finalStates = ['completed', 'rejected', 'cancelled'];
      if (returnRequest.status && finalStates.includes(returnRequest.status)) {
        return res.status(400).json({
          message: `Cannot execute next workflow step on ${returnRequest.status} return request`,
        });
      }

      const nextStep = await ReturnWorkflowService.executeNextWorkflowStep(
        Number(requestId),
        userId
      );

      if (!nextStep) {
        return res.json({
          message: 'All workflow steps completed',
          data: null,
        });
      }

      res.json({
        message: 'Next workflow step executed successfully',
        data: nextStep,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
