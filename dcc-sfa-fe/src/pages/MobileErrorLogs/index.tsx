import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Smartphone,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Layers,
  Clock,
  User as UserIcon,
  Copy,
  Check,
  X,
  HardDrive,
  Eye,
  Filter,
} from 'lucide-react';
import SearchInput from 'shared/SearchInput';
import { useMobileErrorLogs } from 'hooks/useMobileErrorLogs';
import type { MobileErrorLogData } from 'services/mobileErrorLogs';
import { formatDateTime } from 'utils/dateUtils';

const MobileErrorLogs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedError, setSelectedError] = useState<MobileErrorLogData | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch mobile error logs with auto-refresh every 30 seconds
  const { data: responseData, isLoading, isFetching, error, refetch } = useMobileErrorLogs({
    limit: 100,
  });

  const logs = responseData?.data || [];
  const stats = responseData?.stats || {
    total_errors: logs.length,
    today_errors: 0,
    this_week_errors: 0,
    this_month_errors: 0,
  };

  // Local filtering for fast search & filter responsiveness
  const filteredLogs = logs.filter((log) => {
    const query = search.toLowerCase();
    const matchesQuery =
      log.error_message?.toLowerCase().includes(query) ||
      log.screen_name?.toLowerCase().includes(query) ||
      log.error_type?.toLowerCase().includes(query) ||
      log.user_name?.toLowerCase().includes(query) ||
      log.employee_code?.toLowerCase().includes(query) ||
      log.device_info?.toLowerCase().includes(query);

    const matchesType =
      selectedType === 'ALL' ||
      (log.error_type && log.error_type.toLowerCase() === selectedType.toLowerCase());

    return matchesQuery && matchesType;
  });

  // Extract distinct error types for quick filter pills
  const availableTypes = Array.from(
    new Set(logs.map((l) => l.error_type).filter(Boolean))
  ) as string[];

  const handleCopyStack = (text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getErrorColor = (type?: string | null) => {
    const t = (type || '').toLowerCase();
    if (t.includes('crash') || t.includes('fatal') || t.includes('null')) {
      return {
        bg: '!bg-red-50',
        text: '!text-red-700',
        border: '!border-red-200',
        avatarBg: '!bg-red-100 !text-red-700',
      };
    }
    if (t.includes('timeout') || t.includes('network') || t.includes('http')) {
      return {
        bg: '!bg-amber-50',
        text: '!text-amber-700',
        border: '!border-amber-200',
        avatarBg: '!bg-amber-100 !text-amber-700',
      };
    }
    return {
      bg: '!bg-blue-50',
      text: '!text-blue-700',
      border: '!border-blue-200',
      avatarBg: '!bg-blue-100 !text-blue-700',
    };
  };

  return (
    <Box className="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header section - Centered matching SalesmanControl */}
      <Box className="flex flex-col items-center text-center w-full gap-2 mb-4 relative">
        <Box className="flex items-center justify-center gap-2">
          <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
          <Typography
            variant="h5"
            className="!text-lg sm:!text-2xl !font-bold !text-gray-900 !leading-tight"
          >
            Mobile App Error Logs
          </Typography>
        </Box>
        <Typography
          variant="body2"
          className="!text-[11px] sm:!text-sm !text-gray-500 max-w-xl mx-auto"
        >
          Track application crashes, API timeouts, and offline sync issues logged from mobile devices.
        </Typography>

        {isFetching && (
          <Box className="absolute top-0 right-0 flex items-center gap-1.5 text-primary-600">
            <CircularProgress size={16} color="inherit" />
            <span className="text-xs font-medium hidden sm:inline">Syncing...</span>
          </Box>
        )}
      </Box>

      {/* Quick Stats Grid */}
      <Box className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <Box className="bg-white rounded-xl border border-gray-100 p-3 shadow-xs flex items-center gap-2.5">
          <Box className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </Box>
          <Box className="min-w-0">
            <Typography variant="caption" className="!text-[10px] !text-gray-400 !font-semibold !uppercase !block !leading-tight">
              Total Errors
            </Typography>
            <Typography variant="h6" className="!text-sm sm:!text-base !font-bold !text-gray-900">
              {stats.total_errors}
            </Typography>
          </Box>
        </Box>

        <Box className="bg-white rounded-xl border border-gray-100 p-3 shadow-xs flex items-center gap-2.5">
          <Box className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4" />
          </Box>
          <Box className="min-w-0">
            <Typography variant="caption" className="!text-[10px] !text-gray-400 !font-semibold !uppercase !block !leading-tight">
              Today
            </Typography>
            <Typography variant="h6" className="!text-sm sm:!text-base !font-bold !text-gray-900">
              {stats.today_errors}
            </Typography>
          </Box>
        </Box>

        <Box className="bg-white rounded-xl border border-gray-100 p-3 shadow-xs flex items-center gap-2.5">
          <Box className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </Box>
          <Box className="min-w-0">
            <Typography variant="caption" className="!text-[10px] !text-gray-400 !font-semibold !uppercase !block !leading-tight">
              This Week
            </Typography>
            <Typography variant="h6" className="!text-sm sm:!text-base !font-bold !text-gray-900">
              {stats.this_week_errors}
            </Typography>
          </Box>
        </Box>

        <Box className="bg-white rounded-xl border border-gray-100 p-3 shadow-xs flex items-center gap-2.5">
          <Box className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-4 h-4" />
          </Box>
          <Box className="min-w-0">
            <Typography variant="caption" className="!text-[10px] !text-gray-400 !font-semibold !uppercase !block !leading-tight">
              This Month
            </Typography>
            <Typography variant="h6" className="!text-sm sm:!text-base !font-bold !text-gray-900">
              {stats.this_month_errors}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Control panel and filters - Full width search input matching SalesmanControl */}
      <Box className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 mb-4 flex flex-col gap-3">
        <Box className="w-full">
          <SearchInput
            placeholder="Search by error message, screen name, device, user..."
            value={search}
            onChange={(val) => setSearch(val)}
            fullWidth={true}
          />
        </Box>

        {/* Filter pills & Action controls */}
        <Box className="flex flex-wrap gap-2 w-full justify-between items-center">
          <Box className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
            <Chip
              label="All Types"
              size="small"
              onClick={() => setSelectedType('ALL')}
              className={`!text-xs !cursor-pointer ${
                selectedType === 'ALL'
                  ? '!bg-primary-600 !text-white !font-bold'
                  : '!bg-gray-100 !text-gray-600 hover:!bg-gray-200'
              }`}
            />
            {availableTypes.map((type) => (
              <Chip
                key={type}
                label={type}
                size="small"
                onClick={() => setSelectedType(type)}
                className={`!text-xs !cursor-pointer ${
                  selectedType === type
                    ? '!bg-primary-600 !text-white !font-bold'
                    : '!bg-gray-100 !text-gray-600 hover:!bg-gray-200'
                }`}
              />
            ))}
          </Box>

          <Box className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <Chip
              icon={<Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
              label={`Count: ${filteredLogs.length}`}
              variant="outlined"
              size="small"
              className="!bg-emerald-50/50 !text-emerald-700 !border-emerald-200 !text-xs font-semibold"
            />
            <button
              onClick={() => refetch()}
              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </Box>
        </Box>
      </Box>

      {/* Loader / Empty States */}
      {isLoading ? (
        <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {[...Array(8)].map((_, index) => (
            <Card
              key={index}
              className="!border !border-gray-100 !rounded-xl !shadow-none animate-pulse"
            >
              <CardContent className="!p-3">
                <Box className="flex items-center gap-2 mb-3">
                  <Box className="w-9 h-9 sm:w-11 sm:h-11 bg-gray-200 rounded-lg" />
                  <Box className="flex-1">
                    <Box className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                    <Box className="h-2.5 bg-gray-200 rounded w-1/2" />
                  </Box>
                </Box>
                <Box className="h-2.5 bg-gray-200 rounded w-5/6 mb-1.5" />
                <Box className="h-2.5 bg-gray-200 rounded w-2/3 mb-3" />
                <Box className="h-6 bg-gray-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : error ? (
        <Box className="bg-red-50 border border-red-200 rounded-xl p-5 text-center max-w-lg mx-auto my-6">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <Typography
            variant="h6"
            className="!text-red-800 !font-semibold !text-base mb-1"
          >
            Failed to load Mobile Error Logs
          </Typography>
          <Typography variant="body2" className="!text-red-600 !text-xs mb-3">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </Typography>
          <button
            onClick={() => refetch()}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-xs"
          >
            Try Again
          </button>
        </Box>
      ) : filteredLogs.length === 0 ? (
        <Box className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center max-w-lg mx-auto my-6">
          <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <Typography
            variant="h6"
            className="!text-gray-700 !font-semibold !text-base mb-1"
          >
            No Error Logs Found
          </Typography>
          <Typography variant="body2" className="!text-gray-400 !text-xs">
            {search || selectedType !== 'ALL'
              ? 'No error logs match your search filters.'
              : 'There are currently no mobile error logs recorded.'}
          </Typography>
        </Box>
      ) : (
        /* Responsive Cards Grid - 2 cols on mobile/sm, 3 on md, 4 on lg matching SalesmanControl */
        <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredLogs.map((log) => {
            const colors = getErrorColor(log.error_type);

            return (
              <Card
                key={log.id}
                onClick={() => setSelectedError(log)}
                className="!relative !border !border-gray-200 hover:!border-primary-300 !rounded-xl !bg-white hover:!bg-primary-50/5 hover:!shadow-md hover:!-translate-y-0.5 !transition-all !duration-300 !cursor-pointer select-none group flex flex-col justify-between"
              >
                <CardContent className="!p-3 sm:!p-4 flex flex-col justify-between h-full">
                  {/* Card Header: Error Avatar & Error Type badge */}
                  <Box className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <Avatar
                      className={`!w-8 h-8 sm:!w-10 sm:!h-10 !rounded-lg !font-bold !text-xs sm:!text-sm ${colors.avatarBg}`}
                    >
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Avatar>

                    <Box className="flex flex-col gap-1 items-end">
                      <Chip
                        label={log.error_type || 'Error'}
                        size="small"
                        className={`!text-[9px] sm:!text-[10px] !font-bold !h-5 ${colors.bg} ${colors.text} !border ${colors.border}`}
                      />
                      {log.is_synced === 1 && (
                        <span className="text-[8px] sm:text-[9px] text-emerald-600 font-medium">
                          • Synced
                        </span>
                      )}
                    </Box>
                  </Box>

                  {/* Error Message & Screen */}
                  <Box className="mb-2 sm:mb-3 flex-1">
                    <Typography
                      variant="subtitle2"
                      className="!text-xs sm:!text-sm !font-bold !text-gray-900 group-hover:!text-primary-700 !leading-snug !line-clamp-2"
                      title={log.error_message}
                    >
                      {log.error_message}
                    </Typography>

                    {/* Screen name pill */}
                    <Box className="flex items-center gap-1.5 mt-1.5 text-gray-500">
                      <Layers className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <Typography
                        variant="body2"
                        className="!text-[11px] sm:!text-xs !font-medium !text-gray-600 !truncate"
                        title={log.screen_name || 'Global'}
                      >
                        {log.screen_name || 'Global / Background'}
                      </Typography>
                    </Box>

                    {/* Device & User Pills */}
                    <Box className="flex flex-wrap gap-1 mt-2.5">
                      {log.user_name && log.user_name !== 'N/A' && (
                        <span className="text-[9px] sm:text-[10px] bg-gray-50 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 !leading-none flex items-center gap-1">
                          <UserIcon className="w-2.5 h-2.5 text-gray-400" />
                          {log.user_name}
                        </span>
                      )}

                      {log.employee_code && log.employee_code !== 'N/A' && (
                        <span className="text-[9px] sm:text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 !leading-none">
                          EMP: {log.employee_code}
                        </span>
                      )}

                      {log.device_info && (
                        <span
                          className="text-[9px] sm:text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 !leading-none !truncate max-w-[170px]"
                          title={log.device_info}
                        >
                          {log.device_info}
                        </span>
                      )}
                    </Box>
                  </Box>

                  {/* Card Bottom Area: Date & Quick Tap indicator */}
                  <Box className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto gap-1 text-gray-400">
                    <Box className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <Typography
                        variant="caption"
                        className="!text-[10px] sm:!text-[11px] !text-gray-500 !font-medium"
                      >
                        {formatDateTime(log.createdate) || 'Recent'}
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-0.5 text-primary-600 text-[10px] font-semibold opacity-80 group-hover:opacity-100">
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Detailed Error Dialog */}
      <Dialog
        open={Boolean(selectedError)}
        onClose={() => setSelectedError(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: '!rounded-2xl !p-1 !max-w-2xl',
        }}
      >
        {selectedError && (
          <>
            <DialogTitle className="!flex !items-center !justify-between !pb-2 !pt-4 !px-5 !border-b !border-gray-100">
              <Box className="flex items-center gap-2">
                <Box className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </Box>
                <Box>
                  <Typography variant="h6" className="!text-sm sm:!text-base !font-bold !text-gray-900">
                    Mobile Error Details #{selectedError.id}
                  </Typography>
                  <Typography variant="caption" className="!text-xs !text-gray-500">
                    {formatDateTime(selectedError.createdate)}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedError(null)} size="small">
                <X className="w-4 h-4 text-gray-500" />
              </IconButton>
            </DialogTitle>

            <DialogContent className="!p-5 space-y-4">
              {/* Badges Overview */}
              <Box className="flex flex-wrap gap-1.5 pb-2 border-b border-gray-100">
                <Chip
                  label={`Type: ${selectedError.error_type || 'Unknown'}`}
                  size="small"
                  className="!text-xs !font-semibold !bg-red-50 !text-red-700 !border !border-red-200"
                />
                <Chip
                  label={`Screen: ${selectedError.screen_name || 'N/A'}`}
                  size="small"
                  className="!text-xs !font-semibold !bg-blue-50 !text-blue-700 !border !border-blue-200"
                />
                <Chip
                  label={selectedError.is_synced === 1 ? 'Synced: Yes' : 'Synced: Pending'}
                  size="small"
                  className="!text-xs !font-semibold !bg-emerald-50 !text-emerald-700 !border !border-emerald-200"
                />
              </Box>

              {/* Error Message */}
              <Box>
                <Typography variant="caption" className="!text-xs !font-bold !text-gray-500 !uppercase">
                  Error Message
                </Typography>
                <Box className="bg-red-50/70 border border-red-200/80 rounded-xl p-3 mt-1">
                  <Typography variant="body2" className="!text-sm !font-semibold !text-red-900 !break-words">
                    {selectedError.error_message}
                  </Typography>
                </Box>
              </Box>

              {/* User & Device Details Grid */}
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <Box>
                  <Typography variant="caption" className="!text-[11px] !font-bold !text-gray-400 !uppercase">
                    User Information
                  </Typography>
                  <Typography variant="body2" className="!text-xs !font-semibold !text-gray-800 mt-0.5">
                    {selectedError.user_name || 'Not logged in'}
                  </Typography>
                  {selectedError.user_email && (
                    <Typography variant="caption" className="!text-[11px] !text-gray-500 block">
                      {selectedError.user_email}
                    </Typography>
                  )}
                  {selectedError.employee_code && (
                    <Typography variant="caption" className="!text-[11px] !text-gray-500 block">
                      Code: {selectedError.employee_code}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" className="!text-[11px] !font-bold !text-gray-400 !uppercase">
                    Device Information
                  </Typography>
                  <Typography variant="body2" className="!text-xs !font-medium !text-gray-800 mt-0.5 !break-words">
                    {selectedError.device_info || 'Device details not captured'}
                  </Typography>
                </Box>
              </Box>

              {/* Stack Trace */}
              {selectedError.stack_trace ? (
                <Box>
                  <Box className="flex items-center justify-between mb-1.5">
                    <Typography variant="caption" className="!text-xs !font-bold !text-gray-500 !uppercase">
                      Stack Trace
                    </Typography>
                    <button
                      onClick={() => handleCopyStack(selectedError.stack_trace)}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium py-1 px-2 rounded-md hover:bg-primary-50 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Stack'}</span>
                    </button>
                  </Box>
                  <Box className="bg-gray-900 text-gray-100 p-3 rounded-xl overflow-x-auto max-h-64 font-mono text-xs leading-relaxed border border-gray-800">
                    <pre className="whitespace-pre-wrap break-words">{selectedError.stack_trace}</pre>
                  </Box>
                </Box>
              ) : (
                <Box className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <Typography variant="caption" className="!text-xs !text-gray-400">
                    No stack trace captured for this error.
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions className="!p-4 !border-t !border-gray-100">
              <button
                onClick={() => setSelectedError(null)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MobileErrorLogs;
