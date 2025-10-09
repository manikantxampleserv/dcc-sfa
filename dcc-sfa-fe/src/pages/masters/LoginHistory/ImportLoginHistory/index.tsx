import { Download, Upload } from '@mui/icons-material';
import { Alert, Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import {
  useDownloadTemplate,
  useImportData,
} from '../../../../hooks/useImportExport';

interface ImportLoginHistoryProps {
  open: boolean;
  onClose: () => void;
}

const ImportLoginHistory: React.FC<ImportLoginHistoryProps> = ({
  open,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const downloadTemplateMutation = useDownloadTemplate();
  const importDataMutation = useImportData();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplateMutation.mutateAsync('login_history');
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const result = await importDataMutation.mutateAsync({
        tableName: 'login_history',
        file: file,
      });
      setImportResult(result);
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    onClose();
  };

  return (
    <CustomDrawer
      open={open}
      setOpen={open => !open && handleClose()}
      title="Import Login History"
      width={500}
    >
      <div className="space-y-4">
        {/* Download Template */}
        <Box className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Typography variant="h6" className="mb-2 font-semibold">
            Step 1: Download Template
          </Typography>
          <Typography variant="body2" className="mb-3 text-gray-600">
            Download the Excel template with the correct format and sample data.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadTemplate}
            disabled={downloadTemplateMutation.isPending}
            className="w-full"
          >
            Download Template
          </Button>
        </Box>

        {/* Upload File */}
        <Box className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Typography variant="h6" className="mb-2 font-semibold">
            Step 2: Upload File
          </Typography>
          <Typography variant="body2" className="mb-3 text-gray-600">
            Select the Excel file with your login history data.
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="mb-3 w-full rounded border border-gray-300 p-2"
          />
          {file && (
            <Typography variant="body2" className="text-green-600">
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        {/* Import Button */}
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={handleImport}
          disabled={!file || importDataMutation.isPending}
          className="w-full"
        >
          Import Data
        </Button>

        {/* Import Progress */}
        {importDataMutation.isPending && (
          <Alert severity="info">
            Importing data... Please wait while we process your file.
          </Alert>
        )}

        {/* Import Result */}
        {importResult && (
          <Box className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Typography variant="h6" className="mb-2 font-semibold">
              Import Results
            </Typography>
            <div className="space-y-2">
              <Typography variant="body2">
                <span className="font-medium">Total Records:</span>{' '}
                {importResult.totalRecords || 0}
              </Typography>
              <Typography variant="body2">
                <span className="font-medium">Successfully Imported:</span>{' '}
                <span className="text-green-600">
                  {importResult.successCount || 0}
                </span>
              </Typography>
              <Typography variant="body2">
                <span className="font-medium">Failed:</span>{' '}
                <span className="text-red-600">
                  {importResult.errorCount || 0}
                </span>
              </Typography>
              {importResult.errors && importResult.errors.length > 0 && (
                <Box className="mt-2">
                  <Typography variant="body2" className="font-medium">
                    Errors:
                  </Typography>
                  <ul className="ml-4 list-disc space-y-1">
                    {importResult.errors
                      .slice(0, 5)
                      .map((error: string, index: number) => (
                        <li key={index} className="text-sm text-red-600">
                          {error}
                        </li>
                      ))}
                    {importResult.errors.length > 5 && (
                      <li className="text-sm text-gray-500">
                        ... and {importResult.errors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </Box>
              )}
            </div>
          </Box>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={importDataMutation.isPending}
          >
            Close
          </Button>
        </div>
      </div>
    </CustomDrawer>
  );
};

export default ImportLoginHistory;
