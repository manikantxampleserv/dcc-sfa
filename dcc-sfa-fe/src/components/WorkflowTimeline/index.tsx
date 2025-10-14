import { Divider, Modal, Typography } from '@mui/material';
import {
  useApplyWorkflowTemplate,
  useExecuteFullWorkflowFlow,
  useExecuteNextWorkflowStep,
  useRejectReturnRequest,
  useWorkflowSteps,
  useWorkflowTemplates,
} from 'hooks/useWorkflow';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import Button from 'shared/Button';
import Input from 'shared/Input';
import { formatDate } from 'utils/dateUtils';

interface WorkflowTimelineProps {
  requestId: number;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

/**
 * WorkflowTimeline component for displaying and managing workflow steps
 * @param props - Component props
 * @returns JSX element
 */
const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  requestId,
  currentStatus,
  onStatusChange,
}) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const {
    data: workflowSteps = [],
    isLoading,
    refetch,
  } = useWorkflowSteps(requestId);
  const { data: templates = [] } = useWorkflowTemplates();
  const applyTemplateMutation = useApplyWorkflowTemplate();
  const executeFullFlowMutation = useExecuteFullWorkflowFlow();
  const executeNextStepMutation = useExecuteNextWorkflowStep();
  const rejectReturnRequestMutation = useRejectReturnRequest();

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-gray-400';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    try {
      await applyTemplateMutation.mutateAsync({
        requestId,
        templateId,
      });
      setShowTemplateSelector(false);
      refetch();
    } catch (error) {
      // Do Nothing
    }
  };

  const handleExecuteFullFlow = async (
    templateId: string = 'standard_return'
  ) => {
    try {
      await executeFullFlowMutation.mutateAsync({
        requestId,
        templateId,
      });
      refetch();
      if (onStatusChange) {
        onStatusChange('completed');
      }
    } catch (error) {
      // Do Nothing
    }
  };

  const handleExecuteNextStep = async () => {
    try {
      await executeNextStepMutation.mutateAsync({
        requestId,
      });
      refetch();
    } catch (error) {
      // Do Nothing
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    try {
      await rejectReturnRequestMutation.mutateAsync({
        requestId,
        rejectionReason: rejectionReason.trim(),
      });
      setShowRejectDialog(false);
      setRejectionReason('');
      refetch();
      if (onStatusChange) {
        onStatusChange('rejected');
      }
    } catch (error) {
      // Do Nothing
    }
  };

  // Check if all workflow steps are completed
  const allStepsCompleted =
    workflowSteps.length > 0 &&
    workflowSteps.every(step => step.status === 'completed');

  // Check if there are any pending steps
  const hasPendingSteps = workflowSteps.some(
    step => step.status === 'pending' || step.status === 'in_progress'
  );

  // Check if this is the last step (only one pending step remaining)
  const isLastStep =
    workflowSteps.filter(
      step => step.status === 'pending' || step.status === 'in_progress'
    ).length === 1;

  // Check if the overall return request is in a final state
  const isReturnRequestFinal = ['completed', 'rejected', 'cancelled'].includes(
    currentStatus
  );

  // Only show action buttons if:
  // 1. There are workflow steps
  // 2. There are pending steps
  // 3. The overall return request is NOT in a final state
  const shouldShowActionButtons =
    workflowSteps.length > 0 &&
    hasPendingSteps &&
    !allStepsCompleted &&
    !isReturnRequestFinal;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Workflow Steps */}
      <div className="flex flex-col gap-2">
        {workflowSteps.length > 0 ? (
          workflowSteps.map(step => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1">
                <Typography
                  variant="subtitle2"
                  className={`font-medium ${getStepColor(step.status)}`}
                >
                  {step.step}
                </Typography>
                {step.remarks && (
                  <Typography
                    variant="body2"
                    className={`mt-1 ${
                      step.status === 'rejected'
                        ? 'text-red-600 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.remarks}
                  </Typography>
                )}
                {step.action_date && (
                  <Typography
                    variant="caption"
                    className="text-gray-500 mt-1 block"
                  >
                    {formatDate(step.action_date)}
                  </Typography>
                )}
                {step.action_by && step.action_user && (
                  <Typography variant="caption" className="text-gray-500">
                    by {step.action_user.name}
                  </Typography>
                )}
                {!step.action_by && (
                  <Typography variant="caption" className="text-gray-500">
                    by System
                  </Typography>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 flex flex-col gap-2 items-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <Typography variant="body2" className="mb-4">
              No workflow steps found
            </Typography>
            {!isReturnRequestFinal && (
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setShowTemplateSelector(true)}
              >
                Apply Workflow Template
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Template Selector */}
      {showTemplateSelector && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Typography variant="h6" className="mb-3 text-blue-900">
            Select Workflow Template
          </Typography>
          <div className="space-y-2 mb-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div>
                  <Typography variant="subtitle2" className="font-medium">
                    {template.name}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {template.description}
                  </Typography>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleApplyTemplate(template.id)}
                  disabled={applyTemplateMutation.isPending}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outlined"
            onClick={() => setShowTemplateSelector(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Workflow Actions - Only show if conditions are met */}
      {shouldShowActionButtons && (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-2 items-center">
          <Button
            variant="contained"
            className=" bg-purple-600 hover:bg-purple-700 text-white"
            startIcon={<Zap />}
            onClick={() => handleExecuteFullFlow('standard_return')}
            disabled={executeFullFlowMutation.isPending}
          >
            {executeFullFlowMutation.isPending
              ? 'Processing...'
              : 'Complete the Process'}
          </Button>

          <Button
            variant={isLastStep ? 'contained' : 'outlined'}
            className={` ${
              isLastStep
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
            }`}
            startIcon={<ArrowRight />}
            onClick={handleExecuteNextStep}
            disabled={executeNextStepMutation.isPending}
          >
            {executeNextStepMutation.isPending
              ? 'Processing...'
              : isLastStep
                ? 'Complete the Return Process'
                : 'Execute Next Step'}
          </Button>

          <Button
            variant="outlined"
            className=" border-red-300 text-red-600 hover:bg-red-50"
            startIcon={<X />}
            color="error"
            onClick={() => setShowRejectDialog(true)}
            disabled={rejectReturnRequestMutation.isPending}
          >
            {rejectReturnRequestMutation.isPending
              ? 'Rejecting...'
              : 'Reject Request'}
          </Button>
        </div>
      )}

      {/* Rejection Dialog */}
      <Modal
        open={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setRejectionReason('');
        }}
        aria-labelledby="reject-modal-title"
        aria-describedby="reject-modal-description"
      >
        <div className="!absolute !top-1/2 !left-1/2 !transform !-translate-x-1/2 !-translate-y-1/2 !w-[90%] sm:!w-[500px] !bg-white !rounded-lg !shadow-2xl !p-0">
          {/* Header */}
          <div className="!flex !items-center !justify-between !p-4 !pb-3">
            <Typography
              id="reject-modal-title"
              variant="h6"
              component="h2"
              className="!font-semibold"
            >
              Reject Return Request
            </Typography>
            <Button
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              className="!min-w-0 !p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Divider */}
          <Divider />

          {/* Body */}
          <div className="!p-4 !pb-3">
            <Input
              label="Rejection Reason"
              placeholder="Please provide a reason for rejecting this return request..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              multiline
              rows={4}
              required
              error={!rejectionReason.trim() && showRejectDialog}
              helperText={
                !rejectionReason.trim() && showRejectDialog
                  ? 'Rejection reason is required'
                  : ''
              }
              className="!w-full"
            />
          </div>

          {/* Divider */}
          <Divider />

          {/* Footer */}
          <div className="!flex !gap-2 !justify-end !p-4 !pt-3">
            <Button
              variant="outlined"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              disabled={rejectReturnRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRejectRequest}
              className="!w-24"
              disabled={
                !rejectionReason.trim() || rejectReturnRequestMutation.isPending
              }
            >
              {rejectReturnRequestMutation.isPending
                ? 'Rejecting...'
                : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkflowTimeline;
