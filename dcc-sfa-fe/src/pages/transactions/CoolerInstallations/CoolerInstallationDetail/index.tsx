import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import {
  useCoolerInstallation,
  useUpdateCoolerStatus,
} from 'hooks/useCoolerInstallations';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Droplets,
  Package,
  Thermometer,
  Wrench,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const CoolerInstallationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: coolerResponse,
    isLoading,
    error,
    isFetching,
  } = useCoolerInstallation(Number(id));
  const cooler = coolerResponse;

  const updateStatusMutation = useUpdateCoolerStatus();

  const handleBack = () => {
    navigate('/transactions/installations');
  };

  const handleStatusUpdate = async (status: string, value: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: cooler?.id || 0,
        status,
        value,
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'working':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'broken':
        return 'error';
      case 'offline':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string | null) => {
    switch (status) {
      case 'working':
        return 'Working';
      case 'maintenance':
        return 'Maintenance';
      case 'broken':
        return 'Broken';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="!flex !items-start !gap-4">
        <div className="!flex-2 !flex !flex-col !gap-4">
          {/* Main Cooler Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="!absolute !top-3 !right-3">
              <Skeleton
                variant="circular"
                width={10}
                height={10}
                className="!bg-green-200"
              />
            </div>

            <div className="!relative !mb-4">
              <Skeleton
                variant="circular"
                width={96}
                height={96}
                className="!mx-auto !border-3 !border-white"
              />
            </div>

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
              className="!mx-auto !mb-4 !bg-green-50"
            />

            <div className="!space-y-2 !text-left !mt-4">
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="30%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="60%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="70%" height={14} />
              </div>
              <div className="!p-2 !bg-gray-50 !rounded-md">
                <Skeleton
                  variant="text"
                  width="25%"
                  height={10}
                  className="!mb-1"
                />
                <Skeleton variant="text" width="50%" height={14} />
              </div>
            </div>
          </div>

          {/* Cooler Information Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={140} height={20} />
              </div>
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                {[1, 2, 3, 4].map(field => (
                  <div key={field} className="!space-y-1">
                    <Skeleton
                      variant="text"
                      width={`${40 + field * 8}%`}
                      height={12}
                    />
                    <Skeleton
                      variant="text"
                      width={`${60 + field * 6}%`}
                      height={16}
                    />
                    {field === 1 && (
                      <Skeleton
                        variant="text"
                        width="50%"
                        height={12}
                        className="!mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="!flex-4 !space-y-4">
          {/* Installation Details Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={200} height={20} />
              </div>

              <div className="!space-y-3">
                {[1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between">
                      <div className="!flex-1">
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="40%" height={12} />
                      </div>
                      <Skeleton
                        variant="text"
                        width={80}
                        height={16}
                        className="!text-right"
                      />
                    </div>
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={12}
                      className="!mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service History Card Skeleton */}
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !relative !overflow-hidden">
            <div className="!absolute !top-0 !right-0 !w-16 !h-16 !bg-gradient-to-br !from-blue-50 !to-purple-50 !rounded-full !-translate-y-8 !translate-x-8"></div>
            <div className="!relative !z-10">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!p-1.5 !w-10 !h-10 flex items-center justify-center !bg-primary-100 !rounded-md">
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    className="!bg-primary-200"
                  />
                </div>
                <Skeleton variant="text" width={150} height={20} />
              </div>

              <div className="!space-y-3">
                {[1, 2].map(item => (
                  <div
                    key={item}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <div className="!flex !items-center !justify-between">
                      <div className="!flex-1">
                        <Skeleton
                          variant="text"
                          width="70%"
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="50%" height={12} />
                      </div>
                      <div className="!text-right">
                        <Skeleton
                          variant="text"
                          width={80}
                          height={16}
                          className="!mb-1"
                        />
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={20}
                          className="!rounded-full"
                        />
                      </div>
                    </div>
                    <div className="!flex !items-center !justify-between !text-xs">
                      <Skeleton variant="text" width="30%" height={10} />
                      <Skeleton variant="text" width="40%" height={10} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cooler) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load cooler installation details
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
          Back to Cooler Installations
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
      <div className="flex lg:!flex-row flex-col items-start gap-4">
        <div className="lg:!flex-2 !w-full !flex-1 !flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  cooler.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      cooler.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      cooler.is_active !== 'Y',
                  }
                )}
              >
                <Droplets className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {cooler.code}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {cooler.brand && cooler.model
                ? `${cooler.brand} ${cooler.model}`
                : 'Unknown Model'}
            </Typography>

            <Chip
              label={getStatusLabel(cooler.status)}
              color={getStatusColor(cooler.status)}
              size="small"
            />

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Capacity
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {cooler.capacity ? `${cooler.capacity}L` : 'Not specified'}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Temperature
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {cooler.temperature
                    ? `${cooler.temperature}°C`
                    : 'Not monitored'}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Energy Rating
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {cooler.energy_rating || 'Not rated'}
                </Typography>
              </div>
            </div>
          </div>
          <InfoCard title="Installation Details" icon={Calendar}>
            <div className="!space-y-3">
              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div className="!flex !items-center !gap-2">
                    <Calendar className="!text-blue-500 !w-4 !h-4" />
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Installation Date
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-blue-600"
                  >
                    {cooler.install_date
                      ? formatDate(cooler.install_date)
                      : 'Not installed'}
                  </Typography>
                </div>
              </div>

              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div className="!flex !items-center !gap-2">
                    <Wrench className="!text-green-500 !w-4 !h-4" />
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Last Service Date
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-green-600"
                  >
                    {cooler.last_service_date
                      ? formatDate(cooler.last_service_date)
                      : 'No service history'}
                  </Typography>
                </div>
              </div>

              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div className="!flex !items-center !gap-2">
                    <Calendar className="!text-orange-500 !w-4 !h-4" />
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Next Service Due
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-orange-600"
                  >
                    {cooler.next_service_due
                      ? formatDate(cooler.next_service_due)
                      : 'Not scheduled'}
                  </Typography>
                </div>
              </div>

              {cooler.last_scanned_date && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !justify-between">
                    <div className="!flex !items-center !gap-2">
                      <Thermometer className="!text-purple-500 !w-4 !h-4" />
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Last Scanned
                      </Typography>
                    </div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-purple-600"
                    >
                      {formatDate(cooler.last_scanned_date)}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        <div className="lg:!flex-4 !w-full !flex-1 !space-y-4">
          {/* Installation Details */}
          <InfoCard title="Cooler Information" icon={Package}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !font-bold !uppercase !tracking-wide"
                >
                  Customer
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {cooler.customer?.name || 'Unknown Customer'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {cooler.customer?.code}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Technician
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {cooler.technician?.name || 'No technician assigned'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {cooler.technician?.email}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Brand & Model
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {cooler.brand || 'Unknown Brand'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {cooler.model || 'Unknown Model'}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Serial Number
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900 !font-mono"
                >
                  {cooler.serial_number || 'Not provided'}
                </Typography>
              </div>

              {cooler.maintenance_contract && (
                <div className="!space-y-0.5 md:!col-span-2">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Maintenance Contract
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {cooler.maintenance_contract}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>
          {/* Warranty & Service History */}
          <InfoCard title="Warranty & Service History" icon={Wrench}>
            <div className="!space-y-3">
              {cooler.warranty_expiry && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !justify-between">
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Warranty Expiry
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {formatDate(cooler.warranty_expiry)}
                      </Typography>
                    </div>
                    <Chip
                      label={
                        new Date(cooler.warranty_expiry) > new Date()
                          ? 'Active'
                          : 'Expired'
                      }
                      color={
                        new Date(cooler.warranty_expiry) > new Date()
                          ? 'success'
                          : 'error'
                      }
                      size="small"
                    />
                  </div>
                </div>
              )}

              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Current Status
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      Operational status
                    </Typography>
                  </div>
                  <Chip
                    label={getStatusLabel(cooler.status)}
                    color={getStatusColor(cooler.status)}
                    size="small"
                  />
                </div>
              </div>

              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Installation Status
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      System status
                    </Typography>
                  </div>
                  <Chip
                    label={cooler.is_active === 'Y' ? 'Active' : 'Inactive'}
                    color={cooler.is_active === 'Y' ? 'success' : 'error'}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Status Management */}
          <InfoCard title="Status Management" icon={Wrench}>
            <div className="!space-y-4">
              {/* Operational Status */}
              <div className="!space-y-2">
                <Typography
                  variant="subtitle2"
                  className="!font-semibold !text-gray-900"
                >
                  Operational Status
                </Typography>
                <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-2">
                  {['working', 'maintenance', 'broken', 'offline'].map(
                    status => (
                      <Button
                        variant={
                          cooler.status === status ? 'contained' : 'outlined'
                        }
                        color={
                          status === 'working'
                            ? 'success'
                            : status === 'maintenance'
                              ? 'warning'
                              : status === 'broken'
                                ? 'error'
                                : 'secondary'
                        }
                        onClick={() =>
                          cooler.status !== status &&
                          handleStatusUpdate('status', status)
                        }
                        disabled={updateStatusMutation.isPending}
                        className="!capitalize !w-full"
                        size="small"
                      >
                        Set {status}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="!space-y-2">
                <Typography
                  variant="subtitle2"
                  className="!font-semibold !text-gray-900"
                >
                  Active Status
                </Typography>
                <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-2">
                  <Button
                    variant={
                      cooler.is_active === 'Y' ? 'contained' : 'outlined'
                    }
                    color="success"
                    onClick={() =>
                      cooler.is_active !== 'Y' &&
                      handleStatusUpdate('is_active', 'Y')
                    }
                    disabled={updateStatusMutation.isPending}
                    className="!w-full"
                    size="small"
                  >
                    Set Active
                  </Button>
                  <Button
                    variant={
                      cooler.is_active === 'N' ? 'contained' : 'outlined'
                    }
                    color="error"
                    onClick={() =>
                      cooler.is_active !== 'N' &&
                      handleStatusUpdate('is_active', 'N')
                    }
                    disabled={updateStatusMutation.isPending}
                    className="!w-full"
                    size="small"
                  >
                    Set Inactive
                  </Button>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </>
  );
};

export default CoolerInstallationDetail;
