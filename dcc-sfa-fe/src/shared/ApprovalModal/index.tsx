import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useTakeActionOnRequest } from 'hooks/useRequests';
import { Check, X } from 'lucide-react';
import React from 'react';
import type { Request } from 'services/requests';
import Button from 'shared/Button';
import Input from 'shared/Input';
import * as yup from 'yup';

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  request: Request | null;
  type: 'approve' | 'reject';
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  open,
  onClose,
  request,
  type,
}) => {
  const takeActionMutation = useTakeActionOnRequest();

  const formik = useFormik({
    initialValues: {
      remarks: '',
    },
    validationSchema: yup.object({
      remarks: yup
        .string()
        .required(
          `${type === 'approve' ? 'Approval' : 'Rejection'} remarks are required`
        )
        .trim()
        .min(
          1,
          `${type === 'approve' ? 'Approval' : 'Rejection'} remarks are required`
        ),
    }),
    enableReinitialize: true,
    onSubmit: async values => {
      if (!request || !request.approvals?.[0]) return;

      try {
        await takeActionMutation.mutateAsync({
          request_id: request.id,
          approval_id: request.approvals[0].id,
          action: type === 'approve' ? 'A' : 'R',
          remarks: values.remarks.trim(),
        });
        formik.resetForm();
        onClose();
      } catch (error) {
        console.error('Error taking action on request:', error);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      className="!rounded-lg"
    >
      <DialogTitle className="!flex !items-center !gap-3 !pb-4 !border-b !border-gray-200 !relative">
        <div
          className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !shrink-0 ${
            type === 'approve' ? '!bg-green-100' : '!bg-red-100'
          }`}
        >
          {type === 'approve' ? (
            <Check className="!w-6 !h-6 !text-green-600" />
          ) : (
            <X className="!w-6 !h-6 !text-red-600" />
          )}
        </div>
        <div className="!flex-1">
          <Typography variant="h6" className="!font-semibold !text-gray-900">
            {type === 'approve' ? 'Approve Request?' : 'Reject Request?'}
          </Typography>
          <Typography variant="body2" className="!text-gray-600 !mt-1">
            {type === 'approve' ? (
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
                {request?.request_type?.toLowerCase() || 'request'} from{' '}
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
          className="!absolute !top-2 !right-2 !bg-white !rounded-full !shadow-md hover:!bg-gray-100 !border !border-gray-200"
          size="small"
        >
          <X className="!w-4 !h-4 !text-gray-600" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!p-4">
        {request && (
          <div className="!mb-4 !pb-4 !border-b !border-gray-200">
            <Typography
              variant="subtitle2"
              className="!font-semibold !text-gray-700 !mb-3"
            >
              Request Details
            </Typography>
            {request.reference_details ? (
              <div className="!bg-gray-50 !rounded-md !p-4 !border !border-gray-200">
                {/* ORDER_APPROVAL Details */}
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

                {/* ASSET_MOVEMENT_APPROVAL Details */}
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
          label={type === 'approve' ? 'Approval Remarks' : 'Rejection Remarks'}
          placeholder={
            type === 'approve'
              ? 'Enter approval remarks...'
              : 'Enter rejection remarks...'
          }
          formik={formik}
          required
        />
      </DialogContent>

      <DialogActions className="!px-6 !py-4 !gap-2">
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={type === 'approve' ? 'success' : 'error'}
          startIcon={
            type === 'approve' ? (
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
            ? type === 'approve'
              ? 'Approving...'
              : 'Rejecting...'
            : type === 'approve'
              ? 'Yes, Approve'
              : 'Yes, Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalModal;
