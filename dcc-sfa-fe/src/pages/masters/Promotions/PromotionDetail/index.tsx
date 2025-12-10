import {
  Block,
  CardGiftcard,
  CheckCircle,
  Inventory,
  People,
  Tag,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  useActivatePromotion,
  useApplyPromotion,
  useCalculateEligiblePromotions,
  useDeactivatePromotion,
  usePromotion,
  useSettlePeriodPromotion,
} from 'hooks/usePromotions';
import { Activity, ArrowLeft, Calendar, Info } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import Table from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { formatLabel } from 'utils/stringUtils';
import UpdatedManagePromotion from '../ManagePromotion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`promotion-tabpanel-${index}`}
      aria-labelledby={`promotion-tab-${index}`}
      {...other}
    >
      {value === index && <Box className="!p-3">{children}</Box>}
    </div>
  );
}

const PromotionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);

  const {
    data: promotionResponse,
    isLoading,
    error,
  } = usePromotion(Number(id));

  const promotion = promotionResponse?.data;
  const promotionId = Number(id);

  const activateMutation = useActivatePromotion(promotionId, {
    onSuccess: () => {
      console.log('Promotion activated successfully');
    },
  });

  const deactivateMutation = useDeactivatePromotion(promotionId, {
    onSuccess: () => {
      console.log('Promotion deactivated successfully');
    },
  });

  const calculateMutation = useCalculateEligiblePromotions({
    onSuccess: data => {
      console.log('Eligible promotions calculated:', data);
    },
  });

  const applyMutation = useApplyPromotion({
    onSuccess: data => {
      console.log('Promotion applied successfully:', data);
    },
  });

  const settleMutation = useSettlePeriodPromotion(promotionId, {
    onSuccess: data => {
      console.log('Period promotion settled successfully:', data);
    },
  });

  const handleBack = () => {
    navigate('/masters/promotions');
  };

  const handleEdit = () => {
    setSelectedPromotion(promotion);
    setDrawerOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleActivateDeactivate = () => {
    if (promotion?.is_active === 'Y') {
      deactivateMutation.mutate(undefined);
    } else {
      activateMutation.mutate(undefined);
    }
  };

  const handleCalculateEligible = () => {
    console.warn(
      'Calculate Eligible Promotions requires order data. This feature needs additional implementation.'
    );
  };

  const handleApply = () => {
    console.warn(
      'Apply Promotion requires order data. This feature needs additional implementation.'
    );
  };

  const handleSettlePeriod = () => {
    console.warn(
      'Settle Period Promotion requires period dates and customer IDs. This feature needs additional implementation.'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex-2">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
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
          </div>
        </div>
        <div className="flex-4 !space-y-4">
          {[1, 2, 3].map(card => (
            <div
              key={card}
              className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6"
            >
              <Skeleton variant="text" width={200} height={24} />
              <Skeleton
                variant="text"
                width="100%"
                height={16}
                className="!mt-2"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Warning className="w-5 h-5" />
            <Typography variant="h6" className="!text-white !font-bold">
              Failed to load promotion details
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
          Back to Promotions
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
      <Box className="!mb-3 !flex !items-center !gap-3">
        <Box className="!flex-1">
          <Box className="!flex !items-center !gap-3">
            <Typography variant="h5" className="!font-bold !text-gray-900">
              {promotion.name}
            </Typography>
            <Chip
              icon={promotion.is_active === 'Y' ? <CheckCircle /> : <Block />}
              label={promotion.is_active === 'Y' ? 'Active' : 'Inactive'}
              size="small"
              color={promotion.is_active === 'Y' ? 'success' : 'error'}
            />
            <Chip label={promotion.code} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" className="!text-gray-500 !mt-1">
            {promotion.description || 'No description provided'}
          </Typography>
        </Box>
        <Box className="!flex !gap-2">
          <EditButton onClick={handleEdit} tooltip="Edit promotion" />
          <DeleteButton
            onClick={() => {}}
            tooltip="Delete promotion"
            confirmDelete={true}
            itemName="promotion"
          />
        </Box>
      </Box>

      <div className="flex items-start gap-4">
        <div className="!flex-2 flex flex-col gap-4">
          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6 !text-center !relative">
            <div className="absolute top-3 right-3">
              <div
                className={`!w-2.5 !h-2.5 !rounded-full ${
                  promotion.is_active === 'Y' ? '!bg-green-400' : '!bg-red-400'
                }`}
              ></div>
            </div>

            <div className="!relative !mb-4">
              <Avatar
                className={`!w-24 !h-24 !mx-auto !text-xl !font-bold !border-3 !border-white !shadow-lg ${
                  promotion.is_active === 'Y'
                    ? '!bg-gradient-to-br !from-green-400 !to-green-600 !text-white'
                    : '!bg-gradient-to-br !from-red-400 !to-red-600 !text-white'
                }`}
              >
                <Tag className="!w-8 !h-8" />
              </Avatar>
            </div>

            <Typography
              variant="h6"
              className="!font-bold !text-gray-900 !mb-1"
            >
              {promotion.name}
            </Typography>

            <Typography variant="body2" className="!text-gray-600 !mb-3">
              {promotion.code}
            </Typography>

            <Chip
              icon={promotion.is_active === 'Y' ? <CheckCircle /> : <Block />}
              color={promotion.is_active === 'Y' ? 'success' : 'error'}
              label={promotion.is_active === 'Y' ? 'Active' : 'Inactive'}
              size="small"
            />

            <div className="!space-y-1 !text-left !mt-4">
              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  Start Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(promotion.start_date)}
                </Typography>
              </div>

              <div className="!p-1 !bg-gray-50 !rounded-md">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide !mb-0.5"
                >
                  End Date
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {formatDate(promotion.end_date)}
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
                  {promotion.createdate
                    ? formatDate(promotion.createdate.toString())
                    : 'N/A'}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <div className="!flex-4 !space-y-4">
          <InfoCard title="Promotion Information" icon={Info}>
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Type
                </Typography>
                <Typography
                  variant="body2"
                  className="!font-semibold !text-gray-900"
                >
                  {promotion.type || 'N/A'}
                </Typography>
              </div>

              <div className="!space-y-0.5">
                <Typography
                  variant="caption"
                  className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                >
                  Status
                </Typography>
                <div className="!mt-1">
                  <Chip
                    icon={
                      promotion.is_active === 'Y' ? <CheckCircle /> : <Block />
                    }
                    color={promotion.is_active === 'Y' ? 'success' : 'error'}
                    label={promotion.is_active === 'Y' ? 'Active' : 'Inactive'}
                    size="small"
                  />
                </div>
              </div>

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
                  {promotion.description || 'No description provided'}
                </Typography>
              </div>
            </div>
          </InfoCard>

          <div className="!bg-white !rounded-lg !shadow !border !border-gray-200">
            <Box>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                className="!min-h-0"
                visibleScrollbar
                sx={{
                  '& .MuiTab-root': {
                    minHeight: '36px',
                    padding: '10px 12px',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    '& .MuiTab-iconWrapper': {
                      marginRight: '6px',
                      fontSize: '1rem',
                    },
                  },
                }}
              >
                <Tab icon={<Info />} label="Overview" iconPosition="start" />
                <Tab
                  icon={<People />}
                  label={`Eligibility (${(promotion.depots?.length || 0) + (promotion.salespersons?.length || 0) + (promotion.routes?.length || 0) + (promotion.zones?.length || 0)})`}
                  iconPosition="start"
                />
                <Tab
                  icon={<Inventory />}
                  label={`Conditions (${promotion.conditions?.length || 0})`}
                  iconPosition="start"
                />
                <Tab
                  icon={<CardGiftcard />}
                  label={`Levels & Benefits (${promotion.levels?.length || 0})`}
                  iconPosition="start"
                />
                <Tab icon={<Activity />} label="Actions" iconPosition="start" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <div className="!space-y-4">
                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Channels & Platforms
                  </Typography>
                  {promotion.channels && promotion.channels.length > 0 ? (
                    <div className="!flex !flex-wrap !gap-2">
                      {promotion.channels.map((channel: any) => (
                        <Chip
                          key={channel.id}
                          label={channel.channel_type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body2" className="!text-gray-500">
                      No channels assigned
                    </Typography>
                  )}
                </Paper>

                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Period Information
                  </Typography>
                  <div className="!grid !grid-cols-2 !gap-4">
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase"
                      >
                        Start Date
                      </Typography>
                      <Typography variant="body2" className="!font-semibold">
                        {formatDate(promotion.start_date)}
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase"
                      >
                        End Date
                      </Typography>
                      <Typography variant="body2" className="!font-semibold">
                        {formatDate(promotion.end_date)}
                      </Typography>
                    </div>
                  </div>
                </Paper>
              </div>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <div className="!space-y-4">
                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Depots ({promotion.depots?.length || 0})
                  </Typography>
                  {promotion.depots && promotion.depots.length > 0 ? (
                    <Table
                      data={promotion.depots.map((depot: any) => ({
                        id: depot.id,
                        name: depot.depots?.name || 'N/A',
                        code: depot.depots?.code || 'N/A',
                      }))}
                      columns={[
                        { id: 'name', label: 'Depot Name' },
                        { id: 'code', label: 'Code' },
                      ]}
                      pagination={false}
                      sortable={false}
                    />
                  ) : (
                    <Typography variant="body2" className="!text-gray-500">
                      No depots assigned
                    </Typography>
                  )}
                </Paper>

                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Salespersons ({promotion.salespersons?.length || 0})
                  </Typography>
                  {promotion.salespersons &&
                  promotion.salespersons.length > 0 ? (
                    <Table
                      data={promotion.salespersons.map((salesperson: any) => ({
                        id: salesperson.id,
                        name:
                          salesperson.promotion_salesperson_users?.name ||
                          'N/A',
                        email:
                          salesperson.promotion_salesperson_users?.email ||
                          'N/A',
                      }))}
                      columns={[
                        { id: 'name', label: 'Name' },
                        { id: 'email', label: 'Email' },
                      ]}
                      pagination={false}
                      sortable={false}
                    />
                  ) : (
                    <Typography variant="body2" className="!text-gray-500">
                      No salespersons assigned
                    </Typography>
                  )}
                </Paper>

                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Routes ({promotion.routes?.length || 0})
                  </Typography>
                  {promotion.routes && promotion.routes.length > 0 ? (
                    <Table
                      data={promotion.routes.map((route: any) => ({
                        id: route.id,
                        name: route.promotion_route?.name || 'N/A',
                        code: route.promotion_route?.code || 'N/A',
                      }))}
                      columns={[
                        { id: 'name', label: 'Route Name' },
                        { id: 'code', label: 'Code' },
                      ]}
                      pagination={false}
                      sortable={false}
                    />
                  ) : (
                    <Typography variant="body2" className="!text-gray-500">
                      No routes assigned
                    </Typography>
                  )}
                </Paper>

                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Zones ({promotion.zones?.length || 0})
                  </Typography>
                  {promotion.zones && promotion.zones.length > 0 ? (
                    <Table
                      data={promotion.zones.map((zone: any) => ({
                        id: zone.id,
                        name: zone.promotion_zones_zones?.name || 'N/A',
                        code: zone.promotion_zones_zones?.code || 'N/A',
                      }))}
                      columns={[
                        { id: 'name', label: 'Zone Name' },
                        { id: 'code', label: 'Code' },
                      ]}
                      pagination={false}
                      sortable={false}
                    />
                  ) : (
                    <Typography variant="body2" className="!text-gray-500">
                      No zones assigned
                    </Typography>
                  )}
                </Paper>

                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Customer Categories (
                    {promotion.customer_categories?.length || 0})
                  </Typography>
                  {promotion.customer_categories &&
                  promotion.customer_categories.length > 0 ? (
                    <Table
                      data={promotion.customer_categories.map(
                        (category: any) => ({
                          id: category.id,
                          name:
                            category.promotion_customer_categorys
                              ?.category_name || 'N/A',
                          code:
                            category.promotion_customer_categorys
                              ?.category_code || 'N/A',
                        })
                      )}
                      columns={[
                        { id: 'name', label: 'Category Name' },
                        { id: 'code', label: 'Code' },
                      ]}
                      pagination={false}
                      sortable={false}
                    />
                  ) : (
                    <Typography variant="body2" className="!text-gray-500">
                      No customer categories assigned
                    </Typography>
                  )}
                </Paper>

                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Customer Exclusions (
                    {promotion.customer_exclusions?.length || 0})
                  </Typography>
                  {promotion.customer_exclusions &&
                  promotion.customer_exclusions.length > 0 ? (
                    <Typography variant="body2">
                      {promotion.customer_exclusions.length} customer(s)
                      excluded
                    </Typography>
                  ) : (
                    <Typography variant="body2" className="!text-gray-500">
                      No customer exclusions
                    </Typography>
                  )}
                </Paper>
              </div>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <div className="!space-y-4">
                {promotion.conditions && promotion.conditions.length > 0 ? (
                  promotion.conditions.map((condition: any) => (
                    <Paper
                      key={condition.id}
                      className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200"
                    >
                      <Typography variant="h6" className="!font-semibold !mb-3">
                        Condition {condition.id}
                      </Typography>
                      <div className="!grid !grid-cols-2 !gap-4 !mb-3">
                        <div>
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase"
                          >
                            Type
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold"
                          >
                            {formatLabel(condition.condition_type)}
                          </Typography>
                        </div>
                        <div>
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase"
                          >
                            Applies To
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold"
                          >
                            {formatLabel(condition.applies_to_type)}
                          </Typography>
                        </div>
                        <div>
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase"
                          >
                            Min Value
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold"
                          >
                            {condition.min_value}
                          </Typography>
                        </div>
                      </div>
                      {condition.promotion_condition_products &&
                      condition.promotion_condition_products.length > 0 ? (
                        <Table
                          data={condition.promotion_condition_products.map(
                            (product: any) => ({
                              id: product.id,
                              type: formatLabel(condition.condition_type),
                              product_group:
                                product.product_group ||
                                (product.product_id
                                  ? `Product ID: ${product.product_id}`
                                  : product.category_id
                                    ? `Category ID: ${product.category_id}`
                                    : 'N/A'),
                              at_least: product.condition_quantity,
                            })
                          )}
                          columns={[
                            { id: 'type', label: 'Type' },
                            { id: 'product_group', label: 'Product/Category' },
                            { id: 'at_least', label: 'At least' },
                          ]}
                          pagination={false}
                          sortable={false}
                        />
                      ) : null}
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" className="!text-gray-500">
                    No conditions defined
                  </Typography>
                )}
              </div>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <div className="!space-y-4">
                {promotion.levels && promotion.levels.length > 0 ? (
                  promotion.levels.map((level: any, _idx: number) => (
                    <Paper
                      key={level.id}
                      className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200"
                    >
                      <Typography variant="h6" className="!font-semibold !mb-3">
                        Level {level.level_number}
                      </Typography>
                      <div className="!grid !grid-cols-2 !gap-4 !mb-3">
                        <div>
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase"
                          >
                            Threshold Value
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold"
                          >
                            {level.threshold_value}
                          </Typography>
                        </div>
                        <div>
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase"
                          >
                            Discount Type
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold"
                          >
                            {formatLabel(level.discount_type)}
                          </Typography>
                        </div>
                        <div>
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase"
                          >
                            Discount Value
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold"
                          >
                            {level.discount_value}
                          </Typography>
                        </div>
                      </div>
                      {level.promotion_benefit_level &&
                      level.promotion_benefit_level.length > 0 ? (
                        <div>
                          <Typography variant="subtitle2" className="!mb-2">
                            Benefits:
                          </Typography>
                          <Table
                            data={level.promotion_benefit_level.map(
                              (benefit: any) => ({
                                id: benefit.id,
                                type: benefit.benefit_type,
                                product:
                                  benefit.promotion_benefit_products?.name ||
                                  'N/A',
                                value: benefit.benefit_value,
                                gift_limit: benefit.gift_limit,
                              })
                            )}
                            columns={[
                              {
                                id: 'type',
                                label: 'Type',
                                render: (value: string) => formatLabel(value),
                              },
                              { id: 'product', label: 'Product' },
                              { id: 'value', label: 'Value' },
                              { id: 'gift_limit', label: 'Gift Limit' },
                            ]}
                            pagination={false}
                            sortable={false}
                          />
                        </div>
                      ) : null}
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" className="!text-gray-500">
                    No levels defined
                  </Typography>
                )}
              </div>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <div className="!space-y-4">
                <Paper className="!p-4 !rounded-lg !shadow-sm !border !bg-white !border-gray-200">
                  <Typography variant="h6" className="!font-semibold !mb-3">
                    Promotion Actions
                  </Typography>
                  <div className="!space-y-2">
                    <Button
                      variant={
                        promotion.is_active === 'Y' ? 'outlined' : 'contained'
                      }
                      startIcon={
                        promotion.is_active === 'Y' ? (
                          <Block />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      fullWidth
                      onClick={handleActivateDeactivate}
                      disabled={
                        activateMutation.isPending ||
                        deactivateMutation.isPending
                      }
                    >
                      {activateMutation.isPending ||
                      deactivateMutation.isPending
                        ? 'Processing...'
                        : promotion.is_active === 'Y'
                          ? 'Deactivate Promotion'
                          : 'Activate Promotion'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      fullWidth
                      onClick={handleCalculateEligible}
                      disabled={calculateMutation.isPending}
                    >
                      {calculateMutation.isPending
                        ? 'Calculating...'
                        : 'Calculate Eligible Promotions'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      fullWidth
                      onClick={handleApply}
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending
                        ? 'Applying...'
                        : 'Apply Promotion'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Calendar />}
                      fullWidth
                      onClick={handleSettlePeriod}
                      disabled={settleMutation.isPending}
                    >
                      {settleMutation.isPending
                        ? 'Settling...'
                        : 'Settle Period Promotion'}
                    </Button>
                  </div>
                </Paper>
              </div>
            </TabPanel>
          </div>
        </div>
      </div>

      <UpdatedManagePromotion
        selectedPromotion={selectedPromotion}
        setSelectedPromotion={setSelectedPromotion}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default PromotionDetail;
