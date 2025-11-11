import { Chip, MenuItem, Typography } from '@mui/material';
import {
  useApprovalWorkflows,
  useApproveWorkflowStep,
  useRejectWorkflowStep,
} from 'hooks/useApprovalWorkflows';
import { Check, X } from 'lucide-react';
import React, { useState } from 'react';
import type { ApprovalWorkflow } from 'services/approvalWorkflows';
import { ActionButton } from 'shared/ActionButton';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';

const ApprovalWorkflows: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: workflowsResponse, isLoading } = useApprovalWorkflows({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  });

  const workflows: ApprovalWorkflow[] = workflowsResponse?.data || [];
  const pagination = workflowsResponse?.meta;

  const approveMutation = useApproveWorkflowStep();
  const rejectMutation = useRejectWorkflowStep();

  const handleApprove = (workflow: ApprovalWorkflow) => {
    approveMutation.mutate({
      id: workflow.id,
    });
  };

  const handleReject = (workflow: ApprovalWorkflow) => {
    rejectMutation.mutate({
      id: workflow.id,
      rejectionReason: 'Rejected by user',
    });
  };

  const canApproveOrReject = (workflow: ApprovalWorkflow) => {
    return workflow.status === 'P';
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status) {
      case 'A':
        return 'success';
      case 'R':
        return 'error';
      case 'P':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    if (!priority) return 'default';
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns: TableColumn<ApprovalWorkflow>[] = [
    {
      id: 'reference_number',
      label: 'Reference Number',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium">
          {row.reference_number}
        </Typography>
      ),
    },
    {
      id: 'workflow_type',
      label: 'Workflow Type',
      render: (_value, row) => (
        <Chip label={row.workflow_type} size="small" className="!capitalize" />
      ),
    },
    {
      id: 'requested_by',
      label: 'Requested By',
      render: (_value, row) =>
        row.requested_by_user?.name || `User #${row.requested_by}`,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={
            row.status === 'P'
              ? 'Pending'
              : row.status === 'A'
                ? 'Approved'
                : row.status === 'R'
                  ? 'Rejected'
                  : 'N/A'
          }
          color={getStatusColor(row.status) as any}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'priority',
      label: 'Priority',
      render: (_value, row) => (
        <Chip
          label={row.priority || 'N/A'}
          color={getPriorityColor(row.priority) as any}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'progress',
      label: 'Progress',
      render: (_value, row) => (
        <div className="!flex !items-center !gap-2">
          <Typography variant="body2" className="!text-sm">
            Step {row.current_step || 0} of {row.total_steps}
          </Typography>
          <div className="!flex-1 !max-w-[100px] !bg-gray-200 !rounded-full !h-2">
            <div
              className="!bg-blue-600 !h-2 !rounded-full"
              style={{
                width: `${((row.current_step || 0) / row.total_steps) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'request_date',
      label: 'Request Date',
      render: (_value, row) => formatDate(row.request_date) || 'N/A',
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => {
        const canAction = canApproveOrReject(row);
        return (
          <div className="!flex !gap-2 !items-center">
            <PopConfirm
              title="Approve Workflow"
              description={`Are you sure you want to approve workflow ${row.reference_number}?`}
              onConfirm={() => handleApprove(row)}
              confirmText="Approve"
              cancelText="Cancel"
              placement="top"
              disabled={!canAction || approveMutation.isPending}
            >
              <ActionButton
                onClick={() => {}}
                tooltip="Approve workflow"
                icon={<Check className="!w-4 !h-4" />}
                color="success"
                disabled={!canAction || approveMutation.isPending}
              />
            </PopConfirm>
            <PopConfirm
              title="Reject Workflow"
              description={`Are you sure you want to reject workflow ${row.reference_number}?`}
              onConfirm={() => handleReject(row)}
              confirmText="Reject"
              cancelText="Cancel"
              placement="top"
              disabled={!canAction || rejectMutation.isPending}
            >
              <ActionButton
                onClick={() => {}}
                tooltip="Reject workflow"
                icon={<X className="!w-4 !h-4" />}
                color="error"
                disabled={!canAction || rejectMutation.isPending}
              />
            </PopConfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="!mb-3 !flex !justify-between !items-center">
        <div>
          <Typography variant="h6" className="!font-bold !text-gray-900">
            Approval Workflows
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            Manage and track approval workflows for various business processes
          </Typography>
        </div>
      </div>

      <div className="!bg-white !rounded-lg !shadow-sm !p-4 !mb-6">
        <div className="!flex !flex-wrap !gap-4 !items-end">
          <div className="!flex-1 ">
            <SearchInput
              placeholder="Search Approval Workflows..."
              value={search}
              onChange={setSearch}
              className="!min-w-[300px]"
            />
          </div>
          <div className="!w-[180px]">
            <Select
              label="Status"
              value={statusFilter}
              fullWidth
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="P">Pending</MenuItem>
              <MenuItem value="A">Approved</MenuItem>
              <MenuItem value="R">Rejected</MenuItem>
            </Select>
          </div>
          <div className="!w-[180px]">
            <Select
              label="Priority"
              value={priorityFilter}
              fullWidth
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={workflows}
        loading={isLoading}
        page={page - 1}
        onPageChange={newPage => setPage(newPage + 1)}
        rowsPerPage={limit}
        totalCount={pagination?.total_count || 0}
      />
    </>
  );
};

export default ApprovalWorkflows;
