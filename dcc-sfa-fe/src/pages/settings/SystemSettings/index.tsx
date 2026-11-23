import {
  Business,
  CheckCircleOutlined,
  Close,
  Upload,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useCurrencies } from 'hooks/useCurrencies';
import { useSettings, useUpdateSettings } from 'hooks/useSettings';
import {
  Check,
  Copy,
  FileSpreadsheet,
  Info,
  RefreshCw,
  Settings as SettingsIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Select from 'shared/Select';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Company name is required'),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  country: Yup.string(),
  zipcode: Yup.string(),
  phone_number: Yup.string(),
  email: Yup.string().email('Invalid email address'),
  website: Yup.string().url('Invalid URL'),
  smtp_host: Yup.string(),
  smtp_port: Yup.number().nullable(),
  smtp_username: Yup.string(),
  smtp_password: Yup.string(),
  smtp_mail_from_name: Yup.string(),
  smtp_mail_from_address: Yup.string().email('Invalid from email address'),
  currency_id: Yup.number().nullable(),
  customer_grading_cron_time: Yup.string(),
  excel_api_username: Yup.string().nullable(),
  excel_api_password: Yup.string().nullable(),
  excel_api_key: Yup.string().nullable(),
});

const SystemSettings: React.FC = () => {
  const { data: settingsResponse, isLoading, refetch } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const { data: currenciesResponse } = useCurrencies({
    status: 'active',
    page: 1,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [copiedEndpointWithKey, setCopiedEndpointWithKey] = useState<
    string | null
  >(null);
  const [apiKeyCopied, setApiKeyCopied] = useState<boolean>(false);

  const settings = settingsResponse?.data;
  const currencies = currenciesResponse?.data || [];

  const apiBase = (
    import.meta.env?.VITE_API_BASE_URL || `${window.location.origin}/api/v1`
  ).replace(/\/$/, '');
  const excelBaseUrl = apiBase.endsWith('/v1')
    ? `${apiBase}/excel`
    : `${apiBase}/api/v1/excel`;

  const excelEndpoints = [
    {
      id: 'outlet-master',
      name: 'Outlet Master (CSV)',
      endpoint: `${excelBaseUrl}/outlet-master`,
      description:
        'All active outlets with route, depot, customer channel, and coordinate details.',
      format: 'CSV',
    },
    {
      id: 'outlet-master-json',
      name: 'Outlet Master (JSON API)',
      endpoint: `${excelBaseUrl}/outlet-master-json`,
      description:
        'Lightweight outlet master in JSON format. Supports OR-mode search on customer_no, name, and contact_details.',
      format: 'JSON',
    },
    {
      id: 'sales-data',
      name: 'Sales Data',
      endpoint: `${excelBaseUrl}/sales-data`,
      description:
        'Detailed item-level invoice sales records, category, SKU, turnover, and volume.',
      format: 'CSV',
    },
    {
      id: 'survey-data',
      name: 'Survey Data',
      endpoint: `${excelBaseUrl}/survey-data`,
      description:
        'Customer survey questionnaire responses with questions and answers.',
      format: 'CSV',
    },
    {
      id: 'van-load-unload',
      name: 'Van Load & Unload',
      endpoint: `${excelBaseUrl}/van-load-unload`,
      description:
        'Van inventory movement history, daily stock loading and unloading transactions.',
      format: 'CSV',
    },
  ];

  /**
   * Generates a secure random live API key for Excel synchronization.
   */
  const handleGenerateApiKey = () => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const newKey = `dcc_live_${randomHex}`;
    formik.setFieldValue('excel_api_key', newKey);
  };

  /**
   * Copies text to the user clipboard and triggers temporary copied indicator state.
   *
   * @param {string} text Text or URL string to copy
   * @param {'apikey' | 'endpoint' | 'endpointWithKey'} type Target copy category
   * @param {string} [endpointId] Optional ID of the endpoint card
   */
  const handleCopyText = (
    text: string,
    type: 'apikey' | 'endpoint' | 'endpointWithKey',
    endpointId?: string
  ) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'apikey') {
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    } else if (type === 'endpointWithKey' && endpointId) {
      setCopiedEndpointWithKey(endpointId);
      setTimeout(() => setCopiedEndpointWithKey(null), 2000);
    } else if (endpointId) {
      setCopiedEndpoint(endpointId);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: settings?.name || '',
      address: settings?.address || '',
      city: settings?.city || '',
      state: settings?.state || '',
      country: settings?.country || '',
      zipcode: settings?.zipcode || '',
      phone_number: settings?.phone_number || '',
      email: settings?.email || '',
      website: settings?.website || '',
      is_active: settings?.is_active || 'Y',
      smtp_mail_from_name: settings?.smtp_mail_from_name || '',
      smtp_mail_from_address: settings?.smtp_mail_from_address || '',
      smtp_host: settings?.smtp_host || '',
      smtp_port: settings?.smtp_port || null,
      smtp_username: settings?.smtp_username || '',
      smtp_password: settings?.smtp_password || '',
      currency_id: settings?.currency_id || null,
      customer_grading_cron_time:
        settings?.customer_grading_cron_time || '0 0 * * *',
      excel_api_username: settings?.excel_api_username || '',
      excel_api_password: settings?.excel_api_password || '',
      excel_api_key: settings?.excel_api_key || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (!settings?.id) {
          return;
        }
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('address', values.address || '');
        formData.append('city', values.city || '');
        formData.append('state', values.state || '');
        formData.append('country', values.country || '');
        formData.append('zipcode', values.zipcode || '');
        formData.append('phone_number', values.phone_number || '');
        formData.append('email', values.email || '');
        formData.append('website', values.website || '');
        formData.append('is_active', values.is_active);
        formData.append(
          'smtp_mail_from_name',
          values.smtp_mail_from_name || ''
        );
        formData.append(
          'smtp_mail_from_address',
          values.smtp_mail_from_address || ''
        );
        formData.append('smtp_host', values.smtp_host || '');
        formData.append(
          'smtp_port',
          values.smtp_port ? values.smtp_port.toString() : ''
        );
        formData.append('smtp_username', values.smtp_username || '');
        formData.append('smtp_password', values.smtp_password || '');
        formData.append(
          'currency_id',
          values.currency_id ? values.currency_id.toString() : ''
        );
        formData.append(
          'customer_grading_cron_time',
          values.customer_grading_cron_time || ''
        );
        formData.append('excel_api_username', values.excel_api_username || '');
        formData.append('excel_api_password', values.excel_api_password || '');
        formData.append('excel_api_key', values.excel_api_key || '');

        if (uploadedFile) {
          formData.append('logo', uploadedFile);
        }
        await updateSettingsMutation.mutateAsync({
          id: settings.id,
          settingsData: formData,
        });
        setUploadedFile(null);
        setLogoPreview(null);
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setLogoPreview(null);
  };

  if (isLoading) {
    return (
      <Box>
        <Box className="mb-2">
          <Skeleton variant="text" width={200} height={32} className="!mb-1" />
          <Skeleton variant="text" width={400} height={20} />
        </Box>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
          <Divider className="!mb-6" />

          <Box className="mb-6">
            <Skeleton
              variant="text"
              width={120}
              height={16}
              className="!mb-4"
            />
            <Box className="flex items-center gap-4">
              <Skeleton
                variant="circular"
                width={96}
                height={96}
                className="!bg-gray-200"
              />
              <Box>
                <Skeleton variant="rectangular" width={140} height={36} />
                <Skeleton
                  variant="text"
                  width={200}
                  height={14}
                  className="!mt-2"
                />
              </Box>
            </Box>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(field => (
              <Box key={field} className="space-y-2">
                <Skeleton variant="text" width="40%" height={14} />
                <Skeleton variant="rectangular" width="100%" height={56} />
              </Box>
            ))}
          </Box>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
          <Divider className="!mb-6" />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(field => (
              <Box key={field} className="space-y-2">
                <Skeleton variant="text" width="40%" height={14} />
                <Skeleton variant="rectangular" width="100%" height={56} />
              </Box>
            ))}
          </Box>
        </div>

        <Box className="flex justify-end gap-3">
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="rectangular" width={140} height={36} />
        </Box>
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box className="p-8 text-center bg-white rounded-lg border border-gray-200">
        <Typography variant="h6" className="!text-gray-700 !mb-2">
          No settings found
        </Typography>
        <Typography variant="body2" className="!text-gray-500 !mb-4">
          Unable to load company settings. Please refresh or retry.
        </Typography>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="mb-2">
        <Typography variant="h5" className="!font-semibold !text-gray-900">
          System Settings
        </Typography>
        <Typography variant="body2" className="!text-gray-600 !mt-1">
          Manage your company settings and configuration
        </Typography>
      </Box>

      <Box component="form" onSubmit={formik.handleSubmit} autoComplete="off">
        <div
          style={{
            position: 'absolute',
            opacity: 0,
            height: 0,
            width: 0,
            zIndex: -1,
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <input
            type="text"
            name="prevent_autofill_username"
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="password"
            name="prevent_autofill_password"
            tabIndex={-1}
            autoComplete="new-password"
          />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <Box className="flex items-center gap-2 p-3">
            <Business className="!w-5 !h-5 !text-primary-600" />
            <Typography variant="h6" className="!font-semibold !text-gray-900">
              Company Information
            </Typography>
          </Box>
          <Divider />
          <div className="p-4">
            <Box className="mb-6">
              <Typography
                variant="body2"
                className="!font-medium !text-gray-700 !mb-4"
              >
                Company Logo
              </Typography>
              <Box className="flex items-center gap-4">
                <Avatar
                  src={logoPreview || settings.logo || undefined}
                  alt={settings.name}
                  className="!w-24 !h-24 !rounded-lg !bg-primary-100"
                >
                  <Business className="!w-12 !h-12 !text-primary-600" />
                </Avatar>
                <Box>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload className="!w-4 !h-4" />}
                      size="small"
                    >
                      {uploadedFile ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                  </label>
                  {uploadedFile && (
                    <IconButton
                      size="small"
                      onClick={removeUploadedFile}
                      className="!ml-2"
                    >
                      <Close className="!w-4 !h-4" />
                    </IconButton>
                  )}
                  <Typography
                    variant="caption"
                    className="!block !mt-2 !text-gray-500"
                  >
                    JPG, PNG or GIF. Max size of 10MB
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="name"
                formik={formik}
                label="Company Name"
                placeholder="Enter company name"
                required
                fullWidth
              />
              <Input
                name="code"
                label="Company Code"
                value={settings.code}
                disabled
                fullWidth
              />
              <Input
                name="address"
                formik={formik}
                label="Address"
                placeholder="Enter address"
                fullWidth
                className="md:col-span-2"
              />
              <Input
                name="city"
                formik={formik}
                label="City"
                placeholder="Enter city"
                fullWidth
              />
              <Input
                name="state"
                formik={formik}
                label="State"
                placeholder="Enter state"
                fullWidth
              />
              <Input
                name="country"
                formik={formik}
                label="Country"
                placeholder="Enter country"
                fullWidth
              />
              <Input
                name="zipcode"
                formik={formik}
                label="Zip Code"
                placeholder="Enter zip code"
                fullWidth
              />
              <Input
                name="phone_number"
                formik={formik}
                label="Phone Number"
                placeholder="Enter phone number"
                fullWidth
              />
              <Input
                name="email"
                formik={formik}
                label="Email"
                placeholder="Enter email address"
                type="email"
                autoComplete="off"
                fullWidth
              />
              <Input
                name="website"
                formik={formik}
                label="Website"
                placeholder="https://example.com"
                fullWidth
              />

              <Select
                name="currency_id"
                formik={formik}
                label="Currency"
                fullWidth
              >
                <MenuItem value="">Select Currency</MenuItem>
                {currencies.map(currency => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <Box className="flex items-center p-3 gap-2">
            <SettingsIcon className="w-5 h-5 text-primary-600" />
            <Typography variant="h6" className="!font-semibold !text-gray-900">
              SMTP Configuration
            </Typography>
          </Box>
          <Divider />

          <div
            style={{
              position: 'absolute',
              opacity: 0,
              height: 0,
              width: 0,
              zIndex: -1,
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            <input
              type="text"
              name="prevent_smtp_username"
              tabIndex={-1}
              autoComplete="off"
            />
            <input
              type="password"
              name="prevent_smtp_password"
              tabIndex={-1}
              autoComplete="new-password"
            />
          </div>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Input
              name="smtp_mail_from_name"
              formik={formik}
              label="From Name"
              placeholder="Company Name"
              autoComplete="off"
              fullWidth
            />
            <Input
              name="smtp_mail_from_address"
              formik={formik}
              label="From Email"
              placeholder="noreply@company.com"
              type="email"
              autoComplete="off"
              fullWidth
            />
            <Input
              name="smtp_host"
              formik={formik}
              label="SMTP Host"
              placeholder="smtp.example.com"
              autoComplete="off"
              fullWidth
            />
            <Input
              name="smtp_port"
              formik={formik}
              label="SMTP Port"
              placeholder="587"
              type="number"
              autoComplete="off"
              fullWidth
            />
            <Input
              name="smtp_username"
              formik={formik}
              label="SMTP Username"
              placeholder="Enter SMTP username"
              autoComplete="off"
              fullWidth
            />
            <Input
              name="smtp_password"
              formik={formik}
              label="SMTP Password"
              placeholder="Enter SMTP password"
              type="password"
              autoComplete="new-password"
              fullWidth
            />
          </Box>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <Box className="flex items-center p-3 gap-2">
            <SettingsIcon className="w-5 h-5 text-primary-600" />
            <Typography variant="h6" className="!font-semibold !text-gray-900">
              Background Jobs
            </Typography>
          </Box>
          <Divider />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Select
              name="customer_grading_cron_time"
              formik={formik}
              label="Customer Grading Cron Time"
              fullWidth
            >
              <MenuItem value="0 0 * * *">Everyday Midnight</MenuItem>
              <MenuItem value="0 * * * *">Every Hour</MenuItem>
              <MenuItem value="* * * * *">Every Minute</MenuItem>
              <MenuItem value="0 0 * * 0">
                Every Week (Sunday Midnight)
              </MenuItem>
              <MenuItem value="0 0 1 * *">Every Month (1st Midnight)</MenuItem>
            </Select>
          </Box>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <Box className="flex items-center justify-between p-3">
            <Box className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900"
              >
                Excel API & Power Query Integration
              </Typography>
            </Box>
            <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Live CSV Streams
            </span>
          </Box>
          <Divider />

          <div className="p-4 space-y-6">
            <div>
              <Typography
                variant="subtitle2"
                className="!font-semibold !text-gray-800 !mb-3"
              >
                API Authentication Credentials
              </Typography>
              <div
                style={{
                  position: 'absolute',
                  opacity: 0,
                  height: 0,
                  width: 0,
                  zIndex: -1,
                  overflow: 'hidden',
                }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="prevent_excel_username"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input
                  type="password"
                  name="prevent_excel_password"
                  tabIndex={-1}
                  autoComplete="new-password"
                />
              </div>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="excel_api_username"
                  formik={formik}
                  label="Excel API Username (Basic Auth)"
                  placeholder="e.g. excel_sync"
                  autoComplete="off"
                  fullWidth
                />
                <Input
                  name="excel_api_password"
                  formik={formik}
                  label="Excel API Password (Basic Auth)"
                  placeholder="Enter strong password for Excel sync"
                  type="password"
                  autoComplete="new-password"
                  fullWidth
                />
              </Box>

              <Box className="mt-4">
                <Typography
                  variant="body2"
                  className="!font-medium !text-gray-700 !mb-1"
                >
                  Excel API Key (For Direct URL Access &amp; Power BI)
                </Typography>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      name="excel_api_key"
                      formik={formik}
                      placeholder="dcc_live_..."
                      fullWidth
                    />
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshCw className="w-4 h-4" />}
                    onClick={handleGenerateApiKey}
                    className="!whitespace-nowrap !h-10"
                  >
                    {formik.values.excel_api_key
                      ? 'Regenerate'
                      : 'Generate Key'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      apiKeyCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                    onClick={() =>
                      handleCopyText(
                        formik.values.excel_api_key || '',
                        'apikey'
                      )
                    }
                    disabled={!formik.values.excel_api_key}
                    className="!whitespace-nowrap !h-10"
                  >
                    {apiKeyCopied ? 'Copied' : 'Copy Key'}
                  </Button>
                </div>
                <Typography
                  variant="caption"
                  className="!block !mt-1 !text-gray-500"
                >
                  Attach this key to endpoints using &quot;Copy with Key&quot;
                  below. Excel or Power BI will load live data instantly without
                  requiring username/password credentials.
                </Typography>
              </Box>
            </div>

            <div>
              <Typography
                variant="subtitle2"
                className="!font-semibold !text-gray-800 !mb-2"
              >
                Available Excel Data Endpoints
              </Typography>
              <Typography
                variant="body2"
                className="!text-gray-500 !mb-3 !text-xs"
              >
                Copy any endpoint URL below and paste it directly into Microsoft
                Excel Power Query (Data → From Web).
              </Typography>

              <div className="space-y-3">
                {excelEndpoints.map(ep => (
                  <div
                    key={ep.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          {ep.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-blue-100 text-blue-800">
                          GET
                        </span>
                        {ep.format && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                              ep.format === 'JSON'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ep.format}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{ep.description}</p>
                      <code className="text-xs text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200 block break-all">
                        {ep.endpoint}
                      </code>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          copiedEndpoint === ep.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )
                        }
                        onClick={() =>
                          handleCopyText(ep.endpoint, 'endpoint', ep.id)
                        }
                        className="!whitespace-nowrap"
                      >
                        {copiedEndpoint === ep.id ? 'Copied URL' : 'Copy URL'}
                      </Button>
                      {formik.values.excel_api_key && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            copiedEndpointWithKey === ep.id ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )
                          }
                          onClick={() =>
                            handleCopyText(
                              `${ep.endpoint}?apiKey=${encodeURIComponent(
                                formik.values.excel_api_key
                              )}`,
                              'endpointWithKey',
                              ep.id
                            )
                          }
                          className="!whitespace-nowrap !bg-emerald-600 hover:!bg-emerald-700 !text-white"
                        >
                          {copiedEndpointWithKey === ep.id
                            ? 'Copied URL + Key'
                            : 'Copy with Key'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-1">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-2">
                  <p className="font-semibold text-sm">
                    How to Connect in Microsoft Excel (Power Query):
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-blue-800">
                    <li>
                      In Excel, go to the <strong>Data</strong> tab and click{' '}
                      <strong>From Web</strong>.
                    </li>
                    <li>
                      Paste the endpoint URL and click <strong>OK</strong>.
                    </li>
                    <li>
                      When the <strong>&quot;Access Web content&quot;</strong>{' '}
                      dialog appears, choose either method:
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div className="p-2.5 rounded bg-white border border-blue-200">
                          <p className="font-bold text-emerald-800 mb-1">
                            Method 1 : Basic Auth
                          </p>
                          <p className="text-gray-700">
                            1. Click <strong>Basic</strong> on the left menu
                            (above Web API).
                            <br />
                            2. Enter your <strong>
                              Excel API Username
                            </strong>{' '}
                            and <strong>Password</strong>.<br />
                            3. Click <strong>Connect</strong>.
                          </p>
                        </div>
                        <div className="p-2.5 rounded bg-white border border-blue-200">
                          <p className="font-bold text-blue-800 mb-1">
                            Method 2: Direct URL with Key
                          </p>
                          <p className="text-gray-700">
                            1. Click <strong>Copy with Key</strong> above to get
                            the URL with <code>?apiKey=...</code>.<br />
                            2. Select <strong>Anonymous</strong> on the left
                            menu.
                            <br />
                            3. Click <strong>Connect</strong>.
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      Click <strong>Connect</strong>, then click{' '}
                      <strong>Load</strong> to import live data into your
                      spreadsheet.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-800 space-y-2.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="font-bold text-sm text-emerald-950">
                      Outlet Master JSON API — Query Parameters &amp; Options:
                    </p>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      OR-Mode Search Enabled
                    </span>
                  </div>

                  <p className="text-gray-600">
                    Use these query parameters with <code>/outlet-master-json</code> for search, filtering, and mobile or external system integration. When multiple search parameters are passed, they operate in <strong>OR mode</strong>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded bg-white border border-emerald-100 space-y-1">
                      <p className="font-bold text-emerald-900 font-mono text-[11px]">
                        ?customer_no=...
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Matches customer code / number with few letters (e.g. <code>?customer_no=SGD040</code>). Alias: <code>?code=...</code>.
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-emerald-100 space-y-1">
                      <p className="font-bold text-emerald-900 font-mono text-[11px]">
                        ?name=...
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Matches outlet / customer name with few letters (e.g. <code>?name=abdul</code>). Alias: <code>?customer_name=...</code>.
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-emerald-100 space-y-1">
                      <p className="font-bold text-emerald-900 font-mono text-[11px]">
                        ?contact_details=...
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Matches owner phone number or contact person (e.g. <code>?contact_details=0628</code>). Alias: <code>?owner_number=...</code>.
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-emerald-100 space-y-1">
                      <p className="font-bold text-emerald-900 font-mono text-[11px]">
                        ?search=...
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Universal keyword search across code, name, phone, and contact person simultaneously. Alias: <code>?q=...</code>.
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-emerald-100 space-y-1">
                      <p className="font-bold text-emerald-900 font-mono text-[11px]">
                        ?depot_id=... &amp; ?route_id=...
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Filter by hierarchy IDs: <code>?depot_id=...</code>, <code>?zone_id=...</code>, <code>?route_id=...</code>.
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-emerald-100 space-y-1">
                      <p className="font-bold text-emerald-900 font-mono text-[11px]">
                        ?limit=... &amp; ?raw=true
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Default returns all records. Pass <code>?limit=50&amp;page=1</code> for pagination, or <code>?raw=true</code> for flat array.
                      </p>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded border border-emerald-200 font-mono text-[11px] text-gray-800 break-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-gray-500 font-sans font-bold mr-1">Example Search URL:</span>
                      <code>
                        {excelBaseUrl}/outlet-master-json?customer_no=SGD040&amp;name=abdul&amp;contact_details=0628
                        {formik.values.excel_api_key
                          ? `&amp;apiKey=${formik.values.excel_api_key}`
                          : ''}
                      </code>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Copy className="w-3.5 h-3.5" />}
                      onClick={() =>
                        handleCopyText(
                          `${excelBaseUrl}/outlet-master-json?customer_no=SGD040&name=abdul&contact_details=0628${
                            formik.values.excel_api_key
                              ? `&apiKey=${formik.values.excel_api_key}`
                              : ''
                          }`,
                          'apikey'
                        )
                      }
                      className="!whitespace-nowrap !text-xs !py-0.5 shrink-0"
                    >
                      Copy Example
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Box className="flex justify-end gap-3">
          <Button
            variant="outlined"
            onClick={() => {
              formik.resetForm();
              setUploadedFile(null);
              setLogoPreview(null);
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={updateSettingsMutation.isPending}
            startIcon={<CheckCircleOutlined />}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SystemSettings;
