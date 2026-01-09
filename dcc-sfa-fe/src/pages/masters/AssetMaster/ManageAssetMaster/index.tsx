import { Box, MenuItem, Typography, IconButton } from '@mui/material';
import { CloudUpload, Delete, Image } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useAssetTypes } from 'hooks/useAssetTypes';
import { useUsers } from 'hooks/useUsers';
import {
  useCreateAssetMaster,
  useUpdateAssetMaster,
  type AssetMaster,
} from 'hooks/useAssetMaster';
import React, { useEffect, useState, useRef } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { assetMasterValidationSchema } from 'schemas/assetMaster.schema';

interface ManageAssetMasterProps {
  selectedAsset?: AssetMaster | null;
  setSelectedAsset: (asset: AssetMaster | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAssetMaster: React.FC<ManageAssetMasterProps> = ({
  selectedAsset,
  setSelectedAsset,
  drawerOpen,
  setDrawerOpen,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!selectedAsset;

  const { data: assetTypesResponse } = useAssetTypes({
    page: 1,
    limit: 1000,
    isActive: 'Y',
  });
  const assetTypes = assetTypesResponse?.data || [];

  const { data: usersResponse } = useUsers({
    page: 1,
    limit: 1000,
    isActive: 'Y',
  });
  const users = usersResponse?.data || [];

  const createAssetMasterMutation = useCreateAssetMaster();
  const updateAssetMasterMutation = useUpdateAssetMaster();

  const handleCancel = () => {
    setSelectedAsset(null);
    setDrawerOpen(false);
    setSelectedImages([]);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      asset_type_id: selectedAsset?.asset_type_id || 0,
      serial_number: selectedAsset?.serial_number || '',
      purchase_date: selectedAsset?.purchase_date
        ? selectedAsset.purchase_date.split('T')[0]
        : '',
      warranty_expiry: selectedAsset?.warranty_expiry
        ? selectedAsset.warranty_expiry.split('T')[0]
        : '',
      warranty_period: '1', // Default to 1 year (UI only)
      current_location: selectedAsset?.current_location || '',
      current_status: selectedAsset?.current_status || 'Available',
      assigned_to: selectedAsset?.assigned_to || '',
      is_active: selectedAsset?.is_active || 'Y',
    },
    validationSchema: assetMasterValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          asset_type_id: Number(values.asset_type_id),
          purchase_date: values.purchase_date,
          warranty_expiry: values.warranty_expiry,
          current_location: values.current_location,
          current_status: values.current_status,
          assigned_to: values.assigned_to,
        };

        if (isEdit && selectedAsset) {
          await updateAssetMasterMutation.mutateAsync({
            id: selectedAsset.id,
            data: submitData,
          });
        } else {
          await createAssetMasterMutation.mutateAsync({
            data: submitData,
            images: selectedImages.length > 0 ? selectedImages : undefined,
          });
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting asset:', error);
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });

      if (validFiles.length !== fileArray.length) {
        alert(
          'Some files were skipped. Only image files under 5MB are allowed.'
        );
      }

      setSelectedImages(prev => [...prev, ...validFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!drawerOpen) {
      setSelectedImages([]);
      setExistingImages([]);
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (selectedAsset && selectedAsset.asset_master_image) {
      setExistingImages(selectedAsset.asset_master_image);
    } else {
      setExistingImages([]);
    }
  }, [selectedAsset]);

  useEffect(() => {
    const purchaseDate = formik.values.purchase_date;
    const warrantyPeriod = formik.values.warranty_period;

    if (purchaseDate && warrantyPeriod) {
      const purchase = new Date(purchaseDate);
      const years = parseInt(warrantyPeriod);

      if (!isNaN(purchase.getTime()) && !isNaN(years)) {
        const expiryDate = new Date(purchase);
        expiryDate.setFullYear(expiryDate.getFullYear() + years);

        const formattedExpiry = expiryDate.toISOString().split('T')[0];
        formik.setFieldValue('warranty_expiry', formattedExpiry);
      }
    }
  }, [formik.values.purchase_date, formik.values.warranty_period]);

  const statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'In Use', label: 'In Use' },
    { value: 'Under Maintenance', label: 'Under Maintenance' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Lost', label: 'Lost' },
    { value: 'Damaged', label: 'Damaged' },
  ];

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Asset' : 'Create Asset'}
      size="large"
    >
      <Box className="!p-6">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
            <Select
              name="asset_type_id"
              label="Asset Type"
              formik={formik}
              required
            >
              {assetTypes.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>

            <Input
              name="serial_number"
              label="Serial Number"
              placeholder="Enter serial number"
              formik={formik}
              required
            />

            <Input
              name="purchase_date"
              label="Purchase Date"
              type="date"
              formik={formik}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Select
              name="warranty_period"
              label="Warranty Period"
              formik={formik}
            >
              <MenuItem value="1">1 Year</MenuItem>
              <MenuItem value="2">2 Years</MenuItem>
              <MenuItem value="3">3 Years</MenuItem>
              <MenuItem value="4">4 Years</MenuItem>
              <MenuItem value="5">5 Years</MenuItem>
            </Select>

            <Input
              name="warranty_expiry"
              label="Warranty Expiry"
              type="date"
              formik={formik}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Input
              name="current_location"
              label="Current Location"
              placeholder="Enter current location"
              formik={formik}
            />

            <Select
              name="current_status"
              label="Current Status"
              formik={formik}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            <Select name="assigned_to" label="Assigned To" formik={formik}>
              {users.map(user => (
                <MenuItem key={user.id} value={user.name}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>
          </Box>

          <Box className="!space-y-3">
            <Box className="!p-3 !border !border-gray-200 !rounded-lg">
              <Typography variant="subtitle2" className="!font-medium !mb-2">
                Asset Images (Optional)
              </Typography>

              <Box
                className="!border-2 !border-dashed !border-gray-300 !rounded-lg !p-4 !text-center hover:!border-primary-400 !transition-colors !cursor-pointer"
                onClick={handleImageUploadClick}
              >
                <CloudUpload className="!mx-auto !mb-2 !text-gray-400 !text-2xl" />
                <Typography variant="body2" className="!mb-1 !text-gray-700">
                  {isEdit ? 'Add more images' : 'Upload images'}
                </Typography>
                <Typography variant="caption" className="!text-gray-500">
                  JPG, PNG, GIF, WEBP (Max 10MB)
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="!hidden"
                />
              </Box>

              {/* Combined Images Display */}
              {(existingImages.length > 0 || selectedImages.length > 0) && (
                <Box className="!mt-3 !space-y-2">
                  <Typography
                    variant="caption"
                    className="!text-gray-600 !font-medium"
                  >
                    Images ({existingImages.length + selectedImages.length})
                  </Typography>

                  <Box className="!space-y-1">
                    {/* Existing Images - Compact List */}
                    {existingImages.map((image, index) => (
                      <Box
                        key={`existing-${index}`}
                        className="!flex !items-center !justify-between !p-2 !bg-blue-50 !rounded !border !border-blue-200"
                      >
                        <Box className="!flex !items-center !gap-2 !flex-1 !min-w-0">
                          <Image className="!text-blue-500 !w-4 !h-4" />
                          <Typography
                            variant="caption"
                            className="!truncate !text-blue-700"
                            title={image.caption || `Image ${index + 1}`}
                          >
                            {image.caption || `Image ${index + 1}`} (Current)
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeExistingImage(index)}
                          className="!p-1"
                        >
                          <Delete fontSize="inherit" />
                        </IconButton>
                      </Box>
                    ))}

                    {/* New Images - Compact List */}
                    {selectedImages.map((image, index) => (
                      <Box
                        key={`new-${index}`}
                        className="!flex !items-center !justify-between !p-2 !bg-green-50 !rounded !border !border-green-200"
                      >
                        <Box className="!flex !items-center !gap-2 !flex-1 !min-w-0">
                          <Image className="!text-green-500 !w-4 !h-4" />
                          <Typography
                            variant="caption"
                            className="!truncate !text-green-700"
                            title={image.name}
                          >
                            {image.name} ({(image.size / 1024).toFixed(0)}KB)
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeImage(index)}
                          className="!p-1"
                        >
                          <Delete fontSize="inherit" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box className="!flex !justify-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createAssetMasterMutation.isPending ||
                updateAssetMasterMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAssetMasterMutation.isPending ||
                updateAssetMasterMutation.isPending
              }
            >
              {createAssetMasterMutation.isPending ||
              updateAssetMasterMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}{' '}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageAssetMaster;
