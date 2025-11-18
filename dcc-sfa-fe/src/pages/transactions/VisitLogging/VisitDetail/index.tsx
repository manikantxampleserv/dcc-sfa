import { CheckCircle, Settings } from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useVisit } from 'hooks/useVisits';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  UserCheck,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const VisitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: visitResponse,
    isLoading,
    error,
    isFetching,
  } = useVisit(Number(id));
  const visit = visitResponse?.data;

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
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="!flex-2 flex flex-col gap-4">
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

          <div className="!flex-4 !space-y-4">
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
    );
  }

  if (error || !visit) {
    return (
      <div className="max-w-4xl mx-auto">
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  visit.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
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
        </div>

        <div className="!flex-4 !space-y-4">
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
                <div className="!space-y-0.5">
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
                  <Typography variant="caption" className="!text-gray-500">
                    {visit.salesperson.email}
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
                    ₹{Number(visit.amount_collected).toLocaleString()}
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
        </div>
      </div>

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
                ₹{Number(visit.customer.credit_limit).toLocaleString()}
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
                ₹{Number(visit.customer.outstanding_amount).toLocaleString()}
              </Typography>
            </div>

            <div className="!space-y-0.5">
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !uppercase !tracking-wide"
              >
                Status
              </Typography>
              <Chip
                label={visit.customer.is_active === 'Y' ? 'Active' : 'Inactive'}
                size="small"
                color={visit.customer.is_active === 'Y' ? 'success' : 'error'}
              />
            </div>
          </div>
        </InfoCard>
      )}

      {(visit.start_latitude ||
        visit.start_longitude ||
        visit.end_latitude ||
        visit.end_longitude) && (
        <InfoCard title="Location Details" icon={MapPin}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
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

      <div className="!mt-4">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
        >
          Back to Visits
        </Button>
      </div>
    </div>
  );
};

export default VisitDetail;
