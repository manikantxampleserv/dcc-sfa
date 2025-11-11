import { Alert, Box, Chip, MenuItem, Typography } from '@mui/material';
import { CheckCircle, Settings, Users, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import {
  useApprovalWorkflowSetups,
  useDeleteApprovalWorkflowSetupByRequestType,
} from 'hooks/useApprovalWorkflowSetup';
import type { ApprovalWorkflowSetupGrouped } from 'services/approvalWorkflowSetup';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import ManageApprovalSetup from './ManageApprovalSetup';

const ApprovalSetup: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requestTypeFilter, setRequestTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch all workflows to get unique request types (without pagination)
  const { data: allWorkflowsResponse } = useApprovalWorkflowSetups({
    page: 1,
    size: 1000, // Get all to extract unique request types
  });

  const {
    data: workflowsResponse,
    isLoading,
    error,
  } = useApprovalWorkflowSetups({
    page,
    size,
    search: search || undefined,
    request_type: requestTypeFilter !== 'all' ? requestTypeFilter : undefined,
  });

  const workflows: ApprovalWorkflowSetupGrouped[] =
    workflowsResponse?.data || [];
  const pagination = workflowsResponse?.pagination;

  // Get unique request types from all workflows
  const allWorkflows: ApprovalWorkflowSetupGrouped[] =
    allWorkflowsResponse?.data || [];
  const uniqueRequestTypes = Array.from(
    new Set(allWorkflows.map(w => w.request_type))
  ).sort();

  // Calculate statistics from all workflows (before filtering)
  const totalWorkflows = pagination?.totalCount || workflows.length;
  const activeWorkflows = workflows.filter(w => w.is_active === 'Y').length;
  const inactiveWorkflows = workflows.filter(w => w.is_active === 'N').length;
  const totalApprovers = workflows.reduce(
    (sum, w) => sum + (w.no_of_approvers || 0),
    0
  );

  // Filter workflows based on status (client-side filtering for current page)
  const filteredWorkflows = workflows.filter(workflow => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return workflow.is_active === 'Y';
    if (statusFilter === 'inactive') return workflow.is_active === 'N';
    return true;
  });

  const deleteMutation = useDeleteApprovalWorkflowSetupByRequestType();

  const handleManage = (requestType: string) => {
    setSelectedRequestType(requestType);
    setDrawerOpen(true);
  };

  const handleDelete = useCallback(
    async (requestType: string) => {
      try {
        await deleteMutation.mutateAsync(requestType);
      } catch (error) {
        console.error('Error deleting approval setup:', error);
      }
    },
    [deleteMutation]
  );

  const handleCreateSetup = () => {
    setSelectedRequestType(null);
    setDrawerOpen(true);
  };

  const handleDrawerClose = (drawerOpen: boolean) => {
    setDrawerOpen(drawerOpen);
    if (!drawerOpen) {
      setSelectedRequestType(null);
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleRequestTypeFilterChange = useCallback((value: string) => {
    setRequestTypeFilter(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const columns: TableColumn<ApprovalWorkflowSetupGrouped>[] = [
    {
      id: 'request_type',
      label: 'Request Type',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium !capitalize">
          {row.request_type.replace(/_/g, ' ')}
        </Typography>
      ),
    },
    {
      id: 'zones',
      label: 'Zones',
      render: (_value, row) => (
        <div className="!flex !flex-wrap !gap-1">
          {row.zones.slice(0, 2).map((zone, idx) => (
            <Chip
              key={idx}
              label={zone.name}
              size="small"
              variant="outlined"
              className="!text-xs"
            />
          ))}
          {row.zones.length > 2 && (
            <Chip
              label={`+${row.zones.length - 2} more`}
              size="small"
              variant="outlined"
              className="!text-xs"
            />
          )}
        </div>
      ),
    },
    {
      id: 'depots',
      label: 'Depots',
      render: (_value, row) => (
        <div className="!flex !flex-wrap !gap-1">
          {row.depots.slice(0, 2).map((depot, idx) => (
            <Chip
              key={idx}
              label={depot.name}
              size="small"
              variant="outlined"
              className="!text-xs"
            />
          ))}
          {row.depots.length > 2 && (
            <Chip
              label={`+${row.depots.length - 2} more`}
              size="small"
              variant="outlined"
              className="!text-xs"
            />
          )}
        </div>
      ),
    },
    {
      id: 'no_of_approvers',
      label: 'Approvers',
      render: (_value, row) => (
        <Typography variant="body2">{row.no_of_approvers}</Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          color={row.is_active === 'Y' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="!flex !gap-2 !items-center">
          <EditButton
            onClick={() => handleManage(row.request_type)}
            tooltip={`Manage ${row.request_type.replace(/_/g, ' ')}`}
          />
          <DeleteButton
            onClick={() => handleDelete(row.request_type)}
            tooltip={`Delete ${row.request_type.replace(/_/g, ' ')}`}
            itemName={row.request_type.replace(/_/g, ' ')}
            confirmDelete={true}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Approval Setup</p>
          <p className="!text-gray-500 text-sm">
            Configure approval workflows for different request types
          </p>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Workflows
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalWorkflows}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Workflows
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeWorkflows}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">
                Inactive Workflows
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-500">
                  {inactiveWorkflows}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Total Approvers
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {totalApprovers}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load approval workflows. Please try again.
        </Alert>
      )}

      <Table
        data={filteredWorkflows}
        columns={columns}
        actions={
          <div className="flex justify-between w-full items-center flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              <SearchInput
                placeholder="Search by request type..."
                value={search}
                onChange={handleSearchChange}
                debounceMs={400}
                showClear={true}
                fullWidth={false}
                className="!min-w-80"
              />
              <Select
                value={statusFilter}
                onChange={e => handleStatusFilterChange(e.target.value)}
                className="!min-w-32"
                size="small"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
              <Select
                value={requestTypeFilter}
                onChange={e => handleRequestTypeFilterChange(e.target.value)}
                className="!min-w-48"
                size="small"
              >
                <MenuItem value="all">All Request Types</MenuItem>
                {uniqueRequestTypes.map(requestType => (
                  <MenuItem key={requestType} value={requestType}>
                    {requestType
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <Button
              variant="contained"
              className="!capitalize"
              disableElevation
              startIcon={<Settings />}
              onClick={handleCreateSetup}
            >
              Create
            </Button>
          </div>
        }
        getRowId={workflow => workflow.request_type}
        initialOrderBy="request_type"
        loading={isLoading}
        totalCount={
          statusFilter !== 'all'
            ? filteredWorkflows.length
            : pagination?.totalCount || 0
        }
        page={page - 1}
        rowsPerPage={size}
        onPageChange={handlePageChange}
        emptyMessage={
          search || statusFilter !== 'all' || requestTypeFilter !== 'all'
            ? `No workflows found matching your filters`
            : 'No approval workflows found in the system'
        }
      />

      <ManageApprovalSetup
        requestType={selectedRequestType}
        drawerOpen={drawerOpen}
        setDrawerOpen={handleDrawerClose}
      />
    </>
  );
};

export default ApprovalSetup;
