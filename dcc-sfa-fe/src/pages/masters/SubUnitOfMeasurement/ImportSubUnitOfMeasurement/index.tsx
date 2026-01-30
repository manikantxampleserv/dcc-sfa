import { Box, Typography } from '@mui/material';
import React from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';

interface ImportSubUnitOfMeasurementProps {
  open: boolean;
  onClose: () => void;
}

/**
 * ImportSubUnitOfMeasurement component for importing sub units of measurement
 * Placeholder component for future implementation
 */
const ImportSubUnitOfMeasurement: React.FC<ImportSubUnitOfMeasurementProps> = ({
  open,
  onClose,
}) => {
  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import sub units of measurement');
    onClose();
  };

  return (
    <CustomDrawer
      open={open}
      setOpen={onClose}
      title="Import Sub Units of Measurement"
      size="medium"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body1">
          Import functionality for sub units of measurement will be implemented here.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You can upload Excel or CSV files to bulk import sub units of measurement.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleImport}
            fullWidth
          >
            Import
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </CustomDrawer>
  );
};

export default ImportSubUnitOfMeasurement;
