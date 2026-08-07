import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import { useRolesDropdown } from 'hooks/useRoles';
import { useUsers, useUpdateUserLogInst, type User } from 'hooks/useUsers';
import CustomSwitch from 'shared/CustomSwitch';
import SearchInput from 'shared/SearchInput';
import { Shield, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';

const SalesmanControl: React.FC = () => {
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch all roles to find the salesman role ID
  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useRolesDropdown();
  const roles = rolesResponse?.data || [];
  const salesmanRole = roles.find(
    (role) => role.name.toLowerCase() === 'salesman'
  );
  const salesmanRoleId = salesmanRole?.id;

  // Fetch users filtered by salesman role ID
  const {
    data: usersResponse,
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
    refetch,
  } = useUsers(
    {
      role_id: salesmanRoleId,
      limit: 1000, // Fetch all salesman users to list on one control tower page
    },
    {
      enabled: !!salesmanRoleId,
    }
  );

  const { mutate: updateLogInst } = useUpdateUserLogInst();

  const handleToggleLogInst = (user: User) => {
    const currentVal = user.log_inst ?? 1; // Default to 1 if null
    const newVal = currentVal === 1 ? 0 : 1;

    setUpdatingId(user.id);
    updateLogInst(
      { id: user.id, log_inst: newVal },
      {
        onSettled: () => {
          setUpdatingId(null);
        },
      }
    );
  };

  const users = usersResponse?.data || [];

  // Local filter for search responsiveness
  const filteredSalesmen = users.filter((u) => {
    const query = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.employee_id && u.employee_id.toLowerCase().includes(query)) ||
      (u.sap_code && u.sap_code.toLowerCase().includes(query))
    );
  });

  const isLoading =
    rolesLoading || ((usersLoading || usersFetching) && !!salesmanRoleId);
  const error = rolesError || usersError;

  return (
    <Box className="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header section - Centered */}
      <Box className="flex flex-col items-center text-center w-full gap-2 mb-4 relative">
        <Box className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
          <Typography variant="h5" className="!text-lg sm:!text-2xl !font-bold !text-gray-900 !leading-tight">
            Salesman Device & Login Control
          </Typography>
        </Box>
        <Typography variant="body2" className="!text-[11px] sm:!text-sm !text-gray-500 max-w-xl mx-auto">
          Bypass or enforce single-device login instances (`log_inst`) for sales representatives.
        </Typography>
        
        {isLoading && (
          <Box className="absolute top-0 right-0 flex items-center gap-1.5 text-primary-600">
            <CircularProgress size={16} color="inherit" />
            <span className="text-xs font-medium hidden sm:inline">Syncing...</span>
          </Box>
        )}
      </Box>

      {/* Control panel and filters - Full width search input */}
      <Box className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 mb-4 flex flex-col gap-3">
        <Box className="w-full">
          <SearchInput
            placeholder="Search by name, email, ID..."
            value={search}
            onChange={(val) => setSearch(val)}
            fullWidth={true}
          />
        </Box>
        <Box className="flex gap-2 w-full justify-between items-center">
          <Chip
            icon={<Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
            label={`Count: ${filteredSalesmen.length}`}
            variant="outlined"
            size="small"
            className="!bg-emerald-50/50 !text-emerald-700 !border-emerald-200 !text-xs"
          />
          <button
            onClick={() => refetch()}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
            title="Refresh List"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </Box>
      </Box>

      {/* Loader / Empty States */}
      {isLoading ? (
        <Box className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="!border !border-gray-100 !rounded-xl !shadow-none animate-pulse">
              <CardContent className="!p-3">
                <Box className="flex items-center gap-2 mb-3">
                  <Box className="w-9 h-9 sm:w-12 sm:h-12 bg-gray-200 rounded-lg" />
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
          <Typography variant="h6" className="!text-red-800 !font-semibold !text-base mb-1">
            Failed to load Salesmen
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
      ) : filteredSalesmen.length === 0 ? (
        <Box className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center max-w-lg mx-auto my-6">
          <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <Typography variant="h6" className="!text-gray-700 !font-semibold !text-base mb-1">
            No Salesmen Found
          </Typography>
          <Typography variant="body2" className="!text-gray-400 !text-xs">
            {search ? "No sales representative matches your search query." : "There are currently no sales representatives registered in the system."}
          </Typography>
        </Box>
      ) : (
        /* Responsive Cards Grid - 2 columns on mobile */
        <Box className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {filteredSalesmen.map((salesman) => {
            const isUpdating = updatingId === salesman.id;
            const logInstVal = salesman.log_inst ?? 1;

            return (
              <Card
                key={salesman.id}
                onClick={() => !isUpdating && handleToggleLogInst(salesman)}
                className={`!relative !border !rounded-xl !transition-all !duration-300 !cursor-pointer select-none group
                  ${isUpdating ? '!opacity-80 !pointer-events-none' : ''}
                  ${logInstVal === 1
                    ? '!border-primary-100 hover:!border-primary-300 !bg-primary-50/5 hover:!bg-primary-50/15 hover:!shadow-md hover:!-translate-y-0.5'
                    : '!border-gray-200 hover:!border-gray-300 !bg-white hover:!shadow-md hover:!-translate-y-0.5'
                  }
                `}
              >
                {/* Active updating overlay */}
                {isUpdating && (
                  <Box className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center z-10">
                    <CircularProgress size={20} className="text-primary-600" />
                  </Box>
                )}

                <CardContent className="!p-2.5 sm:!p-4 flex flex-col justify-between h-full">
                  {/* Salesman info header */}
                  <Box className="flex items-start justify-between gap-2 mb-2 sm:mb-4">
                    <Avatar
                      alt={salesman.name}
                      src={salesman.profile_image || undefined}
                      className={`!w-9 !h-9 sm:!w-12 sm:!h-12 !rounded-lg !font-bold !text-xs sm:!text-base ${salesman.is_active === 'Y'
                        ? '!bg-primary-100 !text-primary-700'
                        : '!bg-gray-100 !text-gray-500'
                        }`}
                    >
                      {salesman.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Avatar>
                    <Box className="flex flex-col gap-1 items-end">
                      <Chip
                        label={salesman.is_active === 'Y' ? 'Active' : 'Inactive'}
                        size="small"
                        className={`!text-[9px] sm:!text-[10px] !font-semibold !h-4.5 ${salesman.is_active === 'Y'
                          ? '!bg-emerald-50 !text-emerald-700 !border !border-emerald-200'
                          : '!bg-gray-100 !text-gray-600 !border !border-gray-200'
                          }`}
                      />
                    </Box>
                  </Box>

                  {/* Salesman contact/codes */}
                  <Box className="mb-2 sm:mb-4">
                    <Typography
                      variant="subtitle2"
                      className="!text-xs sm:!text-sm !font-bold !text-gray-900 group-hover:!text-primary-700 !leading-tight !truncate"
                      title={salesman.name}
                    >
                      {salesman.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="!text-[10px] sm:!text-xs !text-gray-500 !mt-0.5 !truncate"
                      title={salesman.email}
                    >
                      {salesman.email}
                    </Typography>

                    <Box className="flex flex-wrap gap-1 mt-2">
                      {salesman.employee_id && (
                        <span className="text-[9px] sm:text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 !leading-none">
                          EMP: {salesman.employee_id}
                        </span>
                      )}
                      {salesman.sap_code && (
                        <span className="text-[9px] sm:text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 !leading-none">
                          SAP: {salesman.sap_code}
                        </span>
                      )}
                    </Box>
                  </Box>

                  {/* Toggle area */}
                  <Box className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto gap-1">
                    <Box className="flex flex-col">
                      <Typography variant="caption" className="!text-[9px] sm:!text-[10px] !text-gray-400 !font-semibold !uppercase !leading-none">
                        Login Instance
                      </Typography>
                      <Typography
                        variant="body2"
                        className={`!text-[10px] sm:!text-xs !font-bold !mt-1 ${logInstVal === 1 ? '!text-primary-700' : '!text-gray-600'
                          }`}
                      >
                        log_inst: {logInstVal}
                      </Typography>
                    </Box>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex items-center flex-shrink-0"
                    >
                      <CustomSwitch
                        checked={logInstVal === 1}
                        onChange={() => !isUpdating && handleToggleLogInst(salesman)}
                        disabled={isUpdating}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SalesmanControl;
