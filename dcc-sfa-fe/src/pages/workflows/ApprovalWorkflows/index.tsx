import { Chip, MenuItem, Typography } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import { useRequestsByUsers, useRequestTypes } from 'hooks/useRequests';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  FileText,
  X,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import type { Request } from 'services/requests';
import { ActionButton } from 'shared/ActionButton';
import ApprovalModal from 'shared/ApprovalModal';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { CurrentApproverTooltip } from 'shared/CurrentApproverTooltip';
import { formatDateTime } from 'utils/dateUtils';

const ApprovalWorkflows: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requestTypeFilter, setRequestTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { isRead, isUpdate } = usePermission('approval');

  const { data: requestsResponse, isFetching } = useRequestsByUsers(
    {
      page,
      limit,
      search: search,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      request_type: requestTypeFilter !== 'all' ? requestTypeFilter : undefined,
    },
    {
      enabled: isRead,
    }
  );

  const { data: requestTypesResponse } = useRequestTypes({ enabled: isRead });

  const requests: Request[] = requestsResponse?.data || [];
  const pagination = requestsResponse?.pagination;
  const stats = requestsResponse?.stats;
  const requestTypes = requestTypesResponse?.data || [];

  const handleApproveClick = (request: Request) => {
    setSelectedRequest(request);
    setDialogType('approve');
    setDialogOpen(true);
  };

  const handleRejectClick = (request: Request) => {
    setSelectedRequest(request);
    setDialogType('reject');
    setDialogOpen(true);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setTimeout(() => {
      setSelectedRequest(null);
    }, 200);
  };

  const formatRequestType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
  };

  const getReferenceNumber = (request: Request): string => {
    if (request.reference_details) {
      if (
        request.request_type === 'ORDER_APPROVAL' &&
        request.reference_details.order_number
      ) {
        return request.reference_details.order_number;
      }
      if (
        request.request_type === 'ASSET_MOVEMENT_APPROVAL' &&
        request.reference_details.movement_number
      ) {
        return request.reference_details.movement_number;
      }
      if (
        request.request_type === 'LOCATION_RESET' &&
        request.reference_details.customer_code
      ) {
        return request.reference_details.customer_code;
      }
    }

    if (request.request_data) {
      try {
        const data = JSON.parse(request.request_data);
        if (request.request_type === 'CUSTOMER_CREATION') {
          return (
            data.customer_data?.code ||
            request.reference_details?.customer_code ||
            `NEW-CUST-${request.id}`
          );
        }
        if (request.request_type === 'LOCATION_RESET') {
          return (
            data.customer_code ||
            request.reference_details?.customer_code ||
            `LOC-${request.reference_id || request.id}`
          );
        }
      } catch (e) {
        console.error('Error parsing request data:', e);
      }
    }

    return request.reference_id
      ? `#${request.reference_id}`
      : `REQ-${request.id}`;
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'A':
      case 'APPROVED':
        return 'success';
      case 'R':
      case 'REJECTED':
        return 'error';
      case 'P':
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'N/A';
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'A':
      case 'APPROVED':
        return 'Approved';
      case 'R':
      case 'REJECTED':
        return 'Rejected';
      case 'P':
      case 'PENDING':
        return 'Pending';
      default:
        return status;
    }
  };

  const columns: TableColumn<Request>[] = [
    {
      id: 'reference',
      label: 'Reference',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium">
          {getReferenceNumber(row)}
        </Typography>
      ),
    },
    {
      id: 'request_type',
      label: 'Request Type',
      render: (_value, row) => (
        <Chip
          label={formatRequestType(row.request_type)}
          size="small"
          className="!capitalize"
        />
      ),
    },
    {
      id: 'requester',
      label: 'Requested By',
      render: (_value, row) =>
        row.requester?.name || `User #${row.requester_id}`,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => {
        const approvalStatus = row.approvals?.[0]?.status || row.status;
        const firstPendingStep = row.approvals?.find(step => step.status === 'P');
        const approver = firstPendingStep?.approver;
        const currentApproverStr = approver
          ? JSON.stringify({
            name: approver.name,
            email: approver.email || '',
            profile_image: approver.profile_image || null,
            employee_id: approver.employee_id || '',
          })
          : null;

        const chipEl = (
          <Chip
            label={getStatusLabel(approvalStatus)}
            color={getStatusColor(approvalStatus) as any}
            size="small"
            className="!capitalize"
          />
        );

        if (approvalStatus?.toUpperCase() === 'P' && currentApproverStr) {
          return (
            <CurrentApproverTooltip currentApprover={currentApproverStr}>
              <span>{chipEl}</span>
            </CurrentApproverTooltip>
          );
        }

        return chipEl;
      },
    },
    {
      id: 'createdate',
      label: 'Request Date',
      render: (_value, row) =>
        formatDateTime(
          row.createdate instanceof Date
            ? row.createdate.toISOString()
            : String(row.createdate || '')
        ) || 'N/A',
    },
    ...(isUpdate
      ? [
        {
          id: 'actions',
          label: 'Actions',
          sortable: false,
          render: (_value: any, row: Request) => {
            const normalizedStatus = row.approvals?.[0]?.status || row.status;
            return (
              <div className="!flex !gap-2 !items-center">
                <ActionButton
                  onClick={() => handleApproveClick(row)}
                  tooltip="Approve request"
                  icon={<Check className="!w-4 !h-4" />}
                  color="success"
                  disabled={normalizedStatus?.toUpperCase() !== 'P'}
                />
                <ActionButton
                  onClick={() => handleRejectClick(row)}
                  tooltip="Reject request"
                  icon={<X className="!w-4 !h-4" />}
                  color="error"
                  disabled={normalizedStatus?.toUpperCase() !== 'P'}
                />
              </div>
            );
          },
        },
      ]
      : []),
  ];

  return (
    <>
      <div className="!mb-3 !flex !justify-between !items-center">
        <div>
          <Typography variant="h6" className="!font-bold !text-gray-900">
            Approval Requests
          </Typography>
          <Typography variant="body2" className="!text-gray-500">
            Manage and track approval requests for various business processes
          </Typography>
        </div>
      </div>

      {isRead && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatsCard
            title="Total Requests"
            value={stats?.total_requests || 0}
            icon={<FileText className="w-6 h-6" />}
            color="blue"
            isLoading={isFetching}
          />
          <StatsCard
            title="Pending Requests"
            value={stats?.pending_requests || 0}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="orange"
            isLoading={isFetching}
          />
          <StatsCard
            title="Approved Requests"
            value={stats?.approved_requests || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            isLoading={isFetching}
          />
          <StatsCard
            title="Rejected Requests"
            value={stats?.rejected_requests || 0}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            isLoading={isFetching}
          />
        </div>
      )}

      <Table
        columns={columns}
        data={requests}
        loading={isFetching}
        page={page - 1}
        onPageChange={newPage => setPage(newPage + 1)}
        rowsPerPage={limit}
        totalCount={pagination?.total_count || 0}
        isPermission={isRead}
        actions={
          isRead ? (
            <div className="flex justify-between gap-3 items-center flex-wrap">
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  placeholder="Search requests..."
                  value={search}
                  onChange={setSearch}
                  debounceMs={400}
                  showClear={true}
                  className="!w-80"
                />
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="!w-40"
                  disableClearable
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="P">Pending</MenuItem>
                  <MenuItem value="A">Approved</MenuItem>
                  <MenuItem value="R">Rejected</MenuItem>
                </Select>
                <Select
                  value={requestTypeFilter}
                  onChange={e => setRequestTypeFilter(e.target.value)}
                  className="!w-48"
                  disableClearable
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {requestTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          ) : undefined
        }
        emptyMessage={
          search
            ? `No requests found matching "${search}"`
            : 'No approval requests found'
        }
      />

      {/* Approval Modal */}
      <ApprovalModal
        open={dialogOpen}
        onClose={handleDialogCancel}
        request={selectedRequest}
        type={dialogType}
      />
    </>
  );
};

export default ApprovalWorkflows;
