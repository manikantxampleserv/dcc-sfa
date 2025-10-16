import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import {
  useCoolerInspection,
  useUpdateCoolerInspectionStatus,
} from 'hooks/useCoolerInspections';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Droplets,
  MapPin,
  Thermometer,
  Wrench,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const CoolerInspectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: coolerInspectionResponse,
    isLoading,
    error,
    isFetching,
  } = useCoolerInspection(Number(id));
  const coolerInspection = coolerInspectionResponse;

  const updateStatusMutation = useUpdateCoolerInspectionStatus();

  const handleStatusUpdate = async (status: string, value: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: coolerInspection?.id || 0,
        status,
        value,
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getWorkingStatusColor = (isWorking?: string | null) => {
    const colors = {
      Y: '!bg-green-100 !text-green-800',
      N: '!bg-red-100 !text-red-800',
    };
    return (
      colors[isWorking as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const getWorkingStatusLabel = (isWorking?: string | null) => {
    const labels = {
      Y: 'Working',
      N: 'Not Working',
    };
    return labels[isWorking as keyof typeof labels] || 'Unknown';
  };

  const getActionRequiredColor = (actionRequired?: string | null) => {
    const colors = {
      Y: '!bg-yellow-100 !text-yellow-800',
      N: '!bg-green-100 !text-green-800',
    };
    return (
      colors[actionRequired as keyof typeof colors] ||
      '!bg-gray-100 !text-gray-800'
    );
  };

  const getActionRequiredLabel = (actionRequired?: string | null) => {
    const labels = {
      Y: 'Action Required',
      N: 'No Action Required',
    };
    return labels[actionRequired as keyof typeof labels] || 'Unknown';
  };

  const handleBack = () => {
    navigate('/transactions/inspections');
  };

  if (isLoading || isFetching) {
    return (
      <div className="!flex !items-start !gap-4">
        <div className="!flex-2 !flex !flex-col !gap-4">
          {/* Main Inspection Card Skeleton */}
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

          {/* Inspection Information Card Skeleton */}
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
          {/* Inspection Details Card Skeleton */}
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

          {/* Issues and Actions Card Skeleton */}
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

  if (error || !coolerInspection) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load cooler inspection details
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
          Back to Cooler Inspections
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
                  coolerInspection.is_active === 'Y'
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
                      coolerInspection.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      coolerInspection.is_active !== 'Y',
                  }
                )}
              >
                <Wrench className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              Inspection #{coolerInspection.id}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {coolerInspection.cooler?.code || 'Unknown Cooler'}
            </Typography>

            <Chip
              label={getWorkingStatusLabel(coolerInspection.is_working)}
              className={`${getWorkingStatusColor(coolerInspection.is_working)} font-semibold`}
              size="small"
            />

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Inspection Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {coolerInspection.inspection_date
                    ? formatDate(coolerInspection.inspection_date)
                    : 'Not inspected'}
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
                  {coolerInspection.temperature
                    ? `${coolerInspection.temperature}°C`
                    : 'Not monitored'}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Action Required
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {getActionRequiredLabel(coolerInspection.action_required)}
                </Typography>
              </div>
            </div>
          </div>
          <InfoCard title="Inspection Details" icon={Calendar}>
            <div className="!space-y-3">
              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div className="!flex !items-center !gap-2">
                    <Calendar className="!text-blue-500 !w-4 !h-4" />
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Inspection Date
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-blue-600"
                  >
                    {coolerInspection.inspection_date
                      ? formatDate(coolerInspection.inspection_date)
                      : 'Not inspected'}
                  </Typography>
                </div>
              </div>

              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div className="!flex !items-center !gap-2">
                    <Thermometer className="!text-green-500 !w-4 !h-4" />
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Temperature
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-green-600"
                  >
                    {coolerInspection.temperature
                      ? `${coolerInspection.temperature}°C`
                      : 'Not monitored'}
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
                      Next Inspection Due
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-orange-600"
                  >
                    {coolerInspection.next_inspection_due
                      ? formatDate(coolerInspection.next_inspection_due)
                      : 'Not scheduled'}
                  </Typography>
                </div>
              </div>

              {coolerInspection.latitude && coolerInspection.longitude && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !justify-between">
                    <div className="!flex !items-center !gap-2">
                      <MapPin className="!text-purple-500 !w-4 !h-4" />
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Location
                      </Typography>
                    </div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-purple-600"
                    >
                      {coolerInspection.latitude.toFixed(4)},{' '}
                      {coolerInspection.longitude.toFixed(4)}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        <div className="!flex-4 !space-y-4">
          {/* Inspection Details */}
          <InfoCard title="Cooler Information" icon={Droplets}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Cooler Code
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {coolerInspection.cooler?.code || 'Unknown Cooler'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {coolerInspection.cooler?.brand}{' '}
                  {coolerInspection.cooler?.model}
                </Typography>
              </div>

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
                  {coolerInspection.cooler?.customer?.name ||
                    'Unknown Customer'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {coolerInspection.cooler?.customer?.code}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Inspector
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {coolerInspection.inspector?.name || 'No inspector assigned'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  {coolerInspection.inspector?.email}
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
                  {coolerInspection.cooler?.serial_number || 'Not provided'}
                </Typography>
              </div>

              {coolerInspection.issues && (
                <div className="!space-y-0.5 md:!col-span-2">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Issues Found
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {coolerInspection.issues}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Status & Actions */}
          <InfoCard title="Status & Actions" icon={Wrench}>
            <div className="!space-y-3">
              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      Working Status
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      Operational status
                    </Typography>
                  </div>
                  <Chip
                    label={getWorkingStatusLabel(coolerInspection.is_working)}
                    className={`${getWorkingStatusColor(coolerInspection.is_working)} font-semibold`}
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
                      Action Required
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      Maintenance status
                    </Typography>
                  </div>
                  <Chip
                    label={getActionRequiredLabel(
                      coolerInspection.action_required
                    )}
                    className={`${getActionRequiredColor(coolerInspection.action_required)} font-semibold`}
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
                      Inspection Status
                    </Typography>
                    <Typography variant="caption" className="!text-gray-500">
                      System status
                    </Typography>
                  </div>
                  <Chip
                    label={
                      coolerInspection.is_active === 'Y' ? 'Active' : 'Inactive'
                    }
                    color={
                      coolerInspection.is_active === 'Y' ? 'success' : 'error'
                    }
                    size="small"
                  />
                </div>
              </div>

              {coolerInspection.action_taken && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !justify-between">
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Action Taken
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {coolerInspection.action_taken}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Status Management */}
          <InfoCard title="Status Management" icon={Wrench}>
            <div className="!space-y-4">
              {/* Working Status */}
              <div className="!space-y-2">
                <Typography
                  variant="subtitle2"
                  className="!font-semibold !text-gray-900"
                >
                  Working Status
                </Typography>
                <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-2">
                  <Button
                    variant={
                      coolerInspection.is_working === 'Y'
                        ? 'contained'
                        : 'outlined'
                    }
                    color="success"
                    onClick={() =>
                      coolerInspection.is_working !== 'Y' &&
                      handleStatusUpdate('is_working', 'Y')
                    }
                    disabled={updateStatusMutation.isPending}
                    className="!w-full"
                    size="small"
                  >
                    Set Working
                  </Button>
                  <Button
                    variant={
                      coolerInspection.is_working === 'N'
                        ? 'contained'
                        : 'outlined'
                    }
                    color="error"
                    onClick={() =>
                      coolerInspection.is_working !== 'N' &&
                      handleStatusUpdate('is_working', 'N')
                    }
                    disabled={updateStatusMutation.isPending}
                    className="!w-full"
                    size="small"
                  >
                    Set Not Working
                  </Button>
                </div>
              </div>

              {/* Action Required */}
              <div className="!space-y-2">
                <Typography
                  variant="subtitle2"
                  className="!font-semibold !text-gray-900"
                >
                  Action Required
                </Typography>
                <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-2">
                  <Button
                    variant={
                      coolerInspection.action_required === 'N'
                        ? 'contained'
                        : 'outlined'
                    }
                    color="success"
                    onClick={() =>
                      coolerInspection.action_required !== 'N' &&
                      handleStatusUpdate('action_required', 'N')
                    }
                    disabled={updateStatusMutation.isPending}
                    className="!w-full"
                    size="small"
                  >
                    Set No Action Required
                  </Button>
                  <Button
                    variant={
                      coolerInspection.action_required === 'Y'
                        ? 'contained'
                        : 'outlined'
                    }
                    color="warning"
                    onClick={() =>
                      coolerInspection.action_required !== 'Y' &&
                      handleStatusUpdate('action_required', 'Y')
                    }
                    disabled={updateStatusMutation.isPending}
                    className="!w-full"
                    size="small"
                  >
                    Set Action Required
                  </Button>
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
                      coolerInspection.is_active === 'Y'
                        ? 'contained'
                        : 'outlined'
                    }
                    color="success"
                    onClick={() =>
                      coolerInspection.is_active !== 'Y' &&
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
                      coolerInspection.is_active === 'N'
                        ? 'contained'
                        : 'outlined'
                    }
                    color="error"
                    onClick={() =>
                      coolerInspection.is_active !== 'N' &&
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

export default CoolerInspectionDetail;
