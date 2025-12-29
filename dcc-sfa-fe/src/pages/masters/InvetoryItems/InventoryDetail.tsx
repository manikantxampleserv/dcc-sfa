import {
  Avatar,
  Box,
  Chip,
  Skeleton,
  Tab,
  Tabs,
  Typography,
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
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3, px: 0 }}>{children}</Box>}
    </div>
  );
}

const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
    {[...Array(4)].map((_, idx) => (
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
          {[1, 2, 3].map(i => (
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
      {[1, 2, 3].map(i => (
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
    {[...Array(6)].map((_, idx) => (
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
          {[...Array(5)].map((_, j) => (
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
      {[...Array(columns)].map((_, ci) => (
        <Skeleton key={ci} width={90} height={18} sx={{ borderRadius: 2 }} />
      ))}
    </div>
    <div className="flex flex-col gap-2">
      {[...Array(rows)].map((_, ri) => (
        <div key={ri} className="flex gap-2">
          {[...Array(columns)].map((_, ci) => (
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

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);

  const salespersonId = id ? parseInt(id) : undefined;
  const {
    data: inventoryData,
    isLoading,
    error,
  } = useInventoryItemById(salespersonId!, {
    enabled: !!salespersonId,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/masters/inventory-items');
  };

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

  const salespersonData = inventoryData.data;
  const products = salespersonData.products || [];

  const batchRows = products.flatMap(
    (product: any) =>
      product.batches?.map((batch: any) => ({
        ...batch,
        product_id: product.product_id,
      })) || []
  );

  const serialRows = products.flatMap(
    (product: any) =>
      product.serials?.map((serial: any) => ({
        ...serial,
        product_id: product.product_id,
      })) || []
  );

  const getStatusColor = (status: string) => {
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

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-5 justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {salespersonData.salesperson_name}'s Inventory
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
            src={salespersonData.salesperson_profile_image || ''}
            alt={salespersonData.salesperson_name}
            className="!w-20 !h-20 !bg-green-100 !text-green-600 !text-2xl"
          >
            {salespersonData.salesperson_name?.charAt(0)}
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4 justify-between ">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {salespersonData.salesperson_name}
                </h2>
                <p className="text-gray-500">Sales Representative</p>
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
                  {salespersonData.salesperson_email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">
                  {salespersonData.salesperson_phone}
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
          value={salespersonData.total_products}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Total Quantity"
          value={salespersonData.total_quantity}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Total Batches"
          value={salespersonData.total_batches}
          icon={<Layers className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Total Serials"
          value={salespersonData.total_serials}
          icon={<Fingerprint className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Products (${products.length})`} />
          <Tab label={`Batches (${salespersonData.total_batches})`} />
          <Tab label={`Serial Numbers (${salespersonData.total_serials})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product: any) => {
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
                      <h3 className="font-semibold text-gray-900 text-sm truncate w-full text-ellipsis max-w-[90%]">
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
                    color={stockStatus.color as any}
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
                    <span className="text-sm text-gray-600">Tracking Type</span>
                    <span className="font-medium uppercase">
                      {product.tracking_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Van Entries</span>
                    <span className="font-medium">
                      {product.van_entries?.length || 0}
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

                {product.total_quantity > 0 && product.total_quantity <= 10 && (
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
        <Table
          data={batchRows}
          columns={
            [
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
                render: value => (value ? String(value) : 'N/A'),
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
                render: value => (value ? formatDate(value) : 'N/A'),
              },
              {
                id: 'status',
                label: 'Status',
                sortable: true,
                render: value => (
                  <Chip
                    label={String(value || '').replace('_', ' ')}
                    size="small"
                    color={getStatusColor(String(value)) as any}
                    variant="outlined"
                    className="!capitalize"
                  />
                ),
              },
            ] as TableColumn<any>[]
          }
          getRowId={(row: any) => `${row.batch_lot_id}-${row.product_id}`}
          pagination={false}
          emptyMessage="No batches found"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Table
          data={serialRows}
          columns={
            [
              {
                id: 'serial_number',
                label: 'Serial Number',
                sortable: true,
                render: value => (
                  <span className="font-mono text-sm">
                    {value ? String(value) : 'N/A'}
                  </span>
                ),
              },
              {
                id: 'status',
                label: 'Status',
                sortable: true,
                render: value => (
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
                render: value => (value ? formatDate(value) : 'N/A'),
              },
              {
                id: 'customer',
                label: 'Customer',
                sortable: false,
                render: (_value, row) =>
                  row.customer
                    ? `${row.customer.name} (${row.customer.code})`
                    : 'N/A',
              },
              {
                id: 'sold_date',
                label: 'Sold Date',
                sortable: true,
                render: value => (value ? formatDate(value) : 'Not Sold'),
              },
            ] as TableColumn<any>[]
          }
          getRowId={(row: any) => row.serial_id}
          pagination={false}
          emptyMessage="No serial numbers found"
        />
      </TabPanel>
    </div>
  );
};

export default InventoryDetail;
