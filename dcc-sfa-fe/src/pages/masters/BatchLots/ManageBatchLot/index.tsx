import { Box } from '@mui/material';
// import { Typography, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateBatchLot,
  useUpdateBatchLot,
  type BatchLot,
} from 'hooks/useBatchLots';
// import { useProductsDropdown, type ProductDropdown } from 'hooks/useProducts';
// import { Plus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { batchLotValidationSchema } from 'schemas/batchLot.schema';
// import { DeleteButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
// import Select from 'shared/Select';
// import Table, { type TableColumn } from 'shared/Table';

interface ManageBatchLotProps {
  selectedBatchLot?: BatchLot | null;
  setSelectedBatchLot: (batchLot: BatchLot | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageBatchLot: React.FC<ManageBatchLotProps> = ({
  selectedBatchLot,
  setSelectedBatchLot,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      product_id: number;
      product_name: string;
      product_code: string;
      quantity: number;
    }>
  >([]);
  const hasLoadedProductsRef = useRef(false);
  const isEdit = !!selectedBatchLot;

  const handleCancel = () => {
    setSelectedBatchLot(null);
    setDrawerOpen(false);
    setSelectedProducts([]);
    hasLoadedProductsRef.current = false;
    formik.resetForm();
  };

  const createBatchLotMutation = useCreateBatchLot();
  const updateBatchLotMutation = useUpdateBatchLot();
  // const { data: productsResponse } = useProductsDropdown();
  // const products = productsResponse?.data || [];

  // React.useEffect(() => {
  //   if (products.length > 0) {
  //     // Products are loaded, no need to transform as they're already in the right format
  //   }
  // }, [products]);

  // React.useEffect(() => {
  //   if (isEdit && selectedBatchLot?.products && !hasLoadedProductsRef.current) {
  //     const existingProducts = selectedBatchLot.products.map(
  //       (product: any) => ({
  //         product_id: product.id,
  //         product_name: product.name,
  //         product_code: product.code,
  //         quantity: product.quantity || 0,
  //       })
  //     );
  //     setSelectedProducts(existingProducts);
  //     hasLoadedProductsRef.current = true;
  //   } else if (!isEdit) {
  //     setSelectedProducts([]);
  //     hasLoadedProductsRef.current = false;
  //   }
  // }, [isEdit, selectedBatchLot]);

  React.useEffect(() => {
    if (!drawerOpen) {
      hasLoadedProductsRef.current = false;
    }
  }, [drawerOpen]);

  // const addProduct = () => {
  //   const newProduct = {
  //     product_id: 0,
  //     product_name: '',
  //     product_code: '',
  //     quantity: 0,
  //   };
  //   setSelectedProducts([...selectedProducts, newProduct]);
  // };

  // const removeProduct = (index: number) => {
  //   setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  // };

  // const updateProduct = (index: number, productId: number | null) => {
  //   const updatedProducts = [...selectedProducts];

  //   if (productId === null || productId === 0) {
  //     updatedProducts[index] = {
  //       product_id: 0,
  //       product_name: '',
  //       product_code: '',
  //       quantity: 0,
  //     };
  //   } else {
  //     const product = products.find((p: ProductDropdown) => p.id === productId);
  //     if (product) {
  //       updatedProducts[index] = {
  //         product_id: product.id,
  //         product_name: product.name,
  //         product_code: product.code,
  //         quantity: updatedProducts[index].quantity || 0,
  //       };
  //     }
  //   }

  //   setSelectedProducts(updatedProducts);
  // };

  // const updateProductQuantity = (index: number, quantity: number) => {
  //   const updatedProducts = [...selectedProducts];
  //   const validatedQuantity = Math.max(0, quantity);

  //   updatedProducts[index] = {
  //     ...updatedProducts[index],
  //     quantity: validatedQuantity,
  //   };
  //   setSelectedProducts(updatedProducts);
  // };

  // const productsWithIndex = selectedProducts.map((item, index) => ({
  //   ...item,
  //   _index: index,
  // }));

  // const productColumns: TableColumn<(typeof productsWithIndex)[0]>[] = [
  //   {
  //     id: 'product_id',
  //     label: 'Product',
  //     width: 450,
  //     render: (_, row) => (
  //       <Select
  //         name={`product_${row._index}`}
  //         value={row.product_id || ''}
  //         onChange={e => {
  //           const value = e.target.value;
  //           updateProduct(
  //             row._index,
  //             value === '' || value === null ? null : Number(value)
  //           );
  //         }}
  //         fullWidth
  //         size="small"
  //         placeholder="Select product"
  //         disableClearable={false}
  //       >
  //         {products.map((product: ProductDropdown) => (
  //           <MenuItem key={product.id} value={product.id}>
  //             {product.name}
  //             {product.code && ` (${product.code})`}
  //           </MenuItem>
  //         ))}
  //       </Select>
  //     ),
  //   },

  //   {
  //     id: 'quantity',
  //     label: 'Quantity',
  //     render: (_, row) => (
  //       <Input
  //         name={`quantity_${row._index}`}
  //         type="number"
  //         value={row.quantity || ''}
  //         onChange={e =>
  //           updateProductQuantity(row._index, Number(e.target.value))
  //         }
  //         size="small"
  //         fullWidth
  //       />
  //     ),
  //   },
  //   {
  //     id: 'action' as any,
  //     label: 'Actions',
  //     sortable: false,
  //     render: (_, row) => (
  //       <DeleteButton
  //         onClick={() => removeProduct(row._index)}
  //         tooltip="Remove product"
  //         size="small"
  //       />
  //     ),
  //   },
  // ];

  const formik = useFormik({
    initialValues: {
      batch_number: selectedBatchLot?.batch_number || '',
      lot_number: selectedBatchLot?.lot_number || '',
      manufacturing_date: selectedBatchLot?.manufacturing_date
        ? new Date(selectedBatchLot.manufacturing_date)
            .toISOString()
            .split('T')[0]
        : '',
      expiry_date: selectedBatchLot?.expiry_date
        ? new Date(selectedBatchLot.expiry_date).toISOString().split('T')[0]
        : '',
      quantity: selectedBatchLot?.quantity || '',
      remaining_quantity: selectedBatchLot?.remaining_quantity || '',
      supplier_name: selectedBatchLot?.supplier_name || '',
      purchase_price: selectedBatchLot?.purchase_price || '',
      quality_grade: selectedBatchLot?.quality_grade || 'A',
      storage_location: selectedBatchLot?.storage_location || '',
      is_active: selectedBatchLot?.is_active || 'Y',
    },
    validationSchema: batchLotValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const batchLotData = {
          batch_number: values.batch_number,
          lot_number: values.lot_number || undefined,
          manufacturing_date: values.manufacturing_date,
          expiry_date: values.expiry_date,
          quantity: Number(values.quantity),
          remaining_quantity: values.remaining_quantity
            ? Number(values.remaining_quantity)
            : undefined,
          supplier_name: values.supplier_name || undefined,
          purchase_price: values.purchase_price
            ? Number(values.purchase_price)
            : undefined,
          quality_grade: values.quality_grade || undefined,
          storage_location: values.storage_location || undefined,
          is_active: values.is_active,
          products: selectedProducts
            .filter(p => p.product_id > 0 && p.quantity > 0)
            .map(p => ({
              product_id: p.product_id,
              quantity: p.quantity,
            })),
        };

        if (isEdit && selectedBatchLot) {
          await updateBatchLotMutation.mutateAsync({
            id: selectedBatchLot.id,
            ...batchLotData,
          });
        } else {
          await createBatchLotMutation.mutateAsync(batchLotData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving batch lot:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Batch Lot' : 'Create Batch Lot'}
      // size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Input
              name="batch_number"
              label="Batch Number"
              placeholder="Enter batch number"
              formik={formik}
              required
            />

            <Input
              name="lot_number"
              label="Lot Number"
              placeholder="Enter lot number (optional)"
              formik={formik}
            />

            <Input
              name="manufacturing_date"
              label="Manufacturing Date"
              type="date"
              formik={formik}
              required
            />

            <Input
              name="expiry_date"
              label="Expiry Date"
              type="date"
              formik={formik}
              required
            />

            <Input
              name="quantity"
              label="Total Quantity"
              placeholder="Enter total quantity"
              formik={formik}
              type="number"
              required
            />

            <Input
              name="remaining_quantity"
              label="Remaining Quantity"
              placeholder="Enter remaining quantity"
              formik={formik}
              type="number"
            />

            <Input
              name="purchase_price"
              label="Purchase Price"
              placeholder="Enter purchase price"
              formik={formik}
              type="number"
            />

            <Input
              name="storage_location"
              label="Storage Location"
              placeholder="Enter storage location"
              formik={formik}
            />

            <Input
              name="supplier_name"
              label="Supplier Name"
              placeholder="Enter supplier name"
              formik={formik}
              className="md:!col-span-2"
            />

            <ActiveInactiveField
              name="is_active"
              label="Status"
              formik={formik}
            />
          </Box>

          {/* Products Section */}
          {/* <Table
            data={productsWithIndex}
            compact={true}
            actions={
              <Box className="!flex !justify-between !items-center">
                <Typography variant="body1" className="!font-semibold">
                  Products
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={addProduct}
                  startIcon={<Plus size={16} />}
                >
                  Add Product
                </Button>
              </Box>
            }
            columns={productColumns}
            getRowId={product => product._index}
            pagination={false}
            emptyMessage="No products added. Click 'Add Product' to add products"
          /> */}

          {/* Action Buttons */}
          <Box className="!flex !justify-end !gap-3 !pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createBatchLotMutation.isPending ||
                updateBatchLotMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createBatchLotMutation.isPending ||
                updateBatchLotMutation.isPending
              }
            >
              {createBatchLotMutation.isPending ||
              updateBatchLotMutation.isPending
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

export default ManageBatchLot;
