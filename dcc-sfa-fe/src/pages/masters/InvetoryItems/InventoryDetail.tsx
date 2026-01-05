import {
  Avatar,
  Box,
  Chip,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  type ChipProps,
} from '@mui/material';
import { useInventoryItemById } from 'hooks/useInventoryItems';
import {
  AlertTriangle,
  Calendar,
  Fingerprint,
  Layers,
  Mail,
  MapPin,
  Package,
  Phone,
  TrendingUp,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import type {
  BatchInfo,
  ProductInventory,
  SalespersonInventoryData,
  SerialInfo,
} from 'services/masters/VanInventoryItems';

const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white shadow-sm rounded-lg border border-gray-100 p-6 flex flex-col gap-4"
      >
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={100} height={24} />
        </div>
        <Skeleton variant="rectangular" width={60} height={28} />
      </div>
    ))}
  </div>
);

const SalespersonCardSkeleton = () => (
  <div className="bg-white mb-5 shadow-sm rounded-lg border border-gray-100 p-6">
    <div className="flex items-start gap-6">
      <Skeleton variant="circular" width={80} height={80} />
      <div className="flex-1">
        <div className="flex items-start gap-4 mb-4 justify-between">
          <div>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="text" width={120} height={20} />
          </div>
          <Skeleton variant="rectangular" width={64} height={28} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={90} height={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TabsSkeleton = () => (
  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width={120}
          height={40}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </div>
  </Box>
);

const ProductsTabSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white shadow-sm rounded-lg border border-gray-100 p-4 flex flex-col"
      >
        <div className="flex items-start justify-between mb-4 pb-0">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div>
              <Skeleton variant="text" width={90} height={18} />
              <Skeleton variant="text" width={54} height={14} />
            </div>
          </div>
          <Skeleton
            variant="rectangular"
            width={64}
            height={24}
            sx={{ borderRadius: 16 }}
          />
        </div>
        <div className="space-y-1 pb-3 px-2">
          {Array.from({ length: 5 }).map((_, j) => (
            <div className="flex items-center justify-between my-1" key={j}>
              <Skeleton variant="text" width={100} height={17} />
              <Skeleton variant="text" width={32} height={17} />
            </div>
          ))}
        </div>
        <Skeleton
          variant="rectangular"
          width="90%"
          height={18}
          sx={{ mx: 2, my: 1, borderRadius: 2 }}
        />
      </div>
    ))}
  </div>
);

const TableSkeleton = ({
  columns = 6,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-1 py-3 w-full mb-3">
    <div className="flex gap-2 mb-2">
      {Array.from({ length: columns }).map((_, ci) => (
        <Skeleton key={ci} width={90} height={18} sx={{ borderRadius: 2 }} />
      ))}
    </div>
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-2">
          {Array.from({ length: columns }).map((_, ci) => (
            <Skeleton
              key={ci}
              width={90}
              height={18}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3, px: 0 }}>{children}</Box>}
    </div>
  );
}

const getStatusColor = (status: string): ChipProps['color'] => {
  switch (status) {
    case 'active':
      return 'success';
    case 'expiring_soon':
      return 'warning';
    case 'expired':
      return 'error';
    default:
      return 'default';
  }
};

const getStockStatus = (quantity: number) => {
  if (quantity === 0)
    return { status: 'out_of_stock', color: 'error', label: 'Out of Stock' };
  if (quantity <= 10)
    return { status: 'low_stock', color: 'warning', label: 'Low Stock' };
  return { status: 'in_stock', color: 'success', label: 'In Stock' };
};

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const inventoryId = id ? Number(id) : undefined;
  const {
    data: inventoryData,
    isLoading,
    error,
  } = useInventoryItemById(inventoryId as number, {
    enabled: inventoryId !== undefined,
  });

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue),
    []
  );

  const handleBack = useCallback(
    () => navigate('/masters/inventory-items'),
    [navigate]
  );

  // MOVED ALL HOOKS BEFORE CONDITIONAL RETURNS
  const salespersonData = useMemo(
    () => (inventoryData?.data as SalespersonInventoryData) || null,
    [inventoryData]
  );

  const products: ProductInventory[] = useMemo(() => {
    if (!salespersonData?.products || !Array.isArray(salespersonData.products))
      return [];

    return salespersonData.products.map(product => ({
      ...product,
      product_name: product.product_name ?? '',
      batches: product.batches ?? [],
      serials: product.serials ?? [],
    }));
  }, [salespersonData]);

  const batchRows: Array<BatchInfo & { product_id: number | string }> =
    useMemo(() => {
      if (!Array.isArray(products) || products.length === 0) return [];

      return products.flatMap(product => {
        if (!product.batches || !Array.isArray(product.batches)) return [];
        return product.batches.map(batch => ({
          ...batch,
          product_id: product.product_id,
        }));
      });
    }, [products]);

  const serialRows: Array<SerialInfo & { product_id: number | string }> =
    useMemo(() => {
      if (!Array.isArray(products) || products.length === 0) return [];

      return products.flatMap(product => {
        if (!product.serials || !Array.isArray(product.serials)) return [];
        return product.serials.map(serial => ({
          ...serial,
          product_id: product.product_id,
          warranty_expiry: serial.warranty_expiry ?? null,
          customer: serial.customer,
        }));
      });
    }, [products]);

  const batchColumns = useMemo<
    TableColumn<BatchInfo & { product_id: number | string }>[]
  >(
    () => [
      {
        id: 'batch_number',
        label: 'Batch Number',
        sortable: true,
      },
      {
        id: 'lot_number',
        label: 'Lot Number',
        sortable: true,
      },
      {
        id: 'supplier_name',
        label: 'Supplier',
        sortable: true,
        render: (value: string | undefined) => (value ? String(value) : 'N/A'),
      },
      {
        id: 'total_quantity',
        label: 'Total Qty',
        sortable: true,
      },
      {
        id: 'remaining_quantity',
        label: 'Remaining',
        sortable: true,
      },
      {
        id: 'expiry_date',
        label: 'Expiry Date',
        sortable: true,
        render: (value: string | undefined) =>
          value ? formatDate(value) : 'N/A',
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) => (
          <Chip
            label={String(value || '').replace('_', ' ')}
            size="small"
            color={getStatusColor(String(value)) as ChipProps['color']}
            variant="outlined"
            className="!capitalize"
          />
        ),
      },
    ],
    []
  );

  const serialColumns = useMemo<
    TableColumn<SerialInfo & { product_id: number | string }>[]
  >(
    () => [
      {
        id: 'serial_number',
        label: 'Serial Number',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-sm">
            {value ? String(value) : 'N/A'}
          </span>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) => (
          <Chip
            label={value ? String(value)?.replace('_', ' ') : 'N/A'}
            size="small"
            variant="outlined"
            className="!capitalize"
          />
        ),
      },
      {
        id: 'warranty_expiry',
        label: 'Warranty Expiry',
        sortable: true,
        render: (value: string | undefined) =>
          value ? formatDate(value) : 'N/A',
      },
      {
        id: 'customer',
        label: 'Customer',
        sortable: false,
        render: (_value: SerialInfo['customer'] | null, row) =>
          row.customer ? `${row.customer.name} (${row.customer.code})` : 'N/A',
      },
      {
        id: 'sold_date',
        label: 'Sold Date',
        sortable: true,
        render: (value: string | undefined) =>
          value ? formatDate(value) : 'Not Sold',
      },
    ],
    []
  );

  // NOW CHECK CONDITIONS AFTER ALL HOOKS
  if (isLoading) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="flex items-center mb-5 justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Skeleton variant="text" width={220} height={32} />
              <Skeleton variant="text" width={160} height={20} sx={{ mt: 1 }} />
            </div>
          </div>
          <Skeleton
            variant="rectangular"
            width={210}
            height={34}
            sx={{ borderRadius: 26 }}
          />
        </div>
        <SalespersonCardSkeleton />
        <StatsCardsSkeleton />
        <TabsSkeleton />
        {tabValue === 0 && <ProductsTabSkeleton />}
        {tabValue === 1 && <TableSkeleton columns={7} rows={7} />}
        {tabValue === 2 && <TableSkeleton columns={5} rows={7} />}
      </div>
    );
  }

  if (error || !inventoryData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <Typography variant="h6" className="text-gray-600 mb-2">
          Inventory Not Found
        </Typography>
        <Typography variant="body2" className="text-gray-500 mb-4">
          The inventory item you're looking for doesn't exist or you don't have
          permission to view it.
        </Typography>
        <Button onClick={handleBack}>Go Back to Inventory</Button>
      </div>
    );
  }

  if (!salespersonData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <Typography variant="h6" className="text-gray-600 mb-2">
          Invalid Inventory Data
        </Typography>
        <Typography variant="body2" className="text-gray-500 mb-4">
          The inventory data could not be loaded properly.
        </Typography>
        <Button onClick={handleBack}>Go Back to Inventory</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-5 justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {salespersonData?.salesperson_name || 'Unknown'}&apos;s Inventory
            </h1>
            <p className="text-gray-500 text-sm">
              Detailed view of all inventory items and stock levels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Last Updated: {formatDate(new Date().toISOString())}
          </span>
        </div>
      </div>

      <div className="bg-white mb-5 shadow-sm rounded-lg border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={salespersonData?.salesperson_profile_image || undefined}
            alt={salespersonData?.salesperson_name || 'Unknown'}
            className="!w-20 !h-20 !bg-green-100 !text-green-600 !text-2xl"
          >
            {salespersonData?.salesperson_name?.charAt(0)}
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-2 justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {salespersonData?.salesperson_name || 'Unknown'}
                </h2>
                <p className="text-gray-500 text-sm">Sales Representative</p>
              </div>
              <Chip
                label="Active"
                size="small"
                color="success"
                variant="outlined"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">
                  {salespersonData?.salesperson_email || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">
                  {salespersonData?.salesperson_phone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Region: North Zone</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <StatsCard
          title="Total Products"
          value={salespersonData?.total_products || 0}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Total Quantity"
          value={salespersonData?.total_quantity || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Total Batches"
          value={salespersonData?.total_batches || 0}
          icon={<Layers className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Total Serials"
          value={salespersonData?.total_serials || 0}
          icon={<Fingerprint className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={`Products (${Array.isArray(products) ? products.length : 0})`}
          />
          <Tab label={`Batches (${salespersonData?.total_batches || 0})`} />
          <Tab
            label={`Serial Numbers (${salespersonData?.total_serials || 0})`}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.isArray(products) &&
            products.map(product => {
              const stockStatus = getStockStatus(product.total_quantity);
              return (
                <div
                  key={product.product_id}
                  className="bg-white shadow-sm rounded-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4 pb-0 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="!bg-blue-100 !rounded-md !text-blue-600"
                        src=""
                      >
                        {product.product_name?.charAt(0) || 'P'}
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {product.product_name || 'Unknown Product'}
                        </h3>
                        <p className="text-xs text-gray-500 truncate text-ellipsis w-[90%]">
                          {product.product_code || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Chip
                      label={stockStatus.label}
                      size="small"
                      color={stockStatus.color as ChipProps['color']}
                      variant="outlined"
                    />
                  </div>
                  <div className="space-y-1 pb-3 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Quantity
                      </span>
                      <span className="font-medium">
                        {product.total_quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Tracking Type
                      </span>
                      <span className="font-medium uppercase">
                        {product.tracking_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Van Entries</span>
                      <span className="font-medium">
                        {product.van_inventories?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Batches</span>
                      <span className="font-medium">
                        {product.batches?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Serial Numbers
                      </span>
                      <span className="font-medium">
                        {product.serials?.length || 0}
                      </span>
                    </div>
                  </div>
                  {product.total_quantity > 0 &&
                    product.total_quantity <= 10 && (
                      <div className="border-t border-gray-100 p-3">
                        <div className="flex items-center gap-2 text-orange-600 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Low Stock Alert</span>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Table<BatchInfo & { product_id: number | string }>
          data={batchRows}
          columns={batchColumns}
          getRowId={(row: BatchInfo & { product_id: number | string }) =>
            `${row.batch_lot_id}-${row.product_id}`
          }
          pagination={false}
          emptyMessage="No batches found"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Table<SerialInfo & { product_id: number | string }>
          data={serialRows}
          columns={serialColumns}
          getRowId={(row: SerialInfo) => row.serial_id}
          pagination={false}
          emptyMessage="No serial numbers found"
        />
      </TabPanel>
    </div>
  );
};

export default InventoryDetail;
