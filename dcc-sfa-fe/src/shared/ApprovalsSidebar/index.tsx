import { Chip, Skeleton, Typography } from '@mui/material';
import {
  useApprovalWorkflow,
  useApprovalWorkflows,
} from 'hooks/useApprovalWorkflows';
import { Check, FileText, X } from 'lucide-react';
import React, { useState } from 'react';
import type { ApprovalWorkflow } from 'services/approvalWorkflows';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import WorkflowConfirmationDialog from 'shared/WorkflowConfirmationDialog';
import { formatDate } from 'utils/dateUtils';

interface ApprovalsSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ApprovalsSidebar: React.FC<ApprovalsSidebarProps> = ({
  open,
  setOpen,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<ApprovalWorkflow | null>(null);

  const { data: workflowsResponse, isLoading } = useApprovalWorkflows({
    page: 1,
    limit: 10,
  });

  const workflows: ApprovalWorkflow[] = workflowsResponse?.data || [];
  const pendingWorkflows = workflows.filter(
    w =>
      w.status?.toUpperCase() === 'P' || w.status?.toUpperCase() === 'PENDING'
  );

  const { data: workflowDetailData, isLoading: isLoadingDetail } =
    useApprovalWorkflow(selectedWorkflow?.id || 0, {
      enabled: !!selectedWorkflow?.id,
    });

  const workflowDetail = workflowDetailData || selectedWorkflow;

  const handleApproveClick = (workflow: ApprovalWorkflow) => {
    setSelectedWorkflow(workflow);
    setDialogType('approve');
    setDialogOpen(true);
  };

  const handleRejectClick = (workflow: ApprovalWorkflow) => {
    setSelectedWorkflow(workflow);
    setDialogType('reject');
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setSelectedWorkflow(null);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setSelectedWorkflow(null);
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'A':
      case 'APPROVED':
        return 'success';
      case 'R':
      case 'REJECTED':
        return 'error';
      case 'P':
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'N/A';
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'A':
      case 'APPROVED':
        return 'Approved';
      case 'R':
      case 'REJECTED':
        return 'Rejected';
      case 'P':
      case 'PENDING':
        return 'Pending';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string | null) => {
    if (!priority) return 'default';
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <CustomDrawer
      open={open}
      setOpen={setOpen}
      title="Recent Approvals"
      size="medium"
      anchor="right"
    >
      <div className="!p-2">
        {isLoading ? (
          <div className="!space-y-2">
            {[1, 2, 3].map(item => (
              <div
                key={item}
                className="!bg-white !rounded-lg !border !border-gray-200 !p-4"
              >
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  className="!mb-2"
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={16}
                  className="!mb-3"
                />
                <div className="!flex !gap-2 !mb-3">
                  <Skeleton variant="rectangular" width={80} height={24} />
                  <Skeleton variant="rectangular" width={80} height={24} />
                </div>
                <div className="!flex !gap-2">
                  <Skeleton variant="rectangular" width={100} height={32} />
                  <Skeleton variant="rectangular" width={100} height={32} />
                </div>
              </div>
            ))}
          </div>
        ) : pendingWorkflows.length === 0 ? (
          <div className="!text-center !py-12">
            <FileText className="!w-16 !h-16 !text-gray-400 !mx-auto !mb-4" />
            <Typography variant="body1" className="!text-gray-600 !mb-2">
              No Pending Approvals
            </Typography>
            <Typography variant="body2" className="!text-gray-500">
              All workflows have been processed
            </Typography>
          </div>
        ) : (
          <div className="!space-y-2">
            {pendingWorkflows.map(workflow => {
              const requesterName =
                workflow.requested_by_user?.name ||
                `User #${workflow.requested_by}`;
              const workflowTypeLabel =
                workflow.workflow_type?.charAt(0).toUpperCase() +
                  workflow.workflow_type?.slice(1).toLowerCase() || 'Workflow';

              return (
                <div
                  key={workflow.id}
                  className="!bg-white !rounded-lg !border !border-gray-200 !p-3 !hover:!shadow-md !transition-shadow"
                >
                  <div className="!flex !items-start !justify-between !mb-2">
                    <div className="!flex-1 !pr-2 !min-w-0">
                      <div className="!flex !items-center !gap-2 !mb-1">
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {workflow.reference_number}
                        </Typography>
                        <Chip
                          label={workflow.workflow_type}
                          size="small"
                          className="!capitalize !text-xs !h-5"
                        />
                      </div>
                      <Typography
                        variant="caption"
                        className="!text-gray-600 !text-xs !leading-tight"
                      >
                        <span className="!font-medium">{requesterName}</span>{' '}
                        has requested{' '}
                        <span className="!font-medium">
                          {workflowTypeLabel} Approval
                        </span>{' '}
                        for{' '}
                        <span className="!font-medium">
                          {workflow.reference_number}
                        </span>
                        .
                      </Typography>
                    </div>
                  </div>

                  <div className="!flex !items-center !gap-2 !mb-2 !flex-wrap">
                    <Chip
                      label={getStatusLabel(workflow.status)}
                      color={getStatusColor(workflow.status) as any}
                      size="small"
                      className="!capitalize !text-xs !h-5"
                    />
                    <Chip
                      label={workflow.priority || 'N/A'}
                      color={getPriorityColor(workflow.priority) as any}
                      size="small"
                      className="!capitalize !text-xs !h-5"
                    />
                    <div className="!flex !items-center !gap-1 !text-xs !text-gray-500">
                      {workflow.request_date && (
                        <>
                          <span className="!mx-1">•</span>
                          <span>{formatDate(workflow.request_date)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="!flex !items-center justify-end !gap-2 !border-t !border-gray-100 !pt-2">
                    <div className="!flex !gap-2">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Check className="!w-5 !h-5" />}
                        onClick={() => handleApproveClick(workflow)}
                        disabled={
                          workflow.status?.toUpperCase() !== 'P' &&
                          workflow.status?.toUpperCase() !== 'PENDING'
                        }
                        className="!flex-1 !text-xs !h-8 !w-26"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<X className="!w-5 !h-5" />}
                        onClick={() => handleRejectClick(workflow)}
                        disabled={
                          workflow.status?.toUpperCase() !== 'P' &&
                          workflow.status?.toUpperCase() !== 'PENDING'
                        }
                        className="!flex-1 !text-xs !h-8 !w-26"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <WorkflowConfirmationDialog
        open={dialogOpen}
        type={dialogType}
        workflowDetail={workflowDetail}
        isLoadingDetail={isLoadingDetail}
        onSuccess={handleDialogSuccess}
        onCancel={handleDialogCancel}
      />
    </CustomDrawer>
  );
};

export default ApprovalsSidebar;
