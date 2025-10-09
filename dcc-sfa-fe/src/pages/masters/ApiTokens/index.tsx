import { Block, CheckCircle, PlayArrow, Stop } from '@mui/icons-material';
import { Alert, Box, Chip, MenuItem, Typography } from '@mui/material';
import { Key, Shield } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ActionButton, DeleteButton } from 'shared/ActionButton';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import {
  useActivateApiToken,
  useApiTokens,
  useDeactivateApiToken,
  useDeleteApiToken,
  useRevokeApiToken,
} from '../../../hooks/useApiTokens';
import type { ApiToken } from '../../../services/masters/ApiTokens';
import { formatDate } from '../../../utils/dateUtils';

const ApiTokensPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [revokedFilter, setRevokedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: tokensResponse,
    isLoading,
    error,
  } = useApiTokens({
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
  });
  const tokens = tokensResponse?.data || [];
  const totalCount = tokensResponse?.meta?.total_count || 0;
  const currentPage = (tokensResponse?.meta?.current_page || 1) - 1;

  const revokeTokenMutation = useRevokeApiToken();
  const activateTokenMutation = useActivateApiToken();
  const deactivateTokenMutation = useDeactivateApiToken();
  const deleteTokenMutation = useDeleteApiToken();

  const totalTokens = tokensResponse?.stats?.total_tokens ?? tokens.length;
  const activeTokens =
    tokensResponse?.stats?.active_tokens ??
    tokens.filter(token => token.is_active === 'Y').length;
  const revokedTokens =
    tokensResponse?.stats?.revoked_tokens ??
    tokens.filter(token => token.is_revoked).length;
  const expiredTokens =
    tokensResponse?.stats?.expired_tokens ??
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

  const handleActivateToken = useCallback(
    async (id: number) => {
      try {
        await activateTokenMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error activating token:', error);
      }
    },
    [activateTokenMutation]
  );

  const handleDeactivateToken = useCallback(
    async (id: number) => {
      try {
        await deactivateTokenMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deactivating token:', error);
      }
    },
    [deactivateTokenMutation]
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
          <Box>
            <Typography variant="body2" className="!text-gray-900">
              {user?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {user?.email || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'device_id',
      label: 'Device',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.device_id || (
            <span className="italic text-gray-400">No Device</span>
          )}
        </Typography>
      ),
    },
    {
      id: 'ip_address',
      label: 'IP Address',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.ip_address || (
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
            icon={config.icon}
            label={config.label}
            size="small"
            className="w-26"
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
    {
      id: 'action',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => {
        const isRevoked = row.is_revoked;
        const isActive = row.is_active === 'Y';
        const isExpired =
          row.expires_at && new Date(row.expires_at) < new Date();

        return (
          <div className="!flex !gap-2 !items-center">
            {!isRevoked && !isExpired && (
              <>
                {isActive ? (
                  <PopConfirm
                    title="Deactivate Token"
                    description="Are you sure you want to deactivate this token?"
                    confirmText="Deactivate"
                    onConfirm={() => handleDeactivateToken(row.id)}
                  >
                    <ActionButton
                      tooltip="Deactivate Token"
                      disabled={deactivateTokenMutation.isPending}
                      icon={<Stop />}
                      color="warning"
                    />
                  </PopConfirm>
                ) : (
                  <PopConfirm
                    title="Activate Token"
                    description="Are you sure you want to activate this token?"
                    confirmText="Activate"
                    onConfirm={() => handleActivateToken(row.id)}
                  >
                    <ActionButton
                      tooltip="Activate Token"
                      disabled={activateTokenMutation.isPending}
                      icon={<PlayArrow />}
                      color="success"
                    />
                  </PopConfirm>
                )}

                <PopConfirm
                  title="Revoke Token"
                  description="Are you sure you want to revoke this token? It will no longer be usable."
                  confirmText="Revoke"
                  onConfirm={() => handleRevokeToken(row.id)}
                >
                  <ActionButton
                    tooltip="Revoke Token"
                    disabled={revokeTokenMutation.isPending}
                    icon={<Block />}
                    color="error"
                  />
                </PopConfirm>
              </>
            )}

            <DeleteButton
              onClick={() => handleDeleteToken(row.id)}
              tooltip={`Delete Token #${row.id}`}
              itemName={`Token #${row.id}`}
              confirmDelete={true}
            />
          </div>
        );
      },
    },
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">
                Total Tokens
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-primary-500">
                  {totalTokens}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">
                Active Tokens
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {activeTokens}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">Revoked Tokens</p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {revokedTokens}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Block className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-500">
                Expired Tokens
              </p>
              {isLoading ? (
                <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-orange-500">
                  {expiredTokens}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
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
        }
        getRowId={token => token.id}
        initialOrderBy="id"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        onPageChange={handlePageChange}
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
