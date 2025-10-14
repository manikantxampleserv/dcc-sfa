import {
  Cancel,
  CheckCircle,
  Description,
  History,
  Inventory,
  Verified,
  Warning,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useCustomer } from 'hooks/useCustomers';
import {
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import { getBusinessTypeIcon } from '../utils';

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

  const responseData = customerData?.data as any;
  const customer = responseData?.customer || responseData || {};
  const documents = responseData?.documents || [];
  const assets = responseData?.assets || [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress />
      </Box>
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

  // Documents Table Columns
  const documentColumns: TableColumn<any>[] = [
    {
      id: 'document_type',
      label: 'Document Type',
      render: (_value, row) => (
        <Box className="flex items-center gap-2">
          <Avatar className="!bg-blue-100 !text-blue-600 !w-8 !h-8">
            <FileText className="w-4 h-4" />
          </Avatar>
          <Typography variant="body2" className="!font-medium">
            {row.document_type}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'document_number',
      label: 'Document Number',
      render: document_number => (
        <Typography variant="body2">
          {document_number || <span className="text-gray-400">N/A</span>}
        </Typography>
      ),
    },
    {
      id: 'issue_date',
      label: 'Issue Date',
      render: issue_date => (
        <Typography variant="body2">
          {issue_date ? formatDate(issue_date) : '-'}
        </Typography>
      ),
    },
    {
      id: 'expiry_date',
      label: 'Expiry Date',
      render: expiry_date => (
        <Typography variant="body2">
          {expiry_date ? formatDate(expiry_date) : '-'}
        </Typography>
      ),
    },
    {
      id: 'is_verified',
      label: 'Verification Status',
      render: is_verified => (
        <Chip
          icon={
            is_verified ? (
              <Verified fontSize="small" />
            ) : (
              <Warning fontSize="small" />
            )
          }
          label={is_verified ? 'Verified' : 'Pending'}
          size="small"
          color={is_verified ? 'success' : 'warning'}
        />
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: is_active => (
        <Chip
          icon={is_active === 'Y' ? <CheckCircle /> : <Cancel />}
          label={is_active === 'Y' ? 'Active' : 'Inactive'}
          size="small"
          color={is_active === 'Y' ? 'success' : 'error'}
        />
      ),
    },
  ];

  // Assets Table Columns
  const assetColumns: TableColumn<any>[] = [
    {
      id: 'code',
      label: 'Asset Code',
      render: (_value, row) => (
        <Box className="flex items-center gap-2">
          <Avatar className="!bg-purple-100 !text-purple-600 !w-8 !h-8">
            <Package className="w-4 h-4" />
          </Avatar>
          <Box>
            <Typography variant="body2" className="!font-medium">
              {row.code}
            </Typography>
            {row.asset_types && (
              <Typography variant="caption" className="!text-gray-500">
                {row.asset_types.name}
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
      id: 'capacity',
      label: 'Capacity',
      render: capacity => (
        <Typography variant="body2">
          {capacity || <span className="text-gray-400">-</span>}
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

  // Asset History Columns
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

  // Flatten asset history from all assets
  const allAssetHistory = assets.flatMap((asset: any) =>
    (asset.customer_assets_history || []).map((history: any) => ({
      ...history,
      asset_code: asset.code,
      asset_type: asset.asset_types?.name,
    }))
  );

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
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  return (
    <>
      {/* Header */}
      <Box className="!mb-3 !flex !items-center !gap-3">
        <Box className="!flex-1">
          <Box className="!flex !items-center !gap-3">
            <Typography variant="h5" className="!font-bold !text-gray-900">
              {customer.name}
            </Typography>
            <Chip
              icon={customer.is_active === 'Y' ? <CheckCircle /> : <Cancel />}
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
                className="!capitalize !px-1"
                color={getBusinessTypeChipColor(customer.type || '')}
              />
            )}
          </Box>
          <Typography variant="body2" className="!text-gray-500 !mt-1">
            Code: {customer.code} • {customer.email || 'No Email'}
          </Typography>
        </Box>
      </Box>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Contact Person
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {customer.contact_person || 'N/A'}
              </p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Phone className="w-3 h-3 mr-1" />
                {customer.phone_number || 'N/A'}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Location</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {customer.city || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {customer.state} {customer.zipcode}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credit Limit</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                {formatCurrency(customer.credit_limit)}
              </p>
              <p className="text-sm text-gray-500 mt-2">Available Credit</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-lg font-bold text-red-600 mt-1">
                {formatCurrency(customer.outstanding_amount)}
              </p>
              <p className="text-sm text-gray-500 mt-2">Amount Due</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border !border-b-none border-gray-200">
        <Box>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              icon={<Description />}
              label={`Documents (${documents.length})`}
              iconPosition="start"
              className="!py-0"
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
              className="!py-0"
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
              className="!py-0"
              sx={{
                '& .MuiButtonBase-root': {
                  padding: 1,
                },
              }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Table
            data={documents}
            columns={documentColumns}
            getRowId={doc => doc.id}
            initialOrderBy="createdate"
            emptyMessage="No documents found for this outlet"
            pagination={false}
          />
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
      </div>
    </>
  );
};

export default OutletDetail;
