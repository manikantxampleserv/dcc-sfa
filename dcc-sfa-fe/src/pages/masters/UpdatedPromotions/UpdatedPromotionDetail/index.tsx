import { CheckCircle, Block } from '@mui/icons-material';
import { Avatar, Chip, Skeleton, Typography } from '@mui/material';
import { useUpdatedPromotion } from 'hooks/useUpdatedPromotions';
import { ArrowLeft, Calendar, Info, MapPin, Package, Tag } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { formatDate } from 'utils/dateUtils';

const UpdatedPromotionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: promotionResponse,
    isLoading,
    error,
    isFetching,
  } = useUpdatedPromotion(Number(id));
  const promotion = promotionResponse?.data;

  const handleBack = () => {
    navigate('/masters/updated-promotions');
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-4">
        <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
          <Skeleton variant="text" width={200} height={32} className="!mb-4" />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </div>
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="!bg-red-50 !border !border-red-200 !rounded-lg !p-6 !mb-6">
          <Typography variant="h6" className="!text-red-800 !font-bold !mb-2">
            Failed to load updated promotion details
          </Typography>
          <Typography variant="body2" className="!text-red-600">
            Please try again or contact your system administrator if this
            problem persists.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
          className="!mt-4"
        >
          Back to Updated Promotions
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
    <div className="max-w-6xl mx-auto">
      <div className="!mb-6 !flex !items-center !gap-3">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={handleBack}
          className="!capitalize"
        >
          Back
        </Button>
        <Typography variant="h5" className="!font-bold !text-gray-900">
          Updated Promotion Details
        </Typography>
      </div>

      <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-6 !mb-6">
        <div className="lg:!col-span-2 !space-y-6">
          <InfoCard title="Promotion Information" icon={Tag}>
            <div className="!space-y-4">
              <div className="!flex !items-start !gap-4">
                <Avatar
                  alt={promotion.name}
                  className="!rounded !bg-primary-100 !text-primary-600 !w-16 !h-16"
                >
                  <Tag className="w-8 h-8" />
                </Avatar>
                <div className="!flex-1">
                  <Typography
                    variant="h5"
                    className="!font-bold !text-gray-900 !mb-1"
                  >
                    {promotion.name}
                  </Typography>
                  <Typography variant="body2" className="!text-gray-500 !mb-2">
                    Code: {promotion.code}
                  </Typography>
                  <Chip
                    icon={
                      promotion.is_active === 'Y' ? <CheckCircle /> : <Block />
                    }
                    label={promotion.is_active === 'Y' ? 'Active' : 'Inactive'}
                    size="small"
                    color={promotion.is_active === 'Y' ? 'success' : 'error'}
                  />
                </div>
              </div>

              {promotion.description && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <Typography
                    variant="body2"
                    className="!text-gray-700 !whitespace-pre-wrap"
                  >
                    {promotion.description}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard title="Period & Dates" icon={Calendar}>
            <div className="!space-y-3">
              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !block !mb-1"
                >
                  Start Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!text-gray-900 !font-medium"
                >
                  {formatDate(promotion.start_date)}
                </Typography>
              </div>
              <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !block !mb-1"
                >
                  Finish Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!text-gray-900 !font-medium"
                >
                  {formatDate(promotion.end_date)}
                </Typography>
              </div>
            </div>
          </InfoCard>

          {promotion.conditions && promotion.conditions.length > 0 && (
            <InfoCard title="Product Conditions" icon={Package}>
              <div className="!space-y-4">
                {promotion.conditions.map((condition: any) => (
                  <div
                    key={condition.id}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <Typography
                      variant="body2"
                      className="!text-gray-900 !font-medium !mb-2"
                    >
                      {condition.condition_type} - {condition.applies_to_type}
                    </Typography>
                    {condition.promotion_condition_products &&
                      condition.promotion_condition_products.length > 0 && (
                        <div className="!space-y-1">
                          {condition.promotion_condition_products.map(
                            (product: any) => (
                              <Typography
                                key={product.id}
                                variant="caption"
                                className="!text-gray-600"
                              >
                                Min: {product.condition_quantity}
                              </Typography>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>

        <div className="!space-y-6">
          <InfoCard title="Locations" icon={MapPin}>
            <div className="!space-y-4">
              {promotion.depots && promotion.depots.length > 0 && (
                <div>
                  <Typography
                    variant="subtitle2"
                    className="!font-medium !text-gray-700 !mb-2"
                  >
                    Depots ({promotion.depots.length})
                  </Typography>
                  <div className="!space-y-2">
                    {promotion.depots.map(depot => (
                      <div
                        key={depot.id}
                        className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                      >
                        <Typography
                          variant="body2"
                          className="!text-gray-900 !font-medium"
                        >
                          {depot.depots?.name || `Depot ID: ${depot.depot_id}`}
                        </Typography>
                        {depot.depots?.code && (
                          <Typography
                            variant="caption"
                            className="!text-gray-500"
                          >
                            Code: {depot.depots.code}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {promotion.routes && promotion.routes.length > 0 && (
                <div>
                  <Typography
                    variant="subtitle2"
                    className="!font-medium !text-gray-700 !mb-2"
                  >
                    Routes ({promotion.routes.length})
                  </Typography>
                  <div className="!space-y-2">
                    {promotion.routes.map((route: any) => (
                      <div
                        key={route.id}
                        className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                      >
                        <Typography
                          variant="body2"
                          className="!text-gray-900 !font-medium"
                        >
                          Route ID: {route.route_id}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {promotion.customer_categories &&
                promotion.customer_categories.length > 0 && (
                  <div>
                    <Typography
                      variant="subtitle2"
                      className="!font-medium !text-gray-700 !mb-2"
                    >
                      Customer Categories (
                      {promotion.customer_categories.length})
                    </Typography>
                    <div className="!space-y-2">
                      {promotion.customer_categories.map((category: any) => (
                        <div
                          key={category.id}
                          className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                        >
                          <Typography
                            variant="body2"
                            className="!text-gray-900 !font-medium"
                          >
                            Category ID: {category.customer_category_id}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {(!promotion.depots || promotion.depots.length === 0) &&
                (!promotion.routes || promotion.routes.length === 0) &&
                (!promotion.customer_categories ||
                  promotion.customer_categories.length === 0) && (
                  <Typography variant="body2" className="!text-gray-500">
                    No locations assigned
                  </Typography>
                )}
            </div>
          </InfoCard>

          {promotion.levels && promotion.levels.length > 0 && (
            <InfoCard title="Levels & Benefits" icon={Info}>
              <div className="!space-y-4">
                {promotion.levels.map((level: any) => (
                  <div
                    key={level.id}
                    className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200"
                  >
                    <Typography
                      variant="body2"
                      className="!text-gray-900 !font-medium !mb-2"
                    >
                      Level {level.level_number} - Threshold:{' '}
                      {level.threshold_value}
                    </Typography>
                    <Typography variant="caption" className="!text-gray-600">
                      Discount: {level.discount_type} - {level.discount_value}
                    </Typography>
                    {level.promotion_benefit_level &&
                      level.promotion_benefit_level.length > 0 && (
                        <div className="!mt-2 !space-y-1">
                          {level.promotion_benefit_level.map((benefit: any) => (
                            <Typography
                              key={benefit.id}
                              variant="caption"
                              className="!text-gray-600 !block"
                            >
                              Benefit: {benefit.benefit_type} -{' '}
                              {benefit.benefit_value}
                            </Typography>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          <InfoCard title="Metadata" icon={Info}>
            <div className="!space-y-3">
              {promotion.createdate && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !block !mb-1"
                  >
                    Created Date
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!text-gray-900 !font-medium"
                  >
                    {formatDate(promotion.createdate.toString())}
                  </Typography>
                </div>
              )}

              {promotion.updatedate && (
                <div className="!p-3 !bg-gray-50 !rounded-md !border !border-gray-200">
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !block !mb-1"
                  >
                    Last Updated
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!text-gray-900 !font-medium"
                  >
                    {formatDate(promotion.updatedate.toString())}
                  </Typography>
                </div>
              )}
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default UpdatedPromotionDetail;
