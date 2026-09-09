import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';

import { Check, Close, Description, ExpandMore } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useTakeActionOnRequest } from 'hooks/useRequests';
import { useResolvedUom } from 'hooks/useUnitOfMeasurement';
import React from 'react';
import type { Request } from 'services/requests';
import Button from 'shared/Button';
import { formatCalendarTime, formatDate } from 'utils/dateUtils';
import { getSourceSystemLabel } from 'utils/sourceSystem';

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  request: Request | null;
  type: 'approve' | 'reject' | 'view';
}

/**
 * Formats quantity display omitting 0 case or piece values.
 *
 * @param cases - Number of cases
 * @param pieces - Number of pieces
 * @param isRGB - Whether the item is returnable glass
 * @param uomCase - Unit label for cases
 * @param uomPcs - Unit label for pieces
 * @returns Formatted quantity string
 */
function formatQuantityDisplay(
  cases: number,
  pieces: number,
  isRGB: boolean | undefined,
  uomCase: string = 'Cs',
  uomPcs: string = 'Btls'
): string {
  const c = Math.abs(cases);
  const p = Math.abs(pieces);

  if (!isRGB) {
    return `${c} ${uomCase}`;
  }

  if (c === 0 && p === 0) {
    return `0 ${uomCase}`;
  }

  if (c === 0) {
    return `${p} ${uomPcs}`;
  }

  if (p === 0) {
    return `${c} ${uomCase}`;
  }

  return `${c} ${uomCase} ${p} ${uomPcs}`;
}

/**
 * Formats signed variance quantity in cases and pieces.
 *
 * @param cases - Signed cases variance
 * @param pieces - Signed pieces variance
 * @param isRGB - Whether the item is returnable glass
 * @param uomCase - Unit label for cases
 * @param uomPcs - Unit label for pieces
 * @returns Formatted signed variance string
 */
function formatVarianceDisplay(
  cases: number,
  pieces: number,
  isRGB: boolean | undefined,
  uomCase: string = 'Cs',
  uomPcs: string = 'Btls'
): string {
  const c = Math.abs(cases);
  const p = Math.abs(pieces);
  const isZero = c === 0 && (!isRGB || p === 0);

  if (isZero) {
    return `0 ${uomCase}`;
  }

  const sign = cases < 0 || pieces < 0 ? '-' : '+';

  if (!isRGB || p === 0) {
    return `${sign}${c} ${uomCase}`;
  }

  if (c === 0) {
    return `${sign}${p} ${uomPcs}`;
  }

  return `${sign}${c} ${uomCase} ${p} ${uomPcs}`;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  open,
  onClose,
  request,
  type,
}) => {
  const { uomCase: defaultUomCase, uomPcs: defaultUomPcs } = useResolvedUom();
  const queryClient = useQueryClient();
  const takeActionMutation = useTakeActionOnRequest();

  const handleSubmit = async () => {
    if (type === 'view') return;
    if (!request || !request.approvals?.[0]) return;

    try {
      await takeActionMutation.mutateAsync({
        request_id: request.id,
        approval_id: request.approvals[0].id,
        action: type === 'approve' ? 'A' : 'R',
        remarks: type === 'approve' ? 'Approved' : 'Rejected',
      });
      await queryClient.invalidateQueries({ queryKey: ['requests'] });
      await queryClient.refetchQueries({ queryKey: ['requests'] });
      onClose();
    } catch (error) {
      console.error('Error taking action on request:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const getParsedRequestData = () => {
    if (!request?.request_data) return null;
    try {
      return JSON.parse(request.request_data);
    } catch (e) {
      console.error('Error parsing request data:', e);
      return null;
    }
  };

  const requestData = getParsedRequestData();

  const formatRequestType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
  };

  const getReferenceNumber = (request: Request | null): string => {
    if (!request) return '';
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
      if (
        request.request_type === 'RECONCILIATION_APPROVAL' &&
        request.reference_details.reconciliation_id
      ) {
        return `REC-${request.reference_details.reconciliation_id}`;
      }
      if (request.request_type === 'VAN_INVENTORY') {
        return `VAN-${request.reference_id || request.id}`;
      }
    }

    if (request.request_data) {
      try {
        const data = JSON.parse(request.request_data);
        if (request.request_type === 'VAN_INVENTORY') {
          return `VAN-${request.reference_id || request.id}`;
        }
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

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth={
        request?.request_type === 'RECONCILIATION_APPROVAL' ? 'md' : 'sm'
      }
      fullWidth
      className="!rounded-lg"
    >
      <DialogTitle className="!flex !items-center !gap-3 !pb-4 !border-b !border-gray-200 !relative">
        <div
          className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !shrink-0 ${
            type === 'approve'
              ? '!bg-green-100'
              : type === 'reject'
                ? '!bg-red-100'
                : '!bg-blue-100'
          }`}
        >
          {type === 'approve' ? (
            <Check className="!w-6 !h-6 !text-green-600" />
          ) : type === 'reject' ? (
            <Close className="!w-6 !h-6 !text-red-600" />
          ) : (
            <Description className="!w-6 !h-6 !text-blue-600" />
          )}
        </div>
        <div className="!flex-1">
          <Typography variant="h6" className="!font-semibold !text-gray-900">
            {type === 'approve'
              ? 'Approve Request?'
              : type === 'reject'
                ? 'Reject Request?'
                : 'Request Details'}
          </Typography>
          <Typography variant="body2" className="!text-gray-600 !mt-1">
            {type === 'view' ? (
              <>
                Viewing{' '}
                <span className="!font-semibold !text-gray-900">
                  {getReferenceNumber(request)}
                </span>{' '}
                - {formatRequestType(request?.request_type || '')}
              </>
            ) : type === 'approve' ? (
              <>
                Are you sure you want to approve this{' '}
                {request?.request_type?.replaceAll('_', ' ').toLowerCase() ||
                  'request'}{' '}
                from{' '}
                <span className="!font-semibold !text-gray-900">
                  {request?.requester?.name || 'User'}
                </span>
                ?
              </>
            ) : (
              <>
                Are you sure you want to reject this{' '}
                {request?.request_type?.replaceAll('_', ' ').toLowerCase() ||
                  'request'}{' '}
                from{' '}
                <span className="!font-semibold !text-gray-900">
                  {request?.requester?.name || 'User'}
                </span>
                ?
              </>
            )}
          </Typography>
        </div>
        <IconButton
          onClick={handleCancel}
          className="!absolute !top-2 !right-2 !bg-white !rounded hover:!bg-gray-100 !border !border-gray-200"
          size="small"
        >
          <Close className="!w-4 !h-4 !text-gray-600" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!p-4">
        {request && (
          <div className="!mb-4 !pb-4">
            {request.reference_details ? (
              <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                {request.request_type === 'ORDER_APPROVAL' && (
                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    {request.reference_details.order_number && (
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
                          {request.reference_details.order_number}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.customer_name && (
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
                          {request.reference_details.customer_name}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.customer_code && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Customer Code
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.customer_code}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.salesperson_name && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Salesperson
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.salesperson_name}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.total_amount && (
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
                          {request.reference_details.total_amount}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.order_date && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Order Date
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.order_date}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.payment_method && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Payment Method
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.payment_method}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.status && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Order Status
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.status}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}

                {request.request_type === 'ASSET_MOVEMENT_APPROVAL' && (
                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    {request.reference_details.movement_number && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Movement Number
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.movement_number}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.movement_type && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Movement Type
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !capitalize !text-gray-900"
                        >
                          {request.reference_details.movement_type}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.from_location && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          From Location
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.from_location}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.to_location && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          To Location
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.to_location}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.performed_by && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Performed By
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.performed_by}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.movement_date && (
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Movement Date
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.movement_date}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.assets && (
                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Assets
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.assets}
                        </Typography>
                      </div>
                    )}

                    {request.reference_details.notes && (
                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Notes
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.notes}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}

                {request.request_type === 'LOCATION_RESET' && (
                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    {request.reference_details.customer_name && (
                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Customer
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.customer_name}
                        </Typography>
                      </div>
                    )}

                    <div className="!space-y-1">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        New Coordinates
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {request.reference_details.new_latitude ||
                          requestData?.latitude ||
                          'N/A'}
                        ,{' '}
                        {request.reference_details.new_longitude ||
                          requestData?.longitude ||
                          'N/A'}
                      </Typography>
                    </div>

                    <div className="!space-y-1">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        Old Coordinates
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-medium !text-gray-600"
                      >
                        {request.reference_details.old_latitude ||
                          requestData?.old_latitude ||
                          'N/A'}
                        ,{' '}
                        {request.reference_details.old_longitude ||
                          requestData?.old_longitude ||
                          'N/A'}
                      </Typography>
                    </div>

                    <div className="!space-y-1 md:!col-span-2">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        Relocation Reason
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-medium !text-gray-800 !italic"
                      >
                        {request.reference_details.reason ||
                          requestData?.reason ||
                          'No reason provided'}
                      </Typography>
                    </div>
                  </div>
                )}

                {request.request_type === 'CUSTOMER_CREATION' && (
                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    <div className="!space-y-1">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        Customer Name
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {request.reference_details.customer_name ||
                          requestData?.customer_data?.name ||
                          'N/A'}
                      </Typography>
                    </div>

                    <div className="!space-y-1">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        Customer Code
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-semibold !text-gray-900"
                      >
                        {request.reference_details.customer_code ||
                          requestData?.customer_data?.code ||
                          'N/A'}
                      </Typography>
                    </div>

                    <div className="!space-y-1">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        Email Address
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-medium !text-gray-800"
                      >
                        {request.reference_details.email ||
                          requestData?.customer_data?.email ||
                          'N/A'}
                      </Typography>
                    </div>

                    <div className="!space-y-1">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        Phone Number
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-medium !text-gray-800"
                      >
                        {request.reference_details.phone_number ||
                          requestData?.customer_data?.phone_number ||
                          'N/A'}
                      </Typography>
                    </div>

                    <div className="!space-y-1 md:!col-span-2">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                      >
                        Location
                      </Typography>
                      <Typography
                        variant="body2"
                        className="!font-medium !text-gray-800"
                      >
                        {request.reference_details.city ||
                          requestData?.customer_data?.city ||
                          'N/A'}
                        ,{' '}
                        {request.reference_details.state ||
                          requestData?.customer_data?.state ||
                          'N/A'}
                      </Typography>
                    </div>

                    {(request.reference_details.profile_picture ||
                      requestData?.customer_data?.profile_picture) && (
                      <div className="!space-y-1 md:!col-span-2">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Profile Picture
                        </Typography>
                        <div className="!mt-1">
                          <img
                            src={(
                              request.reference_details.profile_picture ||
                              requestData?.customer_data?.profile_picture
                            ).trim()}
                            alt="Profile"
                            className="!w-24 !h-24 !rounded-lg !object-cover !border !border-gray-200 shadow-sm"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                'https://via.placeholder.com/100?text=No+Image';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {request.request_type === 'RECONCILIATION_APPROVAL' && (
                  <div className="!space-y-4">
                    <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-3 !bg-white !p-3 !rounded-lg !border !border-gray-200">
                      {request.reference_details.salesman_name && (
                        <div className="!space-y-1">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Salesman
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {request.reference_details.salesman_name}{' '}
                            {request.reference_details.salesman_employee_id
                              ? `(${request.reference_details.salesman_employee_id})`
                              : ''}
                          </Typography>
                        </div>
                      )}

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Reconciliation Date
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {formatDate(
                            request.reference_details.reconciliation_date
                          ) || 'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Depot
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-medium !text-gray-800"
                        >
                          {request.reference_details.depot_name || 'N/A'}
                          {request.reference_details.depot_code
                            ? ` (${request.reference_details.depot_code})`
                            : ''}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                        >
                          Total Items
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details.total_items ??
                            request.reference_details.items?.length ??
                            'N/A'}
                        </Typography>
                      </div>

                      {request.reference_details.message && (
                        <div className="!space-y-1 md:!col-span-2">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                          >
                            Message
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-medium !text-gray-800 !italic"
                          >
                            {request.reference_details.message}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {Array.isArray(request.reference_details.items) &&
                      request.reference_details.items.length > 0 && (
                        <div className="!space-y-2">
                          <div className="!flex !justify-between !items-center">
                            <Typography
                              variant="caption"
                              className="!text-gray-600 !text-xs !uppercase !tracking-wider !font-bold"
                            >
                              Reconciliation Items (
                              {request.reference_details.items.length})
                            </Typography>
                          </div>
                          <div className="!border !border-gray-200 !rounded-lg !overflow-hidden !shadow-sm">
                            <div className="!max-h-[360px] !overflow-y-auto">
                              <table className="!w-full !text-left !border-collapse !text-xs">
                                <thead className="!bg-gray-100 !sticky !top-0 !z-10 !border-b !border-gray-200">
                                  <tr>
                                    <th className="!py-2.5 !px-3 !font-semibold !text-gray-700 !text-center !w-10">
                                      #
                                    </th>
                                    <th className="!py-2.5 !px-3 !font-semibold !text-gray-700">
                                      Item Name
                                    </th>
                                    <th className="!py-2.5 !px-3 !font-semibold !text-gray-700 !text-center">
                                      Batch
                                    </th>
                                    <th className="!py-2.5 !px-3 !font-semibold !text-gray-700 !text-center">
                                      Expected ROP
                                    </th>
                                    <th className="!py-2.5 !px-3 !font-semibold !text-gray-700 !text-center">
                                      Actual ROP
                                    </th>
                                    <th className="!py-2.5 !px-3 !font-semibold !text-gray-700 !text-center">
                                      Variance
                                    </th>
                                    <th className="!py-2.5 !px-3 !font-semibold !text-gray-700 !text-center">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="!divide-y !divide-gray-200 !bg-white">
                                  {request.reference_details.items.map(
                                    (item: any, idx: number) => {
                                      const conv =
                                        Number(item.conversion_rate) || 1;
                                      const isRGB =
                                        item.sub_category_name
                                          ?.toUpperCase()
                                          .includes('RGB') ||
                                        item.sub_category_name
                                          ?.toUpperCase()
                                          .includes('RETURNABLE GLASS') ||
                                        item.stock_name
                                          ?.toUpperCase()
                                          .includes('RGB') ||
                                        item.stock_name
                                          ?.toUpperCase()
                                          .includes('RETURNABLE GLASS');

                                      const uomCase = defaultUomCase;
                                      const uomPcs = defaultUomPcs;

                                      const normalizeQty = (
                                        c: number,
                                        p: number
                                      ) => {
                                        if (conv <= 1)
                                          return { c: c || 0, p: p || 0 };
                                        const total =
                                          (c || 0) * conv + (p || 0);
                                        const sign = total < 0 ? -1 : 1;
                                        const abs = Math.abs(total);
                                        return {
                                          c: Math.floor(abs / conv) * sign,
                                          p: (abs % conv) * sign,
                                        };
                                      };

                                      const expRaw =
                                        Number(item.expected_rop) || 0;
                                      const expBaseRaw =
                                        Number(item.expected_base_qty) || 0;
                                      const actRaw =
                                        Number(item.actual_rop) || 0;
                                      const actBaseRaw =
                                        Number(item.actual_base_qty) || 0;

                                      const expected = normalizeQty(
                                        expRaw,
                                        expBaseRaw
                                      );
                                      const actual = normalizeQty(
                                        actRaw,
                                        actBaseRaw
                                      );

                                      const expectedTotalPieces =
                                        expRaw * conv + expBaseRaw;
                                      const actualTotalPieces =
                                        actRaw * conv + actBaseRaw;

                                      let variancePieces = 0;
                                      if (
                                        item.variance !== undefined &&
                                        item.variance !== null &&
                                        item.variance_base_qty !== undefined &&
                                        item.variance_base_qty !== null
                                      ) {
                                        variancePieces =
                                          Number(item.variance) * conv +
                                          Number(item.variance_base_qty);
                                      } else {
                                        variancePieces = Math.round(
                                          actualTotalPieces -
                                            expectedTotalPieces
                                        );
                                      }

                                      const absV = Math.abs(variancePieces);
                                      const vCases = Math.floor(absV / conv);
                                      const vPcs = absV % conv;
                                      const signMultiplier =
                                        variancePieces < 0 ? -1 : 1;
                                      const signedCases =
                                        vCases * signMultiplier;
                                      const signedPieces =
                                        vPcs * signMultiplier;

                                      const isShort = variancePieces < 0;
                                      const isExcess = variancePieces > 0;
                                      const isClean = variancePieces === 0;

                                      const vColor = isShort
                                        ? '!text-red-600'
                                        : isExcess
                                          ? '!text-blue-600'
                                          : '!text-gray-800';

                                      const expectedDisplay =
                                        formatQuantityDisplay(
                                          expected.c,
                                          expected.p,
                                          isRGB,
                                          uomCase,
                                          uomPcs
                                        );
                                      const actualDisplay =
                                        formatQuantityDisplay(
                                          actual.c,
                                          actual.p,
                                          isRGB,
                                          uomCase,
                                          uomPcs
                                        );
                                      const varianceDisplay =
                                        variancePieces === 0
                                          ? `0 ${uomCase}`
                                          : formatVarianceDisplay(
                                              signedCases,
                                              signedPieces,
                                              isRGB,
                                              uomCase,
                                              uomPcs
                                            );

                                      let actionLabel =
                                        item.resolution_action || 'CLEAN';
                                      if (
                                        actionLabel ===
                                          'Blocked - Force-Push Required' ||
                                        actionLabel === 'Awaiting Force-Push'
                                      ) {
                                        actionLabel = 'Blocked';
                                      } else if (
                                        actionLabel === 'Post to Default Outlet'
                                      ) {
                                        actionLabel = 'Posted to D/O';
                                      } else if (
                                        actionLabel === 'Adjust Unload Upward'
                                      ) {
                                        actionLabel = 'Adjust Unload';
                                      } else if (isClean) {
                                        actionLabel = 'CLEAN';
                                      } else {
                                        actionLabel = 'Posted to D/O';
                                      }

                                      return (
                                        <tr
                                          key={item.id || idx}
                                          className="hover:!bg-blue-50/40 !transition-colors"
                                        >
                                          <td className="!py-2.5 !px-3 !text-gray-400 !text-center">
                                            {idx + 1}
                                          </td>
                                          <td className="!py-2.5 !px-3">
                                            <div className="!font-semibold !text-gray-900">
                                              {item.stock_name}
                                            </div>
                                            {item.stock_code &&
                                              item.stock_code !== 'N/A' && (
                                                <span className="!text-[11px] !text-gray-500 !font-mono">
                                                  {item.stock_code}
                                                </span>
                                              )}
                                          </td>
                                          <td className="!py-2.5 !px-3 !text-center !text-gray-600 !font-mono !text-[11px]">
                                            {item.batch_number || '-'}
                                          </td>
                                          <td className="!py-2.5 !px-3 !text-center !font-medium !text-gray-800 !whitespace-nowrap">
                                            {expectedDisplay}
                                          </td>
                                          <td className="!py-2.5 !px-3 !text-center !font-medium !text-gray-800 !whitespace-nowrap">
                                            {actualDisplay}
                                          </td>
                                          <td
                                            className={`!py-2.5 !px-3 !text-center !font-bold !whitespace-nowrap ${vColor}`}
                                          >
                                            {varianceDisplay}
                                          </td>
                                          <td className="!py-2.5 !px-3 !text-center !whitespace-nowrap">
                                            <Chip
                                              label={actionLabel}
                                              size="small"
                                              color={
                                                isClean
                                                  ? 'success'
                                                  : actionLabel === 'Blocked'
                                                    ? 'warning'
                                                    : 'error'
                                              }
                                              variant="outlined"
                                              className="!text-[11px] !font-semibold !h-6"
                                            />
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {request.request_type === 'VAN_INVENTORY' && (
                  <div className="!space-y-4">
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Request Type
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          Van Stock{' '}
                          {requestData?.loading_type === 'L'
                            ? 'Load'
                            : 'Unload'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Document Date
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {formatCalendarTime(requestData?.document_date) ||
                            'N/A'}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Salesman
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details?.salesman_name || 'N/A'}
                          {requestData?.salesman_sap_code
                            ? ` (${requestData.salesman_sap_code})`
                            : ''}
                        </Typography>
                      </div>

                      <div className="!space-y-1">
                        <Typography
                          variant="caption"
                          className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                        >
                          Depot
                        </Typography>
                        <Typography
                          variant="body2"
                          className="!font-semibold !text-gray-900"
                        >
                          {request.reference_details?.depot_name || 'N/A'}
                          {requestData?.depot_sap_code
                            ? ` (${requestData.depot_sap_code})`
                            : ''}
                        </Typography>
                      </div>

                      {(request.reference_details?.vehicle_info ||
                        requestData?.vehicle_sap_code) && (
                        <div className="!space-y-1 md:!col-span-2">
                          <Typography
                            variant="caption"
                            className="!text-gray-500 !text-xs !uppercase !tracking-wide"
                          >
                            Vehicle Info
                          </Typography>
                          <Typography
                            variant="body2"
                            className="!font-semibold !text-gray-900"
                          >
                            {request.reference_details?.vehicle_info || 'N/A'}
                            {requestData?.vehicle_sap_code
                              ? ` (SAP: ${requestData.vehicle_sap_code})`
                              : ''}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {/* Items Section */}
                    <div className="!space-y-2 !pt-2 !border-t !border-gray-200">
                      <Typography
                        variant="caption"
                        className="!text-gray-500 !text-xs !uppercase !tracking-wide !font-medium"
                      >
                        Requested Items
                      </Typography>
                      <div className="!space-y-4 max-h-[300px] !overflow-y-auto !pr-1">
                        {Object.entries(
                          (
                            requestData?.van_inventory_items ||
                            requestData?.items ||
                            []
                          ).reduce((acc: any, item: any) => {
                            const docNum = item.sap_docnum || 'Unassigned';
                            if (!acc[docNum]) acc[docNum] = [];
                            acc[docNum].push(item);
                            return acc;
                          }, {})
                        ).map(
                          (
                            [docNum, items]: [string, any],
                            groupIdx: number
                          ) => (
                            <div key={groupIdx} className="!space-y-2">
                              {docNum !== 'Unassigned' && (
                                <Typography
                                  variant="subtitle2"
                                  className="!font-bold !text-gray-800 !bg-gray-100 !px-3 !py-2 !rounded-md !border !border-gray-200"
                                >
                                  SAP Document Number: {docNum}
                                </Typography>
                              )}
                              <div
                                className={
                                  docNum !== 'Unassigned'
                                    ? '!space-y-2 !pl-2'
                                    : '!space-y-2'
                                }
                              >
                                {items.map((item: any, idx: number) => (
                                  <Accordion
                                    key={idx}
                                    className="!shadow-none !border !border-gray-200 !rounded-md before:!hidden"
                                  >
                                    <AccordionSummary
                                      expandIcon={
                                        <ExpandMore className="w-5 h-5 text-gray-500" />
                                      }
                                      className="!min-h-0 !py-1"
                                    >
                                      <div className="!flex !justify-between !items-center !w-full !pr-4">
                                        <div className="!flex !flex-col">
                                          <Typography
                                            variant="body2"
                                            className="!font-semibold !text-gray-900"
                                          >
                                            {item.product_name || item.notes}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            className="!text-gray-500"
                                          >
                                            Code:{' '}
                                            {item.product_sap_code ||
                                              request?.reference_details
                                                ?.items_details?.[
                                                item.product_id
                                              ]?.code ||
                                              'N/A'}
                                          </Typography>
                                        </div>
                                        <Typography
                                          variant="body2"
                                          className="!font-bold !text-primary-600"
                                        >
                                          Qty: {item.quantity}
                                          {item.base_quantity
                                            ? ` | PCs: ${item.base_quantity}`
                                            : ''}
                                        </Typography>
                                      </div>
                                    </AccordionSummary>
                                    <AccordionDetails className="!bg-gray-50 !border-t !border-gray-200 !p-3">
                                      {(item.source_system ||
                                        item.sap_lineid) && (
                                        <div className="!grid !grid-cols-2 !gap-2 !mb-3">
                                          {item.source_system && (
                                            <div className="!flex !flex-col">
                                              <Typography
                                                variant="caption"
                                                className="!text-gray-500 !text-[10px] !uppercase"
                                              >
                                                Source System
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                className="!text-gray-800 !text-xs !font-medium"
                                              >
                                                {getSourceSystemLabel(
                                                  item.source_system
                                                ) || '-'}
                                              </Typography>
                                            </div>
                                          )}
                                          {item.sap_lineid && (
                                            <div className="!flex !flex-col">
                                              <Typography
                                                variant="caption"
                                                className="!text-gray-500 !text-[10px] !uppercase"
                                              >
                                                SAP Line ID
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                className="!text-gray-800 !text-xs !font-medium"
                                              >
                                                {item.sap_lineid || '-'}
                                              </Typography>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Batches details */}
                                      {item.product_batches &&
                                        item.product_batches.length > 0 && (
                                          <div className="!pl-3 !border-l-2 !border-gray-300 !space-y-1 !mb-2">
                                            <Typography
                                              variant="caption"
                                              className="!text-gray-500 !text-xs !font-medium"
                                            >
                                              Batches:
                                            </Typography>
                                            {item.product_batches.map(
                                              (batch: any, bIdx: number) => (
                                                <div
                                                  key={bIdx}
                                                  className="!flex !justify-between !text-xs !text-gray-600"
                                                >
                                                  <span>
                                                    Batch:{' '}
                                                    {batch.batch_number ||
                                                      'N/A'}{' '}
                                                    {batch.expiry_date &&
                                                      `(Exp: ${batch.expiry_date.split('T')[0]})`}
                                                  </span>
                                                  <span className="!font-medium !text-gray-800">
                                                    Qty: {batch.quantity}
                                                    {batch.base_quantity
                                                      ? ` | PCs: ${batch.base_quantity}`
                                                      : ''}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                      {item.batches &&
                                        item.batches.length > 0 && (
                                          <div className="!pl-3 !border-l-2 !border-gray-300 !space-y-1 !mb-2">
                                            <Typography
                                              variant="caption"
                                              className="!text-gray-500 !text-xs !font-medium"
                                            >
                                              Batches:
                                            </Typography>
                                            {item.batches.map(
                                              (batch: any, bIdx: number) => (
                                                <div
                                                  key={bIdx}
                                                  className="!flex !justify-between !text-xs !text-gray-600"
                                                >
                                                  <span>
                                                    Batch:{' '}
                                                    {batch.batch_number ||
                                                      'N/A'}{' '}
                                                    {batch.expiry_date &&
                                                      `(Exp: ${batch.expiry_date.split('T')[0]})`}
                                                  </span>
                                                  <span className="!font-medium !text-gray-800">
                                                    Qty: {batch.quantity}
                                                    {batch.base_quantity
                                                      ? ` | PCs: ${batch.base_quantity}`
                                                      : ''}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}

                                      {/* Serials details */}
                                      {item.product_serials &&
                                        item.product_serials.length > 0 && (
                                          <div className="!pl-3 !border-l-2 !border-gray-300 !space-y-1">
                                            <Typography
                                              variant="caption"
                                              className="!text-gray-500 !text-xs !font-medium"
                                            >
                                              Serials:
                                            </Typography>
                                            <div className="!flex !flex-wrap !gap-1">
                                              {item.product_serials.map(
                                                (serial: any, sIdx: number) => (
                                                  <span
                                                    key={sIdx}
                                                    className="!bg-gray-200 !text-gray-800 !text-[10px] !px-2 !py-0.5 !rounded"
                                                  >
                                                    {serial.serial_number ||
                                                      serial}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>

      <DialogActions className="!px-4 !pb-4 !gap-2">
        {type === 'view' ? (
          <Button
            size="small"
            variant="contained"
            onClick={handleCancel}
            className="!px-6"
          >
            Close
          </Button>
        ) : (
          <>
            <Button size="small" variant="outlined" onClick={handleCancel}>
              Close
            </Button>
            <Button
              size="small"
              variant="contained"
              color={type === 'approve' ? 'success' : 'error'}
              startIcon={
                type === 'approve' ? (
                  <Check className="!w-4 !h-4" />
                ) : (
                  <Close className="!w-4 !h-4" />
                )
              }
              onClick={handleSubmit}
              disabled={takeActionMutation.isPending}
            >
              {takeActionMutation.isPending
                ? type === 'approve'
                  ? 'Approving...'
                  : 'Rejecting...'
                : type === 'approve'
                  ? 'Confirm'
                  : 'Reject'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalModal;
