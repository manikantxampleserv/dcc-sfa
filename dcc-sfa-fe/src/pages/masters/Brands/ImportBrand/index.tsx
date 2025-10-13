import { CloudUpload, TableChart, Download } from '@mui/icons-material';
import { Alert, Box, LinearProgress, Typography } from '@mui/material';
import { useFormik } from 'formik';
import React, { useRef, useState } from 'react';
import * as Yup from 'yup';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import {
  useDownloadTemplate,
  useImportData,
  type ImportResult,
} from '../../../../hooks/useImportExport';

interface ImportBrandProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const importValidationSchema = Yup.object({
  file: Yup.mixed().required('Please select a file to import'),
});

const ImportBrand: React.FC<ImportBrandProps> = ({
  drawerOpen,
  setDrawerOpen,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'import' | 'results'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // API hooks
  const downloadTemplateMutation = useDownloadTemplate();
  const importDataMutation = useImportData({
    onSuccess: data => {
      setImportResults(data.data);
      setStep('results');
    },
  });

  const handleCancel = () => {
    setUploadedFile(null);
    setImportResults(null);
    setStep('upload');
    formik.resetForm();
    setDrawerOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      file: null,
    },
    validationSchema: importValidationSchema,
    onSubmit: async () => {
      if (!uploadedFile) return;
      await handleImport();
    },
  });

  const handleDownloadSample = async () => {
    try {
      await downloadTemplateMutation.mutateAsync('brands');
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setUploadedFile(file);
      setImportResults(null);
      setStep('upload');
      formik.setFieldValue('file', file);
    }
  };

  const handleImport = async () => {
    if (!uploadedFile) return;

    try {
      await importDataMutation.mutateAsync({
        tableName: 'brands',
        file: uploadedFile,
        options: {
          batchSize: 100,
          skipDuplicates: false,
          updateExisting: false,
        },
      });
      // Results are handled in the mutation onSuccess callback
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setImportResults(null);
    setStep('upload');
    formik.setFieldValue('file', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title="Import Brands"
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit} className="!space-y-6">
          <Alert severity="info" className="!mb-4">
            <Typography variant="body2">
              Upload an Excel file to import multiple brands. Download the
              sample file to see the required format.
            </Typography>
          </Alert>

          {/* Download Sample Section */}
          <Box className="!p-4 !border !border-gray-200 !rounded-lg">
            <Box className="!flex !items-center !justify-between">
              <Box className="!flex !items-center !gap-3">
                <TableChart className="!text-green-600" />
                <Box>
                  <Typography variant="subtitle1" className="!font-medium">
                    Download Excel Template
                  </Typography>
                  <Typography variant="body2" className="!text-gray-600">
                    Get the Excel template with required columns and sample data
                  </Typography>
                </Box>
              </Box>
              <Button
                type="button"
                variant="outlined"
                onClick={handleDownloadSample}
                className="!shrink-0"
              >
                <Download className="!mr-2" />
                Download
              </Button>
            </Box>
          </Box>

          {/* Upload Section */}
          <Box className="!p-4 !border !border-gray-200 !rounded-lg">
            <Typography variant="subtitle1" className="!font-medium !mb-3">
              Upload File
            </Typography>

            {!uploadedFile ? (
              <Box
                className="!border-2 !border-dashed !border-gray-300 !rounded-lg !p-8 !text-center hover:!border-primary-400 !transition-colors !cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUpload className="!mx-auto !mb-4 !text-gray-400 !text-5xl" />
                <Typography variant="h6" className="!mb-2 !text-gray-700">
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="body2" className="!text-gray-500">
                  Excel files only (.xlsx, .xls)
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="!hidden"
                />
              </Box>
            ) : (
              <Box className="!space-y-4">
                <Box className="!flex !items-center !justify-between !p-3 !bg-gray-50 !rounded-lg">
                  <Box className="!flex !items-center !gap-3">
                    <TableChart className="!text-green-600" />
                    <Box>
                      <Typography variant="subtitle2" className="!font-medium">
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="caption" className="!text-gray-600">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    color="error"
                    type="button"
                    variant="outlined"
                    onClick={handleRemoveFile}
                    disabled={importDataMutation.isPending}
                  >
                    Remove
                  </Button>
                </Box>

                {importDataMutation.isPending && (
                  <Box className="!space-y-2">
                    <Box className="!flex !justify-between !items-center">
                      <Typography variant="body2">Importing data...</Typography>
                    </Box>
                    <LinearProgress />
                  </Box>
                )}

                {importResults && step === 'results' && (
                  <Box className="!space-y-3 !mt-4">
                    <Typography variant="subtitle2" className="!font-medium">
                      Import Results
                    </Typography>

                    <Box className="!grid !grid-cols-3 !gap-4">
                      <Box className="!flex !items-center !gap-2 !p-3 !bg-blue-50 !rounded-lg">
                        <Typography variant="h6" className="!text-blue-700">
                          {importResults.totalProcessed}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-blue-600"
                        >
                          Total Processed
                        </Typography>
                      </Box>

                      <Box className="!flex !items-center !gap-2 !p-3 !bg-green-50 !rounded-lg">
                        <Typography variant="h6" className="!text-green-700">
                          {importResults.success}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-green-600"
                        >
                          Successful
                        </Typography>
                      </Box>

                      <Box className="!flex !items-center !gap-2 !p-3 !bg-red-50 !rounded-lg">
                        <Typography variant="h6" className="!text-red-700">
                          {importResults.failed}
                        </Typography>
                        <Typography variant="caption" className="!text-red-600">
                          Failed
                        </Typography>
                      </Box>
                    </Box>

                    {importResults.fileInfo && (
                      <Box className="!mt-3 !p-3 !bg-gray-50 !rounded-lg">
                        <Typography
                          variant="subtitle2"
                          className="!font-medium !mb-1"
                        >
                          File Information
                        </Typography>
                        <Typography variant="body2" className="!text-gray-600">
                          File: {importResults.fileInfo.originalName}
                        </Typography>
                        <Typography variant="body2" className="!text-gray-600">
                          Total Rows: {importResults.fileInfo.rows}
                        </Typography>
                      </Box>
                    )}

                    {importResults.errors &&
                      importResults.errors.length > 0 && (
                        <Box className="!mt-3">
                          <Typography
                            variant="subtitle2"
                            className="!font-medium !mb-2 !text-red-700"
                          >
                            Import Errors ({importResults.errors.length}):
                          </Typography>
                          <Box className="!bg-red-50 !rounded-lg !max-h-32 !overflow-y-auto !p-2">
                            {importResults.errors
                              .slice(0, 10)
                              .map((error: string, index: number) => (
                                <Typography
                                  key={index}
                                  variant="body2"
                                  className="!text-red-600 !mb-1"
                                >
                                  • {error}
                                </Typography>
                              ))}
                            {importResults.errors.length > 10 && (
                              <Typography
                                variant="body2"
                                className="!text-red-600 !font-medium"
                              >
                                ... and {importResults.errors.length - 10} more
                                errors
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Box className="!flex !justify-end items-center gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={importDataMutation.isPending}
            >
              Cancel
            </Button>

            {step === 'upload' && (
              <Button
                type="submit"
                variant="contained"
                disabled={!uploadedFile || importDataMutation.isPending}
                loading={importDataMutation.isPending}
              >
                {importDataMutation.isPending ? 'Importing...' : 'Import Data'}
              </Button>
            )}

            {step === 'results' && (
              <Button type="button" variant="contained" onClick={handleCancel}>
                Done
              </Button>
            )}
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ImportBrand;
