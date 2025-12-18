import {
  Cancel,
  CheckCircle,
  Inventory2,
  LocalOffer,
  QrCode,
  Receipt,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Package,
  Tag,
  TrendingUp,
  DollarSign,
  Percent,
  Weight,
  Droplet,
  Calendar,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'shared/Button';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { useProduct } from 'hooks/useProducts';

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
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const { data: productData, isLoading, error } = useProduct(Number(id));

  const product = productData?.data;
  const batchLots = product?.batch_lots || [];
  const inventoryStock = product?.inventory_stock || [];
  const priceHistory = product?.price_history || [];
  const orderItems = product?.order_items || [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatPercentage = (percentage: number | null | undefined) => {
    if (percentage === null || percentage === undefined) return 'N/A';
    return `${Number(percentage || '0').toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <>
        <Box className="!mb-3 !flex !items-center !gap-3">
          <Box className="!flex-1">
            <Box className="!flex !items-center !gap-3">
              <Skeleton variant="text" width={250} height={32} />
              <Skeleton
                variant="rectangular"
                width={80}
                height={24}
                className="!rounded-full"
              />
            </Box>
            <Skeleton
              variant="text"
              width={300}
              height={20}
              className="!mt-1"
            />
          </Box>
          <Skeleton variant="rectangular" width={100} height={40} />
        </Box>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map(index => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton
                variant="text"
                width={150}
                height={32}
                className="!mt-2"
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <Skeleton variant="rectangular" height={400} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="!mb-4">
        Failed to load product details. Please try again.
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert severity="warning" className="!mb-4">
        Product not found.
      </Alert>
    );
  }

  const batchLotColumns: TableColumn<any>[] = [
    {
      id: 'batch_number',
      label: 'Batch Number',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" className="!font-medium">
            {value}
          </Typography>
          {row.lot_number && (
            <Typography variant="caption" className="!text-gray-500">
              Lot: {row.lot_number}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: value => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'remaining_quantity',
      label: 'Remaining',
      render: value => (
        <Chip
          label={Number(value).toLocaleString()}
          size="small"
          color={Number(value) > 0 ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'manufacturing_date',
      label: 'Mfg Date',
      render: value => (
        <Typography variant="body2">{formatDate(value?.toString())}</Typography>
      ),
    },
    {
      id: 'expiry_date',
      label: 'Expiry Date',
      render: value => (
        <Typography variant="body2">{formatDate(value?.toString())}</Typography>
      ),
    },
  ];

  const inventoryColumns: TableColumn<any>[] = [
    {
      id: 'location_id',
      label: 'Location ID',
      render: value => <Typography variant="body2">{value}</Typography>,
    },
    {
      id: 'current_stock',
      label: 'Current Stock',
      render: value => (
        <Chip
          label={Number(value).toLocaleString()}
          size="small"
          color={Number(value) > 0 ? 'success' : 'warning'}
        />
      ),
    },
    {
      id: 'reorder_point',
      label: 'Reorder Point',
      render: value => (
        <Typography variant="body2">
          {value !== null && value !== undefined
            ? Number(value).toLocaleString()
            : 'N/A'}
        </Typography>
      ),
    },
  ];

  const priceHistoryColumns: TableColumn<any>[] = [
    {
      id: 'price',
      label: 'Price',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          {formatPrice(Number(value))}
        </Typography>
      ),
    },
    {
      id: 'effective_date',
      label: 'Effective Date',
      render: value => (
        <Typography variant="body2">{formatDate(value?.toString())}</Typography>
      ),
    },
  ];

  const orderItemsColumns: TableColumn<any>[] = [
    {
      id: 'order_id',
      label: 'Order ID',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          #{value}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: value => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      render: value => (
        <Typography variant="body2">{formatPrice(Number(value))}</Typography>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !items-center !gap-3">
        <Box className="!flex-1">
          <Box className="!flex !items-center !gap-3">
            <Typography variant="h5" className="!font-bold !text-gray-900">
              {product.name}
            </Typography>
            <Chip
              icon={product.is_active === 'Y' ? <CheckCircle /> : <Cancel />}
              label={product.is_active === 'Y' ? 'Active' : 'Inactive'}
              size="small"
              color={product.is_active === 'Y' ? 'success' : 'error'}
            />
          </Box>
          <Typography variant="body2" className="!text-gray-500 !mt-1">
            Product Code: {product.code}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate('/masters/products')}
        >
          Back to Products
        </Button>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Base Price
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {formatPrice(product.base_price)}
              </Typography>
            </div>
            <Avatar className="!bg-green-100">
              <DollarSign className="text-green-600" />
            </Avatar>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Tax Rate
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {formatPercentage(product.tax_rate)}
              </Typography>
            </div>
            <Avatar className="!bg-blue-100">
              <Percent className="text-blue-600" />
            </Avatar>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Batch Lots
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {batchLots.length}
              </Typography>
            </div>
            <Avatar className="!bg-purple-100">
              <QrCode className="text-purple-600" />
            </Avatar>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Stock Locations
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {inventoryStock.length}
              </Typography>
            </div>
            <Avatar className="!bg-orange-100">
              <Inventory2 className="text-orange-600" />
            </Avatar>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <Typography variant="h6" className="!font-bold !mb-4 !text-gray-900">
          Product Information
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Category
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {product.product_category?.category_name || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Sub-Category
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {product.product_sub_category?.sub_category_name || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Brand
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {product.product_brand?.name || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Unit of Measurement
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {product.product_unit?.name || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Tracking Type
              </Typography>
            </Box>
            <Chip
              label={product.tracking_type || 'None'}
              size="small"
              variant="outlined"
            />
          </Box>

          {product.product_type && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Product Type
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {product.product_type.name}
              </Typography>
            </Box>
          )}

          {product.product_target_group && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Target Group
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {product.product_target_group.name}
              </Typography>
            </Box>
          )}

          {product.volume && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Volume
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {product.volume.name}
              </Typography>
            </Box>
          )}

          {product.flavour && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <LocalOffer className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Flavour
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {product.flavour.name}
              </Typography>
            </Box>
          )}

          {product.shelf_life && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Shelf Life
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {product.shelf_life.name}
              </Typography>
            </Box>
          )}

          {product.vat_percentage !== null &&
            product.vat_percentage !== undefined && (
              <Box>
                <Box className="flex items-center gap-2 mb-1">
                  <Percent className="w-4 h-4 text-gray-400" />
                  <Typography variant="body2" className="!text-gray-500">
                    VAT %
                  </Typography>
                </Box>
                <Typography variant="body1" className="!font-medium">
                  {formatPercentage(product.vat_percentage)}
                </Typography>
              </Box>
            )}

          {product.weight_in_grams !== null &&
            product.weight_in_grams !== undefined && (
              <Box>
                <Box className="flex items-center gap-2 mb-1">
                  <Weight className="w-4 h-4 text-gray-400" />
                  <Typography variant="body2" className="!text-gray-500">
                    Weight
                  </Typography>
                </Box>
                <Typography variant="body1" className="!font-medium">
                  {Number(product.weight_in_grams).toLocaleString()} g
                </Typography>
              </Box>
            )}

          {product.volume_in_liters !== null &&
            product.volume_in_liters !== undefined && (
              <Box>
                <Box className="flex items-center gap-2 mb-1">
                  <Droplet className="w-4 h-4 text-gray-400" />
                  <Typography variant="body2" className="!text-gray-500">
                    Volume
                  </Typography>
                </Box>
                <Typography variant="body1" className="!font-medium">
                  {Number(product.volume_in_liters).toFixed(2)} L
                </Typography>
              </Box>
            )}

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Created Date
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {formatDate(product.createdate?.toString())}
            </Typography>
          </Box>
        </div>

        {product.description && (
          <Box className="!mt-6">
            <Typography variant="body2" className="!text-gray-500 !mb-2">
              Description
            </Typography>
            <Typography variant="body1" className="!text-gray-700">
              {product.description}
            </Typography>
          </Box>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <Box className="!border-b !border-gray-200">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="product tabs"
            className="!px-6"
          >
            <Tab
              icon={<QrCode />}
              label={`Batch Lots (${batchLots.length})`}
              iconPosition="start"
              className="!py-0"
            />
            <Tab
              icon={<Inventory2 />}
              label={`Inventory (${inventoryStock.length})`}
              iconPosition="start"
              className="!py-0"
            />
            <Tab
              icon={<LocalOffer />}
              label={`Price History (${priceHistory.length})`}
              iconPosition="start"
              className="!py-0"
            />
            <Tab
              icon={<Receipt />}
              label={`Order Items (${orderItems.length})`}
              iconPosition="start"
              className="!py-0"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Table
            data={batchLots}
            columns={batchLotColumns}
            getRowId={batch => batch.id}
            initialOrderBy="batch_number"
            emptyMessage="No batch lots found for this product"
            pagination={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Table
            data={inventoryStock}
            columns={inventoryColumns}
            getRowId={stock => stock.id}
            initialOrderBy="location_id"
            emptyMessage="No inventory stock found for this product"
            pagination={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Table
            data={priceHistory}
            columns={priceHistoryColumns}
            getRowId={price => price.id}
            initialOrderBy="effective_date"
            emptyMessage="No price history found for this product"
            pagination={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Table
            data={orderItems}
            columns={orderItemsColumns}
            getRowId={item => item.id}
            initialOrderBy="order_id"
            emptyMessage="No order items found for this product"
            pagination={false}
          />
        </TabPanel>
      </div>
    </>
  );
};

export default ProductDetail;
