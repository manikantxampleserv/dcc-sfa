import { Avatar, Box, Typography } from '@mui/material';
import type {
  AllSalespersonsResponse,
  SingleSalespersonResponse,
} from 'hooks/useInventoryItems';
import { useInventoryItems } from 'hooks/useInventoryItems';
import { usePermission } from 'hooks/usePermission';
import { useResolvedUom } from 'hooks/useUnitOfMeasurement';
import { Package, Receipt, User, Users } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewButton } from 'shared/ActionButton';
import DepotSelect from 'shared/DepotSelect';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';

const InventoryItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [depotId, setDepotId] = useState<string>('');
  const [supervisorId, setSupervisorId] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(50);
  const navigate = useNavigate();

  const { isRead } = usePermission('inventory-items');
  const { uomCase, uomPcs } = useResolvedUom();

  const { data: inventoryResponse, isLoading: isLoadingInventory } =
    useInventoryItems(
      {
        page,
        limit,
        search: searchTerm || undefined,
        depot_id: depotId ? Number(depotId) : undefined,
        supervisor_id: supervisorId ? Number(supervisorId) : undefined,
      },
      { enabled: isRead }
    );

  const isLoading = isLoadingInventory;

  const isAllSalespersonsResponse = (
    response?: AllSalespersonsResponse | SingleSalespersonResponse | null
  ): response is AllSalespersonsResponse => {
    return !!response && ('statistics' in response || 'stats' in response);
  };

  const summaryResponse = useMemo(
    () =>
      isAllSalespersonsResponse(inventoryResponse) ? inventoryResponse : null,
    [inventoryResponse]
  );

  type SalespersonSummary = {
    salesperson_id: string | number;
    salesperson_name: string;
    salesperson_email?: string;
    salesperson_sap_code?: string | null;
    salesperson_profile_image?: string | null;
    total_van_inventories: number;
    total_quantity: number;
    total_base_quantity?: number;
    total_batches: number;
    total_serials: number;
    total_products: number;
    helpers?: string | null;
    today_invoices?: number;
    depots?: { id: number; name: string; code?: string }[];
    depot_name?: string | null;
  };

  const summaryData: SalespersonSummary[] = useMemo(
    () => (summaryResponse?.data ?? []) as SalespersonSummary[],
    [summaryResponse]
  );

  const stats = summaryResponse?.statistics || summaryResponse?.stats;

  const summary = useMemo(() => {
    return {
      total_items: stats?.total_items ?? stats?.total_van_inventories ?? 0,
      today_invoices: stats?.today_invoices ?? 0,
      total_groups: stats?.total_groups ?? 0,
      active_users: stats?.active_users ?? stats?.total_active_salesmen ?? 0,
    };
  }, [stats]);

  const handleItemClick = useCallback(
    (item: Pick<SalespersonSummary, 'salesperson_id'>) => {
      navigate(`/masters/inventory-items/${item.salesperson_id}`);
    },
    [navigate]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleDepotChange = useCallback((value: string) => {
    setDepotId(value);
    setPage(1);
  }, []);

  const handleSupervisorChange = useCallback((value: string) => {
    setSupervisorId(value);
    setPage(1);
  }, []);

  const filteredSummaryData = useMemo(() => {
    if (!searchTerm) return summaryData;
    const term = searchTerm.toLowerCase();
    return summaryData.filter(
      person =>
        person.salesperson_name?.toLowerCase().includes(term) ||
        person.salesperson_sap_code?.toLowerCase().includes(term) ||
        person.salesperson_email?.toLowerCase().includes(term) ||
        person.helpers?.toLowerCase().includes(term) ||
        person.depot_name?.toLowerCase().includes(term) ||
        person.depots?.some(d => d.name?.toLowerCase().includes(term))
    );
  }, [searchTerm, summaryData]);

  const totalCount =
    summaryResponse?.pagination?.total_count ??
    summaryResponse?.pagination?.total ??
    filteredSummaryData.length;

  const columns = useMemo<TableColumn<any>[]>(
    () => [
      {
        id: 'salesperson_name',
        label: 'Name / Group',
        render: (_value, row) => (
          <div className="flex items-center gap-2">
            <Avatar
              src={row.salesperson_profile_image || 'mkx'}
              alt={row.salesperson_name}
              className="!bg-green-100 !rounded !text-green-600"
            />
            <div className="flex flex-col">
              <span className="text-gray-800 font-semibold text-sm">
                {row.salesperson_name}
              </span>
              <span className="text-gray-400 text-xs">
                {row.salesperson_sap_code || row.salesperson_email}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: 'depot',
        label: 'Depot & Code',
        render: (_value, row) => {
          const depot =
            row.depots?.[0] ||
            (row as any).depot ||
            (row.depot_name ? { name: row.depot_name, code: '' } : null);

          if (!depot || !depot.name) {
            return (
              <span className="italic text-xs text-gray-400">No Depot</span>
            );
          }

          return (
            <Box className="!flex !gap-2 !items-center">
              <Avatar
                alt={depot.name}
                src="mkx"
                className="!rounded !bg-primary-100 !text-primary-500"
              />
              <Box>
                <Typography
                  variant="body1"
                  className="!text-gray-900 !leading-tight !font-medium !text-sm"
                >
                  {depot.name}
                </Typography>
                {depot.code && (
                  <Typography
                    variant="caption"
                    className="!text-gray-500 !text-xs !block !mt-0.5"
                  >
                    {depot.code}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        },
      },
      {
        id: 'today_invoices',
        label: "Today's Invoices",
        numeric: true,
        render: (_value, row) => (
          <span className="font-semibold text-gray-800">
            {row.today_invoices || 0}
          </span>
        ),
      },
      {
        id: 'total_quantity',
        label: 'Quantity',
        numeric: true,
        render: (_value, row) => {
          const parts: string[] = [];
          if (row.total_quantity > 0)
            parts.push(`${row.total_quantity} ${uomCase}`);
          if (row.total_base_quantity && row.total_base_quantity > 0)
            parts.push(`${row.total_base_quantity} ${uomPcs}`);
          return (
            <span className="font-medium text-green-600 text-sm">
              {parts.length > 0 ? parts.join(' & ') : `0 ${uomCase}`}
            </span>
          );
        },
      },
      {
        id: 'total_batches',
        label: 'Batches',
        numeric: true,
      },
      {
        id: 'total_products',
        label: 'Products',
        numeric: true,
      },
      {
        id: 'action',
        label: 'Action',
        sortable: false,
        render: (_value, row) => (
          <div className="flex items-center gap-1">
            <ViewButton
              onClick={() => handleItemClick(row)}
              tooltip="View Inventory"
            />
          </div>
        ),
      },
    ],
    [uomCase, uomPcs, handleItemClick]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Inventories"
          value={summary.total_items}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Today's Invoices"
          value={summary.today_invoices}
          icon={<Receipt className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Active Groups"
          value={summary.total_groups}
          icon={<Users className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Active Salesman"
          value={summary.active_users}
          icon={<User className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {!isRead && (
        <div className="col-span-full text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            You do not have permission to view inventory data
          </p>
        </div>
      )}

      {isRead && (
        <Table
          data={filteredSummaryData}
          columns={columns}
          pagination={true}
          page={page - 1}
          rowsPerPage={limit}
          totalCount={totalCount}
          onPageChange={(newPage: number) => setPage(newPage + 1)}
          filterColunm={false}
          loading={isLoading}
          isPermission={isRead}
          emptyMessage="No inventory items found"
          actions={
            <div className="flex items-center flex-wrap gap-2">
              <SearchInput
                placeholder="Search Sales Person..."
                value={searchTerm}
                onChange={handleSearchChange}
                debounceMs={300}
                showClear={true}
                fullWidth={false}
                className="!min-w-52"
              />
              <div className="w-60">
                <DepotSelect
                  value={depotId}
                  setValue={handleDepotChange}
                  label="Depot Filter"
                />
              </div>
              <div className="w-72">
                <UserSelect
                  value={supervisorId}
                  setValue={handleSupervisorChange}
                  label="Area Supervisor Filter"
                />
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};

export default InventoryItems;
