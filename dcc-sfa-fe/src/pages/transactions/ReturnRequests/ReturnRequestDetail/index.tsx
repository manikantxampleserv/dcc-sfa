import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import WorkflowTimeline from 'components/WorkflowTimeline';
import { useProducts } from 'hooks/useProducts';
import { useReturnRequest } from 'hooks/useReturnRequests';
import { useUsers } from 'hooks/useUsers';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  History,
  Info,
  Package,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';
import ManageReturnRequest from '../ManageReturnRequest';

const ReturnRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: returnRequestResponse,
    isLoading,
    error,
  } = useReturnRequest(Number(id));

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000,
  });

  const { data: productsResponse } = useProducts({
    page: 1,
    limit: 1000,
  });

  const returnRequest = returnRequestResponse?.data;
  const users = usersResponse?.data || [];
  const products = productsResponse?.data || [];

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleBack = () => {
    navigate('/transactions/returns');
  };

  if (isLoading) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex-2">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="!absolute !top-4 !right-4">
              <Skeleton
                variant="circular"
                width={12}
                height={12}
                className="!bg-yellow-200"
              />
            </div>

            <Skeleton
              variant="circular"
              width={96}
              height={96}
              className="!mx-auto !mb-4 !border-3 !border-white"
            />

            <Skeleton
              variant="text"
              width="70%"
              height={24}
              className="!mx-auto !mb-1"
            />
            <Skeleton
              variant="text"
              width="50%"
              height={16}
              className="!mx-auto !mb-3"
            />

            <Skeleton
              variant="rectangular"
              width="60%"
              height={24}
              className="!mx-auto !mb-4 !bg-yellow-50"
            />

            <div className="!space-y-3 !text-left">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="50%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="70%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="80%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="35%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="60%" height={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-4 !space-y-4">
          {[1, 2, 3].map(card => (
            <div
              key={card}
              className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden"
            >
              <div className="!absolute !top-0 !right-0 !w-20 !h-20 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-10 !translate-x-10"></div>
              <div className="!relative !z-10">
                <div className="!flex !items-center !gap-2 !mb-4">
                  <div className="!p-1 !bg-blue-100 !rounded-md">
                    <Skeleton
                      variant="circular"
                      width={16}
                      height={16}
                      className="!bg-blue-200"
                    />
                  </div>
                  <Skeleton variant="text" width={140} height={20} />
                </div>
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                  {[1, 2, 3, 4].map(field => (
                    <div key={field} className="!space-y-1">
                      <Skeleton
                        variant="text"
                        width={`${50 + field * 8}%`}
                        height={12}
                      />
                      <Skeleton
                        variant="text"
                        width={`${60 + field * 6}%`}
                        height={16}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !returnRequest) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load return request details
            </Typography>
          </div>
          <Typography variant="body2" className="!text-gray-200">
            Please try again or contact your system administrator if this
            problem persists.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
          className="mt-4"
        >
          Back to Return Requests
        </Button>
      </div>
    );
  }

  const InfoCard = ({
    title,
    children,
    icon: Icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ElementType;
  }) => (
    <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
      <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
      <div className="!relative !z-10">
        <div className="!flex !items-center !gap-2 !mb-4">
          {Icon && (
            <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
              <Icon className="!text-primary-500" />
            </div>
          )}
          <Typography variant="h6" className="!font-bold !text-gray-900">
            {title}
          </Typography>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  returnRequest.status === 'completed'
                    ? '!bg-green-400'
                    : returnRequest.status === 'approved'
                      ? '!bg-blue-400'
                      : returnRequest.status === 'rejected'
                        ? '!bg-red-400'
                        : '!bg-yellow-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white':
                      returnRequest.status === 'completed',
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      returnRequest.status === 'approved',
                    '!bg-gradient-to-br !from-red-400 !to-red-600 !text-white':
                      returnRequest.status === 'rejected',
                    '!bg-gradient-to-br !from-yellow-400 !to-yellow-600 !text-white':
                      returnRequest.status === 'pending',
                  }
                )}
              >
                <Package className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              Return Request #{returnRequest.id}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {returnRequest.customer?.name || 'Unknown Customer'}
            </Typography>

            <Chip
              label={getStatusLabel(returnRequest.status || '')}
              className={`${getStatusColor(returnRequest.status || '')} font-semibold`}
              size="small"
            />

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Product
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {returnRequest.product?.name || 'Unknown Product'}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Return Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {returnRequest.return_date
                    ? formatDate(returnRequest.return_date)
                    : 'Not specified'}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Created
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(returnRequest.createdate)}
                </Typography>
              </div>
            </div>
          </div>
          <InfoCard title="Request Information" icon={Info}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
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
                  {returnRequest.customer?.name || 'Unknown Customer'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {returnRequest.customer?.code}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Product
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {returnRequest.product?.name || 'Unknown Product'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {returnRequest.product?.code}
                </Typography>
              </div>

              {returnRequest.serial_number && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Serial Number
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {returnRequest.serial_number.serial_no}
                  </Typography>
                </div>
              )}

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Current Status
                </Typography>
                <div className="!mt-1">
                  <Chip
                    label={getStatusLabel(returnRequest.status || '')}
                    className={`${getStatusColor(returnRequest.status || '')} font-semibold`}
                    size="small"
                  />
                </div>
              </div>

              <div className="!space-y-0.5 md:!col-span-2">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Reason for Return
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {returnRequest.reason || 'No reason provided'}
                </Typography>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="!flex-4 !space-y-4">
          {returnRequest.approved_user && (
            <InfoCard title="Approval Information" icon={CheckCircle}>
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Approved By
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {returnRequest.approved_user.name}
                  </Typography>
                  <Typography variant="caption" className="!text-gray-500">
                    {returnRequest.approved_user.email}
                  </Typography>
                </div>

                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Approval Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {returnRequest.approved_date
                      ? formatDate(returnRequest.approved_date)
                      : 'Not approved'}
                  </Typography>
                </div>

                {returnRequest.resolution_notes && (
                  <div className="!space-y-0.5 md:!col-span-2">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Resolution Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {returnRequest.resolution_notes}
                    </Typography>
                  </div>
                )}
              </div>
            </InfoCard>
          )}

          <InfoCard title="Workflow Timeline" icon={History}>
            <WorkflowTimeline
              requestId={returnRequest.id}
              currentStatus={returnRequest.status || 'pending'}
              onStatusChange={_newStatus => {
                // Refresh the return request data when status changes
                window.location.reload();
              }}
            />
          </InfoCard>
        </div>
      </div>

      {/* Edit Drawer */}
      <ManageReturnRequest
        selectedReturnRequest={returnRequest}
        setSelectedReturnRequest={() => {}}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        users={users}
        products={products}
      />
    </>
  );
};

export default ReturnRequestDetail;
