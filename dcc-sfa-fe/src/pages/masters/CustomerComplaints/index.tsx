import { Add, Download, Upload } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useCustomerComplaints,
  useDeleteCustomerComplaint,
  type CustomerComplaint,
} from 'hooks/useCustomerComplaints';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { AlertCircle, MessageSquare, User } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportCustomerComplaint from './ImportCustomerComplaint';
import ManageCustomerComplaint from './ManageCustomerComplaint';

const CustomerComplaintsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] =
    useState<CustomerComplaint | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { isCreate, isUpdate, isDelete, isRead } =
    usePermission('customer-complaint');

  const {
    data: complaintsResponse,
    isLoading,
    error,
  } = useCustomerComplaints(
    {
      page,
      limit,
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    },
    {
      enabled: isRead,
    }
  );

  const complaints: CustomerComplaint[] = complaintsResponse?.data || [];
  const pagination = complaintsResponse?.pagination;

  const deleteComplaintMutation = useDeleteCustomerComplaint();
  const exportToExcelMutation = useExportToExcel();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleCreateComplaint = useCallback(() => {
    setSelectedComplaint(null);
    setDrawerOpen(true);
  }, []);

  const handleEditComplaint = useCallback((complaint: CustomerComplaint) => {
    setSelectedComplaint(complaint);
    setDrawerOpen(true);
  }, []);

  const handleDeleteComplaint = useCallback(
    async (id: number) => {
      try {
        await deleteComplaintMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting customer complaint:', error);
      }
    },
    [deleteComplaintMutation]
  );

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'customer_complaints',
        filters,
      });
    } catch (error) {
      console.error('Error exporting customer complaints:', error);
    }
  }, [exportToExcelMutation, search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'P':
        return 'warning';
      case 'R':
        return 'success';
      case 'C':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'P':
        return 'Pending';
      case 'R':
        return 'Resolved';
      case 'C':
        return 'Closed';
      default:
        return status || 'N/A';
    }
  };

  const columns: TableColumn<CustomerComplaint>[] = [
    {
      id: 'complaint_title',
      label: 'Title',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !text-gray-900">
          {row.complaint_title || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (_value, row) => (
        <div className="!flex !items-center !gap-2">
          <Avatar className="!w-10 !h-10 !rounded !bg-primary-100 !text-primary-500 !text-xs">
            <User className="!w-4 !h-4" />
          </Avatar>
          <div>
            <Typography variant="body2" className="!font-medium !text-gray-900">
              {row.customer?.name || `Customer #${row.customer_id}`}
            </Typography>
            {row.customer?.code && (
              <Typography variant="caption" className="!text-gray-500">
                {row.customer.code}
              </Typography>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'complaint_description',
      label: 'Complaint Description',
      render: (_value, row) => (
        <Tooltip title={row.complaint_description} placement="top" arrow>
          <Typography
            variant="body2"
            className="!text-gray-900 !max-w-md"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {row.complaint_description}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'submitted_by_user',
      label: 'Submitted By',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.submitted_by_user?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={getStatusLabel(row.status)}
          color={getStatusColor(row.status) as any}
          size="small"
          variant="outlined"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
      render: (_value, row) =>
        formatDate(String(row.createdate || '')) || 'N/A',
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: CustomerComplaint) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditComplaint(row)}
                    tooltip={`Edit complaint #${row.id}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteComplaint(row.id)}
                    tooltip={`Delete complaint #${row.id}`}
                    itemName={`complaint #${row.id}`}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const totalComplaints = pagination?.total_count || complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'P').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'R').length;
  const closedComplaints = complaints.filter(c => c.status === 'C').length;

  return (
    <>
      <div className="!mb-3 !flex !justify-between !items-center">
        <div>
          <Typography variant="h6" className="!font-bold !text-gray-900">
            Customer Complaints
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            View and manage customer complaints
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Complaints"
          value={totalComplaints}
          icon={<MessageSquare className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending Complaints"
          value={pendingComplaints}
          icon={<AlertCircle className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Resolved Complaints"
          value={resolvedComplaints}
          icon={<MessageSquare className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Closed Complaints"
          value={closedComplaints}
          icon={<MessageSquare className="w-6 h-6" />}
          color="gray"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load customer complaints. Please try again.
        </Alert>
      )}

      <Table
        data={complaints}
        columns={columns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              {isRead && (
                <div className="flex items-center flex-wrap gap-2">
                  <SearchInput
                    placeholder="Search complaints..."
                    value={search}
                    onChange={handleSearchChange}
                    debounceMs={400}
                    showClear={true}
                    className="!w-80"
                  />
                  <Select
                    value={statusFilter}
                    onChange={e => handleStatusFilterChange(e.target.value)}
                    className="!w-40"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="P">Pending</MenuItem>
                    <MenuItem value="R">Resolved</MenuItem>
                    <MenuItem value="C">Closed</MenuItem>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Customer Complaints"
                    description="Are you sure you want to export the current customer complaints data to Excel? This will include all filtered results."
                    onConfirm={handleExportToExcel}
                    confirmText="Export"
                    cancelText="Cancel"
                    placement="top"
                  >
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      startIcon={<Download />}
                      disabled={exportToExcelMutation.isPending}
                    >
                      {exportToExcelMutation.isPending
                        ? 'Exporting...'
                        : 'Export'}
                    </Button>
                  </PopConfirm>
                )}
                {isCreate && (
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateComplaint}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={complaint => complaint.id}
        initialOrderBy="createdate"
        loading={isLoading}
        totalCount={pagination?.total_count || 0}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
        emptyMessage={
          search || statusFilter !== 'all'
            ? `No complaints found matching your filters`
            : 'No customer complaints found in the system'
        }
      />

      <ManageCustomerComplaint
        selectedComplaint={selectedComplaint}
        setSelectedComplaint={setSelectedComplaint}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportCustomerComplaint
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default CustomerComplaintsPage;
