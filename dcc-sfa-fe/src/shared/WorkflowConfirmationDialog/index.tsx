import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  useApproveWorkflowStep,
  useRejectWorkflowStep,
} from 'hooks/useApprovalWorkflows';
import { useOrder } from 'hooks/useOrders';
import { Check, X } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { ApprovalWorkflow } from 'services/approvalWorkflows';
import Button from 'shared/Button';
import Input from 'shared/Input';
import { formatDate } from 'utils/dateUtils';

interface WorkflowConfirmationDialogProps {
  open: boolean;
  type: 'approve' | 'reject';
  workflowDetail: ApprovalWorkflow | null;
  isLoadingDetail?: boolean;
  onSuccess?: () => void;
  onCancel: () => void;
}

const WorkflowConfirmationDialog: React.FC<WorkflowConfirmationDialogProps> = ({
  open,
  type,
  workflowDetail,
  isLoadingDetail = false,
  onSuccess,
  onCancel,
}) => {
  const isApprove = type === 'approve';
  const Icon = isApprove ? Check : X;

  const approveMutation = useApproveWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  const isSubmitting = isApprove
    ? approveMutation.isPending
    : rejectMutation.isPending;

  const validationSchema = useMemo(
    () =>
      yup.object({
        remark: yup
          .string()
          .required(
            `${isApprove ? 'Approval' : 'Rejection'} remarks are required`
          )
          .trim()
          .min(
            1,
            `${isApprove ? 'Approval' : 'Rejection'} remarks are required`
          ),
      }),
    [isApprove]
  );

  const formik = useFormik({
    initialValues: {
      remark: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      if (!workflowDetail) return;

      try {
        if (isApprove) {
          await approveMutation.mutateAsync({
            id: workflowDetail.id,
            comments: values.remark.trim() || undefined,
          });
        } else {
          await rejectMutation.mutateAsync({
            id: workflowDetail.id,
            rejectionReason: values.remark.trim(),
          });
        }
        formik.resetForm();
        onSuccess?.();
      } catch (error) {
        console.error('Error submitting workflow:', error);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const orderId =
    workflowDetail?.request_data?.order_id ||
    workflowDetail?.request_data?.orderId;
  const { data: orderData, isLoading: isLoadingOrder } = useOrder(orderId || 0);
  const order = orderId ? orderData?.data : null;

  const handleCancel = () => {
    formik.resetForm();
    onCancel();
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

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      className="!rounded-lg"
    >
      {/* Header */}
      <DialogTitle className="!flex !items-center !gap-3 !pb-4 !border-b !border-gray-200">
        <div
          className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !shrink-0 ${
            isApprove ? '!bg-green-100' : '!bg-red-100'
          }`}
        >
          <Icon
            className={`!w-6 !h-6 ${
              isApprove ? '!text-green-600' : '!text-red-600'
            }`}
          />
        </div>
        <div className="!flex-1">
          <Typography variant="h6" className="!font-semibold !text-gray-900">
            {isApprove ? 'Approve Request?' : 'Reject Request?'}
          </Typography>
          <Typography variant="body2" className="!text-gray-600 !mt-1">
            {isApprove ? (
              <>
                Are you sure you want to approve this{' '}
                {workflowDetail?.workflow_type?.toLowerCase() || 'workflow'}{' '}
                approval request from{' '}
                <span className="!font-semibold !text-gray-900">
                  {workflowDetail?.requested_by_user?.name || 'User'}
                </span>
                ?
              </>
            ) : (
              <>
                Are you sure you want to reject this{' '}
                {workflowDetail?.workflow_type?.toLowerCase() || 'workflow'}{' '}
                approval request from{' '}
                <span className="!font-semibold !text-gray-900">
                  {workflowDetail?.requested_by_user?.name || 'User'}
                </span>
                ?
              </>
            )}
          </Typography>
        </div>
      </DialogTitle>

      {/* Body */}
      <DialogContent className="!p-4">
        {isLoadingDetail || isLoadingOrder ? (
          <div className="!space-y-3">
            <Skeleton variant="rectangular" width="100%" height={80} />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </div>
        ) : (
          <>
            {workflowDetail?.request_data && (
              <>
                {workflowDetail.reference_type === 'order' && (
                  <>
                    <Box className="!bg-gray-50 !rounded-lg !mb-4">
                      <Typography
                        variant="subtitle2"
                        className="!font-semibold !text-gray-900 !mb-3"
                      >
                        Order Summary
                      </Typography>
                      <div className="!grid !grid-cols-2 !gap-4">
                        {workflowDetail.request_data.total_amount !==
                          undefined && (
                          <div className="!space-y-1">
                            <Typography
                              variant="caption"
                              className="!text-gray-500 !text-xs !uppercase !block"
                            >
                              Total Amount
                            </Typography>
                            <Typography
                              variant="body1"
                              className="!font-bold !text-gray-900 !text-lg"
                            >
                              {formatCurrency(
                                workflowDetail.request_data.total_amount
                              )}
                            </Typography>
                          </div>
                        )}
                        {workflowDetail.request_data.customer_id && (
                          <div className="!space-y-1">
                            <Typography
                              variant="caption"
                              className="!text-gray-500 !text-xs !uppercase !block"
                            >
                              Customer
                            </Typography>
                            <Typography
                              variant="body2"
                              className="!font-medium !text-gray-900"
                            >
                              {order?.customer?.name ||
                                workflowDetail.request_data.customer_name ||
                                `Customer #${workflowDetail.request_data.customer_id}`}
                            </Typography>
                          </div>
                        )}
                        {workflowDetail.request_data.salesperson_id && (
                          <div className="!space-y-1">
                            <Typography
                              variant="caption"
                              className="!text-gray-500 !text-xs !uppercase !block"
                            >
                              Sales Person
                            </Typography>
                            <Typography
                              variant="body2"
                              className="!font-medium !text-gray-900"
                            >
                              {order?.salesperson?.name ||
                                workflowDetail.request_data.salesperson_name ||
                                `Salesperson #${workflowDetail.request_data.salesperson_id}`}
                            </Typography>
                          </div>
                        )}
                        {workflowDetail.request_data.order_number && (
                          <div className="!space-y-1">
                            <Typography
                              variant="caption"
                              className="!text-gray-500 !text-xs !uppercase !block"
                            >
                              Order Number
                            </Typography>
                            <Typography
                              variant="body2"
                              className="!font-medium !text-gray-900"
                            >
                              {workflowDetail.request_data.order_number}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </Box>
                    <Divider className="!my-4" />
                  </>
                )}

                <Box className="!mb-4">
                  <Typography
                    variant="subtitle2"
                    className="!font-semibold !capitalize !text-gray-900 !mb-3"
                  >
                    {workflowDetail.workflow_type + "'s" || 'Workflow'} Details
                  </Typography>
                  <div className="!grid !grid-cols-2 !gap-4">
                    {workflowDetail?.request_date && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !block"
                        >
                          <span className="!flex !items-center !gap-1">
                            Request Date
                          </span>
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-900"
                        >
                          {formatDate(workflowDetail.request_date)}
                        </Typography>
                      </div>
                    )}
                    {workflowDetail?.priority && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !block"
                        >
                          Priority
                        </Typography>
                        <div>
                          <Chip
                            label={workflowDetail.priority}
                            color={
                              getPriorityColor(workflowDetail.priority) as any
                            }
                            size="small"
                            className="!capitalize"
                          />
                        </div>
                      </div>
                    )}
                    {workflowDetail?.current_step &&
                      workflowDetail?.total_steps && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !block"
                          >
                            Progress
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-medium !text-gray-900"
                          >
                            Step {workflowDetail.current_step} of{' '}
                            {workflowDetail.total_steps}
                          </Typography>
                        </div>
                      )}
                    <div className="!space-y-1">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !block"
                      >
                        Status
                      </Typography>
                      <div>
                        <Chip
                          label={getStatusLabel(workflowDetail?.status ?? null)}
                          color={
                            getStatusColor(
                              workflowDetail?.status ?? null
                            ) as any
                          }
                          size="small"
                          className="!capitalize"
                        />
                      </div>
                    </div>
                  </div>
                </Box>

                <Divider className="!my-4" />
              </>
            )}

            <Input
              name="remark"
              multiline
              rows={3}
              label={isApprove ? 'Approval Remarks' : 'Rejection Remarks'}
              placeholder={
                isApprove
                  ? 'Enter approval remarks...'
                  : 'Enter rejection remarks...'
              }
              formik={formik}
              required
            />
          </>
        )}
      </DialogContent>

      {/* Footer */}
      <Divider />
      <DialogActions className="!px-6 !py-4 !gap-2">
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={isApprove ? 'success' : 'error'}
          startIcon={<Icon className="!w-4 !h-4" />}
          onClick={() => formik.handleSubmit()}
          disabled={
            isSubmitting ||
            isLoadingDetail ||
            isLoadingOrder ||
            !formik.isValid ||
            !formik.values.remark.trim()
          }
        >
          {isSubmitting
            ? isApprove
              ? 'Approving...'
              : 'Rejecting...'
            : isApprove
              ? 'Yes, Approve'
              : 'Yes, Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowConfirmationDialog;
