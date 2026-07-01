import { Skeleton, Typography } from '@mui/material';
import { useRequestsByUsersWithoutPermission } from 'hooks/useRequests';
import { FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Request } from 'services/requests';
import ApprovalModal from 'shared/ApprovalModal';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import { formatDateTime } from 'utils/dateUtils';

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
      { page: 1, limit: 20, status: 'P' },
      { enabled: open }
    );

  const requests: Request[] = requestsResponse?.data || [];

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

  const handleModalClose = () => {
    setDialogOpen(false);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 200);
  };

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

      if (
        request.request_type === 'RECONCILIATION_APPROVAL' &&
        request.reference_details.reconciliation_id
      ) {
        return `REC-${request.reference_details.reconciliation_id}`;
      }

      if (request.request_type === 'VAN_INVENTORY') {
        return `VAN-${request.reference_id || request.id}`;
      }
    }

    if (request.request_data) {
      try {
        const data = JSON.parse(request.request_data);
        if (request.request_type === 'VAN_INVENTORY') {
          return `VAN-${request.reference_id || request.id}`;
        }
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
        title="Approvals"
        size="small"
      >
        <div className="!flex !flex-col !h-full">
          {/* Content */}
          <div className="!flex-1 !overflow-y-auto">
            <div className="!p-2">
              {isLoading ? (
                <div className="!space-y-2">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="!bg-white !rounded-lg !border !border-gray-200 !p-3"
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
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={24}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={24}
                        />
                      </div>
                      <div className="!flex !gap-2">
                        <Skeleton
                          variant="rectangular"
                          width={100}
                          height={32}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={100}
                          height={32}
                        />
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
                      request.requester?.name ||
                      `User #${request.requester_id}`;
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
                          {request.request_type ===
                            'ASSET_MOVEMENT_APPROVAL' && (
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
                          {request.request_type ===
                            'RECONCILIATION_APPROVAL' && (
                            <>
                              {' '}
                              for reconciliation{' '}
                              <span className="!font-semibold !text-indigo-600">
                                {referenceNumber}
                              </span>
                            </>
                          )}
                          {request.request_type === 'VAN_INVENTORY' && (
                            <>
                              for van stock{' '}
                              <span className="!font-semibold !text-teal-600">
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
            </div>
          </div>

          {/* Footer */}
          <div className="!p-2 !border-t !border-gray-200">
            <Button
              variant="text"
              className="!w-full"
              onClick={() => {
                navigate('/workflows/approvals');
                setDialogOpen(false);
                setOpen(false);
              }}
            >
              View All
            </Button>
          </div>
        </div>
      </CustomDrawer>
      <ApprovalModal
        open={dialogOpen}
        type={dialogType}
        request={selectedRequest}
        onClose={handleModalClose}
      />
    </>
  );
};

export default ApprovalsSidebar;
