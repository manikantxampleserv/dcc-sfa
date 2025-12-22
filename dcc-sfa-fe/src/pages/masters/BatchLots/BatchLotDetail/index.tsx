import { Block, CheckCircle, Warning } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, Skeleton, Typography } from '@mui/material';
import { useBatchLot } from 'hooks/useBatchLots';
import {
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Package2,
  Truck,
  User,
  AlertTriangle,
  Archive,
  Tag,
} from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const BatchLotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: batchLotData, isLoading, error } = useBatchLot(Number(id));

  const batchLot = batchLotData?.data;
  const products = batchLot?.products || [];

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

        <Skeleton
          variant="rectangular"
          height={400}
          className="!rounded-lg !shadow !border !border-gray-200"
        />
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

  //  {
  //               "id": 22,
  //               "name": "BULK WATER 12 Ltr",
  //               "code": "KD005",
  //               "base_price": null,
  //               "quantity": 100,
  //               "volume": {
  //                   "id": 7,
  //                   "name": "12 Ltr",
  //                   "code": "VOL-12L-001"
  //               },
  //               "brand": {
  //                   "id": 8,
  //                   "name": "KILIMANJARO"
  //               },
  //               "category": {
  //                   "id": 2,
  //                   "name": "KDW"
  //               },
  //               "sub_category": {
  //                   "id": 7,
  //                   "name": "BULK WATER 12 LTR"
  //               }
  //           },

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
      id: 'category',
      label: 'Category',
      render: (_, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.category?.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          >
            <Tag className="w-5 h-5" />
          </Avatar>
          <Box>
            <Typography variant="body2" className="!font-medium">
              {row.category?.name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.sub_category?.name}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'volume',
      label: 'Volume',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          {value?.name}
        </Typography>
      ),
    },
    {
      id: 'brand',
      label: 'Brand',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          {value?.name}
        </Typography>
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
      id: 'base_price',
      label: 'Base Price',
      render: value => (
        <Typography variant="body2" className="!font-medium">
          {formatPrice(Number(value))}
        </Typography>
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
              <Archive className="text-green-600" />
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
                Expiry Status
              </Typography>
              <Typography variant="h6" className="!font-bold !text-gray-900">
                {expiryStatus.label}
              </Typography>
            </div>
            <Avatar
              className={`!bg-${expiryStatus.color === 'error' ? 'red' : expiryStatus.color === 'warning' ? 'orange' : 'green'}-100`}
            >
              <AlertTriangle
                className={`text-${expiryStatus.color === 'error' ? 'red' : expiryStatus.color === 'warning' ? 'orange' : 'green'}-600`}
              />
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

      <Table
        data={products}
        columns={productColumns}
        getRowId={product => product.id}
        initialOrderBy="name"
        emptyMessage="No products found for this batch lot"
        pagination={false}
      />
    </>
  );
};

export default BatchLotDetail;
