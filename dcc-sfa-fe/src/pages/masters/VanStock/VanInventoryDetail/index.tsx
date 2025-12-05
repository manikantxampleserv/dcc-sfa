import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useVanInventoryById, type VanInventory } from 'hooks/useVanInventory';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Info,
  MapPin,
  Package,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

interface VanInventoryDetailProps {
  open: boolean;
  onClose: () => void;
  vanInventory?: VanInventory | null;
}

const VanInventoryDetail: React.FC<VanInventoryDetailProps> = ({
  open,
  onClose,
  vanInventory,
}) => {
  const {
    data: vanInventoryResponse,
    isLoading,
    error,
  } = useVanInventoryById(vanInventory?.id || 0);
  const vanInventoryData = vanInventoryResponse?.data || vanInventory;

  const getStatusColor = (status: string) => {
    const colors = {
      D: 'bg-yellow-100 text-yellow-800',
      A: 'bg-green-100 text-green-800',
      C: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      D: 'Draft',
      A: 'Confirmed',
      C: 'Canceled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'D':
        return <FileText className="w-4 h-4" />;
      case 'A':
        return <CheckCircle className="w-4 h-4" />;
      case 'C':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getLoadingTypeLabel = (type: string) => {
    switch (type) {
      case 'L':
        return 'Load';
      case 'U':
        return 'Unload';
      default:
        return type;
    }
  };

  const getLoadingTypeColor = (type: string) => {
    return type === 'L'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  };

  const handleBack = () => {
    onClose();
  };

  if (isLoading) {
    return (
      <CustomDrawer
        open={open}
        setOpen={onClose}
        title="Van Inventory Details"
        size="large"
      >
        <div className="!p-6 !space-y-6">
          {/* Header Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <Skeleton
              variant="circular"
              width={96}
              height={96}
              className="!mx-auto !mb-4"
            />
            <Skeleton
              variant="text"
              width="70%"
              height={24}
              className="!mx-auto !mb-2"
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
              className="!mx-auto"
            />
          </div>

          {/* Content Skeleton */}
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6"
              >
                <Skeleton
                  variant="text"
                  width="40%"
                  height={20}
                  className="!mb-4"
                />
                <div className="!space-y-3">
                  {[1, 2, 3].map(field => (
                    <div key={field} className="!flex !justify-between">
                      <Skeleton variant="text" width="30%" height={16} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CustomDrawer>
    );
  }

  if (error || !vanInventoryData) {
    return (
      <CustomDrawer
        open={open}
        setOpen={onClose}
        title="Van Inventory Details"
        size="large"
      >
        <div className="!p-6">
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 text-white relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5" />
              <Typography variant="h6" className="!text-white !font-bold">
                Failed to load van inventory details
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
            Back to Van Inventory
          </Button>
        </div>
      </CustomDrawer>
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
    <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-2 !relative !overflow-hidden">
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

  const itemColumns: TableColumn<any>[] = [
    {
      id: 'product_name',
      label: 'Product',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {row.product_name || `Product #${row.product_id}`}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {row.quantity}
        </Typography>
      ),
    },
    {
      id: 'unit_price',
      label: 'Unit Price',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {Number(row.unit_price || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'discount_amount',
      label: 'Discount',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-green-600">
          {Number(row.discount_amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'tax_amount',
      label: 'Tax',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-700">
          {Number(row.tax_amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'total_amount',
      label: 'Total',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-semibold !text-gray-900">
          {Number(row.total_amount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      render: (_value, row) => (
        <Typography
          variant="body2"
          className="!text-gray-600 !text-sm !max-w-xs !truncate"
          title={row.notes || ''}
        >
          {row.notes || '-'}
        </Typography>
      ),
    },
  ];

  return (
    <CustomDrawer
      open={open}
      setOpen={onClose}
      title="Van Inventory Details"
      size="large"
    >
      <div className="!p-5 mb-10 !space-y-5">
        {/* Header Card */}
        <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
          <div className="absolute top-3 right-3">
            <div
              className={`!w-2.5 !h-2.5 !rounded-full ${
                vanInventoryData.is_active === 'Y'
                  ? '!bg-green-400'
                  : '!bg-gray-400'
              }`}
            ></div>
          </div>

          <div className="!relative !mb-4">
            <Avatar
              className={classNames(
                '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                {
                  '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                    vanInventoryData.loading_type === 'L',
                  '!bg-gradient-to-br !from-purple-400 !to-purple-600 !text-white':
                    vanInventoryData.loading_type === 'U',
                }
              )}
            >
              <Truck className="!w-8 !h-8" />
            </Avatar>
          </div>

          <Typography variant="h6" className="!font-bold !text-gray-900 !mb-1">
            Van Inventory #{vanInventoryData.id}
          </Typography>

          <Typography variant="body2" className="!text-gray-600 !mb-3">
            {vanInventoryData.user?.name || 'Unknown User'}
          </Typography>

          <div className="!flex !justify-center !gap-2 !mb-4">
            <Chip
              icon={getStatusIcon(vanInventoryData.status || 'D')}
              label={getStatusLabel(vanInventoryData.status || 'D')}
              className={`${getStatusColor(vanInventoryData.status || 'D')} font-semibold`}
              size="small"
            />
            <Chip
              label={getLoadingTypeLabel(vanInventoryData.loading_type || 'L')}
              className={`${getLoadingTypeColor(vanInventoryData.loading_type || 'L')} font-semibold`}
              size="small"
            />
          </div>

          <div className="!space-y-1 !text-left !mt-4">
            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Total Items
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {vanInventoryData.items?.length || 0} items
              </Typography>
            </div>

            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Document Date
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatDate(vanInventoryData.document_date) || 'N/A'}
              </Typography>
            </div>

            <div className="!p-2 !bg-gray-50 !rounded-md">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
              >
                Last Updated
              </Typography>
              <Typography
                variant="body2"
                className="!font-semibold !text-gray-900"
              >
                {formatDate(vanInventoryData.last_updated) || 'N/A'}
              </Typography>
            </div>
          </div>
        </div>

        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
          {/* User Information */}
          <InfoCard title="User Information" icon={User}>
            <div className="!space-y-3">
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  User Name:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {vanInventoryData.user?.name || 'N/A'}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Email:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {vanInventoryData.user?.email || 'N/A'}
                </Typography>
              </div>
            </div>
          </InfoCard>

          {/* Vehicle Information */}
          <InfoCard title="Vehicle Information" icon={Truck}>
            <div className="!space-y-3">
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Vehicle Number:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {vanInventoryData.vehicle?.vehicle_number || 'No Vehicle'}
                </Typography>
              </div>
              {vanInventoryData.vehicle && (
                <div className="!flex !justify-between">
                  <Typography variant="body2" className="!text-gray-600">
                    Vehicle Type:
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900 !capitalize"
                  >
                    {vanInventoryData.vehicle.type || 'N/A'}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Inventory Information */}
          <InfoCard title="Inventory Information" icon={Info}>
            <div className="!space-y-3">
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Type:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {getLoadingTypeLabel(vanInventoryData.loading_type || 'L')}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Status:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {getStatusLabel(vanInventoryData.status || 'D')}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Document Date:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(vanInventoryData.document_date) || 'N/A'}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Active Status:
                </Typography>
                <Typography
                  variant="body2"
                  className={`!font-semibold ${
                    vanInventoryData.is_active === 'Y'
                      ? '!text-green-600'
                      : '!text-red-600'
                  }`}
                >
                  {vanInventoryData.is_active === 'Y' ? 'Active' : 'Inactive'}
                </Typography>
              </div>
            </div>
          </InfoCard>

          {/* Location Information */}
          <InfoCard title="Location Information" icon={MapPin}>
            <div className="!space-y-3">
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Location Type:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !capitalize"
                >
                  {vanInventoryData.location_type || 'Van'}
                </Typography>
              </div>
              <div className="!flex !justify-between">
                <Typography variant="body2" className="!text-gray-600">
                  Location ID:
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {vanInventoryData.location_id || 'N/A'}
                </Typography>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Inventory Items */}
        <InfoCard title="Inventory Items" icon={Package}>
          <div className="!space-y-2">
            {vanInventoryData.items && vanInventoryData.items.length > 0 ? (
              <Table
                data={vanInventoryData.items}
                columns={itemColumns}
                getRowId={row => row.id?.toString() || Math.random().toString()}
                pagination={false}
                compact={true}
                sortable={false}
                emptyMessage="No items found"
              />
            ) : (
              <Typography
                variant="body2"
                className="!text-gray-500 !text-center !py-4"
              >
                No items found
              </Typography>
            )}
          </div>
        </InfoCard>

        {/* Back Button */}
        <div className="!flex !justify-end">
          <Button
            variant="outlined"
            startIcon={<ArrowLeft />}
            onClick={handleBack}
          >
            Back to Van Inventory
          </Button>
        </div>
      </div>
    </CustomDrawer>
  );
};

export default VanInventoryDetail;
