import { Avatar, Skeleton } from '@mui/material';
import { useInventoryItems } from 'hooks/useInventoryItems';
import type {
  AllSalespersonsResponse,
  SingleSalespersonResponse,
} from 'hooks/useInventoryItems';
import { usePermission } from 'hooks/usePermission';
import { useCurrency } from 'hooks/useCurrency';
import {
  AlertTriangle,
  Clock,
  Fingerprint,
  Layers,
  Package,
  TrendingUp as TrendingIcon,
  User,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import { formatDate } from 'utils/dateUtils';

const InventoryItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { isRead } = usePermission('inventory-items');
  const { formatCurrency } = useCurrency();

  const { data: inventoryResponse, isLoading: isLoadingInventory } =
    useInventoryItems({ page: 1, limit: 50 }, { enabled: isRead });

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

  const isSummaryResponse = !!summaryResponse;

  type SalespersonSummary = {
    salesperson_id: string | number;
    salesperson_name: string;
    salesperson_email?: string;
    salesperson_profile_image?: string | null;
    total_van_inventories: number;
    total_quantity: number;
    total_batches: number;
    total_serials: number;
    total_products: number;
  };

  const summaryData: SalespersonSummary[] = useMemo(
    () => (summaryResponse?.data ?? []) as SalespersonSummary[],
    [summaryResponse]
  );

  const stats = summaryResponse?.statistics;

  const summary = useMemo(() => {
    const lowStockCount = summaryData.filter(
      p => p.total_quantity > 0 && p.total_quantity <= 10
    ).length;
    const totalValue = stats?.total_quantity
      ? Number(stats.total_quantity) * 100
      : 0;
    return {
      total_items: stats?.total_van_inventories || 0,
      low_stock_items: lowStockCount,
      total_value: totalValue,
      active_users: stats?.total_salespersons || 0,
      last_updated: new Date().toISOString(),
    };
  }, [
    stats?.total_salespersons,
    stats?.total_van_inventories,
    stats?.total_quantity,
    summaryData,
  ]);

  const handleItemClick = useCallback(
    (item: Pick<SalespersonSummary, 'salesperson_id'>) => {
      if (item.salesperson_id) {
        navigate(`/masters/inventory-items/${item.salesperson_id}`);
      }
    },
    [navigate]
  );

  const ItemCardsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(item => (
        <div
          key={item}
          className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
        >
          <div className="flex items-start gap-3">
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              className="!bg-gray-100"
            />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="20%" height={16} />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="75%" height={20} />
                <Skeleton variant="text" width="50%" height={16} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const isSummaryView = isSummaryResponse;

  const filteredSummaryData = useMemo(() => {
    return summaryData.filter(person => {
      if (!searchTerm) return true;
      return person.salesperson_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, summaryData]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="!font-bold text-xl !text-gray-900">
            Sales Person Inventory
          </h2>
          <p className="!text-gray-500 text-sm">
            Manage and track inventory items by sales representative
          </p>
        </div>
        {isRead && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-blue-500 text-blue-700 rounded-full bg-blue-50">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Last Update: {formatDate(summary.last_updated)}
              </span>
            </div>
          </div>
        )}
      </div>

      {isRead && (
        <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <SearchInput
                placeholder="Search Sales Person..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="!w-80"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                <Package className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {summary.total_items} Items
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRead && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
            title="Total Value"
            value={`${formatCurrency(summary.total_value / 1000)}K`}
            icon={<TrendingIcon className="w-6 h-6" />}
            color="green"
            isLoading={isLoading}
          />
          <StatsCard
            title="Active Reps"
            value={summary.active_users}
            icon={<User className="w-6 h-6" />}
            color="purple"
            isLoading={isLoading}
          />
        </div>
      )}

      {!isRead && (
        <div className="col-span-full text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            You do not have permission to view inventory data
          </p>
        </div>
      )}

      {isRead && (
        <>
          {isLoading ? (
            <ItemCardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {isSummaryView &&
                filteredSummaryData.map((person: any) => {
                  return (
                    <div
                      key={person.salesperson_id}
                      className="bg-white shadow-sm rounded-lg border border-gray-100 transition-shadow cursor-pointer hover:shadow-md"
                      onClick={() => handleItemClick(person)}
                    >
                      <div className="flex justify-between items-center p-3 gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={person.salesperson_profile_image || 'mkx'}
                            alt={person.salesperson_name}
                            className="!bg-green-100 !text-xl !rounded !text-green-600"
                          />
                          <div className="flex flex-col">
                            <span className="text-gray-700 text font-semibold">
                              {person.salesperson_name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {person.salesperson_email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-2">
                        <div className="flex flex-col gap-3 pt-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Package className="!w-4 !h-4 text-blue-500" />
                            <span className="text-gray-700 font-medium">
                              Van Inventories: {person.total_van_inventories}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <TrendingIcon className="!w-4 !h-4 text-green-500" />
                            <span className="text-gray-700 font-medium">
                              Total Quantity: {person.total_quantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Layers className="!w-4 !h-4 text-purple-500" />
                            <span className="text-gray-700 font-medium">
                              Batches: {person.total_batches}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Fingerprint className="!w-4 !h-4 text-indigo-500" />
                            <span className="text-gray-700 font-medium">
                              Serials: {person.total_serials}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Package className="!w-4 !h-4 text-orange-500" />
                            <span className="text-gray-700 font-medium">
                              Products: {person.total_products}
                            </span>
                          </div>
                        </div>
                      </div>
                      {person.total_quantity > 0 &&
                        person.total_quantity <= 10 && (
                          <div className="p-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-orange-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium">
                                Low Quantity Alert
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}

              {isSummaryView && filteredSummaryData.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No inventory items found
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm
                      ? 'Try adjusting your search'
                      : 'No inventory items have been added yet'}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryItems;
