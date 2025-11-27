import { Block, CheckCircle } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { Key, Shield } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import {
  useApiTokens,
  useDeleteApiToken,
  useRevokeApiToken,
} from '../../../hooks/useApiTokens';
import { usePermission } from '../../../hooks/usePermission';
import type { ApiToken } from '../../../services/masters/ApiTokens';
import { formatDate } from '../../../utils/dateUtils';

const ApiTokensPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [revokedFilter, setRevokedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isUpdate, isDelete, isRead } = usePermission('token');

  const {
    data: tokensResponse,
    isLoading,
    error,
  } = useApiTokens(
    {
      search,
      page,
      limit,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
      isRevoked:
        revokedFilter === 'all'
          ? undefined
          : revokedFilter === 'revoked'
            ? 'true'
            : 'false',
    },
    {
      enabled: isRead,
    }
  );
  const tokens = tokensResponse?.data || [];
  const totalCount = tokensResponse?.meta?.total_count || 0;
  const currentPage = (tokensResponse?.meta?.current_page || 1) - 1;

  const revokeTokenMutation = useRevokeApiToken();

  const deleteTokenMutation = useDeleteApiToken();
  const stats = (tokensResponse?.stats as any) || {};

  const totalTokens = stats.total_tokens ?? tokens.length;
  const activeTokens =
    stats.active_tokens ??
    tokens.filter(token => token.is_active === 'Y').length;
  const revokedTokens =
    stats.revoked_tokens ?? tokens.filter(token => token.is_revoked).length;
  const expiredTokens =
    stats.expired_tokens ??
    tokens.filter(
      token => token.expires_at && new Date(token.expires_at) < new Date()
    ).length;

  const handleRevokeToken = useCallback(
    async (id: number) => {
      try {
        await revokeTokenMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error revoking token:', error);
      }
    },
    [revokeTokenMutation]
  );

  const handleDeleteToken = useCallback(
    async (id: number) => {
      try {
        await deleteTokenMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting token:', error);
      }
    },
    [deleteTokenMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const formatDeviceInfo = (deviceInfo: string | null | undefined): string => {
    if (!deviceInfo) return 'Unknown device';

    const info = deviceInfo.toLowerCase();

    if (info.includes('macintosh') || info.includes('mac os x')) {
      const osMatch = deviceInfo.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
      const osVersion = osMatch ? osMatch[1].replace(/_/g, '.') : '';

      if (info.includes('chrome')) {
        const chromeMatch = deviceInfo.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
        const chromeVersion = chromeMatch ? chromeMatch[1] : '';
        return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Chrome${chromeVersion ? ` ${chromeVersion}` : ''}`;
      }
      if (info.includes('safari') && !info.includes('chrome')) {
        return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Safari`;
      }
      if (info.includes('firefox')) {
        return `Mac${osVersion ? ` (macOS ${osVersion})` : ''} - Firefox`;
      }
    }

    if (info.includes('windows')) {
      let windowsVersion = '';
      if (info.includes('windows nt 10.0')) {
        windowsVersion = 'Windows 10';
      } else if (info.includes('windows nt 11.0')) {
        windowsVersion = 'Windows 11';
      } else if (info.includes('windows nt 6.3')) {
        windowsVersion = 'Windows 8.1';
      } else if (info.includes('windows nt 6.2')) {
        windowsVersion = 'Windows 8';
      } else if (info.includes('windows nt 6.1')) {
        windowsVersion = 'Windows 7';
      } else {
        const winMatch = deviceInfo.match(/Windows NT (\d+\.\d+)/i);
        if (winMatch) {
          const ntVersion = winMatch[1];
          if (ntVersion === '10.0') windowsVersion = 'Windows 10';
          else if (ntVersion === '11.0') windowsVersion = 'Windows 11';
          else if (ntVersion === '6.3') windowsVersion = 'Windows 8.1';
          else if (ntVersion === '6.2') windowsVersion = 'Windows 8';
          else if (ntVersion === '6.1') windowsVersion = 'Windows 7';
          else windowsVersion = `Windows NT ${ntVersion}`;
        } else {
          windowsVersion = 'Windows';
        }
      }

      if (info.includes('chrome')) {
        const chromeMatch = deviceInfo.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
        const chromeVersion = chromeMatch ? chromeMatch[1] : '';
        return `${windowsVersion}${chromeVersion ? ` - Chrome ${chromeVersion}` : ' - Chrome'}`;
      }
      if (info.includes('firefox')) {
        const firefoxMatch = deviceInfo.match(/Firefox\/(\d+\.\d+)/);
        const firefoxVersion = firefoxMatch ? firefoxMatch[1] : '';
        return `${windowsVersion}${firefoxVersion ? ` - Firefox ${firefoxVersion}` : ' - Firefox'}`;
      }
      if (info.includes('edge')) {
        const edgeMatch = deviceInfo.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
        const edgeVersion = edgeMatch ? edgeMatch[1] : '';
        return `${windowsVersion}${edgeVersion ? ` - Edge ${edgeVersion}` : ' - Edge'}`;
      }
      return windowsVersion;
    }

    if (info.includes('android')) {
      if (info.includes('chrome')) return 'Android - Chrome';
    }

    if (info.includes('iphone') || info.includes('ipad')) {
      if (info.includes('safari')) return 'iOS - Safari';
    }

    if (info.includes('dart')) {
      return 'Mobile App (Dart)';
    }

    return deviceInfo;
  };

  const getTokenStatus = (token: ApiToken) => {
    if (token.is_revoked) return 'revoked';
    if (token.expires_at && new Date(token.expires_at) < new Date())
      return 'expired';
    if (token.is_active === 'Y') return 'active';
    return 'inactive';
  };

  const tokenColumns: TableColumn<ApiToken>[] = [
    {
      id: 'users_api_tokens_user_idTousers',
      label: 'User',
      render: (_value, row) => {
        const user = row.users_api_tokens_user_idTousers;
        return (
          <Box className="!flex !gap-2 !items-center">
            <Avatar
              alt={user?.name}
              className="!rounded !bg-primary-100 !text-primary-500"
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box className="!max-w-xs">
              <Typography
                variant="body1"
                className="!text-gray-900 !leading-tight"
              >
                {user?.name || 'Unknown User'}
              </Typography>
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                {user?.email || `ID: ${row.user_id}`}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'token_type',
      label: 'Token Type',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.token_type || (
            <span className="italic text-gray-400">No Token Type</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'device_id',
      label: 'Device',
      render: (_value, row) => (
        <Tooltip title={row.device_id || 'No Device'} arrow placement="top">
          <Typography variant="body2" className="!text-gray-900">
            {row.device_id ? (
              formatDeviceInfo(row.device_id)
            ) : (
              <span className="italic text-gray-400">No Device</span>
            )}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'ip_address',
      label: 'IP Address',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.ip_address && row.ip_address !== '' ? (
            row.ip_address?.replace(/^::ffff:/, '')
          ) : (
            <span className="italic text-gray-400">No IP</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_value, row) => {
        const status = getTokenStatus(row);
        const statusConfig = {
          active: {
            label: 'Active',
            color: 'success' as const,
            icon: <CheckCircle />,
          },
          inactive: {
            label: 'Inactive',
            color: 'default' as const,
            icon: <Block />,
          },
          revoked: {
            label: 'Revoked',
            color: 'error' as const,
            icon: <Block />,
          },
          expired: {
            label: 'Expired',
            color: 'warning' as const,
            icon: <Block />,
          },
        };
        const config = statusConfig[status];
        return (
          <Chip
            variant="outlined"
            icon={config.icon}
            label={config.label}
            size="small"
            color={config.color}
          />
        );
      },
    },
    {
      id: 'issued_at',
      label: 'Issued At',
      render: (_value, row) =>
        formatDate(row.issued_at?.toString()) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    {
      id: 'expires_at',
      label: 'Expires At',
      render: (_value, row) =>
        formatDate(row.expires_at?.toString()) || (
          <span className="italic text-gray-400">No Expiry</span>
        ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: ApiToken) => {
              const isRevoked = row.is_revoked;
              const isExpired =
                row.expires_at && new Date(row.expires_at) < new Date();

              return (
                <div className="!flex !gap-2 !items-center">
                  {isUpdate && !isRevoked && !isExpired && (
                    <>
                      <PopConfirm
                        title="Revoke Token"
                        description="Are you sure you want to revoke this token? It will no longer be usable."
                        confirmText="Revoke"
                        onConfirm={() => handleRevokeToken(row.id)}
                      >
                        <ActionButton
                          tooltip={`Revoke Token #${row.id}`}
                          disabled={revokeTokenMutation.isPending}
                          icon={<Block />}
                          color="error"
                        />
                      </PopConfirm>
                    </>
                  )}

                  {isDelete && (
                    <DeleteButton
                      onClick={() => handleDeleteToken(row.id)}
                      tooltip={`Delete Token #${row.id}`}
                      itemName={`Token #${row.id}`}
                      confirmDelete={true}
                    />
                  )}
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            API Tokens Management
          </p>
          <p className="!text-gray-500 text-sm">
            Manage and monitor API tokens for all users
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Tokens"
          value={totalTokens}
          icon={<Key className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Tokens"
          value={activeTokens}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Revoked Tokens"
          value={revokedTokens}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
        <StatsCard
          title="Expired Tokens"
          value={expiredTokens}
          icon={<Shield className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load API tokens. Please try again.
        </Alert>
      )}

      <Table
        data={tokens}
        columns={tokenColumns}
        actions={
          isRead ? (
            <div className="flex justify-between gap-3 items-center flex-wrap">
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  placeholder="Search API Tokens..."
                  value={search}
                  onChange={handleSearchChange}
                  debounceMs={400}
                  showClear={true}
                  className="!w-80"
                />
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="!w-40"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                <Select
                  value={revokedFilter}
                  onChange={e => setRevokedFilter(e.target.value)}
                  className="!w-40"
                >
                  <MenuItem value="all">All Revoked</MenuItem>
                  <MenuItem value="revoked">Revoked</MenuItem>
                  <MenuItem value="not-revoked">Not Revoked</MenuItem>
                </Select>
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={token => token.id}
        initialOrderBy="id"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
        isPermission={isRead}
        emptyMessage={
          search
            ? `No API tokens found matching "${search}"`
            : 'No API tokens found in the system'
        }
      />
    </>
  );
};

export default ApiTokensPage;
