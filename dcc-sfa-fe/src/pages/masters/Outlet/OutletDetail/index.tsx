import {
  Cancel,
  CheckCircle,
  Description,
  History,
  Inventory,
  LocationOn,
  Schedule,
  Star,
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
import { useCustomer } from 'hooks/useCustomers';
import {
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  ExternalLink,
  MapPin,
  Package,
  PhoneCall,
  Receipt,
} from 'lucide-react';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { type Customer } from 'services/masters/Customers';
import Barcode from 'shared/Barcode';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { getBusinessTypeIcon } from '../utils';
import CustomerInvoices from './CustomerInvoices';

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
      id={`outlet-tabpanel-${index}`}
      aria-labelledby={`outlet-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const OutletDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);

  const { data: customerData, isLoading, error } = useCustomer(Number(id));

  const responseData = customerData?.data;
  const customer = responseData?.customer || ({} as Customer);
  const documents = responseData?.documents || [];
  const assets = responseData?.assets || [];
  const invoices = responseData?.invoices || [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <>
        {/* Header Skeleton */}
        <Box className="!mb-3 !flex !items-center !gap-3">
          <Box className="!flex-1">
            <Box className="!flex !items-center !gap-3">
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton
                variant="rectangular"
                width={80}
                height={24}
                className="!rounded-full"
              />
              <Skeleton
                variant="rectangular"
                width={100}
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

        {/* Info Cards Skeleton */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(index => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton variant="text" width={100} height={16} />
                  <Skeleton
                    variant="text"
                    width={120}
                    height={28}
                    className="!mt-1"
                  />
                  <Skeleton
                    variant="text"
                    width={80}
                    height={16}
                    className="!mt-2"
                  />
                </div>
                <Skeleton variant="circular" width={48} height={48} />
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Information Skeleton */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Contact Information Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <Skeleton
              variant="text"
              width={150}
              height={24}
              className="!mb-4"
            />
            <div className="space-y-3">
              {[1, 2, 3].map(index => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton variant="circular" width={16} height={16} />
                  <div className="flex-1">
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton
                      variant="text"
                      width={120}
                      height={20}
                      className="!mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Information Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <Skeleton
              variant="text"
              width={150}
              height={24}
              className="!mb-4"
            />
            <div className="space-y-3">
              {[1, 2, 3].map(index => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton variant="circular" width={16} height={16} />
                  <div className="flex-1">
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton
                      variant="text"
                      width={120}
                      height={20}
                      className="!mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barcode Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-center w-full mb-3">
              <div className="flex items-center gap-1.5">
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={80} height={16} />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
              </div>
            </div>
            <div className="flex-grow w-full flex items-center justify-center bg-gray-50/50 rounded-lg p-4 border border-gray-50">
              <Skeleton variant="rectangular" width="80%" height={80} />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Box>
            <Tabs value={0}>
              <Tab
                icon={<Inventory />}
                label="Assets (0)"
                iconPosition="start"
                className="!min-h-14 !py-0"
                disabled
              />
              <Tab
                icon={<History />}
                label="Asset History (0)"
                iconPosition="start"
                className="!min-h-14 !py-0"
                disabled
              />
              <Tab
                icon={<Description />}
                label="Attachments (0)"
                iconPosition="start"
                className="!min-h-14 !py-0"
                disabled
              />
            </Tabs>
          </Box>

          {/* Table Skeleton */}
          <Box className="p-4">
            <Box className="mb-4">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={48}
                className="!rounded"
              />
            </Box>
            {[1, 2, 3, 4, 5].map(index => (
              <Box key={index} className="mb-3 flex items-center gap-4">
                <Skeleton
                  variant="rectangular"
                  width={40}
                  height={40}
                  className="!rounded"
                />
                <Skeleton variant="text" width={150} height={20} />
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={24}
                  className="!rounded-full"
                />
              </Box>
            ))}
          </Box>
        </div>
      </>
    );
  }

  if (error || !customer) {
    return (
      <Box className="p-6">
        <Alert severity="error">
          Failed to load outlet details. Please try again.
        </Alert>
      </Box>
    );
  }

  const assetColumns: TableColumn<any>[] = [
    {
      id: 'code',
      label: 'Asset',
      render: (_value, row) => (
        <Box className="flex items-center gap-2">
          <Avatar className="!h-10 !w-10 !bg-purple-100 !rounded !text-purple-600">
            <Package className="h-5 w-5" />
          </Avatar>
          <Box>
            <Typography variant="body2" className="!font-medium">
              {row.code}
            </Typography>
            {row.asset_types && (
              <Typography variant="caption" className="!text-gray-500 block">
                {row.asset_types.name}
                {row.asset_sub_types?.name && ` - ${row.asset_sub_types.name}`}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'brand',
      label: 'Brand & Model',
      render: (_value, row) => (
        <Box>
          <Typography variant="body2">
            {row.brand || <span className="text-gray-400">No Brand</span>}
          </Typography>
          {row.model && (
            <Typography variant="caption" className="!text-gray-500">
              {row.model}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'serial_number',
      label: 'Serial Number',
      render: serial_number => (
        <Typography variant="body2">
          {serial_number || <span className="text-gray-400">N/A</span>}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: status => (
        <Chip
          label={status || 'working'}
          size="small"
          className="!capitalize"
          color={status === 'working' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'install_date',
      label: 'Install Date',
      render: install_date => (
        <Typography variant="body2">
          {install_date ? formatDate(install_date) : '-'}
        </Typography>
      ),
    },
  ];

  const historyColumns: TableColumn<any>[] = [
    {
      id: 'change_date',
      label: 'Change Date',
      render: change_date => (
        <Typography variant="body2">
          {change_date ? formatDate(change_date) : '-'}
        </Typography>
      ),
    },
    {
      id: 'change_type',
      label: 'Change Type',
      render: change_type => (
        <Chip
          label={change_type || 'Update'}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'old_status',
      label: 'Old Status',
      render: old_status => (
        <Typography variant="body2" className="!text-gray-600">
          {old_status || '-'}
        </Typography>
      ),
    },
    {
      id: 'new_status',
      label: 'New Status',
      render: new_status => (
        <Typography variant="body2" className="!font-medium">
          {new_status || '-'}
        </Typography>
      ),
    },
    {
      id: 'remarks',
      label: 'Remarks',
      render: remarks => (
        <Typography variant="body2" className="!max-w-xs !truncate">
          {remarks || <span className="text-gray-400">No remarks</span>}
        </Typography>
      ),
    },
  ];

  const allAssetHistory = assets.flatMap((asset: any) =>
    (asset.customer_assets_history || []).map((history: any) => ({
      ...history,
      asset_code: asset.code,
      asset_type: asset.asset_types?.name,
    }))
  );

  const documentColumns: TableColumn<any>[] = [
    {
      id: 'document_type',
      label: 'Document Type',
      sortable: true,
      render: val => <span className="font-medium text-gray-700">{val}</span>,
    },
    { id: 'document_number', label: 'Document Number', sortable: true },
    {
      id: 'issue_date',
      label: 'Issue Date',
      sortable: true,
      render: val => (val ? formatDate(val as string) : '-'),
    },
    {
      id: 'expiry_date',
      label: 'Expiry Date',
      sortable: true,
      render: val => (val ? formatDate(val as string) : '-'),
    },
    {
      id: 'is_verified',
      label: 'Verified',
      sortable: true,
      render: val => (
        <span className={val ? 'text-green-600' : 'text-gray-500'}>
          {val ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      id: 'createdate',
      label: 'Uploaded On',
      sortable: true,
      render: val => (val ? formatDate(val as string) : '-'),
    },
  ];

  const getBusinessTypeChipColor = (
    type: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch ((type || '').toLowerCase()) {
      case 'retail':
        return 'primary';
      case 'wholesale':
        return 'success';
      case 'corporate':
        return 'warning';
      case 'industrial':
        return 'default';
      case 'healthcare':
        return 'info';
      case 'automotive':
        return 'error';
      case 'restaurant':
        return 'warning';
      case 'service':
        return 'secondary';
      case 'manufacturing':
        return 'info';
      case 'distribution':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Left main info */}
        <div className="flex-1 space-y-4 w-full">
          {/* Header */}
          <Box className="!mb-3 !flex !items-center !gap-3">
            <Box className="!flex-1">
              <Box className="!flex !items-center !gap-3">
                <Typography variant="h5" className="!font-bold !text-gray-900">
                  {customer.name}
                </Typography>
                <Chip
                  icon={
                    customer.is_active === 'Y' ? <CheckCircle /> : <Cancel />
                  }
                  label={customer.is_active === 'Y' ? 'Active' : 'Inactive'}
                  size="small"
                  color={customer.is_active === 'Y' ? 'success' : 'error'}
                />
                {customer.type && (
                  <Chip
                    icon={getBusinessTypeIcon(customer.type || '')}
                    label={customer.type || 'N/A'}
                    size="small"
                    variant="outlined"
                    className="!px-1 !capitalize"
                    color={getBusinessTypeChipColor(customer.type || '')}
                  />
                )}
              </Box>
              <Typography variant="body2" className="!mt-1 !text-gray-500">
                Code: {customer.code}
                {customer.short_name && ` • Short: ${customer.short_name}`}
                {customer.email && ` • ${customer.email}`}
                {customer.phone_number && ` • ${customer.phone_number}`}
                {customer.nfc_tag_code && ` • NFC: ${customer.nfc_tag_code}`}
              </Typography>
            </Box>
          </Box>

          {/* Info Cards */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Customer Type Card */}
            <StatsCard
              title="Customer Type"
              value={customer.customer_type?.type_name || 'N/A'}
              icon={<Building2 className="h-6 w-6" />}
              color="blue"
            />

            {/* Category Card */}
            <StatsCard
              title="Category"
              value={customer.customer_category?.category_name || 'N/A'}
              icon={<Star className="h-6 w-6" />}
              color="purple"
            />

            {/* Zone Card */}
            <StatsCard
              title="Zone"
              value={customer.customer_zones?.name || 'N/A'}
              icon={<LocationOn className="h-6 w-6" />}
              color="green"
            />

            {/* Route Card */}
            <StatsCard
              title="Route"
              value={customer.customer_routes?.name || 'N/A'}
              icon={<Schedule className="h-6 w-6" />}
              color="orange"
            />
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Contact Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <Typography
                variant="h6"
                className="!mb-4 !font-semibold !text-gray-900"
              >
                Contact Information
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <PhoneCall className="h-4 w-4 text-gray-400" />
                  <div>
                    <Typography variant="body2" className="!text-gray-500">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" className="!font-medium">
                      {customer.phone_number || (
                        <span className="text-xs text-gray-400 italic">
                          No Phone Number
                        </span>
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <Typography variant="body2" className="!text-gray-500">
                      Outlet Channel
                    </Typography>
                    <Typography variant="body1" className="!font-medium">
                      {customer.customer_channel?.channel_name || (
                        <span className="text-xs text-gray-400 italic">
                          No Channel
                        </span>
                      )}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-gray-400" />
                  <div className="space-y-1">
                    <Typography variant="body2" className="!text-gray-500">
                      Address & Location
                    </Typography>
                    {(customer.customer_city ||
                      customer.customer_district ||
                      customer.customer_region) && (
                      <Typography variant="body2" className="!text-gray-600">
                        {[
                          customer.customer_city?.name,
                          customer.customer_district?.name,
                          customer.customer_region?.name,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    )}
                    {customer.zipcode && (
                      <Typography variant="body2" className="!text-gray-600">
                        Zip Code: {customer.zipcode}
                      </Typography>
                    )}
                    {(customer.latitude || customer.longitude) && (
                      <Typography
                        variant="body2"
                        className="!text-xs !text-gray-400 italic"
                      >
                        Coordinates: {customer.latitude}, {customer.longitude}
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <Typography
                variant="h6"
                className="!mb-4 !font-semibold !text-gray-900"
              >
                Business Information
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <Typography variant="body2" className="!text-gray-500">
                      Credit Limit
                    </Typography>
                    <Typography variant="body1" className="!font-medium">
                      {customer.credit_limit
                        ? formatCurrency(customer.credit_limit)
                        : 'Not Set'}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <Typography variant="body2" className="!text-gray-500">
                      Outstanding Amount
                    </Typography>
                    <Typography variant="body1" className="!font-medium">
                      {customer.outstanding_amount
                        ? formatCurrency(customer.outstanding_amount)
                        : '₹0'}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <Typography variant="body2" className="!text-gray-500">
                      Last Visit Date
                    </Typography>
                    <Typography variant="body1" className="!font-medium">
                      {customer.last_visit_date ? (
                        formatDate(customer.last_visit_date)
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No visits yet
                        </span>
                      )}
                    </Typography>
                  </div>
                </div>
                {customer.depot && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <Typography variant="body2" className="!text-gray-500">
                        Associated Depot
                      </Typography>
                      <Typography variant="body1" className="!font-medium">
                        {customer.depot.name} ({customer.depot.code})
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {customer.code && (
              <div className="w-full h-full flex-shrink-0 flex flex-col">
                <Barcode
                  value={customer.code}
                  label="Customer Code"
                  showText={false}
                  className="!flex-1 !h-full"
                />
              </div>
            )}
          </div>

          {/* Map Section */}
          {(customer.latitude || customer.longitude) && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <Typography
                    variant="h6"
                    className="!font-semibold !text-gray-900"
                  >
                    Outlet Location Map
                  </Typography>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${customer.latitude},${customer.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </div>
              <div className="h-[400px] w-full overflow-hidden rounded-lg border border-gray-100 shadow-inner">
                <iframe
                  src={`https://maps.google.com/maps?q=${customer.latitude},${customer.longitude}&z=16&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>
              <div className="mt-3 flex items-center gap-4 rounded border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
                <p>
                  <span className="font-semibold text-gray-700">Latitude:</span>{' '}
                  {customer.latitude}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">
                    Longitude:
                  </span>{' '}
                  {customer.longitude}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className="!min-h-10"
          >
            <Tab
              icon={<Receipt className="h-5 w-5" />}
              label={`INVOICES (${invoices.length})`}
              iconPosition="start"
              className="!min-h-12 !py-0"
              sx={{
                '& .MuiButtonBase-root': {
                  padding: 1,
                },
              }}
            />
            <Tab
              icon={<Inventory />}
              label={`Assets (${assets.length})`}
              iconPosition="start"
              className="!min-h-12 !py-0"
              sx={{
                '& .MuiButtonBase-root': {
                  padding: 1,
                },
              }}
            />
            <Tab
              icon={<History />}
              label={`Asset History (${allAssetHistory.length})`}
              iconPosition="start"
              className="!min-h-12 !py-0"
              sx={{
                '& .MuiButtonBase-root': {
                  padding: 1,
                },
              }}
            />
            <Tab
              icon={<Description />}
              label={`Attachments (${documents.length})`}
              iconPosition="start"
              className="!min-h-12 !py-0"
              sx={{
                '& .MuiButtonBase-root': {
                  padding: 1,
                },
              }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CustomerInvoices invoices={invoices} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Table
            data={assets}
            columns={assetColumns}
            getRowId={asset => asset.id}
            initialOrderBy="createdate"
            emptyMessage="No assets found for this outlet"
            pagination={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Table
            data={allAssetHistory}
            columns={historyColumns}
            getRowId={history => history.id}
            initialOrderBy="change_date"
            emptyMessage="No asset history found"
            pagination={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Table
            data={documents}
            columns={documentColumns}
            getRowId={doc => doc.id}
            initialOrderBy="createdate"
            emptyMessage="No attachments found for this outlet"
            pagination={false}
          />
        </TabPanel>
      </div>
    </div>
  );
};

export default OutletDetail;
