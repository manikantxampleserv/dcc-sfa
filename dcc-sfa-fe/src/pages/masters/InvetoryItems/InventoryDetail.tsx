import {
  Block,
  CheckCircle,
  Download,
  Upload,
  Visibility,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  type ChipProps,
} from '@mui/material';
import { useCurrency } from 'hooks/useCurrency';
import { useInventoryItemById } from 'hooks/useInventoryItems';
import { useInvoices, type Invoice } from 'hooks/useInvoices';
import { useStockMovements } from 'hooks/useStockMovements';
import { useVanInventory, type VanInventory } from 'hooks/useVanInventory';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Fingerprint,
  Layers,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Truck,
} from 'lucide-react';
import InvoiceDetail from 'pages/transactions/Invoices/InvoiceDetail';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Select as MuiSelect,
  FormControl,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import Input from 'shared/Input';
import type {
  BatchInfo,
  ProductInventory,
  SalespersonInventoryData,
  SerialInfo,
} from 'services/masters/VanInventoryItems';
import { ActionButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { getCurrencyCode, getCurrencySymbol } from 'utils/currencyUtils';
import { formatDate, formatDateTime } from 'utils/dateUtils';
import VanInventoryDetail from '../VanStock/VanInventoryDetail';

const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white shadow-sm rounded-lg border border-gray-100 p-6 flex flex-col gap-4"
      >
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={100} height={24} />
        </div>
        <Skeleton variant="rectangular" width={60} height={28} />
      </div>
    ))}
  </div>
);

const SalespersonCardSkeleton = () => (
  <div className="bg-white mb-5 shadow-sm rounded-lg border border-gray-100 p-6">
    <div className="flex items-start gap-6">
      <Skeleton variant="circular" width={80} height={80} />
      <div className="flex-1">
        <div className="flex items-start gap-4 mb-4 justify-between">
          <div>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="text" width={120} height={20} />
          </div>
          <Skeleton variant="rectangular" width={64} height={28} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={90} height={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TabsSkeleton = () => (
  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width={120}
          height={40}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </div>
  </Box>
);

const ProductsTabSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white shadow-sm rounded-lg border border-gray-100 p-4 flex flex-col"
      >
        <div className="flex items-start justify-between mb-4 pb-0">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div>
              <Skeleton variant="text" width={90} height={18} />
              <Skeleton variant="text" width={54} height={14} />
            </div>
          </div>
          <Skeleton
            variant="rectangular"
            width={64}
            height={24}
            sx={{ borderRadius: 16 }}
          />
        </div>
        <div className="space-y-1 pb-3 px-2">
          {Array.from({ length: 5 }).map((_, j) => (
            <div className="flex items-center justify-between my-1" key={j}>
              <Skeleton variant="text" width={100} height={17} />
              <Skeleton variant="text" width={32} height={17} />
            </div>
          ))}
        </div>
        <Skeleton
          variant="rectangular"
          width="90%"
          height={18}
          sx={{ mx: 2, my: 1, borderRadius: 2 }}
        />
      </div>
    ))}
  </div>
);

const TableSkeleton = ({
  columns = 6,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-1 py-3 w-full mb-3">
    <div className="flex gap-2 mb-2">
      {Array.from({ length: columns }).map((_, ci) => (
        <Skeleton key={ci} width={90} height={18} sx={{ borderRadius: 2 }} />
      ))}
    </div>
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-2">
          {Array.from({ length: columns }).map((_, ci) => (
            <Skeleton
              key={ci}
              width={90}
              height={18}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3, px: 0 }}>{children}</Box>}
    </div>
  );
}

const getStockStatus = (quantity: number) => {
  if (quantity <= 0)
    return { status: 'out_of_stock', color: 'error', label: 'Out of Stock' };
  if (quantity <= 10)
    return { status: 'low_stock', color: 'warning', label: 'Low Stock' };
  return { status: 'in_stock', color: 'success', label: 'In Stock' };
};

const InventoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currencies, defaultCurrencyId, formatCurrency } = useCurrency();

  const currencyCode = getCurrencyCode(
    currencies || [],
    defaultCurrencyId || 1
  );
  const currencySymbol = getCurrencySymbol(currencyCode);

  const formatCompactNumber = (num: number): string => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toLocaleString();
  };

  const formatCompactCurrency = (amount: number): string => {
    let formattedAmount = '';
    if (amount >= 1e9) {
      formattedAmount = (amount / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (amount >= 1e6) {
      formattedAmount = (amount / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (amount >= 1e3) {
      formattedAmount = (amount / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      formattedAmount = amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return `${currencySymbol} ${formattedAmount}`;
  };

  const formatQuantityAndBase = (
    qty: number | undefined,
    baseQty: number | undefined
  ) => {
    const safeQty = Number(qty) || 0;
    const safeBaseQty = Number(baseQty) || 0;
    const caseUnit = 'Crates';
    const baseUnit = 'PCs';
    if (safeQty === 0 && safeBaseQty === 0) {
      return `0 ${caseUnit}`;
    }

    return [
      safeQty > 0 ? `${safeQty} ${caseUnit}` : null,
      safeBaseQty > 0 ? `${safeBaseQty} ${baseUnit}` : null,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const [tabValue, setTabValue] = useState(0);
  const [timeFilter, setTimeFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
  });
  const [selectedVanInventory, setSelectedVanInventory] =
    useState<VanInventory | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDetailDrawerOpen, setInvoiceDetailDrawerOpen] = useState(false);

  const inventoryId = id ? Number(id) : undefined;
  const {
    data: inventoryData,
    isLoading,
    error,
  } = useInventoryItemById(inventoryId as number, {
    enabled: inventoryId !== undefined,
  });

  const { data: vanInventoryResponse, isLoading: isLoadingVanInventory } =
    useVanInventory(
      {
        user_id: inventoryId,
        limit: 10000000,
        time_filter:
          timeFilter !== 'all' && timeFilter !== 'custom'
            ? timeFilter
            : undefined,
      },
      {
        enabled: inventoryId !== undefined,
      }
    );

  const { data: invoicesResponse, isLoading: isLoadingInvoices } = useInvoices(
    {
      limit: 1000000,
      time_filter:
        timeFilter !== 'all' && timeFilter !== 'custom'
          ? timeFilter
          : undefined,
    },
    {
      enabled: inventoryId !== undefined,
    }
  );

  const { data: stockMovementsResponse, isLoading: isLoadingStockMovements } =
    useStockMovements(
      {
        limit: 1000000,
        time_filter:
          timeFilter !== 'all' && timeFilter !== 'custom'
            ? timeFilter
            : undefined,
      },
      {
        enabled: inventoryId !== undefined,
      }
    );

  const stockMovements = useMemo(() => {
    let data = stockMovementsResponse?.data || [];
    if (
      timeFilter === 'custom' &&
      customDateRange.start &&
      customDateRange.end
    ) {
      data = data.filter(sm => {
        const dt = new Date(sm.createdate || '');
        if (isNaN(dt.getTime())) return true;
        return (
          dt >= new Date(customDateRange.start) &&
          dt <= new Date(`${customDateRange.end}T23:59:59.999Z`)
        );
      });
    }
    return data;
  }, [stockMovementsResponse, timeFilter, customDateRange]);

  const vanInventories = useMemo(() => {
    let data = vanInventoryResponse?.data || [];
    if (
      timeFilter === 'custom' &&
      customDateRange.start &&
      customDateRange.end
    ) {
      data = data.filter(v => {
        const dt = new Date(v.document_date || v.createdate || '');
        if (isNaN(dt.getTime())) return true;
        return (
          dt >= new Date(customDateRange.start) &&
          dt <= new Date(`${customDateRange.end}T23:59:59.999Z`)
        );
      });
    }
    return data;
  }, [vanInventoryResponse, timeFilter, customDateRange]);

  const salespersonInvoices = useMemo(() => {
    let rawInvoices = invoicesResponse?.data || [];
    if (
      timeFilter === 'custom' &&
      customDateRange.start &&
      customDateRange.end
    ) {
      rawInvoices = rawInvoices.filter(inv => {
        const dt = new Date(inv.invoice_date || inv.createdate || '');
        if (isNaN(dt.getTime())) return true;
        return (
          dt >= new Date(customDateRange.start) &&
          dt <= new Date(`${customDateRange.end}T23:59:59.999Z`)
        );
      });
    }
    return rawInvoices.filter(inv => {
      return (
        (inv.salesperson_id !== null &&
          inv.salesperson_id !== undefined &&
          Number(inv.salesperson_id) === inventoryId) ||
        (inv.createdby !== null &&
          inv.createdby !== undefined &&
          Number(inv.createdby) === inventoryId)
      );
    });
  }, [invoicesResponse, inventoryId, timeFilter, customDateRange]);

  const salespersonStockMovements = useMemo(() => {
    const salespersonVanInventoryIds = new Set(vanInventories.map(v => v.id));
    return stockMovements.filter(
      sm =>
        sm.van_inventory_id &&
        salespersonVanInventoryIds.has(sm.van_inventory_id)
    );
  }, [stockMovements, vanInventories]);

  const loadTransactions = useMemo(() => {
    return vanInventories.filter(v => v.loading_type === 'L');
  }, [vanInventories]);

  const loadCount = loadTransactions.length;

  const unloadTransactions = useMemo(() => {
    return vanInventories.filter(v => v.loading_type === 'U');
  }, [vanInventories]);

  const unloadCount = unloadTransactions.length;

  const totalQtyLoaded = useMemo(() => {
    return salespersonStockMovements
      .filter(sm => sm.movement_type === 'VAN_LOAD')
      .reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);
  }, [salespersonStockMovements]);

  const totalQtyUnloaded = useMemo(() => {
    return salespersonStockMovements
      .filter(sm => sm.movement_type === 'VAN_UNLOAD')
      .reduce((sum, sm) => sum + (Number(sm.quantity) || 0), 0);
  }, [salespersonStockMovements]);

  const totalInvoicesCount = salespersonInvoices.length;

  const totalRevenue = useMemo(() => {
    return salespersonInvoices.reduce(
      (acc, inv) => acc + (Number(inv.total_amount) || 0),
      0
    );
  }, [salespersonInvoices]);

  const totalQtySold = useMemo(() => {
    return salespersonInvoices.reduce((acc, inv) => {
      return (
        acc +
        (inv.invoice_items || []).reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        )
      );
    }, 0);
  }, [salespersonInvoices]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue),
    []
  );

  const handleBack = useCallback(
    () => navigate('/masters/inventory-items'),
    [navigate]
  );

  const salespersonData = useMemo(
    () => (inventoryData?.data as SalespersonInventoryData) || null,
    [inventoryData]
  );

  const products: ProductInventory[] = useMemo(() => {
    if (!salespersonData?.products || !Array.isArray(salespersonData.products))
      return [];

    return salespersonData.products.map(product => ({
      ...product,
      product_name: product.product_name ?? '',
      batches: product.batches ?? [],
      serials: product.serials ?? [],
    }));
  }, [salespersonData]);

  const batchRows: Array<
    BatchInfo & { product_id: number | string; product: ProductInventory }
  > = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    return products.flatMap(product => {
      if (!product.batches || !Array.isArray(product.batches)) return [];
      return product.batches.map(batch => ({
        ...batch,
        product_id: product.product_id,
        product: product,
      }));
    });
  }, [products]);

  const serialRows: Array<SerialInfo & { product_id: number | string }> =
    useMemo(() => {
      if (!Array.isArray(products) || products.length === 0) return [];

      return products.flatMap(product => {
        if (!product.serials || !Array.isArray(product.serials)) return [];
        return product.serials.map(serial => ({
          ...serial,
          product_id: product.product_id,
          warranty_expiry: serial.warranty_expiry ?? null,
          customer: serial.customer,
        }));
      });
    }, [products]);

  const batchColumns = useMemo<
    TableColumn<
      BatchInfo & { product_id: number | string; product: ProductInventory }
    >[]
  >(
    () => [
      {
        id: 'batch_number',
        label: 'Batch Number',
        sortable: true,
      },
      {
        id: 'lot_number',
        label: 'Lot Number',
        sortable: true,
      },
      {
        id: 'remaining_quantity',
        label: 'Quantity',
        sortable: true,
        render: (_value, row) => {
          const qty = Number(row?.remaining_quantity) || 0;
          const baseQty = Number(row?.base_quantity) || 0;
          const caseUnit = 'Crates';
          const baseUnit = 'PCs';
          if (qty === 0 && baseQty === 0) {
            return (
              <span className="font-mono text-sm text-gray-500">
                0 {caseUnit}
              </span>
            );
          }

          return (
            <span className="font-mono text-sm font-medium">
              {[
                qty > 0 ? `${qty} ${caseUnit}` : null,
                baseQty > 0 ? `${baseQty} ${baseUnit}` : null,
              ]
                .filter(Boolean)
                .join(' and ')}
            </span>
          );
        },
      },
      {
        id: 'expiry_date',
        label: 'Expiry Date',
        sortable: true,
        render: (value: string) => (value ? formatDate(value) : 'N/A'),
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) => {
          const getBatchStatusColor = (status: string) => {
            switch (status) {
              case 'active':
                return 'success';
              case 'expiring_soon':
                return 'warning';
              case 'expired':
                return 'error';
              default:
                return 'default';
            }
          };
          return (
            <Chip
              label={String(value || '').replace('_', ' ')}
              size="small"
              color={getBatchStatusColor(String(value)) as ChipProps['color']}
              variant="outlined"
              className="!capitalize"
            />
          );
        },
      },
    ],
    []
  );

  const serialColumns = useMemo<
    TableColumn<SerialInfo & { product_id: number | string }>[]
  >(
    () => [
      {
        id: 'serial_number',
        label: 'Serial Number',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-sm">
            {value ? String(value) : 'N/A'}
          </span>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) => (
          <Chip
            label={value ? String(value)?.replace('_', ' ') : 'N/A'}
            size="small"
            variant="outlined"
            className="!capitalize"
          />
        ),
      },
      {
        id: 'warranty_expiry',
        label: 'Warranty Expiry',
        sortable: true,
        render: (value: string | undefined) =>
          value ? formatDate(value) : 'N/A',
      },
      {
        id: 'customer',
        label: 'Customer',
        sortable: false,
        render: (_value: SerialInfo['customer'] | null, row) =>
          row.customer ? `${row.customer.name} (${row.customer.code})` : 'N/A',
      },
      {
        id: 'sold_date',
        label: 'Sold Date',
        sortable: true,
        render: (value: string | undefined) =>
          value ? formatDate(value) : 'Not Sold',
      },
    ],
    []
  );
  const getLoadingTypeLabel = (type: string) => {
    switch (type) {
      case 'L':
        return 'Load';
      case 'U':
        return 'Unload';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'D':
        return 'Draft';
      case 'A':
        return 'Confirmed';
      case 'C':
        return 'Canceled';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'D':
        return 'warning';
      case 'A':
        return 'success';
      case 'C':
        return 'error';
      default:
        return 'default';
    }
  };

  const vanInventoryColumns = useMemo<TableColumn<any>[]>(
    () => [
      {
        id: 'loading_type',
        label: 'Type',
        render: (_value, row) => (
          <Chip
            label={getLoadingTypeLabel(row.loading_type || 'L')}
            size="small"
            className="w-24"
            variant="outlined"
            color={row.loading_type === 'L' ? 'success' : 'error'}
            icon={row.loading_type === 'L' ? <Upload /> : <Download />}
          />
        ),
      },
      {
        id: 'status',
        label: 'Status',
        render: (_value, row) => (
          <Chip
            label={getStatusLabel(row.status || 'D')}
            size="small"
            className="w-24"
            variant="outlined"
            color={getStatusColor(row.status || 'D') as any}
          />
        ),
      },
      {
        id: 'items',
        label: 'Items',
        render: (_value, row) => (
          <Typography variant="body2" className="!text-gray-900">
            {row.items?.length || 0} items
          </Typography>
        ),
      },
      {
        id: 'vehicle',
        label: 'Vehicle',
        render: (_value, row) => (
          <Typography variant="body2" className="!text-gray-900">
            {row.vehicle?.vehicle_number || 'No Vehicle'}
          </Typography>
        ),
      },
      {
        id: 'document_date',
        label: 'Document Date',
        render: (_value, row) =>
          formatDateTime(row.document_date) || (
            <span className="italic text-gray-400">No Date</span>
          ),
      },
      {
        id: 'is_active',
        label: 'Active',
        render: is_active => (
          <Chip
            icon={is_active === 'Y' ? <CheckCircle /> : <Block />}
            label={is_active === 'Y' ? 'Active' : 'Inactive'}
            size="small"
            variant="outlined"
            color={is_active === 'Y' ? 'success' : 'error'}
          />
        ),
      },
      {
        id: 'last_updated',
        label: 'Last Updated',
        render: (_value, row) => {
          const formattedDate = formatDateTime(row.last_updated);
          return formattedDate ? (
            <span>{formattedDate}</span>
          ) : (
            <span className="italic text-gray-400">No Date</span>
          );
        },
      },
      {
        id: 'id',
        label: 'Actions',
        sortable: false,
        render: (_value: any, row: any) => (
          <div className="!flex !gap-2 !items-center">
            <ActionButton
              onClick={() => {
                setSelectedVanInventory(row);
                setDetailDrawerOpen(true);
              }}
              tooltip="Manage van inventory items"
              icon={<Visibility fontSize="small" />}
              color="info"
            />
          </div>
        ),
      },
    ],
    []
  );

  const invoiceColumns = useMemo<TableColumn<any>[]>(
    () => [
      {
        id: 'invoice_number',
        label: 'Invoice Info',
        render: (_value, row) => (
          <Box className="!flex !gap-2 !items-center">
            <Avatar
              alt={row.invoice_number}
              className="!rounded !bg-primary-100 !text-primary-500"
            >
              <Receipt className="w-5 h-5" />
            </Avatar>
            <Box>
              <Typography
                variant="body1"
                className="!text-gray-900 !leading-tight"
              >
                {row.invoice_number}
              </Typography>
              <Typography
                variant="caption"
                className="!text-gray-500 !text-xs !block !mt-0.5"
              >
                {row.invoice_items?.length || 0} items
                {row.parent_id && ` • Order #${row.parent_id}`}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'customer.name',
        label: 'Customer Info',
        render: (_value, row) => (
          <Box>
            <Typography
              variant="body2"
              className="!text-gray-900 !font-medium uppercase"
            >
              {row.customer?.name || 'N/A'}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              {row.customer?.code || 'N/A'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'invoice_date',
        label: 'Date',
        render: (_value, row) => (
          <Box>
            <Box className="flex items-center text-sm text-gray-900">
              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
              {row.invoice_date ? formatDateTime(row.invoice_date) : 'N/A'}
            </Box>
          </Box>
        ),
      },
      {
        id: 'total_amount',
        label: 'Amounts',
        render: (_value, row) => (
          <Box>
            <Typography variant="body2" className="!text-gray-900 !font-medium">
              Total: {formatCurrency(row.total_amount + row.tax_amount || 0)}
            </Typography>
            <Typography
              variant="caption"
              className="!text-gray-500 !text-xs !block !mt-0.5"
            >
              Tax: {formatCurrency(row.tax_amount || 0)}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        sortable: false,
        render: (_value: any, row: any) => (
          <div className="!flex !gap-2 !items-center">
            <ActionButton
              onClick={() => {
                setSelectedInvoice(row);
                setInvoiceDetailDrawerOpen(true);
              }}
              tooltip="View Invoice"
              icon={<Visibility className="!text-[20px]" />}
              color="success"
            />
          </div>
        ),
      },
    ],
    [formatCurrency, navigate]
  );

  if (isLoading || isLoadingInvoices || isLoadingStockMovements) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="flex items-center mb-5 justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Skeleton variant="text" width={220} height={32} />
              <Skeleton variant="text" width={160} height={20} sx={{ mt: 1 }} />
            </div>
          </div>
          <Skeleton
            variant="rectangular"
            width={210}
            height={34}
            sx={{ borderRadius: 26 }}
          />
        </div>
        <SalespersonCardSkeleton />
        <StatsCardsSkeleton />
        <TabsSkeleton />
        {tabValue === 0 && <ProductsTabSkeleton />}
        {tabValue === 1 && <TableSkeleton columns={7} rows={7} />}
        {tabValue === 2 && <TableSkeleton columns={5} rows={7} />}
        {tabValue === 3 && <TableSkeleton columns={7} rows={7} />}
        {tabValue === 4 && <TableSkeleton columns={7} rows={5} />}
        {tabValue === 5 && (
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={100}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 2 }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error || !inventoryData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <Typography variant="h6" className="text-gray-600 mb-2">
          Inventory Not Found
        </Typography>
        <Typography variant="body2" className="text-gray-500 mb-4">
          The inventory item you're looking for doesn't exist or you don't have
          permission to view it.
        </Typography>
        <Button onClick={handleBack}>Go Back to Inventory</Button>
      </div>
    );
  }

  if (!salespersonData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <Typography variant="h6" className="text-gray-600 mb-2">
          Invalid Inventory Data
        </Typography>
        <Typography variant="body2" className="text-gray-500 mb-4">
          The inventory data could not be loaded properly.
        </Typography>
        <Button onClick={handleBack}>Go Back to Inventory</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-5 justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {salespersonData?.salesperson_name || 'Unknown'}&apos;s Inventory
            </h1>
            <p className="text-gray-500 text-sm">
              Detailed view of all inventory items and stock levels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Last Updated: {formatDate(new Date().toISOString())}
          </span>
        </div>
      </div>

      <div className="bg-white mb-5 shadow-sm rounded-lg border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={salespersonData?.salesperson_profile_image || undefined}
            alt={salespersonData?.salesperson_name || 'Unknown'}
            className="!w-20 !h-20 !bg-green-100 !text-green-600 !text-2xl"
          >
            {salespersonData?.salesperson_name?.charAt(0)}
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-2 justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {salespersonData?.salesperson_name || 'Unknown'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {salespersonData?.salesperson_role || 'Unknown'}
                </p>
              </div>
              <Chip
                label="Active"
                size="small"
                color="success"
                variant="outlined"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">
                  {salespersonData?.salesperson_email || 'No Email'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">
                  {salespersonData?.salesperson_phone || 'No Phone Number'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {salespersonData?.salesperson_address || 'No Address'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <StatsCard
          title="Total Products"
          value={salespersonData?.total_products || 0}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Total Quantity"
          value={formatQuantityAndBase(
            salespersonData?.total_remaining_quantity,
            salespersonData?.total_remaining_base_quantity
          )}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Total Batches"
          value={salespersonData?.total_batches || 0}
          icon={<Layers className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Total Serials"
          value={salespersonData?.total_serials || 0}
          icon={<Fingerprint className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={`Products (${Array.isArray(products) ? products.length : 0})`}
          />
          <Tab label={`Batches (${salespersonData?.total_batches || 0})`} />
          <Tab
            label={`Serial Numbers (${salespersonData?.total_serials || 0})`}
          />
          <Tab label={`Van Inventories (${vanInventories.length})`} />
          <Tab label={`Invoices (${salespersonInvoices.length})`} />
          <Tab label="Salesperson Summary" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.isArray(products) &&
            products
              ?.sort(
                (a, b) =>
                  (b.total_remaining_quantity || 0) -
                  (a.total_remaining_quantity || 0)
              )
              .map(product => {
                const stockStatus = getStockStatus(
                  Number(product.total_remaining_quantity)
                );
                return (
                  <div
                    key={product.product_id}
                    className="bg-white shadow-sm rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4 pb-0 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="!bg-blue-100 !rounded-md !text-blue-600"
                          src=""
                        >
                          {product.product_name?.charAt(0) || 'P'}
                        </Avatar>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {product.product_name || 'Unknown Product'}
                          </h3>
                          <p className="text-xs text-gray-500 truncate text-ellipsis">
                            {product.product_code || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <Chip
                        label={stockStatus.label}
                        size="small"
                        color={stockStatus.color as ChipProps['color']}
                        variant="outlined"
                      />
                    </div>
                    <div className="space-y-1 pb-3 px-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total Quantity
                        </span>
                        <span className="font-medium">
                          {formatQuantityAndBase(
                            product.total_remaining_quantity < 0
                              ? 0
                              : product.total_remaining_quantity,
                            Number(product.total_remaining_base_quantity) < 0
                              ? 0
                              : product.total_remaining_base_quantity
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Tracking Type
                        </span>
                        <span className="font-medium uppercase">
                          {product.tracking_type}
                        </span>
                      </div>
                      {product.tracking_type?.toLowerCase() === 'batch' ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Batches</span>
                          <span className="font-medium">
                            {product.batches?.length || 0}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Serial Numbers
                          </span>
                          <span className="font-medium">
                            {product.serials?.length || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    {product.total_quantity > 0 &&
                      product.total_quantity <= 10 && (
                        <div className="border-t border-gray-100 p-3">
                          <div className="flex items-center gap-2 text-orange-600 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Low Stock Alert</span>
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Table<
          BatchInfo & { product_id: number | string; product: ProductInventory }
        >
          data={batchRows}
          columns={batchColumns}
          getRowId={(
            row: BatchInfo & {
              product_id: number | string;
              product: ProductInventory;
            }
          ) => `${row.batch_lot_id}-${row.product_id}`}
          pagination={false}
          emptyMessage="No batches found"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Table<SerialInfo & { product_id: number | string }>
          data={serialRows}
          columns={serialColumns}
          getRowId={(row: SerialInfo) => row.serial_id}
          pagination={false}
          emptyMessage="No serial numbers found"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Table<any>
          data={vanInventories}
          columns={vanInventoryColumns}
          getRowId={(row: any) => row.id}
          pagination={false}
          emptyMessage="No van inventories found"
          loading={isLoadingVanInventory}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Table<any>
          data={salespersonInvoices}
          columns={invoiceColumns}
          getRowId={(row: any) => row.id}
          pagination={false}
          emptyMessage="No invoices found"
          loading={isLoadingInvoices}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <div className="space-y-6">
          <div className="flex justify-end gap-4">
            <FormControl size="small" className="w-48 bg-white">
              <MuiSelect
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value)}
                displayEmpty
              >
                <MuiMenuItem value="all">All Time</MuiMenuItem>
                <MuiMenuItem value="today">Today</MuiMenuItem>
                <MuiMenuItem value="yesterday">Yesterday</MuiMenuItem>
                <MuiMenuItem value="this_week">This Week</MuiMenuItem>
                <MuiMenuItem value="this_month">This Month</MuiMenuItem>
                <MuiMenuItem value="prev_month">Previous Month</MuiMenuItem>
                <MuiMenuItem value="this_year">This Year</MuiMenuItem>
                <MuiMenuItem value="prev_year">Previous Year</MuiMenuItem>
                <MuiMenuItem value="custom">Custom Range</MuiMenuItem>
              </MuiSelect>
            </FormControl>
            {timeFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customDateRange.start}
                  onChange={e =>
                    setCustomDateRange(prev => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  size="small"
                  className="w-36 bg-white"
                  placeholder="Start Date"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="date"
                  value={customDateRange.end}
                  onChange={e =>
                    setCustomDateRange(prev => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  size="small"
                  className="w-36 bg-white"
                  placeholder="End Date"
                />
              </div>
            )}
          </div>
          {/* Glassmorphic Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Load Card */}
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <Typography
                    variant="body2"
                    className="text-gray-500 font-medium uppercase tracking-wider text-xs"
                  >
                    Loaded Inventory
                  </Typography>
                  <Typography
                    variant="h5"
                    className="text-gray-900 font-black mt-0.5"
                  >
                    {formatCompactNumber(totalQtyLoaded)}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-emerald-700">
                  {loadCount}
                </span>{' '}
                load operations confirmed
              </div>
            </div>

            {/* Unload Card */}
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <Typography
                    variant="body2"
                    className="text-gray-500 font-medium uppercase tracking-wider text-xs"
                  >
                    Unloaded Inventory
                  </Typography>
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-black mt-0.5"
                  >
                    {formatCompactNumber(totalQtyUnloaded)}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-amber-700">
                  {unloadCount}
                </span>{' '}
                unload operations recorded
              </div>
            </div>

            {/* Sales performance Card */}
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <Typography
                    variant="body2"
                    className="text-gray-500 font-medium uppercase tracking-wider text-xs"
                  >
                    Generated Sales
                  </Typography>
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-black mt-0.5"
                  >
                    {formatCompactCurrency(totalRevenue)}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold text-indigo-700">
                  {formatCompactNumber(totalQtySold)}
                </span>{' '}
                items sold{' '}
                <span className="font-semibold text-indigo-700">
                  {totalInvoicesCount}
                </span>{' '}
                invoices
              </div>
            </div>

            {/* Remaining In-Hand Card */}
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-100 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <Typography
                    variant="body2"
                    className="text-gray-500 font-medium uppercase tracking-wider text-xs"
                  >
                    Current Hand Stock
                  </Typography>
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-black mt-0.5"
                  >
                    {formatQuantityAndBase(
                      salespersonData?.total_remaining_quantity,
                      salespersonData?.total_remaining_base_quantity
                    )}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-semibold text-purple-700">
                  {products.length}
                </span>{' '}
                active products in van stock
              </div>
            </div>
          </div>

          {/* Graphical Analytics Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Load vs Unload Balance Box */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-950 text-base">
                    Load vs Unload Stock Balance
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Visual ratio of loaded stock versus unloaded returns
                  </p>
                </div>
                <div className="bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {totalQtyLoaded > 0
                    ? Math.round(
                        ((totalQtyLoaded - totalQtyUnloaded) / totalQtyLoaded) *
                          100
                      )
                    : 0}
                  % Retention
                </div>
              </div>

              {/* Progress bar comparison */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
                    <span>Loaded Stock vs Unloaded</span>
                    <span className="font-semibold text-gray-800">
                      {totalQtyLoaded - totalQtyUnloaded >= 0
                        ? 'Surplus'
                        : 'Deficit'}
                    </span>
                  </div>
                  {/* Custom progress comparison */}
                  <div className="w-full h-4 bg-gray-100 rounded-full flex overflow-hidden">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${totalQtyLoaded > 0 ? Math.max(5, Math.round(((totalQtyLoaded - totalQtyUnloaded) / totalQtyLoaded) * 100)) : 5}%`,
                      }}
                      title={`Retained/Sold: ${totalQtyLoaded - totalQtyUnloaded}`}
                    ></div>
                    <div
                      className="bg-amber-400 transition-all duration-500"
                      style={{
                        width: `${totalQtyLoaded > 0 ? Math.round((totalQtyUnloaded / totalQtyLoaded) * 100) : 0}%`,
                      }}
                      title={`Unloaded: ${totalQtyUnloaded}`}
                    ></div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-gray-600">
                        Retained / Sold (
                        {formatCompactNumber(
                          totalQtyLoaded - totalQtyUnloaded < 0
                            ? 0
                            : totalQtyLoaded - totalQtyUnloaded
                        )}
                        )
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="text-gray-600">
                        Unloaded Returns (
                        {formatCompactNumber(totalQtyUnloaded)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Activity Summary Insights
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    This salesperson has loaded{' '}
                    <span className="font-semibold text-gray-900">
                      {totalQtyLoaded.toLocaleString()}
                    </span>{' '}
                    items across{' '}
                    <span className="font-semibold text-gray-900">
                      {loadCount}
                    </span>{' '}
                    loading sessions. Out of these,{' '}
                    <span className="font-semibold text-gray-900">
                      {totalQtyUnloaded.toLocaleString()}
                    </span>{' '}
                    items were returned/unloaded. This yields a retention &
                    sales operation rate of{' '}
                    <span className="font-semibold text-emerald-600 font-mono">
                      {totalQtyLoaded > 0
                        ? Math.round(
                            ((totalQtyLoaded - totalQtyUnloaded) /
                              totalQtyLoaded) *
                              100
                          )
                        : 0}
                      %
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Efficiency Metrics Box */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-950 text-base">
                    Sales & Revenue Performance
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Efficiency statistics derived from salesperson invoices
                  </p>
                </div>
                <div className="bg-indigo-50 px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-700 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Invoice Analytics
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50/40 border border-indigo-50 rounded-lg p-4 flex flex-col justify-between">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    Average Invoice Value
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-black text-indigo-950">
                      {formatCompactCurrency(
                        totalInvoicesCount > 0
                          ? totalRevenue / totalInvoicesCount
                          : 0
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Per confirmed invoice
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50/40 border border-purple-50 rounded-lg p-4 flex flex-col justify-between">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    Sales Diversity Rate
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-black text-purple-950">
                      {products.length > 0
                        ? Math.round(
                            (products.filter(
                              p => p.total_remaining_quantity < p.total_quantity
                            ).length /
                              products.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Catalog items with sales activity
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Average Items Sold per Invoice
                  </span>
                  <span className="font-black text-gray-900 font-mono">
                    {totalInvoicesCount > 0
                      ? (totalQtySold / totalInvoicesCount).toFixed(1)
                      : '0'}{' '}
                    pcs
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Current Stock Availability
                  </span>
                  <span className="font-black text-emerald-600 font-mono">
                    {(salespersonData?.total_remaining_quantity || 0) > 0
                      ? 'In Stock'
                      : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-2">
                  <span className="text-gray-600 font-medium">
                    Unique Customer Penetration
                  </span>
                  <span className="font-black text-gray-900 font-mono">
                    {
                      new Set(salespersonInvoices.map(inv => inv.customer_id))
                        .size
                    }{' '}
                    unique clients
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      {detailDrawerOpen && (
        <VanInventoryDetail
          open={detailDrawerOpen}
          onClose={() => {
            setDetailDrawerOpen(false);
            setSelectedVanInventory(null);
          }}
          vanInventory={selectedVanInventory}
        />
      )}
      {invoiceDetailDrawerOpen && (
        <InvoiceDetail
          open={invoiceDetailDrawerOpen}
          onClose={() => setInvoiceDetailDrawerOpen(false)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
};

export default InventoryDetail;
