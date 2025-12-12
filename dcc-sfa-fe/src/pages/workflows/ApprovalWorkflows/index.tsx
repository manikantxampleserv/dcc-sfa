import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import {
  useRequestsByUsers,
  useTakeActionOnRequest,
  useRequestTypes,
} from 'hooks/useRequests';
import { usePermission } from 'hooks/usePermission';
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
import Button from 'shared/Button';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import * as yup from 'yup';

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

  const { data: requestsResponse, isLoading } = useRequestsByUsers(
    {
      page,
      limit,
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      request_type: requestTypeFilter !== 'all' ? requestTypeFilter : undefined,
    },
    {
      enabled: isRead,
    }
  );

  const { data: requestTypesResponse } = useRequestTypes();

  const requests: Request[] = requestsResponse?.data || [];
  const pagination = requestsResponse?.pagination;
  const stats = requestsResponse?.stats;
  const requestTypes = requestTypesResponse?.data || [];

  const takeActionMutation = useTakeActionOnRequest();

  const formik = useFormik({
    initialValues: {
      remarks: '',
    },
    validationSchema: yup.object({
      remarks: yup
        .string()
        .required(
          `${dialogType === 'approve' ? 'Approval' : 'Rejection'} remarks are required`
        )
        .trim()
        .min(
          1,
          `${dialogType === 'approve' ? 'Approval' : 'Rejection'} remarks are required`
        ),
    }),
    enableReinitialize: true,
    onSubmit: async values => {
      if (!selectedRequest || !selectedRequest.approvals?.[0]) return;

      try {
        await takeActionMutation.mutateAsync({
          request_id: selectedRequest.id,
          approval_id: selectedRequest.approvals[0].id,
          action: dialogType === 'approve' ? 'A' : 'R',
          remarks: values.remarks.trim(),
        });
        formik.resetForm();
        setDialogOpen(false);
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error taking action on request:', error);
      }
    },
  });

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
    formik.resetForm();
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const canApproveOrReject = (request: Request) => {
    const approvalStatus = request.approvals?.[0]?.status || request.status;
    return (
      approvalStatus?.toUpperCase() === 'P' ||
      approvalStatus?.toUpperCase() === 'PENDING'
    );
  };

  const formatRequestType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
  };

  const getReferenceNumber = (request: Request): string => {
    if (request.reference_details?.order_number) {
      return request.reference_details.order_number;
    }
    if (request.reference_id) {
      return `#${request.reference_id}`;
    }
    return `REQ-${request.id}`;
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
        return (
          <Chip
            label={getStatusLabel(approvalStatus)}
            color={getStatusColor(approvalStatus) as any}
            size="small"
            className="!capitalize"
          />
        );
      },
    },
    {
      id: 'createdate',
      label: 'Request Date',
      render: (_value, row) =>
        formatDate(
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
              const canAction = canApproveOrReject(row);
              return (
                <div className="!flex !gap-2 !items-center">
                  <ActionButton
                    onClick={() => handleApproveClick(row)}
                    tooltip="Approve request"
                    icon={<Check className="!w-4 !h-4" />}
                    color="success"
                    disabled={!canAction || takeActionMutation.isPending}
                  />
                  <ActionButton
                    onClick={() => handleRejectClick(row)}
                    tooltip="Reject request"
                    icon={<X className="!w-4 !h-4" />}
                    color="error"
                    disabled={!canAction || takeActionMutation.isPending}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Requests"
            value={stats?.total_requests || 0}
            icon={<FileText className="w-6 h-6" />}
            color="blue"
            isLoading={isLoading}
          />
          <StatsCard
            title="Pending Requests"
            value={stats?.pending_requests || 0}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="orange"
            isLoading={isLoading}
          />
          <StatsCard
            title="Approved Requests"
            value={stats?.approved_requests || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            isLoading={isLoading}
          />
          <StatsCard
            title="Rejected Requests"
            value={stats?.rejected_requests || 0}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            isLoading={isLoading}
          />
        </div>
      )}

      <Table
        columns={columns}
        data={requests}
        loading={isLoading}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogCancel}
        maxWidth="sm"
        fullWidth
        className="!rounded-lg"
      >
        <DialogTitle className="!flex !items-center !gap-3 !pb-4 !border-b !border-gray-200 !relative">
          <div
            className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !shrink-0 ${
              dialogType === 'approve' ? '!bg-green-100' : '!bg-red-100'
            }`}
          >
            {dialogType === 'approve' ? (
              <Check className="!w-6 !h-6 !text-green-600" />
            ) : (
              <X className="!w-6 !h-6 !text-red-600" />
            )}
          </div>
          <div className="!flex-1">
            <Typography variant="h6" className="!font-semibold !text-gray-900">
              {dialogType === 'approve'
                ? 'Approve Request?'
                : 'Reject Request?'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !mt-1">
              {dialogType === 'approve' ? (
                <>
                  Are you sure you want to approve this{' '}
                  {selectedRequest?.request_type
                    ?.replaceAll('_', ' ')
                    .toLowerCase() || 'request'}{' '}
                  from{' '}
                  <span className="!font-semibold !text-gray-900">
                    {selectedRequest?.requester?.name || 'User'}
                  </span>
                  ?
                </>
              ) : (
                <>
                  Are you sure you want to reject this{' '}
                  {selectedRequest?.request_type?.toLowerCase() || 'request'}{' '}
                  from{' '}
                  <span className="!font-semibold !text-gray-900">
                    {selectedRequest?.requester?.name || 'User'}
                  </span>
                  ?
                </>
              )}
            </Typography>
          </div>
          <IconButton
            onClick={handleDialogCancel}
            className="!absolute !top-2 !right-2 !bg-white !rounded-full !shadow-md hover:!bg-gray-100 !border !border-gray-200"
            size="small"
          >
            <X className="!w-4 !h-4 !text-gray-600" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="!p-4">
          {selectedRequest && (
            <div className="!mb-4 !pb-4 !border-b !border-gray-200">
              <Typography
                variant="subtitle2"
                className="!font-semibold !text-gray-700 !mb-3"
              >
                Request Details
              </Typography>
              {selectedRequest.reference_details ? (
                <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    {selectedRequest.reference_details.order_number && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Order Number
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {selectedRequest.reference_details.order_number}
                        </Typography>
                      </div>
                    )}

                    {selectedRequest.reference_details.customer_name && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Customer Name
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {selectedRequest.reference_details.customer_name}
                        </Typography>
                      </div>
                    )}

                    {selectedRequest.reference_details.total_amount && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Total Amount
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-primary-600"
                        >
                          {selectedRequest.reference_details.total_amount}
                        </Typography>
                      </div>
                    )}

                    {selectedRequest.reference_id && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Reference ID
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          #{selectedRequest.reference_id}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                  <Typography
                    variant="body2"
                    className="!text-gray-600 !text-center"
                  >
                    No request details available
                  </Typography>
                </div>
              )}
            </div>
          )}

          <Input
            name="remarks"
            multiline
            rows={3}
            label={
              dialogType === 'approve'
                ? 'Approval Remarks'
                : 'Rejection Remarks'
            }
            placeholder={
              dialogType === 'approve'
                ? 'Enter approval remarks...'
                : 'Enter rejection remarks...'
            }
            formik={formik}
            required
          />
        </DialogContent>

        <DialogActions className="!px-6 !py-4 !gap-2">
          <Button variant="outlined" onClick={handleDialogCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={dialogType === 'approve' ? 'success' : 'error'}
            startIcon={
              dialogType === 'approve' ? (
                <Check className="!w-4 !h-4" />
              ) : (
                <X className="!w-4 !h-4" />
              )
            }
            onClick={() => formik.handleSubmit()}
            disabled={
              takeActionMutation.isPending ||
              !formik.isValid ||
              !formik.values.remarks.trim()
            }
          >
            {takeActionMutation.isPending
              ? dialogType === 'approve'
                ? 'Approving...'
                : 'Rejecting...'
              : dialogType === 'approve'
                ? 'Yes, Approve'
                : 'Yes, Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApprovalWorkflows;
