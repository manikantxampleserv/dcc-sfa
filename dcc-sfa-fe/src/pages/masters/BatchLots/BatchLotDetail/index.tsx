import {
  Block,
  CheckCircle,
  Inventory2,
  LocalOffer,
  Warning,
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
  Archive,
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Package2,
  TrendingUp,
  Truck,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { useBatchLot } from 'hooks/useBatchLots';

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
      id={`batchlot-tabpanel-${index}`}
      aria-labelledby={`batchlot-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const BatchLotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const { data: batchLotData, isLoading, error } = useBatchLot(Number(id));

  const batchLot = batchLotData?.data;
  const products = batchLot?.products || [];
  const serialNumbers = batchLot?.serial_numbers || [];
  const stockMovements = batchLot?.stock_movements || [];

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

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        color: 'error',
        label: 'Expired',
        icon: <Block />,
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: 'expiring',
        color: 'warning',
        label: `Expiring in ${daysUntilExpiry} days`,
        icon: <Warning />,
      };
    }
    return {
      status: 'valid',
      color: 'success',
      label: 'Valid',
      icon: <CheckCircle />,
    };
  };

  const getQualityGradeColor = (grade?: string | null) => {
    switch (grade) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
      case 'F':
        return 'error';
      default:
        return 'default';
    }
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
          <Skeleton variant="rectangular" width={150} height={40} />
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
        Failed to load batch lot details. Please try again.
      </Alert>
    );
  }

  if (!batchLot) {
    return (
      <Alert severity="warning" className="!mb-4">
        Batch lot not found.
      </Alert>
    );
  }

  const expiryStatus = getExpiryStatus(batchLot.expiry_date);

  const productColumns: TableColumn<any>[] = [
    {
      id: 'name',
      label: 'Product Info',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Package className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography variant="body2" className="!font-medium">
              {row.name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'base_price',
      label: 'Base Price',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          {formatPrice(Number(value))}
        </Typography>
      ),
    },
  ];

  const serialNumberColumns: TableColumn<any>[] = [
    {
      id: 'serial_number',
      label: 'Serial Number',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          {value}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: value => (
        <Chip
          label={value || 'Available'}
          size="small"
          color={value === 'Sold' ? 'error' : 'success'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'sold_date',
      label: 'Sold Date',
      render: value => (
        <Typography variant="body2">
          {value ? formatDate(value?.toString()) : 'N/A'}
        </Typography>
      ),
    },
  ];

  const stockMovementColumns: TableColumn<any>[] = [
    {
      id: 'movement_type',
      label: 'Type',
      render: value => (
        <Chip
          label={value}
          size="small"
          color={value === 'IN' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          {Number(value).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'movement_date',
      label: 'Date',
      render: value => (
        <Typography variant="body2">{formatDate(value?.toString())}</Typography>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !items-center !gap-3">
        <Box className="!flex-1">
          <Box className="!flex !items-center !gap-3">
            <Typography variant="h5" className="!font-bold !text-gray-900">
              {batchLot.batch_number}
            </Typography>
            <Chip
              icon={batchLot.is_active === 'Y' ? <CheckCircle /> : <Block />}
              label={batchLot.is_active === 'Y' ? 'Active' : 'Inactive'}
              size="small"
              color={batchLot.is_active === 'Y' ? 'success' : 'error'}
            />
            <Chip
              icon={expiryStatus.icon}
              label={expiryStatus.label}
              size="small"
              color={expiryStatus.color as any}
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" className="!text-gray-500 !mt-1">
            {batchLot.lot_number && `Lot Number: ${batchLot.lot_number}`}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate('/masters/batch-lots')}
        >
          Back to Batch Lots
        </Button>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Total Quantity
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {batchLot.quantity.toLocaleString()}
              </Typography>
            </div>
            <Avatar className="!bg-blue-100">
              <Package2 className="text-blue-600" />
            </Avatar>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Remaining
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {batchLot.remaining_quantity.toLocaleString()}
              </Typography>
            </div>
            <Avatar className="!bg-green-100">
              <Inventory2 className="text-green-600" />
            </Avatar>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Products
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {products.length}
              </Typography>
            </div>
            <Avatar className="!bg-purple-100">
              <Package className="text-purple-600" />
            </Avatar>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="!text-gray-500 !mb-2">
                Quality Grade
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                Grade {batchLot.quality_grade || 'N/A'}
              </Typography>
            </div>
            <Avatar className="!bg-orange-100">
              <TrendingUp className="text-orange-600" />
            </Avatar>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <Typography variant="h6" className="!font-bold !mb-4 !text-gray-900">
          Batch Lot Information
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Manufacturing Date
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {formatDate(batchLot.manufacturing_date?.toString())}
            </Typography>
          </Box>

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Expiry Date
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {formatDate(batchLot.expiry_date?.toString())}
            </Typography>
          </Box>

          {batchLot.supplier_name && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Supplier
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {batchLot.supplier_name}
              </Typography>
            </Box>
          )}

          {batchLot.purchase_price && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Purchase Price
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {formatPrice(Number(batchLot.purchase_price))}
              </Typography>
            </Box>
          )}

          {batchLot.storage_location && (
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <Typography variant="body2" className="!text-gray-500">
                  Storage Location
                </Typography>
              </Box>
              <Typography variant="body1" className="!font-medium">
                {batchLot.storage_location}
              </Typography>
            </Box>
          )}

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <LocalOffer className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Quality Grade
              </Typography>
            </Box>
            <Chip
              label={`Grade ${batchLot.quality_grade || 'N/A'}`}
              size="small"
              color={getQualityGradeColor(batchLot.quality_grade) as any}
              variant="filled"
            />
          </Box>

          <Box>
            <Box className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-400" />
              <Typography variant="body2" className="!text-gray-500">
                Created Date
              </Typography>
            </Box>
            <Typography variant="body1" className="!font-medium">
              {formatDate(batchLot.createdate?.toString())}
            </Typography>
          </Box>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <Box className="!border-b !border-gray-200">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="batch lot tabs"
            className="!px-6"
          >
            <Tab
              icon={<Package />}
              label={`Products (${products.length})`}
              iconPosition="start"
              className="!py-0"
            />
            <Tab
              icon={<Archive />}
              label={`Serial Numbers (${serialNumbers.length})`}
              iconPosition="start"
              className="!py-0"
            />
            <Tab
              icon={<TrendingUp />}
              label={`Stock Movements (${stockMovements.length})`}
              iconPosition="start"
              className="!py-0"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Table
            data={products}
            columns={productColumns}
            getRowId={product => product.id}
            initialOrderBy="name"
            emptyMessage="No products found for this batch lot"
            pagination={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Table
            data={serialNumbers}
            columns={serialNumberColumns}
            getRowId={serial => serial.id}
            initialOrderBy="serial_number"
            emptyMessage="No serial numbers found for this batch lot"
            pagination={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Table
            data={stockMovements}
            columns={stockMovementColumns}
            getRowId={movement => movement.id}
            initialOrderBy="movement_date"
            emptyMessage="No stock movements found for this batch lot"
            pagination={false}
          />
        </TabPanel>
      </div>
    </>
  );
};

export default BatchLotDetail;
