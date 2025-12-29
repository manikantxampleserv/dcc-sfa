import { Avatar, Chip, MenuItem, Skeleton } from '@mui/material';
import { useInventoryItems } from 'hooks/useInventoryItems';
import { usePermission } from 'hooks/usePermission';
import {
  AlertTriangle,
  Clock,
  Fingerprint,
  Layers,
  Package,
  TrendingUp as TrendingIcon,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from 'shared/SearchInput';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import { formatDate } from 'utils/dateUtils';

const InventoryItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const { isRead } = usePermission('dashboard');

  const { data: inventoryResponse, isLoading: isLoadingInventory } =
    useInventoryItems(
      { page: 1, limit: 50, }, {
      enabled: isRead,
    }
    );

  const isLoading = isLoadingInventory;

  const isSummaryResponse =
    inventoryResponse && 'statistics' in inventoryResponse;

  const summaryData = isSummaryResponse ? (inventoryResponse as any).data : [];
  const detailedData = !isSummaryResponse
    ? (inventoryResponse as any)?.data
    : null;

  const summary = isSummaryResponse
    ? {
      total_items:
        (inventoryResponse as any).statistics?.total_van_inventories || 0,
      low_stock_items: 0,
      total_value:
        (inventoryResponse as any).statistics?.total_quantity * 100 || 0,
      active_users:
        (inventoryResponse as any).statistics?.total_salespersons || 0,
      last_updated: new Date().toISOString(),
    }
    : {
      total_items: detailedData?.total_van_inventories || 0,
      low_stock_items: 0,
      total_value: (detailedData?.total_quantity || 0) * 100,
      active_users: 1,
      last_updated: new Date().toISOString(),
    };

  const handleItemClick = (item: any) => {
    if (item.salesperson_id) {
      navigate(`/masters/inventory-items/${item.salesperson_id}`);
    } else {
      console.log('Item clicked:', item);
    }
  };

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

  const getSalespersonStatus = (totalQuantity: number) => {
    if (totalQuantity === 0) return 'out_of_stock';
    if (totalQuantity <= 10) return 'low_stock';
    return 'in_stock';
  };

  const getProductStatus = (totalQuantity: number) => {
    if (totalQuantity === 0) return 'out_of_stock';
    if (totalQuantity <= 10) return 'low_stock';
    return 'in_stock';
  };

  const isSummaryView = isSummaryResponse;

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

            <Select
              placeholder="Select Status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="!min-w-[150px]"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="in_stock">In Stock</MenuItem>
              <MenuItem value="low_stock">Low Stock</MenuItem>
              <MenuItem value="out_of_stock">Out of Stock</MenuItem>
            </Select>
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
            value={`₹${(summary.total_value / 1000).toFixed(1)}K`}
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
                summaryData
                  .filter((person: any) => {
                    if (searchTerm) {
                      return person.salesperson_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    }
                    return true;
                  })
                  .filter((person: any) => {
                    if (statusFilter !== 'all') {
                      const status = getSalespersonStatus(
                        person.total_quantity
                      );
                      return status === statusFilter;
                    }
                    return true;
                  })
                  .map((person: any) => {
                    return (
                      <div
                        key={person.salesperson_id}
                        className="bg-white shadow-sm rounded-lg border border-gray-100 transition-shadow cursor-pointer hover:shadow-md"
                        onClick={() => handleItemClick(person)}
                      >
                        <div className="flex justify-between items-center p-3 gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={person.salesperson_profile_image || ''}
                              alt={person.salesperson_name}
                              className="!bg-green-100 !rounded !text-green-600"
                            >
                              {person.salesperson_name?.charAt(0)}
                            </Avatar>
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

              {!isSummaryView &&
                detailedData?.products
                  ?.filter((product: any) => {
                    if (searchTerm) {
                      return product.product_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    }
                    return true;
                  })
                  .filter((product: any) => {
                    if (statusFilter !== 'all') {
                      const status = getProductStatus(product.total_quantity);
                      return status === statusFilter;
                    }
                    return true;
                  })
                  .map((product: any) => {
                    const status = getProductStatus(product.total_quantity);
                    return (
                      <div
                        key={product.product_id}
                        className="bg-white shadow-sm rounded-lg border border-gray-100 transition-shadow cursor-pointer hover:shadow-md"
                        onClick={() => handleItemClick(product)}
                      >
                        <div className="flex justify-between items-center p-3 gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar
                              src=""
                              alt={product.product_name || ''}
                              className="!bg-blue-100 !rounded !text-blue-600"
                            >
                              {product.product_name?.charAt(0)}
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-gray-700 text-lg font-semibold">
                                {product.product_name || 'Unknown Product'}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {product.product_code || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <Chip
                              label={status.replace('_', ' ')}
                              size="small"
                              variant="outlined"
                              className="!capitalize !rounded"
                              color={
                                status === 'in_stock'
                                  ? 'success'
                                  : status === 'low_stock'
                                    ? 'warning'
                                    : 'error'
                              }
                            />
                          </div>
                        </div>
                        <div className="px-4 py-2">
                          <div className="flex flex-col gap-3 pt-1">
                            <div className="flex items-center gap-1.5 text-sm">
                              <TrendingIcon className="!w-4 !h-4 text-green-500" />
                              <span className="text-gray-700 font-medium">
                                Total Quantity: {product.total_quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Package className="!w-4 !h-4 text-blue-500" />
                              <span className="text-gray-700 font-medium">
                                Van Entries: {product.van_entries?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Layers className="!w-4 !h-4 text-purple-500" />
                              <span className="text-gray-700 font-medium">
                                Batches: {product.batches?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Fingerprint className="!w-4 !h-4 text-indigo-500" />
                              <span className="text-gray-700 font-medium">
                                Serials: {product.serials?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <AlertTriangle className="!w-4 !h-4 text-orange-500" />
                              <span className="text-gray-700 font-medium">
                                Tracking: {product.tracking_type}
                              </span>
                            </div>
                          </div>
                        </div>
                        {product.total_quantity > 0 &&
                          product.total_quantity <= 10 && (
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

              {((isSummaryView && summaryData.length === 0) ||
                (!isSummaryView && !detailedData?.products?.length)) &&
                !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No inventory items found
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
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
