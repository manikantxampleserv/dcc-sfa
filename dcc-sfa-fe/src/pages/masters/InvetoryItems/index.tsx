import { Avatar, Chip } from '@mui/material';
import type {
  AllSalespersonsResponse,
  SingleSalespersonResponse,
} from 'hooks/useInventoryItems';
import { useInventoryItems } from 'hooks/useInventoryItems';
import { usePermission } from 'hooks/usePermission';
import { useResolvedUom } from 'hooks/useUnitOfMeasurement';
import { AlertTriangle, Package, User, Users } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepotSelect from 'shared/DepotSelect';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import UserSelect from 'shared/UserSelect';
import Table, { type TableColumn } from 'shared/Table';
import { ViewButton } from 'shared/ActionButton';

const InventoryItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [depotId, setDepotId] = useState<string>('');
  const [supervisorId, setSupervisorId] = useState<string>('');
  const navigate = useNavigate();

  const { isRead } = usePermission('inventory-items');
  const { uomCase, uomPcs } = useResolvedUom();

  const { data: inventoryResponse, isLoading: isLoadingInventory } =
    useInventoryItems(
      {
        page: 1,
        limit: 50,
        depot_id: depotId ? Number(depotId) : undefined,
        supervisor_id: supervisorId ? Number(supervisorId) : undefined,
      },
      { enabled: isRead }
    );

  const isLoading = isLoadingInventory;

  const isAllSalespersonsResponse = (
    response?: AllSalespersonsResponse | SingleSalespersonResponse | null
  ): response is AllSalespersonsResponse => {
    return !!response && 'statistics' in response;
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
  };

  const summaryData: SalespersonSummary[] = useMemo(
    () => (summaryResponse?.data ?? []) as SalespersonSummary[],
    [summaryResponse]
  );

  const stats = summaryResponse?.statistics;

  const summary = useMemo(() => {
    const lowStockCount = summaryData.filter(
      p =>
        (p.total_quantity > 0 ||
          (p.total_base_quantity && p.total_base_quantity > 0)) &&
        p.total_quantity <= 10
    ).length;

    return {
      total_items: stats?.total_van_inventories || 0,
      low_stock_items: lowStockCount,
      total_groups: summaryData.filter(p => !!p.helpers).length,
      active_users: summaryData.filter(p => !p.helpers).length,
    };
  }, [stats?.total_van_inventories, summaryData]);

  const handleItemClick = useCallback(
    (item: Pick<SalespersonSummary, 'salesperson_id'>) => {
      navigate(`/masters/inventory-items/${item.salesperson_id}`);
    },
    [navigate]
  );

  const filteredSummaryData = useMemo(() => {
    if (!searchTerm) return summaryData;
    return summaryData.filter(person =>
      person.salesperson_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, summaryData]);

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
        id: 'type',
        label: 'Type',
        render: (_value, row) => (
          <Chip
            label={row.helpers ? 'Container' : 'Salesman'}
            size="small"
            variant="outlined"
            color={row.helpers ? 'success' : 'primary'}
          />
        ),
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
        label: 'Total Quantity',
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
          title="Low Stock Alert"
          value={summary.low_stock_items}
          icon={<AlertTriangle className="w-6 h-6" />}
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
          pagination={false}
          filterColunm={false}
          loading={isLoading}
          isPermission={isRead}
          emptyMessage="No inventory items found"
          actions={
            <div className="flex items-center flex-wrap gap-2">
              <SearchInput
                placeholder="Search Sales Person..."
                value={searchTerm}
                onChange={setSearchTerm}
                debounceMs={300}
                showClear={true}
                fullWidth={false}
                className="!min-w-52"
              />
              <div className="w-60">
                <DepotSelect
                  value={depotId}
                  setValue={setDepotId}
                  label="Depot Filter"
                />
              </div>
              <div className="w-72">
                <UserSelect
                  value={supervisorId}
                  setValue={setSupervisorId}
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
