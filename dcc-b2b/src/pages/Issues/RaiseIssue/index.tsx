import { MenuItem as MuiMenuItem, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { UploadCloud } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from 'shared/Button';
import * as Yup from 'yup';

const issueSchema = Yup.object({
  orderNumber: Yup.string().required('Order number is required'),
  type: Yup.string().required('Issue type is required'),
  subject: Yup.string().required('Subject is required'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Please provide more details'),
});

const RaiseIssue: React.FC = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      orderNumber: '',
      type: '',
      subject: '',
      description: '',
    },
    validationSchema: issueSchema,
    onSubmit: async (_values, { setSubmitting }) => {
      await new Promise(r => setTimeout(r, 800));
      toast.success(
        'Issue submitted successfully. Our team will review it shortly.'
      );
      setSubmitting(false);
      navigate('/issues');
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xl font-bold text-gray-900">Raise an Issue</p>
        <p className="text-sm text-gray-500">
          Report problems with orders, deliveries, or products
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField
              select
              label="Related Order Number"
              fullWidth
              size="small"
              {...formik.getFieldProps('orderNumber')}
              error={
                formik.touched.orderNumber && Boolean(formik.errors.orderNumber)
              }
              helperText={
                formik.touched.orderNumber && formik.errors.orderNumber
              }
            >
              <MuiMenuItem value="B2B-2026-0001">
                B2B-2026-0001 (Delivered)
              </MuiMenuItem>
              <MuiMenuItem value="B2B-2026-0002">
                B2B-2026-0002 (In Transit)
              </MuiMenuItem>
              <MuiMenuItem value="B2B-2026-0005">
                B2B-2026-0005 (Scheduled)
              </MuiMenuItem>
              <MuiMenuItem value="General">
                General / No specific order
              </MuiMenuItem>
            </TextField>

            <TextField
              select
              label="Issue Type"
              fullWidth
              size="small"
              {...formik.getFieldProps('type')}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
            >
              <MuiMenuItem value="shortage">
                Shortage / Missing Items
              </MuiMenuItem>
              <MuiMenuItem value="damage">Damaged Goods</MuiMenuItem>
              <MuiMenuItem value="wrong_product">
                Wrong Product Delivered
              </MuiMenuItem>
              <MuiMenuItem value="late_delivery">Late Delivery</MuiMenuItem>
              <MuiMenuItem value="pricing_dispute">Pricing Dispute</MuiMenuItem>
              <MuiMenuItem value="other">Other</MuiMenuItem>
            </TextField>
          </div>

          <TextField
            label="Subject"
            fullWidth
            size="small"
            placeholder="Brief summary of the issue"
            {...formik.getFieldProps('subject')}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
          />

          <TextField
            label="Detailed Description"
            fullWidth
            multiline
            rows={4}
            placeholder="Please provide as much detail as possible..."
            {...formik.getFieldProps('description')}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={formik.touched.description && formik.errors.description}
          />

          {/* Dummy File Upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Click to upload photo evidence
            </p>
            <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="text"
              color="primary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              loading={formik.isSubmitting}
            >
              Submit Issue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIssue;
