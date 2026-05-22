import { CheckCircle, Settings } from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography, Modal } from '@mui/material';
import classNames from 'classnames';
import { useCurrency } from 'hooks/useCurrency';
import { useVisit } from 'hooks/useVisits';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  UserCheck,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const VisitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const {
    data: visitResponse,
    isLoading,
    error,
    isFetching,
  } = useVisit(Number(id));
  const visit = visitResponse?.data;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const handleOpenImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseImage = () => {
    setSelectedImageIndex(null);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const attachments = visit?.visit_attachments;
    if (!attachments || attachments.length === 0) return;
    setSelectedImageIndex(prev =>
      prev === null ? null : (prev - 1 + attachments.length) % attachments.length
    );
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const attachments = visit?.visit_attachments;
    if (!attachments || attachments.length === 0) return;
    setSelectedImageIndex(prev =>
      prev === null ? null : (prev + 1) % attachments.length
    );
  };

  const handleToggleOrder = (orderId: number) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const getAttachmentLabel = (fileType: string) => {
    switch (fileType) {
      case 'self_image':
        return 'Self Image';
      case 'customer_image':
        return 'Customer Image';
      case 'cooler_image':
        return 'Cooler Image';
      default:
        return 'Attachment';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        handleCloseImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, visit?.visit_attachments]);

  const handleBack = () => {
    navigate('/transactions/visit-logging');
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'planned':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string | null) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left Column (Sidebar - 1/3) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
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
              </div>
            </div>

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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Main Content - 2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Visit Information Skeleton */}
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
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                  {[1, 2, 3, 4, 5, 6].map(field => (
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Information Skeleton */}
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
                <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4">
                  {[1, 2, 3, 4, 5, 6].map(field => (
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4">
                  {[1, 2, 3, 4, 5, 6].map(field => (
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="max-w-4xl mx-auto pb-8">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load visit details
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
          Back to Visits
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

  const activeAttachment = selectedImageIndex !== null ? visit?.visit_attachments?.[selectedImageIndex] : null;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Column (Sidebar - 1/3) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${visit.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                  }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      visit.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      visit.is_active !== 'Y',
                  }
                )}
              >
                <User className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {visit.customer?.name || 'Unknown Customer'}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              Visit #{visit.id}
            </Typography>

            <div className="!flex !justify-center !gap-2 !mb-4">
              <Chip
                label={getStatusLabel(visit.status)}
                size="small"
                color={getStatusColor(visit.status) as any}
              />
              <Chip
                icon={
                  visit.is_active === 'Y' ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <Settings fontSize="small" />
                  )
                }
                label={visit.is_active === 'Y' ? 'Active' : 'Inactive'}
                size="small"
                color={visit.is_active === 'Y' ? 'success' : 'error'}
              />
            </div>

            <div className="!space-y-1 !text-left !mt-4">
              {visit.visit_date && (
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                  >
                    Visit Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatDate(
                      typeof visit.visit_date === 'string'
                        ? visit.visit_date
                        : String(visit.visit_date || '')
                    )}
                  </Typography>
                </div>
              )}

              {visit.purpose && (
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                  >
                    Purpose
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {visit.purpose}
                  </Typography>
                </div>
              )}
            </div>
          </div>

          <InfoCard title="Visit Timeline" icon={Clock}>
            <div className="!space-y-3">
              {visit.visit_date && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Visit Date
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {formatDate(
                          typeof visit.visit_date === 'string'
                            ? visit.visit_date
                            : String(visit.visit_date || '')
                        )}
                        {visit.visit_time && ` at ${visit.visit_time}`}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {visit.check_in_time && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Check-in Time
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {formatDate(
                          typeof visit.check_in_time === 'string'
                            ? visit.check_in_time
                            : String(visit.check_in_time || '')
                        )}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {visit.check_out_time && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Check-out Time
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {formatDate(
                          typeof visit.check_out_time === 'string'
                            ? visit.check_out_time
                            : String(visit.check_out_time || '')
                        )}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {visit.duration && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    <div>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        Duration
                      </Typography>
                      <Typography variant="caption" className="!text-gray-500">
                        {visit.duration} minutes
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {!visit.visit_date && !visit.check_in_time && (
                <div className="!text-center !py-8 !text-gray-500">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <Typography variant="body2">
                    No timeline information available.
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>

          {(visit.start_latitude ||
            visit.start_longitude ||
            visit.end_latitude ||
            visit.end_longitude) && (
              <InfoCard title="Location Details" icon={MapPin}>
                <div className="!space-y-4">
                  {(visit.start_latitude || visit.start_longitude) && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900 !mb-2"
                      >
                        Start Location
                      </Typography>
                      {visit.start_latitude && (
                        <Typography
                          variant="caption"
                          className="!text-gray-600 !block"
                        >
                          Latitude: {visit.start_latitude}
                        </Typography>
                      )}
                      {visit.start_longitude && (
                        <Typography
                          variant="caption"
                          className="!text-gray-600 !block"
                        >
                          Longitude: {visit.start_longitude}
                        </Typography>
                      )}
                    </div>
                  )}

                  {(visit.end_latitude || visit.end_longitude) && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900 !mb-2"
                      >
                        End Location
                      </Typography>
                      {visit.end_latitude && (
                        <Typography
                          variant="caption"
                          className="!text-gray-600 !block"
                        >
                          Latitude: {visit.end_latitude}
                        </Typography>
                      )}
                      {visit.end_longitude && (
                        <Typography
                          variant="caption"
                          className="!text-gray-600 !block"
                        >
                          Longitude: {visit.end_longitude}
                        </Typography>
                      )}
                    </div>
                  )}
                </div>
              </InfoCard>
            )}
        </div>

        {/* Right Column (Main Content - 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <InfoCard title="Visit Information" icon={Calendar}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Visit ID
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  #{visit.id}
                </Typography>
              </div>

              {visit.visit_date && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Visit Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatDate(
                      typeof visit.visit_date === 'string'
                        ? visit.visit_date
                        : String(visit.visit_date || '')
                    )}
                  </Typography>
                </div>
              )}

              {visit.visit_time && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Visit Time
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {visit.visit_time}
                  </Typography>
                </div>
              )}

              {visit.purpose && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Purpose
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {visit.purpose}
                  </Typography>
                </div>
              )}

              {visit.status && (
                <div className="!space-y-0.5 flex flex-col items-start">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(visit.status)}
                    size="small"
                    color={getStatusColor(visit.status) as any}
                  />
                </div>
              )}

              {visit.salesperson && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Sales Person
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {visit.salesperson.name}
                  </Typography>
                </div>
              )}

              {visit.route && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Route
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {visit.route.name}
                  </Typography>
                  {visit.route.code && (
                    <Typography variant="caption" className="!text-gray-500">
                      Code: {visit.route.code}
                    </Typography>
                  )}
                </div>
              )}

              {visit.zone && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Zone
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {visit.zone.name}
                  </Typography>
                  {visit.zone.code && (
                    <Typography variant="caption" className="!text-gray-500">
                      Code: {visit.zone.code}
                    </Typography>
                  )}
                </div>
              )}

              {visit.orders_created !== null &&
                visit.orders_created !== undefined && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Orders Created
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {visit.orders_created}
                    </Typography>
                  </div>
                )}

              {visit.amount_collected && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Amount Collected
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-primary-600"
                  >
                    {formatCurrency(Number(visit.amount_collected))}
                  </Typography>
                </div>
              )}

              {visit.next_visit_date && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Next Visit Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatDate(
                      typeof visit.next_visit_date === 'string'
                        ? visit.next_visit_date
                        : String(visit.next_visit_date || '')
                    )}
                  </Typography>
                </div>
              )}

              {visit.createdate && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Created Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatDate(
                      typeof visit.createdate === 'string'
                        ? visit.createdate
                        : String(visit.createdate || '')
                    )}
                  </Typography>
                </div>
              )}

              {visit.updatedate && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Last Updated
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatDate(
                      typeof visit.updatedate === 'string'
                        ? visit.updatedate
                        : String(visit.updatedate || '')
                    )}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>

          {visit.customer && (
            <InfoCard title="Customer Information" icon={User}>
              <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4">
                <div className="!space-y-0.5">
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
                    {visit.customer.name}
                  </Typography>
                </div>
                {visit.customer.code && (
                  <div className="!space-y-0.5">
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
                      {visit.customer.code}
                    </Typography>
                  </div>
                )}
                {visit.customer.type && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Customer Type
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {visit.customer.type}
                    </Typography>
                  </div>
                )}
                {visit.customer.contact_person && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Contact Person
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {visit.customer.contact_person}
                    </Typography>
                  </div>
                )}
                {visit.customer.phone_number && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Phone Number
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {visit.customer.phone_number}
                    </Typography>
                  </div>
                )}
                {visit.customer.email && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Email
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900 !break-all"
                    >
                      {visit.customer.email}
                    </Typography>
                  </div>
                )}
                {(visit.customer.city || visit.customer.state) && (
                  <div className="!space-y-0.5">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Location
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {[
                        visit.customer.city,
                        visit.customer.state,
                        visit.customer.zipcode,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </Typography>
                  </div>
                )}
                {visit.customer.address && (
                  <div className="!space-y-0.5 md:!col-span-2 lg:!col-span-3">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                    >
                      Address
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900"
                    >
                      {visit.customer.address}
                    </Typography>
                  </div>
                )}
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Credit Limit
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatCurrency(Number(visit.customer.credit_limit))}
                  </Typography>
                </div>
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Outstanding Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-red-600"
                  >
                    {formatCurrency(Number(visit.customer.outstanding_amount))}
                  </Typography>
                </div>

                <div className="!space-y-0.5 flex flex-col items-start">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Status
                  </Typography>
                  <Chip
                    label={
                      visit.customer.is_active === 'Y' ? 'Active' : 'Inactive'
                    }
                    size="small"
                    color={
                      visit.customer.is_active === 'Y' ? 'success' : 'error'
                    }
                  />
                </div>
              </div>
            </InfoCard>
          )}

          {(visit.visit_notes || visit.customer_feedback) && (
            <InfoCard title="Notes & Feedback" icon={UserCheck}>
              <div className="!space-y-4">
                {visit.visit_notes && (
                  <div>
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !block !mb-1 !font-medium"
                    >
                      Visit Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!text-gray-700 !bg-gray-50 !p-3 !rounded !border !border-gray-200"
                    >
                      {visit.visit_notes}
                    </Typography>
                  </div>
                )}

                {visit.customer_feedback && (
                  <div>
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !block !mb-1 !font-medium"
                    >
                      Customer Feedback
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!text-gray-700 !bg-gray-50 !p-3 !rounded !border !border-gray-200"
                    >
                      {visit.customer_feedback}
                    </Typography>
                  </div>
                )}
              </div>
            </InfoCard>
          )}


          {(visit?.visit_attachments?.length ?? 0) > 0 && (
            <InfoCard title="Visit Attachments" icon={ImageIcon}>
              <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 !gap-4">
                {visit?.visit_attachments?.map((attachment, index) => (
                  <div
                    key={attachment.id}
                    className="!group !relative !flex !flex-col !bg-gray-50 !border !border-gray-200 !rounded-lg !overflow-hidden !cursor-pointer !transition-all !duration-300 hover:!shadow-md hover:!border-primary-300"
                    onClick={() => handleOpenImage(index)}
                  >
                    <div className="!relative !w-full !aspect-square !bg-gray-100 !overflow-hidden">
                      <img
                        src={attachment.file_url || ''}
                        alt={attachment.description || attachment.file_name || ''}
                        className="!w-full !h-full !object-cover !transition-transform !duration-500 group-hover:!scale-110"
                      />
                      <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/60 !via-transparent !to-transparent !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300 !flex !items-end !p-2">
                        <span className="!text-white !text-xs !font-medium">
                          Click to view
                        </span>
                      </div>
                    </div>
                    <div className="!p-3 !flex-1 !flex !flex-col !justify-between">
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-bold !text-gray-900 !mb-0.5 !truncate"
                        >
                          {getAttachmentLabel(attachment.file_type)}
                        </Typography>
                        {attachment.description && (
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !line-clamp-2 !leading-relaxed"
                            title={attachment.description}
                          >
                            {attachment.description}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>

      </div>

      {visit.orders && visit.orders.length > 0 && (
        <InfoCard title="Orders & Payments" icon={CreditCard}>
          {/* Payments Summary Cards */}
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 md:!grid-cols-3 !gap-4 !mb-6">
            <div className="!p-4 !bg-gradient-to-br !from-emerald-50 !to-teal-50 !border !border-emerald-100 !rounded-lg !flex !items-center !gap-3">
              <div className="!p-2.5 !bg-emerald-500 !text-white !rounded-md">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <Typography
                  variant="caption"
                  className="!text-emerald-700 !font-semibold !uppercase !tracking-wider"
                >
                  Total Amount Collected
                </Typography>
                <Typography
                  variant="h5"
                  className="!font-bold !text-emerald-900"
                >
                  {formatCurrency(Number(visit.amount_collected || 0))}
                </Typography>
              </div>
            </div>

            <div className="!p-4 !bg-gradient-to-br !from-blue-50 !to-indigo-50 !border !border-blue-100 !rounded-lg !flex !items-center !gap-3">
              <div className="!p-2.5 !bg-blue-500 !text-white !rounded-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <Typography
                  variant="caption"
                  className="!text-blue-700 !font-semibold !uppercase !tracking-wider"
                >
                  Orders Created
                </Typography>
                <Typography
                  variant="h5"
                  className="!font-bold !text-blue-900"
                >
                  {visit.orders.length}{' '}
                  {visit.orders.length === 1 ? 'Order' : 'Orders'}
                </Typography>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="!space-y-4">
            {visit.orders?.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  className="!border !border-gray-200 !rounded-lg !overflow-hidden !bg-white !transition-shadow hover:!shadow-sm"
                >
                  {/* Order Header / Summary */}
                  <div
                    className="!p-4 !flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !gap-4 !cursor-pointer !select-none hover:!bg-gray-50/50"
                    onClick={() => handleToggleOrder(order.id)}
                  >
                    <div className="!flex !items-center !gap-3">
                      <div className="!p-2 !bg-gray-100 !text-gray-600 !rounded-md">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="!flex !items-center !gap-2">
                          <Typography
                            variant="body2"
                            className="!font-bold !text-gray-900"
                          >
                            {order.order_number}
                          </Typography>
                          <Chip
                            label={getStatusLabel(order.status)}
                            size="small"
                            color={getStatusColor(order.status) as any}
                            className="!text-[10px] !h-5"
                          />
                        </div>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          Placed on{' '}
                          {formatDate(
                            typeof order.order_date === 'string'
                              ? order.order_date
                              : String(order.order_date || '')
                          )}
                        </Typography>
                      </div>
                    </div>

                    {/* Payment Details in Header */}
                    <div className="!flex !flex-wrap !items-center !gap-4 md:!gap-6 !w-full md:!w-auto !justify-between">
                      <div className="!text-left md:!text-right">
                        <Typography
                          variant="caption"
                          className="!text-gray-400 !block !text-[10px] !uppercase !tracking-wider"
                        >
                          Payment Method
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-700 !capitalize"
                        >
                          {order.payment_method} ({order.payment_terms || 'N/A'})
                        </Typography>
                      </div>

                      <div className="!text-left md:!text-right">
                        <Typography
                          variant="caption"
                          className="!text-gray-400 !block !text-[10px] !uppercase !tracking-wider"
                        >
                          Order Total
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-bold !text-primary-600"
                        >
                          {formatCurrency(Number(order.total_amount))}
                        </Typography>
                      </div>

                      <div className="!text-gray-400 !self-center">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Items Table */}
                  {isExpanded && (
                    <div className="!px-4 !pb-4 !border-t !border-gray-100 !bg-gray-50/30">
                      <div className="!overflow-x-auto !mt-4">
                        <table className="!w-full !text-left !border-collapse">
                          <thead>
                            <tr className="!border-b !border-gray-200">
                              <th className="!pb-2 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">
                                Product Name
                              </th>
                              <th className="!pb-2 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">
                                Unit
                              </th>
                              <th className="!pb-2 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider !text-center">
                                Quantity
                              </th>
                              <th className="!pb-2 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider !text-right">
                                Unit Price
                              </th>
                              <th className="!pb-2 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider !text-right">
                                Tax
                              </th>
                              <th className="!pb-2 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider !text-right">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="!divide-y !divide-gray-100">
                            {order.order_items.map((item) => (
                              <tr
                                key={item.id}
                                className="hover:!bg-gray-50/50"
                              >
                                <td className="!py-3 !text-sm !font-medium !text-gray-900">
                                  {item.product_name}
                                  {item.notes && (
                                    <span className="!block !text-[11px] !text-gray-400 !font-normal">
                                      Note: {item.notes}
                                    </span>
                                  )}
                                </td>
                                <td className="!py-3 !text-sm !text-gray-600">
                                  {item.unit || 'PCS'}
                                </td>
                                <td className="!py-3 !text-sm !text-gray-900 !text-center">
                                  {item.quantity}
                                </td>
                                <td className="!py-3 !text-sm !text-gray-900 !text-right">
                                  {formatCurrency(Number(item.unit_price))}
                                </td>
                                <td className="!py-3 !text-sm !text-gray-500 !text-right">
                                  {formatCurrency(
                                    Number(item.tax_amount || 0)
                                  )}
                                </td>
                                <td className="!py-3 !text-sm !font-bold !text-gray-900 !text-right">
                                  {formatCurrency(Number(item.total_amount))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Subtotal, discount and tax calculation summary */}
                      <div className="!flex !justify-end !mt-4 !pt-4 !border-t !border-gray-100">
                        <div className="!w-full sm:!w-64 !space-y-1.5">
                          <div className="!flex !justify-between !text-xs !text-gray-500">
                            <span>Subtotal</span>
                            <span>
                              {formatCurrency(Number(order.subtotal))}
                            </span>
                          </div>
                          {Number(order.discount_amount) > 0 && (
                            <div className="!flex !justify-between !text-xs !text-red-500">
                              <span>Discount</span>
                              <span>
                                -
                                {formatCurrency(
                                  Number(order.discount_amount)
                                )}
                              </span>
                            </div>
                          )}
                          {Number(order.tax_amount) > 0 && (
                            <div className="!flex !justify-between !text-xs !text-gray-500">
                              <span>Tax</span>
                              <span>
                                {formatCurrency(Number(order.tax_amount))}
                              </span>
                            </div>
                          )}
                          {Number(order.shipping_amount) > 0 && (
                            <div className="!flex !justify-between !text-xs !text-gray-500">
                              <span>Shipping</span>
                              <span>
                                {formatCurrency(
                                  Number(order.shipping_amount)
                                )}
                              </span>
                            </div>
                          )}
                          <div className="!flex !justify-between !text-sm !font-bold !text-gray-900 !pt-1.5 !border-t !border-gray-100">
                            <span>Total Amount</span>
                            <span>
                              {formatCurrency(Number(order.total_amount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </InfoCard>
      )}
      <Modal
        open={selectedImageIndex !== null}
        onClose={handleCloseImage}
        className="flex items-center justify-center"
        slotProps={{
          backdrop: {
            className: '!bg-black/90 !backdrop-blur-sm',
          },
        }}
      >
        <div className="relative max-w-5xl max-h-[90vh] w-full p-4 flex flex-col items-center justify-center outline-none">
          {/* Close button */}
          <button
            onClick={handleCloseImage}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors duration-200 border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous button */}
          {(visit?.visit_attachments?.length ?? 0) > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors duration-200 border border-white/10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image Container with smooth animation */}
          {selectedImageIndex !== null && activeAttachment && (
            <div className="flex flex-col items-center max-w-full">
              <img
                src={activeAttachment.file_url || ''}
                alt={activeAttachment.description || activeAttachment.file_name || ''}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
              />

              {/* Attachment info details in modal */}
              <div className="mt-4 text-center px-6 max-w-2xl">
                <Typography className="!text-white !font-bold !text-lg">
                  {getAttachmentLabel(activeAttachment.file_type)}
                </Typography>
                {activeAttachment.description && (
                  <Typography className="!text-gray-300 !text-sm !mt-1">
                    {activeAttachment.description}
                  </Typography>
                )}
                <Typography className="!text-gray-500 !text-xs !mt-2">
                  Image {selectedImageIndex + 1} of{' '}
                  {visit?.visit_attachments?.length || 0}
                </Typography>
              </div>
            </div>
          )}

          {/* Next button */}
          {(visit?.visit_attachments?.length ?? 0) > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors duration-200 border border-white/10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VisitDetail;
