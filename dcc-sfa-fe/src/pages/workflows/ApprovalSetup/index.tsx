import { Alert, Chip, MenuItem, Typography } from '@mui/material';
import { Check, CheckCircle, Settings, Users, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import {
  useApprovalWorkflowSetups,
  useDeleteApprovalWorkflowSetupByRequestType,
} from 'hooks/useApprovalWorkflowSetup';
import { usePermission } from 'hooks/usePermission';
import { useRequestTypes } from 'hooks/useRequests';
import type { ApprovalWorkflowSetupGrouped } from 'services/approvalWorkflowSetup';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
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
  const { isCreate, isRead, isUpdate, isDelete } = usePermission('approval');

  const { data: requestTypesResponse } = useRequestTypes();

  const {
    data: workflowsResponse,
    isLoading,
    error,
  } = useApprovalWorkflowSetups(
    {
      page,
      size,
      search: search || undefined,
      request_type: requestTypeFilter !== 'all' ? requestTypeFilter : undefined,
    },
    {
      enabled: isRead,
    }
  );

  const workflows: ApprovalWorkflowSetupGrouped[] =
    workflowsResponse?.data || [];
  const pagination = workflowsResponse?.pagination;

  const requestTypes = requestTypesResponse?.data || [];

  const totalWorkflows = pagination?.totalCount || workflows.length;
  const activeWorkflows = workflows.filter(w => w.is_active === 'Y').length;
  const inactiveWorkflows = workflows.filter(w => w.is_active === 'N').length;
  const totalApprovers = workflows.reduce(
    (sum, w) => sum + (w.no_of_approvers || 0),
    0
  );

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
          variant="outlined"
          icon={
            row.is_active === 'Y' ? (
              <Check fontSize="small" />
            ) : (
              <XCircle fontSize="small" />
            )
          }
          label={row.is_active === 'Y' ? 'Active' : 'Inactive'}
          color={row.is_active === 'Y' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    ...(isUpdate || isDelete
      ? [
          {
            id: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: ApprovalWorkflowSetupGrouped) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleManage(row.request_type)}
                    tooltip={`Manage ${row.request_type.replace(/_/g, ' ')}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDelete(row.request_type)}
                    tooltip={`Delete ${row.request_type.replace(/_/g, ' ')}`}
                    itemName={row.request_type.replace(/_/g, ' ')}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="!mb-3 !flex !justify-between !items-center">
        <div>
          <Typography variant="h6" className="!font-bold !text-gray-900">
            Approval Setup
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            Configure approval workflows for different request types
          </Typography>
        </div>
      </div>

      {isRead && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Workflows"
            value={totalWorkflows}
            icon={<Settings className="w-6 h-6" />}
            color="blue"
            isLoading={isLoading}
          />
          <StatsCard
            title="Active Workflows"
            value={activeWorkflows}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            isLoading={isLoading}
          />
          <StatsCard
            title="Inactive Workflows"
            value={inactiveWorkflows}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Approvers"
            value={totalApprovers}
            icon={<Users className="w-6 h-6" />}
            color="purple"
            isLoading={isLoading}
          />
        </div>
      )}

      {error && isRead && (
        <Alert severity="error" className="!mb-4">
          Failed to load approval workflows. Please try again.
        </Alert>
      )}

      <Table
        data={filteredWorkflows}
        columns={columns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between gap-3 items-center flex-wrap">
              <div className="flex flex-wrap items-center gap-3">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search by request type..."
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
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    <Select
                      value={requestTypeFilter}
                      onChange={e =>
                        handleRequestTypeFilterChange(e.target.value)
                      }
                      className="!w-48"
                    >
                      <MenuItem value="all">All Request Types</MenuItem>
                      {requestTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </div>
              {isCreate && (
                <Button
                  variant="contained"
                  className="!capitalize"
                  disableElevation
                  startIcon={<Settings />}
                  onClick={handleCreateSetup}
                >
                  Create
                </Button>
              )}
            </div>
          ) : undefined
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
        isPermission={isRead}
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
