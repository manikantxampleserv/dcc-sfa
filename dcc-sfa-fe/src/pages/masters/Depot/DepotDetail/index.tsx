import { CheckCircle, Settings } from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import { useDepot } from 'hooks/useDepots';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const DepotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: depotResponse,
    isLoading,
    error,
    isFetching,
  } = useDepot(Number(id));
  const depot = depotResponse?.data;

  const handleBack = () => {
    navigate('/masters/depots');
  };

  if (isLoading || isFetching) {
    return (
      <div className="!flex !items-start !gap-4">
        <div className="!flex-2 !flex !flex-col !gap-4">
          {/* Main Depot Card Skeleton */}
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

          {/* Depot Information Card Skeleton */}
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

        <div className="!flex-4 !space-y-4">
          {/* Staff Assignment Card Skeleton */}
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location Card Skeleton */}
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
                {[1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={12}
                      className="!mb-1"
                    />
                    <Skeleton variant="text" width="80%" height={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !depot) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load depot details
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
          Back to Depots
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
                  depot.is_active === 'Y' ? '!bg-green-400' : '!bg-gray-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={classNames(
                  '!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg',
                  {
                    '!bg-gradient-to-br !from-blue-400 !to-blue-600 !text-white':
                      depot.is_active === 'Y',
                    '!bg-gradient-to-br !from-gray-400 !to-gray-600 !text-white':
                      depot.is_active !== 'Y',
                  }
                )}
              >
                <Building2 className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {depot.name}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {depot.code}
            </Typography>

            <div className="!flex !justify-center !gap-2 !mb-4">
              <Chip
                icon={
                  depot.is_active === 'Y' ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <Settings fontSize="small" />
                  )
                }
                label={depot.is_active === 'Y' ? 'Active' : 'Inactive'}
                size="small"
                color={depot.is_active === 'Y' ? 'success' : 'error'}
              />
            </div>

            <div className="!space-y-1 !text-left !mt-4">
              {depot.depot_companies && (
                <div className="!p-1 !bg-gray-50 !rounded-md">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                  >
                    Company
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {depot.depot_companies.name} ({depot.depot_companies.code})
                  </Typography>
                </div>
              )}

              {depot.createdate && (
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
                      typeof depot.createdate === 'string'
                        ? depot.createdate
                        : String(depot.createdate || '')
                    )}
                  </Typography>
                </div>
              )}
            </div>
          </div>

          <InfoCard title="Depot Information" icon={Building2}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Depot Code
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {depot.code}
                </Typography>
              </div>

              {depot.depot_companies && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Company
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {depot.depot_companies.name}
                  </Typography>
                </div>
              )}

              {depot.address && (
                <div className="!space-y-0.5 md:!col-span-2">
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
                    {depot.address}
                  </Typography>
                </div>
              )}

              {depot.city && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    City
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {depot.city}
                  </Typography>
                </div>
              )}

              {depot.state && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    State
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {depot.state}
                  </Typography>
                </div>
              )}

              {depot.zipcode && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Zip Code
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {depot.zipcode}
                  </Typography>
                </div>
              )}

              {depot.phone_number && (
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
                    {depot.phone_number}
                  </Typography>
                </div>
              )}

              {depot.email && (
                <div className="!space-y-0.5">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!font-semibold !text-gray-900"
                  >
                    {depot.email}
                  </Typography>
                </div>
              )}

              {depot.createdate && (
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
                      typeof depot.createdate === 'string'
                        ? depot.createdate
                        : String(depot.createdate || '')
                    )}
                  </Typography>
                </div>
              )}

              {depot.updatedate && (
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
                      typeof depot.updatedate === 'string'
                        ? depot.updatedate
                        : String(depot.updatedate || '')
                    )}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        <div className="!flex-4 !space-y-4">
          {/* Staff Assignment */}
          <InfoCard title="Staff Assignment" icon={Users}>
            <div className="!space-y-3">
              {depot.depots_manager && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !justify-between">
                    <div className="!flex !items-center !gap-2">
                      <UserCheck className="w-5 h-5 text-primary-500" />
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          Manager
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          {depot.depots_manager.name}
                        </Typography>
                      </div>
                    </div>
                    <div className="!text-right">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block"
                      >
                        {depot.depots_manager.email}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {depot.depots_supervisior && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !justify-between">
                    <div className="!flex !items-center !gap-2">
                      <UserCheck className="w-5 h-5 text-primary-500" />
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          Supervisor
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          {depot.depots_supervisior.name}
                        </Typography>
                      </div>
                    </div>
                    <div className="!text-right">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block"
                      >
                        {depot.depots_supervisior.email}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {depot.depots_coodrinator && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <div className="!flex !items-center !justify-between">
                    <div className="!flex !items-center !gap-2">
                      <UserCheck className="w-5 h-5 text-primary-500" />
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          Coordinator
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          {depot.depots_coodrinator.name}
                        </Typography>
                      </div>
                    </div>
                    <div className="!text-right">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !block"
                      >
                        {depot.depots_coodrinator.email}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {!depot.depots_manager &&
                !depot.depots_supervisior &&
                !depot.depots_coodrinator && (
                  <div className="!text-center !py-8 !text-gray-500">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <Typography variant="body2">
                      No staff assigned to this depot yet.
                    </Typography>
                  </div>
                )}
            </div>
          </InfoCard>

          {/* Location Details */}
          <InfoCard title="Location Details" icon={MapPin}>
            <div className="!space-y-3">
              {depot.city || depot.state ? (
                <>
                  {depot.city && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <div className="!flex !items-center !justify-between">
                        <div>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            City
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            {depot.city}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  {depot.state && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <div className="!flex !items-center !justify-between">
                        <div>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            State
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            {depot.state}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  {depot.zipcode && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <div className="!flex !items-center !justify-between">
                        <div>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            Zip Code
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            {depot.zipcode}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  {(depot.latitude || depot.longitude) && (
                    <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                      <div className="!flex !items-center !justify-between">
                        <div>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            Coordinates
                          </Typography>
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            {depot.latitude && depot.longitude
                              ? `${depot.latitude}, ${depot.longitude}`
                              : depot.latitude
                                ? `Lat: ${depot.latitude}`
                                : depot.longitude
                                  ? `Lng: ${depot.longitude}`
                                  : 'Not available'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="!text-center !py-8 !text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <Typography variant="body2">
                    No location details available for this depot.
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Contact Information */}
          {(depot.email || depot.phone_number) && (
            <InfoCard title="Contact Information" icon={Mail}>
              <div className="!space-y-3">
                {depot.email && (
                  <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                    <div className="!flex !items-center !gap-2">
                      <Mail className="w-5 h-5 text-primary-500" />
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          Email
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          {depot.email}
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}

                {depot.phone_number && (
                  <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                    <div className="!flex !items-center !gap-2">
                      <Phone className="w-5 h-5 text-primary-500" />
                      <div>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          Phone Number
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-gray-500"
                        >
                          {depot.phone_number}
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      <div className="!mt-4">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
        >
          Back to Depots
        </Button>
      </div>
    </>
  );
};

export default DepotDetail;
