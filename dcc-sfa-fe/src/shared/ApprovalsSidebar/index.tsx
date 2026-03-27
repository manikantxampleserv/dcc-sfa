import {
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
import { Check, FileText, Info, MapPin, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Request } from 'services/requests';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import { formatDateTime } from 'utils/dateUtils';
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
      { page: 1, limit: 10, status: 'P' },
      { enabled: open }
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
    setTimeout(() => {
      setSelectedRequest(null);
    }, 200);
  };

  const getParsedRequestData = () => {
    if (!selectedRequest?.request_data) return null;
    try {
      return JSON.parse(selectedRequest.request_data);
    } catch (e) {
      console.error('Error parsing request data:', e);
      return null;
    }
  };

  const requestData = getParsedRequestData();

  const formatRequestType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0) + txt.substr(1).toLowerCase());
  };

  const getReferenceNumber = (request: Request): string => {
    if (request.reference_details) {
      if (
        request.request_type === 'ORDER_APPROVAL' &&
        request.reference_details.order_number
      ) {
        return request.reference_details.order_number;
      }

      if (
        request.request_type === 'ASSET_MOVEMENT_APPROVAL' &&
        request.reference_details.movement_number
      ) {
        return request.reference_details.movement_number;
      }

      if (
        request.request_type === 'LOCATION_RESET' &&
        request.reference_details.customer_code
      ) {
        return request.reference_details.customer_code;
      }
    }

    if (request.request_data) {
      try {
        const data = JSON.parse(request.request_data);
        if (request.request_type === 'CUSTOMER_CREATION') {
          return (
            data.customer_data?.code ||
            request.reference_details?.customer_code ||
            `NEW-CUST-${request.id}`
          );
        }
        if (request.request_type === 'LOCATION_RESET') {
          return (
            data.customer_code ||
            request.reference_details?.customer_code ||
            `LOC-${request.reference_id || request.id}`
          );
        }
      } catch (e) {
        console.error('Error parsing request data:', e);
      }
    }

    return request.reference_id
      ? `#${request.reference_id}`
      : `REQ-${request.id}`;
  };

  return (
    <>
      <CustomDrawer
        open={open}
        setOpen={setOpen}
        title="Recent Requests"
        size="small"
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
                      <div className="!flex justify-between !items-center !gap-2 !flex-1 !min-w-0">
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {referenceNumber}
                        </Typography>
                      </div>
                    </div>

                    <Typography
                      variant="caption"
                      className="!text-gray-600 !text-xs !block !mb-3"
                    >
                      <span className="!font-medium !text-gray-800">
                        {requesterName}
                      </span>{' '}
                      has requested{' '}
                      <span className="!font-medium !text-gray-800">
                        {requestTypeLabel}
                      </span>
                      {request.request_type === 'ORDER_APPROVAL' && (
                        <>
                          {' '}
                          for order{' '}
                          <span className="!font-semibold !text-blue-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                      {request.request_type === 'ASSET_MOVEMENT_APPROVAL' && (
                        <>
                          {' '}
                          for asset movement{' '}
                          <span className="!font-semibold !text-green-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                      {request.request_type === 'CUSTOMER_CREATION' && (
                        <>
                          {' '}
                          for new customer{' '}
                          <span className="!font-semibold !text-purple-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                      {request.request_type === 'LOCATION_RESET' && (
                        <>
                          {' '}
                          for customer relocation{' '}
                          <span className="!font-semibold !text-orange-600">
                            {referenceNumber}
                          </span>
                        </>
                      )}
                    </Typography>

                    <div className="!flex !items-center !justify-between !gap-2">
                      <div className="!flex !items-center !gap-2 !flex-wrap">
                        {request.createdate && (
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs"
                          >
                            {formatDateTime(
                              request.createdate instanceof Date
                                ? request.createdate.toISOString()
                                : String(request.createdate)
                            )}
                          </Typography>
                        )}
                      </div>
                      <div className="!flex !gap-2 items-center !shrink-0">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check className="!w-3 !h-3" />}
                          onClick={() => handleApproveClick(request)}
                          disabled={
                            approvalStatus?.toUpperCase() !== 'P' &&
                            approvalStatus?.toUpperCase() !== 'PENDING'
                          }
                          className="!text-[11px] !py-1"
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
                          className="!text-[11px] !py-1"
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
        <DialogTitle className="!flex !px-4 !items-center !gap-3 !pb-4 !border-b !border-gray-200 !relative">
          <div
            className={`!w-12 !h-12 !rounded !flex !items-center !justify-center !shrink-0 ${
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
            <Typography
              variant="body1"
              className="!font-semibold !text-gray-900"
            >
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
            className="!absolute !top-2 !right-2 !bg-white !rounded hover:!bg-gray-100 !border !border-gray-200"
            size="small"
          >
            <X className="!w-4 !h-4 !text-gray-600" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="!p-4">
          {selectedRequest && (
            <div className="!mb-4 !pb-4 !border-b !border-gray-200">
              {selectedRequest.reference_details ? (
                <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                  {selectedRequest.request_type === 'ORDER_APPROVAL' && (
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

                      {selectedRequest.reference_details.customer_code && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Customer Code
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.customer_code}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.salesperson_name && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Salesperson
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.salesperson_name}
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

                      {selectedRequest.reference_details.order_date && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Order Date
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.order_date}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.payment_method && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Payment Method
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.payment_method}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.status && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Order Status
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.status}
                          </Typography>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRequest.request_type ===
                    'ASSET_MOVEMENT_APPROVAL' && (
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                      {selectedRequest.reference_details.movement_number && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Movement Number
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.movement_number}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.movement_type && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Movement Type
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !capitalize !text-gray-900"
                          >
                            {selectedRequest.reference_details.movement_type}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.from_location && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            From Location
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.from_location}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.to_location && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            To Location
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.to_location}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.performed_by && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Performed By
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.performed_by}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.movement_date && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Movement Date
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.movement_date}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.assets && (
                        <div className="!space-y-1 md:!col-span-2">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Assets
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.assets}
                          </Typography>
                        </div>
                      )}

                      {selectedRequest.reference_details.notes && (
                        <div className="!space-y-1 md:!col-span-2">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Notes
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.notes}
                          </Typography>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRequest.request_type === 'LOCATION_RESET' && (
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-2">
                      {selectedRequest.reference_details.customer_name && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                          >
                            Customer
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.customer_name}
                          </Typography>
                        </div>
                      )}
                      {selectedRequest.reference_details.customer_code && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                          >
                            Customer Code
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {selectedRequest.reference_details.customer_code}
                          </Typography>
                        </div>
                      )}

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          New Coordinates
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {selectedRequest.reference_details.new_latitude ||
                            requestData?.latitude ||
                            'N/A'}
                          ,{' '}
                          {selectedRequest.reference_details.new_longitude ||
                            requestData?.longitude ||
                            'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Old Coordinates
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-600"
                        >
                          {requestData?.old_latitude || 'N/A'},{' '}
                          {requestData?.old_longitude || 'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Relocation Reason
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800 !italic"
                        >
                          "{requestData?.reason || 'No reason provided'}"
                        </Typography>
                      </div>
                    </div>
                  )}

                  {selectedRequest.request_type === 'CUSTOMER_CREATION' && (
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Customer Name
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {selectedRequest.reference_details.customer_name ||
                            requestData?.customer_data?.name ||
                            'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Customer Code
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {selectedRequest.reference_details.customer_code ||
                            requestData?.customer_data?.code ||
                            'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Email Address
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800"
                        >
                          {selectedRequest.reference_details.email ||
                            requestData?.customer_data?.email ||
                            'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Phone Number
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800"
                        >
                          {selectedRequest.reference_details.phone_number ||
                            requestData?.customer_data?.phone_number ||
                            'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Location
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800"
                        >
                          {selectedRequest.reference_details.city ||
                            requestData?.customer_data?.city ||
                            'N/A'}
                          ,{' '}
                          {selectedRequest.reference_details.state ||
                            requestData?.customer_data?.state ||
                            'N/A'}
                        </Typography>
                      </div>

                      {(selectedRequest.reference_details.profile_picture ||
                        requestData?.customer_data?.profile_picture) && (
                        <div className="!space-y-1 md:!col-span-2">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                          >
                            Profile Picture
                          </Typography>
                          <div className="!mt-1">
                            <img
                              src={(
                                selectedRequest.reference_details
                                  .profile_picture ||
                                requestData?.customer_data?.profile_picture
                              ).trim()}
                              alt="Profile"
                              className="!w-24 !h-24 !rounded-lg !object-cover !border !border-gray-200 shadow-sm"
                              onError={e => {
                                (e.target as HTMLImageElement).src =
                                  'https://via.placeholder.com/100?text=No+Image';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                  {selectedRequest.request_type === 'LOCATION_RESET' &&
                  requestData ? (
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                      <div className="md:!col-span-2 !flex !items-center !gap-2 !mb-2">
                        <MapPin className="!w-4 !h-4 !text-orange-500" />
                        <Typography
                          variant="subtitle2"
                          className="!font-bold !text-gray-800"
                        >
                          GPS Relocation Details
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          New Coordinates
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {requestData.latitude}, {requestData.longitude}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Old Coordinates
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-600"
                        >
                          {requestData.old_latitude || 'N/A'},{' '}
                          {requestData.old_longitude || 'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Relocation Reason
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800 !italic"
                        >
                          "{requestData.reason || 'No reason provided'}"
                        </Typography>
                      </div>
                    </div>
                  ) : selectedRequest.request_type === 'CUSTOMER_CREATION' &&
                    requestData ? (
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                      <div className="!space-y-1 md:!col-span-2 !flex !items-center !gap-2 !mb-2">
                        <UserPlus className="!w-4 !h-4 !text-purple-500" />
                        <Typography
                          variant="subtitle2"
                          className="!font-bold !text-gray-800"
                        >
                          New Customer Information
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Customer Name
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {requestData.customer_data?.name || 'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Customer Code
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {requestData.customer_data?.code || 'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Email Address
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800"
                        >
                          {requestData.customer_data?.email || 'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Phone Number
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800"
                        >
                          {requestData.customer_data?.phone_number || 'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Location
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800"
                        >
                          {requestData.customer_data?.city || 'N/A'},{' '}
                          {requestData.customer_data?.state || 'N/A'}
                        </Typography>
                      </div>

                      {requestData.customer_data?.profile_picture && (
                        <div className="!space-y-1 md:!col-span-2">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                          >
                            Profile Picture
                          </Typography>
                          <div className="!mt-1">
                            <img
                              src={requestData.customer_data.profile_picture.trim()}
                              alt="Profile"
                              className="!w-24 !h-24 !rounded-lg !object-cover !border !border-gray-200 shadow-sm"
                              onError={e => {
                                (e.target as HTMLImageElement).src =
                                  'https://via.placeholder.com/100?text=No+Image';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="!flex !flex-col !items-center !justify-center !py-4 !text-gray-500">
                      <Info className="!w-8 !h-8 !mb-2 !opacity-20" />
                      <Typography variant="body2">
                        No additional request details available
                      </Typography>
                    </div>
                  )}
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

        <DialogActions className="!p-4">
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
