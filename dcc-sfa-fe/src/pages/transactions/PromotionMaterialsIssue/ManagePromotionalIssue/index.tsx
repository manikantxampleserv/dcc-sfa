import { Alert, Box, MenuItem, Typography } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useAssetMaster } from 'hooks/useAssetMaster';
import {
  useCreatePromotionMaterialsIssue,
  usePromotionMaterialsIssue,
  useUpdatePromotionMaterialsIssue,
} from 'hooks/usePromotionMaterialsIssue';
import { Plus } from 'lucide-react';
import React, { useMemo } from 'react';
import { toast } from 'react-toastify';
import type { PromotionMaterialsIssue } from 'services/transactions/PromotionMaterialsIssue';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import DepotSelect from 'shared/DepotSelect';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import * as Yup from 'yup';

interface ManagePromotionalIssueProps {
  open: boolean;
  onClose: () => void;
  issue?: PromotionMaterialsIssue | null;
}

export interface PromoItemFormData {
  asset_id: number | '';
  item_code?: string;
  uom?: string;
  quantity: string;
  unit_value: string;
  total_value: string;
  isLoaded?: boolean;
}

const validationSchema = Yup.object({
  depot_id: Yup.string().required('Issue Depot is required'),
  outlet_id: Yup.string().required('Outlet is required'),
  issue_date: Yup.string().required('Issue Date is required'),
  issued_by_id: Yup.string().required('Issued By is required'),
  campaign_reference: Yup.string(),
  notes: Yup.string(),
});

const ManagePromotionalIssue: React.FC<ManagePromotionalIssueProps> = ({
  open,
  onClose,
  issue,
}) => {
  const isEdit = !!issue;
  const { user } = useAuth();

  const { data: issueResponse } = usePromotionMaterialsIssue(issue?.id || 0);
  const issueData = issue?.id ? issueResponse?.data || issue : null;

  const createMutation = useCreatePromotionMaterialsIssue();
  const updateMutation = useUpdatePromotionMaterialsIssue();

  const formik = useFormik({
    initialValues: {
      depot_id: issueData?.depot_id?.toString() || '',
      outlet_id: issueData?.outlet_id?.toString() || '',
      issue_date: issueData?.issue_date
        ? dayjs(issueData.issue_date).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
      issued_by_id:
        issueData?.issued_by_id?.toString() ||
        issueData?.issued_by?.id?.toString() ||
        user?.id?.toString() ||
        '',
      campaign_reference: issueData?.campaign_reference || '',
      notes: issueData?.notes || '',
      items: issueData?.items
        ? issueData.items.map((item: any) => ({
            asset_id: item.asset_id,
            item_code: item.asset?.code || '-',
            uom: 'pcs',
            quantity: item.quantity.toString(),
            unit_value: (item.unit_value || 0).toString(),
            total_value: (item.total_value || 0).toString(),
            isLoaded: true,
          }))
        : ([] as PromoItemFormData[]),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (values.items.length === 0) {
          toast.error('Please add at least one promotion item.');
          return;
        }

        for (let i = 0; i < values.items.length; i++) {
          const item = values.items[i];
          if (!item.asset_id) {
            toast.error(`Item ${i + 1}: Please select an item.`);
            return;
          }
          if (!item.quantity || Number(item.quantity) <= 0) {
            toast.error(`Item ${i + 1}: Please enter a valid quantity.`);
            return;
          }
        }

        const submitData = {
          depot_id: Number(values.depot_id),
          outlet_id: Number(values.outlet_id),
          issue_date: new Date(values.issue_date).toISOString(),
          issued_by_id: Number(values.issued_by_id),
          campaign_reference: values.campaign_reference,
          notes: values.notes,
          items: values.items.map(item => ({
            asset_id: Number(item.asset_id),
            quantity: Number(item.quantity),
            unit_value: Number(item.unit_value) || 0,
            total_value: Number(item.total_value) || 0,
          })),
        };

        if (isEdit && issue) {
          await updateMutation.mutateAsync({
            id: issue.id,
            data: submitData,
          });
        } else {
          await createMutation.mutateAsync(submitData);
        }

        handleCancel();
      } catch (error: any) {
        console.error('Error submitting promotion materials issue:', error);
      }
    },
  });

  const { data: assetsResponse } = useAssetMaster({
    depot_id: formik.values.depot_id
      ? Number(formik.values.depot_id)
      : undefined,
    only_available: true,
    limit: 1000,
  });
  const assets = assetsResponse?.data || [];

  const handleCancel = () => {
    onClose();
    formik.resetForm();
  };

  const addItem = () => {
    const newItem: PromoItemFormData = {
      asset_id: '',
      item_code: '-',
      uom: 'pcs',
      quantity: '',
      unit_value: '',
      total_value: '0',
    };
    formik.setFieldValue('items', [...formik.values.items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = formik.values.items.filter((_, i) => i !== index);
    formik.setFieldValue('items', updatedItems);
  };

  const updateItem = (
    index: number,
    field: keyof PromoItemFormData,
    value: any
  ) => {
    const updatedItems = [...formik.values.items];
    const item = { ...updatedItems[index], [field]: value };

    if (field === 'asset_id') {
      const selectedAsset = assets.find((a: any) => a.id === value);
      if (selectedAsset) {
        item.item_code = selectedAsset.code || '-';
        item.unit_value = '';
      } else {
        item.item_code = '-';
        item.quantity = '';
        item.unit_value = '';
        item.total_value = '0';
      }
    }

    if (field === 'quantity' || field === 'unit_value') {
      const qty = Number(field === 'quantity' ? value : item.quantity) || 0;
      const unitVal =
        Number(field === 'unit_value' ? value : item.unit_value) || 0;
      item.total_value = (qty * unitVal).toString();
    }
    updatedItems[index] = item;
    formik.setFieldValue('items', updatedItems);
  };

  const totalQuantity = useMemo(() => {
    return formik.values.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
  }, [formik.values.items]);

  const totalValue = useMemo(() => {
    return formik.values.items.reduce(
      (sum, item) => sum + (Number(item.total_value) || 0),
      0
    );
  }, [formik.values.items]);

  const itemsColumns: TableColumn<PromoItemFormData & { _index: number }>[] = [
    {
      id: 'asset_id',
      label: 'Item',
      render: (_value, row) => (
        <Select
          name={`items.${row._index}.asset_id`}
          value={row.asset_id}
          onChange={(e: any) =>
            updateItem(row._index, 'asset_id', e.target.value)
          }
          size="small"
          label=""
          className="!min-w-72"
          compact
        >
          {assets.map((a: any) => (
            <MenuItem key={a.id} value={a.id}>
              {a.name}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      id: 'item_code',
      label: 'Item Code',
      render: (_value, row) => (
        <Typography variant="body2">{row.item_code}</Typography>
      ),
    },
    {
      id: 'uom',
      label: 'UOM',
      render: (_value, row) => (
        <Typography variant="body2" className="!capitalize">
          {row.uom}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Qty',
      render: (_value, row) => (
        <Input
          value={row.quantity}
          onChange={e => updateItem(row._index, 'quantity', e.target.value)}
          placeholder="Enter qty"
          type="number"
          size="small"
          compact
          className="!min-w-16"
        />
      ),
    },
    {
      id: 'unit_value',
      label: 'Unit Value (TZS)',
      render: (_value, row) => (
        <Input
          value={row.unit_value}
          onChange={e => updateItem(row._index, 'unit_value', e.target.value)}
          placeholder="Enter value"
          type="number"
          size="small"
          compact
          className="!min-w-32"
        />
      ),
    },
    {
      id: 'total_value',
      label: 'Line Total (TZS)',
      render: (_value, row) => (
        <Typography variant="body2" className="!font-medium">
          {Number(row.total_value).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Action',
      sortable: false,
      render: (_value, row) => (
        <DeleteButton
          onClick={() => removeItem(row._index)}
          tooltip="Remove item"
          size="small"
          itemName="item"
          confirmDelete={true}
        />
      ),
    },
  ];

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={
        isEdit
          ? 'Edit Promotion Materials Issue'
          : 'Create Promotion Materials Issue'
      }
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 !gap-4 md:!grid-cols-3">
            <DepotSelect
              name="depot_id"
              label="Issue Depot"
              formik={formik}
              required
            />
            <CustomerSelect
              name="outlet_id"
              label="Outlet"
              formik={formik}
              required
              disabled={!formik.values.depot_id}
            />
            <Input
              name="issue_date"
              label="Issue Date"
              type="date"
              formik={formik}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <UserSelect
              name="issued_by_id"
              label="Issued By"
              formik={formik}
              required
              nameToSearch={issueData?.issued_by?.name || user?.name || ''}
            />
            <Input
              name="campaign_reference"
              label="Reference / Campaign"
              placeholder="e.g. Rainy season visibility drive"
              formik={formik}
            />
          </Box>

          <Box>
            <Table
              data={formik.values.items.map((item, index) => ({
                ...item,
                _index: index,
              }))}
              columns={itemsColumns}
              getRowId={row => row._index.toString()}
              pagination={false}
              sortable={false}
              filterColunm={false}
              emptyMessage="No items added yet."
              actions={
                <Box className="!flex !items-center !justify-between !w-full">
                  <Box className="!flex !flex-col">
                    <span className="!font-semibold text-lg !text-gray-900">
                      Promotion Items
                    </span>
                    <span className="!text-gray-500 !text-xs">
                      Enter the quantity and the unit value of each item. Line
                      totals calculate automatically.
                    </span>
                  </Box>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<Plus />}
                    onClick={addItem}
                    size="small"
                  >
                    Add Item
                  </Button>
                </Box>
              }
              footer={
                <Box className="!flex !justify-between !items-center !p-3 !border-t !border-gray-200">
                  <Typography variant="subtitle2" className="!font-bold">
                    Total
                  </Typography>
                  <Box className="!flex !gap-24 !pr-16">
                    <Typography variant="subtitle2" className="!font-bold">
                      {totalQuantity} Pcs
                    </Typography>
                    <Typography variant="subtitle2" className="!font-bold">
                      TZS {totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              }
            />

            <Alert severity="info" className="!flex !gap-2 mt-4 !items-center">
              Values are kept for internal tracking and show on the outlet page.
              They are not printed on the Goods Issue Note, since these items
              are free to the outlet.
            </Alert>
          </Box>

          <Input
            name="notes"
            label="Notes"
            placeholder="Optional notes for the approver or the depot"
            multiline
            rows={3}
            formik={formik}
          />

          <Box className="!mt-6 !flex !justify-end !gap-3">
            <Button variant="outlined" color="info" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManagePromotionalIssue;
