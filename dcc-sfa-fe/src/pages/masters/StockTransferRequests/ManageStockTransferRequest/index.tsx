import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useProducts } from 'hooks/useProducts';
import {
  useStockTransferRequest,
  useUpsertStockTransferRequest,
} from 'hooks/useStockTransferRequests';
import { useUsers } from 'hooks/useUsers';
import { useWarehouses } from 'hooks/useWarehouses';
import { Package, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { stockTransferRequestValidationSchema } from 'schemas/stockTransferRequest.schema';
import type { StockTransferRequest } from 'services/masters/StockTransferRequests';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import ProductSelect from 'shared/ProductSelect';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManageStockTransferRequestProps {
  open: boolean;
  onClose: () => void;
  request?: StockTransferRequest | null;
}

interface TransferLineFormData {
  product_id: number | '';
  batch_id: number | '';
  quantity: number | '';
  id?: number | null;
}

const ManageStockTransferRequest: React.FC<ManageStockTransferRequestProps> = ({
  open,
  onClose,
  request,
}) => {
  const isEdit = !!request;
  const [transferLines, setTransferLines] = useState<TransferLineFormData[]>(
    []
  );

  const { data: usersResponse } = useUsers({ limit: 1000 });
  const { data: warehousesResponse } = useWarehouses({ limit: 1000 });
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const { data: requestResponse } = useStockTransferRequest(request?.id || 0);

  const users = usersResponse?.data || [];
  const warehouses = warehousesResponse?.data || [];
  const products = productsResponse?.data || [];

  const upsertRequestMutation = useUpsertStockTransferRequest();

  const handleCancel = () => {
    onClose();
    setTransferLines([]);
    formik.resetForm();
  };

  React.useEffect(() => {
    if (request && requestResponse?.data) {
      const items =
        requestResponse.data.transfer_lines?.map(line => ({
          product_id: line.product_id,
          batch_id: line.batch_id || '',
          quantity: line.quantity,
          id: line.id,
        })) || [];
      setTransferLines(items as TransferLineFormData[]);
      formik.setFieldValue('stock_transfer_lines', items);
    } else {
      setTransferLines([]);
      formik.setFieldValue('stock_transfer_lines', []);
    }
  }, [request, requestResponse]);

  const formik = useFormik({
    initialValues: {
      source_type: request?.source_type || '',
      source_id: request?.source_id || '',
      destination_type: request?.destination_type || '',
      destination_id: request?.destination_id || '',
      requested_by: request?.requested_by || '',
      status: request?.status || 'pending',
      approved_by: request?.approved_by || '',
      approved_at: request?.approved_at || '',
      is_active: request?.is_active || 'Y',
      stock_transfer_lines: [],
    },
    validationSchema: stockTransferRequestValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...(isEdit && request ? { id: request.id } : {}),
          source_type: values.source_type,
          source_id: Number(values.source_id),
          destination_type: values.destination_type,
          destination_id: Number(values.destination_id),
          requested_by: Number(values.requested_by),
          status: values.status,
          approved_by: values.approved_by ? Number(values.approved_by) : null,
          approved_at: values.approved_at || null,
          is_active: values.is_active,
          stock_transfer_lines: transferLines
            .filter(line => line.product_id !== '' && line.quantity !== '')
            .map(line => ({
              product_id: Number(line.product_id),
              batch_id: line.batch_id ? Number(line.batch_id) : null,
              quantity: Number(line.quantity),
              id: line.id || undefined,
            })),
        };

        await upsertRequestMutation.mutateAsync(submitData);
        handleCancel();
      } catch (error) {
        console.log('Error submitting stock transfer request:', error);
      }
    },
  });

  const addTransferLine = () => {
    const newLine: TransferLineFormData = {
      product_id: '',
      batch_id: '',
      quantity: 0,
      id: null,
    };
    const updatedLines = [...transferLines, newLine];
    setTransferLines(updatedLines);
    formik.setFieldValue('stock_transfer_lines', updatedLines);
  };

  const removeTransferLine = (index: number) => {
    const updatedLines = transferLines.filter((_, i) => i !== index);
    setTransferLines(updatedLines);
    formik.setFieldValue('stock_transfer_lines', updatedLines);
  };

  const updateTransferLine = (
    index: number,
    field: keyof TransferLineFormData,
    value: string | number
  ) => {
    const updatedLines = [...transferLines];
    if (field === 'quantity') {
      updatedLines[index] = {
        ...updatedLines[index],
        [field]: value === '' ? 0 : Number(value),
      };
    } else {
      updatedLines[index] = { ...updatedLines[index], [field]: value };
    }
    setTransferLines(updatedLines);
    formik.setFieldValue('stock_transfer_lines', updatedLines);
  };

  const linesWithIndex = transferLines.map((line, index) => ({
    ...line,
    _index: index,
  }));

  const transferLineColumns: TableColumn<
    TransferLineFormData & { _index: number }
  >[] = [
    {
      id: 'product_id',
      label: 'Product',
      width: 300,
      render: (_value, row) => (
        <ProductSelect
          value={row.product_id}
          onChange={(_event, product) =>
            updateTransferLine(row._index, 'product_id', product ? product.id : '')
          }
          size="small"
          fullWidth
          label="Product"
        />
      ),
    },
    {
      id: 'batch_id',
      label: 'Batch ID',
      width: 150,
      render: (_value, row) => (
        <Input
          value={row.batch_id}
          onChange={e =>
            updateTransferLine(row._index, 'batch_id', e.target.value)
          }
          size="small"
          fullWidth
          label="Batch ID"
          type="number"
          placeholder="Optional"
        />
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      width: 120,
      render: (_value, row) => (
        <Input
          value={row.quantity || 0}
          onChange={e =>
            updateTransferLine(row._index, 'quantity', e.target.value)
          }
          size="small"
          fullWidth
          label="Quantity"
          type="number"
          required
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      width: 50,
      render: (_value, row) => (
        <DeleteButton
          onClick={() => removeTransferLine(row._index)}
          tooltip="Remove line"
          confirmDelete={true}
          size="medium"
          itemName="transfer line"
        />
      ),
    },
  ];

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={
        isEdit ? 'Edit Stock Transfer Request' : 'Create Stock Transfer Request'
      }
      size="large"
    >
      <Box className="!p-4">
        <form onSubmit={formik.handleSubmit} className="!space-y-4">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <Input
              name="source_type"
              label="Source Type"
              placeholder="e.g., Warehouse, Store"
              formik={formik}
              required
            />

            <Select
              name="source_id"
              label="Source Location"
              formik={formik}
              required
            >
              {warehouses.map(warehouse => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="destination_type"
              label="Destination Type"
              placeholder="e.g., Warehouse, Store"
              formik={formik}
              required
            />

            <Select
              name="destination_id"
              label="Destination Location"
              formik={formik}
              required
            >
              {warehouses.map(warehouse => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              name="requested_by"
              label="Requested By"
              formik={formik}
              required
            >
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Select name="status" label="Status" formik={formik}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>

            <Select name="approved_by" label="Approved By" formik={formik}>
              <MenuItem value="">Not Approved</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Input
              name="approved_at"
              label="Approved At"
              type="datetime-local"
              formik={formik}
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!space-y-3">
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="body1"
                className="!font-semibold !text-gray-900"
              >
                Transfer Lines
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus />}
                onClick={addTransferLine}
                size="small"
              >
                Add Line
              </Button>
            </Box>

            {transferLines.length > 0 && (
              <Table
                data={linesWithIndex}
                columns={transferLineColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No transfer lines added yet."
              />
            )}

            {transferLines.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No transfer lines added yet. Click "Add Line" to get started.
                </Typography>
              </Box>
            )}
          </Box>

          <Box className="!flex !justify-end !gap-2 !pt-3">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={upsertRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={upsertRequestMutation.isPending}
            >
              {upsertRequestMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageStockTransferRequest;
