import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import {
  useRequestsByUsersWithoutPermission,
  useTakeActionOnRequest,
} from 'hooks/useRequests';
import { Check, FileText, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Request } from 'services/requests';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import { formatDate } from 'utils/dateUtils';
import * as yup from 'yup';

interface ApprovalsSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ApprovalsSidebar: React.FC<ApprovalsSidebarProps> = ({
  open,
  setOpen,
}) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const { data: requestsResponse, isLoading } =
    useRequestsByUsersWithoutPermission(
      {
        page: 1,
        limit: 10,
        status: 'P',
      },
      {
        enabled: open,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      }
    );

  const requests: Request[] = requestsResponse?.data || [];

  const takeActionMutation = useTakeActionOnRequest();

  const formik = useFormik({
    initialValues: {
      remarks: '',
    },
    validationSchema: yup.object({
      remarks: yup
        .string()
        .required(
          `${dialogType === 'approve' ? 'Approval' : 'Rejection'} remarks are required`
        )
        .trim()
        .min(
          1,
          `${dialogType === 'approve' ? 'Approval' : 'Rejection'} remarks are required`
        ),
    }),
    enableReinitialize: true,
    onSubmit: async values => {
      if (!selectedRequest || !selectedRequest.approvals?.[0]) return;

      try {
        await takeActionMutation.mutateAsync({
          request_id: selectedRequest.id,
          approval_id: selectedRequest.approvals[0].id,
          action: dialogType === 'approve' ? 'A' : 'R',
          remarks: values.remarks.trim(),
        });
        formik.resetForm();
        setDialogOpen(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error taking action on request:', error);
      }
    },
  });

  const handleApproveClick = (request: Request) => {
    setSelectedRequest(request);
    setDialogType('approve');
    setDialogOpen(true);
  };

  const handleRejectClick = (request: Request) => {
    setSelectedRequest(request);
    setDialogType('reject');
    setDialogOpen(true);
  };

  const handleDialogCancel = () => {
    formik.resetForm();
    setDialogOpen(false);
    setSelectedRequest(null);
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

  const formatRequestType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
  };

  const getReferenceNumber = (request: Request): string => {
    if (request.reference_id) {
      return `#${request.reference_id}`;
    }
    if (request.request_data) {
      try {
        const data = JSON.parse(request.request_data);
        return (
          data.order_number || data.reference_number || `REQ-${request.id}`
        );
      } catch {
        return `REQ-${request.id}`;
      }
    }
    return `REQ-${request.id}`;
  };

  return (
    <>
      <CustomDrawer
        open={open}
        setOpen={setOpen}
        title="Recent Requests"
        size="small"
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
          ) : requests.length === 0 ? (
            <div className="!text-center !py-12">
              <FileText className="!w-16 !h-16 !text-gray-400 !mx-auto !mb-4" />
              <Typography variant="body1" className="!text-gray-600 !mb-2">
                No Pending Approvals
              </Typography>
              <Typography variant="body2" className="!text-gray-500">
                All requests have been processed
              </Typography>
            </div>
          ) : (
            <div className="!space-y-2">
              {requests.map(request => {
                const requesterName =
                  request.requester?.name || `User #${request.requester_id}`;
                const requestTypeLabel = formatRequestType(
                  request.request_type
                );
                const referenceNumber = getReferenceNumber(request);
                const approvalStatus =
                  request.approvals?.[0]?.status || request.status;

                return (
                  <div
                    key={request.id}
                    className="!bg-white !rounded-lg !border !border-gray-200 !p-3 !hover:!shadow-md !transition-shadow"
                  >
                    <div className="!flex !items-center !justify-between !mb-2">
                      <div className="!flex !items-center !gap-2 !flex-1 !min-w-0">
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {referenceNumber}
                        </Typography>
                        <Chip
                          label={requestTypeLabel}
                          size="small"
                          className="!capitalize !text-xs !h-5"
                        />
                      </div>
                    </div>

                    <Typography
                      variant="caption"
                      className="!text-gray-600 !text-xs !leading-tight !block !mb-3"
                    >
                      <span className="!font-medium">{requesterName}</span> has
                      requested{' '}
                      <span className="!font-medium">
                        {requestTypeLabel} Approval
                      </span>
                    </Typography>

                    <div className="!flex !items-center !justify-between !gap-2">
                      <div className="!flex !items-center !gap-2 !flex-wrap">
                        <Chip
                          label={getStatusLabel(approvalStatus)}
                          color={getStatusColor(approvalStatus) as any}
                          size="small"
                          className="!capitalize !text-xs !h-5"
                        />
                        {request.createdate && (
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs"
                          >
                            {formatDate(
                              request.createdate instanceof Date
                                ? request.createdate.toISOString()
                                : String(request.createdate)
                            )}
                          </Typography>
                        )}
                      </div>
                      <div className="!flex !gap-2 !shrink-0">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check className="!w-4 !h-4" />}
                          onClick={() => handleApproveClick(request)}
                          disabled={
                            approvalStatus?.toUpperCase() !== 'P' &&
                            approvalStatus?.toUpperCase() !== 'PENDING'
                          }
                          className="!text-xs !h-8 !px-3"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<X className="!w-4 !h-4" />}
                          onClick={() => handleRejectClick(request)}
                          disabled={
                            approvalStatus?.toUpperCase() !== 'P' &&
                            approvalStatus?.toUpperCase() !== 'PENDING'
                          }
                          className="!text-xs !h-8 !px-3"
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
          <div className="!mt-4 !pt-4 !border-t !border-gray-200 !flex !justify-end">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setOpen(false);
                navigate('/workflows/approvals');
              }}
            >
              View All
            </Button>
          </div>
        </div>
      </CustomDrawer>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogCancel}
        maxWidth="sm"
        fullWidth
        className="!rounded-lg"
      >
        <DialogTitle className="!flex !items-center !gap-3 !pb-4 !border-b !border-gray-200 !relative">
          <div
            className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !shrink-0 ${
              dialogType === 'approve' ? '!bg-green-100' : '!bg-red-100'
            }`}
          >
            {dialogType === 'approve' ? (
              <Check className="!w-6 !h-6 !text-green-600" />
            ) : (
              <X className="!w-6 !h-6 !text-red-600" />
            )}
          </div>
          <div className="!flex-1">
            <Typography variant="h6" className="!font-semibold !text-gray-900">
              {dialogType === 'approve'
                ? 'Approve Request?'
                : 'Reject Request?'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !mt-1">
              {dialogType === 'approve' ? (
                <>
                  Are you sure you want to approve this{' '}
                  {selectedRequest?.request_type
                    ?.replaceAll('_', ' ')
                    .toLowerCase() || 'request'}{' '}
                  from{' '}
                  <span className="!font-semibold !text-gray-900">
                    {selectedRequest?.requester?.name || 'User'}
                  </span>
                  ?
                </>
              ) : (
                <>
                  Are you sure you want to reject this{' '}
                  {selectedRequest?.request_type?.toLowerCase() || 'request'}{' '}
                  from{' '}
                  <span className="!font-semibold !text-gray-900">
                    {selectedRequest?.requester?.name || 'User'}
                  </span>
                  ?
                </>
              )}
            </Typography>
          </div>
          <IconButton
            onClick={handleDialogCancel}
            className="!absolute !top-2 !right-2 !bg-white !rounded-full !shadow-md hover:!bg-gray-100 !border !border-gray-200"
            size="small"
          >
            <X className="!w-4 !h-4 !text-gray-600" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="!p-4">
          {selectedRequest && (
            <div className="!mb-4 !pb-4 !border-b !border-gray-200">
              <Typography
                variant="subtitle2"
                className="!font-semibold !text-gray-700 !mb-3"
              >
                Request Details
              </Typography>
              {selectedRequest.reference_details ? (
                <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    {selectedRequest.reference_details.order_number && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Order Number
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {selectedRequest.reference_details.order_number}
                        </Typography>
                      </div>
                    )}

                    {selectedRequest.reference_details.customer_name && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Customer Name
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {selectedRequest.reference_details.customer_name}
                        </Typography>
                      </div>
                    )}

                    {selectedRequest.reference_details.total_amount && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Total Amount
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-primary-600"
                        >
                          {selectedRequest.reference_details.total_amount}
                        </Typography>
                      </div>
                    )}

                    {selectedRequest.reference_id && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Reference ID
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          #{selectedRequest.reference_id}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                  <Typography
                    variant="body2"
                    className="!text-gray-600 !text-center"
                  >
                    No request details available
                  </Typography>
                </div>
              )}
            </div>
          )}

          <Input
            name="remarks"
            multiline
            rows={3}
            label={
              dialogType === 'approve'
                ? 'Approval Remarks'
                : 'Rejection Remarks'
            }
            placeholder={
              dialogType === 'approve'
                ? 'Enter approval remarks...'
                : 'Enter rejection remarks...'
            }
            formik={formik}
            required
          />
        </DialogContent>

        <DialogActions className="!px-6 !py-4 !gap-2">
          <Button variant="outlined" onClick={handleDialogCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={dialogType === 'approve' ? 'success' : 'error'}
            startIcon={
              dialogType === 'approve' ? (
                <Check className="!w-4 !h-4" />
              ) : (
                <X className="!w-4 !h-4" />
              )
            }
            onClick={() => formik.handleSubmit()}
            disabled={
              takeActionMutation.isPending ||
              !formik.isValid ||
              !formik.values.remarks.trim()
            }
          >
            {takeActionMutation.isPending
              ? dialogType === 'approve'
                ? 'Approving...'
                : 'Rejecting...'
              : dialogType === 'approve'
                ? 'Yes, Approve'
                : 'Yes, Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApprovalsSidebar;
