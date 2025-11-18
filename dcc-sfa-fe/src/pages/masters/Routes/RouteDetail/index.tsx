import { CheckCircle, Settings } from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useRoute } from 'hooks/useRoutes';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Users,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const RouteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: routeResponse,
    isLoading,
    error,
    isFetching,
  } = useRoute(Number(id));
  const route = routeResponse?.data;

  const handleBack = () => {
    navigate('/masters/routes');
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
              {[1, 2, 3].map(item => (
                <div
                  key={item}
                  className="!p-5 !bg-gray-50 !rounded-md !border !border-gray-200"
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
                    height={12}
                    className="!mb-3"
                  />
                  <div className="!space-y-2">
                    <Skeleton variant="text" width="50%" height={10} />
                    <Skeleton variant="text" width="70%" height={14} />
                    <Skeleton variant="text" width="45%" height={10} />
                    <Skeleton variant="text" width="80%" height={14} />
                  </div>
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
            <div className="!space-y-4">
              {[1, 2].map(item => (
                <div
                  key={item}
                  className="!p-5 !bg-gray-50 !rounded-md !border !border-gray-200"
                >
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={20}
                    className="!mb-3"
                  />
                  <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4 !mt-4">
                    {[1, 2, 3, 4, 5, 6].map(field => (
                      <div key={field}>
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={10}
                          className="!mb-1"
                        />
                        <Skeleton variant="text" width="80%" height={14} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load route details
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
          Back to Routes
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
                  route.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      route.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      route.is_active !== 'Y',
                  }
                )}
              >
                <RouteIcon className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {route.name}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {route.code}
            </Typography>

            <div className="!flex !justify-center !gap-2 !mb-4">
              <Chip
                icon={
                  route.is_active === 'Y' ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <Settings fontSize="small" />
                  )
                }
                label={route.is_active === 'Y' ? 'Active' : 'Inactive'}
                size="small"
                color={route.is_active === 'Y' ? 'success' : 'error'}
              />
            </div>

            <div className="!space-y-1 !text-left !mt-4">
              {route.routes_depots && (
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                  >
                    Depot
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.routes_depots.name} ({route.routes_depots.code})
                  </Typography>
                </div>
              )}

              {route.createdate && (
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                  >
                    Created Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {formatDate(
                      typeof route.createdate === 'string'
                        ? route.createdate
                        : String(route.createdate || '')
                    )}
                  </Typography>
                </div>
              )}
            </div>
          </div>
          <InfoCard title="Route Details" icon={Navigation}>
            <div className="!space-y-3">
              {route.start_location || route.end_location ? (
                <>
                  {route.start_location && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <div className="!flex !items-center !gap-2">
                        <MapPin className="w-5 h-5 text-primary-500" />
                        <div>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            Start Location
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            {route.start_location}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  {route.end_location && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <div className="!flex !items-center !gap-2">
                        <MapPin className="w-5 h-5 text-primary-500" />
                        <div>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            End Location
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            {route.end_location}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  {(route.estimated_distance || route.estimated_time) && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <div className="!flex !items-center !gap-4">
                        {route.estimated_distance && (
                          <div className="!flex !items-center !gap-2">
                            <Navigation className="w-5 h-5 text-primary-500" />
                            <div>
                              <Typography
                                variant="body2"
                                className="!font-semibold !text-gray-900"
                              >
                                Distance
                              </Typography>
                              <Typography
                                variant="caption"
                                className="!text-gray-500"
                              >
                                {route.estimated_distance} km
                              </Typography>
                            </div>
                          </div>
                        )}
                        {route.estimated_time && (
                          <div className="!flex !items-center !gap-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            <div>
                              <Typography
                                variant="body2"
                                className="!font-semibold !text-gray-900"
                              >
                                Duration
                              </Typography>
                              <Typography
                                variant="caption"
                                className="!text-gray-500"
                              >
                                {route.estimated_time} minutes
                              </Typography>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="!text-center !py-8 !text-gray-500">
                  <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <Typography variant="body2">
                    No location details available for this route.
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        <div className="!flex-4 !space-y-4">
          <InfoCard title="Route Information" icon={RouteIcon}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Route Code
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {route.code}
                </Typography>
              </div>

              {route.routes_depots && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Depot
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.routes_depots.name}
                  </Typography>
                </div>
              )}

              {route.routes_zones && (
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
                    {route.routes_zones.name}
                  </Typography>
                </div>
              )}

              {route.routes_route_type && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Route Type
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.routes_route_type.name}
                  </Typography>
                </div>
              )}

              {route.routes_salesperson && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Salesperson
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.routes_salesperson.name}
                  </Typography>
                  <Typography variant="caption" className="!text-gray-500">
                    {route.routes_salesperson.email}
                  </Typography>
                </div>
              )}

              {route.start_location && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Start Location
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.start_location}
                  </Typography>
                </div>
              )}

              {route.end_location && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    End Location
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.end_location}
                  </Typography>
                </div>
              )}

              {route.estimated_distance && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Estimated Distance
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.estimated_distance} km
                  </Typography>
                </div>
              )}

              {route.estimated_time && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Estimated Time
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.estimated_time} minutes
                  </Typography>
                </div>
              )}

              {route.description && (
                <div className="!space-y-0.5 md:!col-span-2">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {route.description}
                  </Typography>
                </div>
              )}

              {route.createdate && (
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
                      typeof route.createdate === 'string'
                        ? route.createdate
                        : String(route.createdate || '')
                    )}
                  </Typography>
                </div>
              )}

              {route.updatedate && (
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
                      typeof route.updatedate === 'string'
                        ? route.updatedate
                        : String(route.updatedate || '')
                    )}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>
        </div>
      </div>

      {route.customer_routes && route.customer_routes.length > 0 && (
        <InfoCard title="Assigned Customers" icon={Users}>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4">
            {route.customer_routes.map(customer => (
              <div
                key={customer.id}
                className="!p-5 !bg-gray-50 !rounded-md !border !border-gray-200 !hover:!shadow-md !transition-shadow"
              >
                <div className="!flex !items-start !justify-between !mb-3">
                  <div className="!flex-1">
                    <div className="!flex !items-center !gap-2 !mb-2 !flex-wrap">
                      <Typography
                        variant="h6"
                        className="!font-semibold !text-gray-900"
                      >
                        {customer.name}
                      </Typography>
                      {customer.code && (
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !bg-gray-200 !px-2 !py-0.5 !rounded !font-medium"
                        >
                          {customer.code}
                        </Typography>
                      )}
                      <Chip
                        label={
                          customer.is_active === 'Y' ? 'Active' : 'Inactive'
                        }
                        size="small"
                        color={customer.is_active === 'Y' ? 'success' : 'error'}
                      />
                    </div>
                    {customer.type && (
                      <Typography
                        variant="body2"
                        className="!text-gray-600 !mb-3"
                      >
                        Type:{' '}
                        <span className="!font-semibold">{customer.type}</span>
                      </Typography>
                    )}
                  </div>
                </div>

                <div className="!space-y-3">
                  {customer.contact_person && (
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
                      >
                        Contact Person
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {customer.contact_person}
                      </Typography>
                    </div>
                  )}

                  <div className="!grid !grid-cols-1 !gap-2">
                    {customer.phone_number && (
                      <div>
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !block !mb-1 !font-medium"
                        >
                          Phone Number
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {customer.phone_number}
                        </Typography>
                      </div>
                    )}

                    {customer.email && (
                      <div>
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !block !mb-1 !font-medium"
                        >
                          Email
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900 !break-all"
                        >
                          {customer.email}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {(customer.city || customer.state || customer.zipcode) && (
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
                      >
                        Location
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {[customer.city, customer.state, customer.zipcode]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </Typography>
                    </div>
                  )}

                  {customer.address && (
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
                      >
                        Address
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {customer.address}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {route.visit_routes && route.visit_routes.length > 0 ? (
        <InfoCard title="Visits History" icon={Clock}>
          <div className="!space-y-4">
            {route.visit_routes.map(visit => (
              <div
                key={visit.id}
                className="!p-5 !bg-gray-50 !rounded-md !border !border-gray-200"
              >
                <div className="!flex !items-start !justify-between !mb-3">
                  <div className="!flex-1">
                    <div className="!flex !items-center !gap-2 !mb-2">
                      <Typography
                        variant="h6"
                        className="!font-semibold !text-gray-900"
                      >
                        {visit.visit_customers?.name || 'Unknown Customer'}
                      </Typography>
                      {visit.visit_customers?.code && (
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !bg-gray-200 !px-2 !py-0.5 !rounded"
                        >
                          {visit.visit_customers.code}
                        </Typography>
                      )}
                      <Chip
                        label={getStatusLabel(visit.status)}
                        size="small"
                        color={getStatusColor(visit.status) as any}
                      />
                    </div>
                    {visit.visits_salesperson && (
                      <Typography variant="body2" className="!text-gray-600">
                        Salesperson: {visit.visits_salesperson.name} (
                        {visit.visits_salesperson.email})
                      </Typography>
                    )}
                  </div>
                </div>

                <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4 !mt-4">
                  {visit.visit_date && (
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
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
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
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
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
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

                  {visit.duration && (
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
                      >
                        Duration
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {visit.duration} min
                      </Typography>
                    </div>
                  )}

                  {visit.orders_created !== null &&
                    visit.orders_created !== undefined && (
                      <div>
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !block !mb-1 !font-medium"
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
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
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
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block !mb-1 !font-medium"
                      >
                        Next Visit
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
                </div>

                {(visit.check_in_time || visit.check_out_time) && (
                  <div className="!mt-4 !pt-4 !border-t !border-gray-200">
                    <div className="!flex !items-center !gap-6">
                      {visit.check_in_time && (
                        <div className="!flex !items-center !gap-2">
                          <Clock className="w-4 h-4 text-primary-500" />
                          <div>
                            <Typography
                              variant="caption"
                              className="!text-gray-500 !block"
                            >
                              Check-in
                            </Typography>
                            <Typography
                              variant="body2"
                              className="!font-medium !text-gray-900"
                            >
                              {formatDate(
                                typeof visit.check_in_time === 'string'
                                  ? visit.check_in_time
                                  : String(visit.check_in_time || '')
                              )}
                            </Typography>
                          </div>
                        </div>
                      )}
                      {visit.check_out_time && (
                        <div className="!flex !items-center !gap-2">
                          <Clock className="w-4 h-4 text-primary-500" />
                          <div>
                            <Typography
                              variant="caption"
                              className="!text-gray-500 !block"
                            >
                              Check-out
                            </Typography>
                            <Typography
                              variant="body2"
                              className="!font-medium !text-gray-900"
                            >
                              {formatDate(
                                typeof visit.check_out_time === 'string'
                                  ? visit.check_out_time
                                  : String(visit.check_out_time || '')
                              )}
                            </Typography>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {visit.visit_notes && (
                  <div className="!mt-4 !pt-4 !border-t !border-gray-200">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !block !mb-1 !font-medium"
                    >
                      Visit Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!text-gray-700 !bg-white !p-3 !rounded !border !border-gray-200"
                    >
                      {visit.visit_notes}
                    </Typography>
                  </div>
                )}

                {visit.customer_feedback && (
                  <div className="!mt-4 !pt-4 !border-t !border-gray-200">
                    <Typography
                      variant="caption"
                      className="!text-gray-500 !block !mb-1 !font-medium"
                    >
                      Customer Feedback
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!text-gray-700 !bg-white !p-3 !rounded !border !border-gray-200"
                    >
                      {visit.customer_feedback}
                    </Typography>
                  </div>
                )}
              </div>
            ))}
          </div>
        </InfoCard>
      ) : (
        <InfoCard title="Visits History" icon={Clock}>
          <div className="!text-center !py-8 !text-gray-500">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <Typography variant="body2">
              No visits recorded for this route yet.
            </Typography>
          </div>
        </InfoCard>
      )}

      <div className="!mt-4">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
        >
          Back to Routes
        </Button>
      </div>
    </div>
  );
};

export default RouteDetail;
