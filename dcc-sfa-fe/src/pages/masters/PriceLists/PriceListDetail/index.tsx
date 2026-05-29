import {
  ArrowBack,
  CalendarToday,
  CheckCircle,
  Close,
  LocalOffer,
} from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
} from '@mui/material';
import { usePriceListById } from 'hooks/usePriceLists';
import { FileText, Package, Route } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PriceListItem, SpecialPrice } from 'services/masters/PriceLists';
import { ActionButton } from 'shared/ActionButton';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { useProducts } from 'hooks/useProducts';

const PriceListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [specialPricesItem, setSpecialPricesItem] =
    useState<PriceListItem | null>(null);

  const { data: priceList, isLoading } = usePriceListById(Number(id));
  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts({
    limit: 1000,
  });
  const products = productsResponse?.data || [];

  const items = priceList?.pricelist_item || [];

  const sortItems = (itemsList: PriceListItem[]) => {
    return [...itemsList].sort((a, b) => {
      const productA = products.find((p: any) => p.id === a.product_id);
      const productB = products.find((p: any) => p.id === b.product_id);
      const subCatA = productA?.product_sub_category?.sub_category_name || '';
      const subCatB = productB?.product_sub_category?.sub_category_name || '';

      const aHasRGB = subCatA.toUpperCase().includes('RGB');
      const bHasRGB = subCatB.toUpperCase().includes('RGB');

      const aIsBulk = subCatA.toUpperCase().includes('BULK KDW');
      const bIsBulk = subCatB.toUpperCase().includes('BULK KDW');

      if (aHasRGB && !bHasRGB) return -1;
      if (!aHasRGB && bHasRGB) return 1;

      if (aIsBulk && !bIsBulk) return 1;
      if (!aIsBulk && bIsBulk) return -1;

      return subCatA.localeCompare(subCatB);
    });
  };

  const sortedItems = sortItems(items);

  const itemColumns: TableColumn<PriceListItem>[] = [
    {
      id: 'product',
      label: 'Product',
      render: (_v, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded text-primary-600">
            <Package size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              {row.product?.name || 'Unknown Product'}
            </div>
            <div className="text-xs text-gray-500">
              SKU: {row.product?.code || '-'}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'unit_price',
      label: 'Unit Price',
      render: (_v, row) => (
        <span className="text-sm font-medium text-gray-900">
          {Number(row.unit_price).toFixed(2)}
        </span>
      ),
    },
    {
      id: 'sub_unit_price',
      label: 'Sub-unit Price',
      render: (_v, row) => {
        const product = products.find((p: any) => p.id === row.product_id);
        const isRGB = product?.product_sub_category?.sub_category_name
          ?.toUpperCase()
          ?.includes('RGB');
        if (!isRGB) return <span className="text-sm text-gray-700">-</span>;

        return (
          <span className="text-sm text-gray-700">
            {row.sub_unit_price ? Number(row.sub_unit_price).toFixed(2) : '-'}
          </span>
        );
      },
    },
    {
      id: 'special_prices',
      label: 'Special Rules',
      render: (_v, row) => {
        const specialPrices = row.special_prices || [];
        return (
          <Chip
            label={`${specialPrices.length} Rules`}
            size="medium"
            color={specialPrices.length > 0 ? 'primary' : 'default'}
            variant={specialPrices.length > 0 ? 'filled' : 'outlined'}
            onClick={e => {
              e.stopPropagation();
              setSpecialPricesItem(row);
            }}
            className="!cursor-pointer hover:!opacity-90"
          />
        );
      },
    },
  ];

  const modalSpecialPriceColumns: TableColumn<SpecialPrice>[] = [
    {
      id: 'validity',
      label: 'Validity',
      render: (_v, row) => (
        <div className="flex items-center gap-1 text-gray-500">
          <CalendarToday sx={{ fontSize: 14 }} />
          <span className="text-xs">
            {row.valid_from
              ? new Date(row.valid_from).toLocaleDateString()
              : 'N/A'}{' '}
            -{' '}
            {row.valid_to ? new Date(row.valid_to).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      id: 'assignment',
      label: 'Assignment',
      render: (_v, row) => {
        if (row.customer_id)
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-600">
              Customer: {row?.special_customer?.name || row.customer_id}
            </span>
          );
        if (row.route_id)
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-600">
              Route: {row.special_route?.name || row.route_id}
            </span>
          );
        if (row.customer_category_id)
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-600">
              Category:{' '}
              {row.special_customer_category?.category_name ||
                row.customer_category_id}
            </span>
          );
        return <span className="text-xs italic text-gray-500">Global</span>;
      },
    },
    {
      id: 'original_price',
      label: 'Orig. Price',
      render: () => (
        <span className="text-xs">
          {specialPricesItem?.unit_price || '0.00'}
        </span>
      ),
    },
    {
      id: 'original_subunit',
      label: 'Orig. Subunit',
      render: () => {
        const product = products.find(
          (p: any) => p.id === specialPricesItem?.product_id
        );
        const isRGB = product?.product_sub_category?.sub_category_name
          ?.toUpperCase()
          ?.includes('RGB');
        if (!isRGB) return <span className="text-xs">-</span>;

        return (
          <span className="text-xs">
            {specialPricesItem?.sub_unit_price || '0.00'}
          </span>
        );
      },
    },
    {
      id: 'sale_price',
      label: 'Sale Price',
      render: (_v, row) => (
        <span className="text-sm font-bold text-primary-600">
          {row.sale_price}
        </span>
      ),
    },
    {
      id: 'sale_sub_unit_price',
      label: 'Sale Subunit',
      render: (_v, row) => {
        const product = products.find(
          (p: any) => p.id === specialPricesItem?.product_id
        );
        const isRGB = product?.product_sub_category?.sub_category_name
          ?.toUpperCase()
          ?.includes('RGB');
        if (!isRGB)
          return <span className="text-sm font-medium text-gray-900">-</span>;

        return (
          <span className="text-sm font-medium text-gray-900">
            {row.sale_sub_unit_price || '-'}
          </span>
        );
      },
    },
    {
      id: 'tax_percent',
      label: 'Tax%',
      render: (_v, row) => (
        <span className="text-sm text-gray-700">
          {row.tax_percent ? `${row.tax_percent}%` : '-'}
        </span>
      ),
    },
    {
      id: 'discount',
      label: 'Disc%',
      render: (_v, row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded border border-orange-200 text-xs text-orange-700 bg-orange-50">
          {row.discount_percent || 0}%
        </span>
      ),
    },
  ];

  const allSpecialPricesCount = items.reduce(
    (count: number, item: PriceListItem) => {
      const sps = item.special_prices || [];
      return count + sps.length;
    },
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
            className="!bg-white !shadow-sm !border !border-gray-200"
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <div>
            <h1 className="text-xl font-bold text-gray-900 m-0">
              {priceList?.name || 'Loading...'}
            </h1>
          </div>
        </div>
        <Chip
          label={priceList?.is_active === 'Y' ? 'Active' : 'Inactive'}
          color={priceList?.is_active === 'Y' ? 'success' : 'error'}
          icon={<CheckCircle fontSize="small" />}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Items"
          value={items.length}
          icon={<Package className="w-5 h-5" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Rules"
          value={allSpecialPricesCount}
          icon={<LocalOffer sx={{ fontSize: 20 }} />}
          color="indigo"
          isLoading={isLoading}
        />
        <StatsCard
          title="Routes"
          value={priceList?.route_id ? 1 : 0}
          icon={<Route className="w-5 h-5" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Depot"
          value={1}
          icon={<FileText className="w-5 h-5" />}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 leading-tight">
              Price List Items
            </span>
            <span className="text-xs text-gray-500">
              Click on Special Rules to view special prices for a product.
            </span>
          </div>
        </div>
        <div>
          <Table
            data={sortedItems}
            columns={itemColumns}
            loading={isLoading || isLoadingProducts}
            pagination={false}
            sortable={false}
            groupBy={row => {
              const product = products.find(
                (p: any) => p.id === row.product_id
              );
              return (
                product?.product_sub_category?.sub_category_name ||
                'Uncategorized'
              );
            }}
            renderGroupHeader={group => (
              <span className="text-sm font-bold uppercase">{group}</span>
            )}
          />
        </div>
      </div>

      <Dialog
        open={specialPricesItem !== null}
        onClose={() => setSpecialPricesItem(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center !py-2 !px-4 border-b border-gray-100">
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 leading-tight">
              Special Prices
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              size="small"
              onClick={() => setSpecialPricesItem(null)}
              icon={<Close fontSize="small" />}
              tooltip="Close"
            />
          </div>
        </DialogTitle>
        <DialogContent className="!p-0">
          <div className="overflow-x-auto">
            <Table
              minHeight={400}
              compact={true}
              filterColunm={false}
              actions={
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">
                      {specialPricesItem?.product?.name || 'Product'}
                    </span>
                    <p className="text-xs text-gray-500">
                      Configure custom pricing based on routes, categories, or
                      specific customers.
                    </p>
                  </div>
                </div>
              }
              data={specialPricesItem?.special_prices || []}
              columns={modalSpecialPriceColumns}
              pagination={false}
              sortable={false}
              emptyMessage="No special prices added."
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceListDetail;
