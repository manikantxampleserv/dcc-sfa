import React, { useCallback, useState } from 'react';
import { Box, Typography, Tabs, Tab, LinearProgress } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import {
  usePromotionMaterialsIssuedReport,
  useExportPromotionMaterialsIssuedReport,
} from 'hooks/useReports';
import {
  Download,
  TrendingUp,
  Store,
  Box as BoxIcon,
  Megaphone,
} from 'lucide-react';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Table, { type TableColumn } from 'shared/Table';
import DepotSelect from 'shared/DepotSelect';
import CustomerSelect from 'shared/CustomerSelect';
import AssetSelect from 'shared/AssetSelect';
import StatsCard from 'shared/StatsCard';

const PromotionMaterialsIssuedReport: React.FC = () => {
  const [depotId, setDepotId] = useState<number | undefined>(undefined);
  const [outletId, setOutletId] = useState<number | undefined>(undefined);
  const [assetId, setAssetId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [activeTab, setActiveTab] = useState<
    'outlet' | 'item' | 'depot' | 'month' | 'detailed'
  >('item');

  const { isRead } = usePermission('report');

  const { mutateAsync: exportReport, isPending: isExporting } =
    useExportPromotionMaterialsIssuedReport();

  const { data: reportData, isFetching } = usePromotionMaterialsIssuedReport(
    {
      depot_id: depotId,
      outlet_id: outletId,
      asset_id: assetId,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      group_by: activeTab,
    },
    {
      enabled: isRead,
    }
  );

  const summary = reportData?.summary || {
    total_expense: 0,
    approved_issues: 0,
    outlets_reached: 0,
    pieces_issued: 0,
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportReport({
        depot_id: depotId,
        outlet_id: outletId,
        asset_id: assetId,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        group_by: activeTab,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [exportReport, depotId, outletId, assetId, startDate, endDate, activeTab]);

  const getColumns = (): TableColumn<any>[] => {
    if (activeTab === 'item') {
      return [
        {
          id: 'item',
          label: 'Item',
          render: (_value, row) => (
            <Box className="flex flex-col">
              <Typography
                variant="body2"
                className="!font-medium text-gray-900"
              >
                {row.item_name}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {row.item_code}
              </Typography>
            </Box>
          ),
        },
        { id: 'issues', label: 'Issues', render: (_value, row) => row.issues },
        {
          id: 'outlets',
          label: 'Outlets',
          render: (_value, row) => row.outlets,
        },
        {
          id: 'qty_issued',
          label: 'Qty Issued',
          render: (_value, row) => row.qty_issued,
        },
        {
          id: 'total_value',
          label: 'Total Value',
          render: (_value, row) => (
            <Typography variant="body2" className="!font-bold">
              TZS {Number(row.total_value || 0).toLocaleString()}
            </Typography>
          ),
        },
        {
          id: 'share_of_value',
          label: 'Share of Value',
          render: (_value, row) => (
            <Box className="flex items-center gap-2">
              <LinearProgress
                variant="determinate"
                value={row.share_of_value}
                className="w-24 !h-2 !rounded !bg-gray-100"
                sx={{ '& .MuiLinearProgress-bar': { borderRadius: 1 } }}
              />
              <Typography variant="caption" className="text-gray-500 w-10">
                {row.share_of_value.toFixed(1)}%
              </Typography>
            </Box>
          ),
        },
      ];
    } else if (activeTab === 'outlet') {
      return [
        {
          id: 'outlet',
          label: 'Outlet',
          render: (_value, row) => (
            <Box className="flex flex-col">
              <Typography
                variant="body2"
                className="!font-medium text-gray-900"
              >
                {row.outlet_name}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {row.outlet_code}
              </Typography>
            </Box>
          ),
        },
        { id: 'issues', label: 'Issues', render: (_value, row) => row.issues },
        {
          id: 'qty_issued',
          label: 'Qty Issued',
          render: (_value, row) => row.qty_issued,
        },
        {
          id: 'total_value',
          label: 'Total Value',
          render: (_value, row) => (
            <Typography variant="body2" className="!font-bold">
              TZS {Number(row.total_value || 0).toLocaleString()}
            </Typography>
          ),
        },
        {
          id: 'share_of_value',
          label: 'Share of Value',
          render: (_value, row) => (
            <Box className="flex items-center gap-2">
              <LinearProgress
                variant="determinate"
                value={row.share_of_value}
                className="w-24 !h-2 !rounded !bg-gray-100"
                sx={{ '& .MuiLinearProgress-bar': { borderRadius: 1 } }}
              />
              <Typography variant="caption" className="text-gray-500 w-10">
                {row.share_of_value.toFixed(1)}%
              </Typography>
            </Box>
          ),
        },
      ];
    } else if (activeTab === 'depot') {
      return [
        {
          id: 'depot',
          label: 'Depot',
          render: (_value, row) => (
            <Box className="flex flex-col">
              <Typography
                variant="body2"
                className="!font-medium text-gray-900"
              >
                {row.depot_name}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {row.depot_code}
              </Typography>
            </Box>
          ),
        },
        { id: 'issues', label: 'Issues', render: (_value, row) => row.issues },
        {
          id: 'outlets',
          label: 'Outlets',
          render: (_value, row) => row.outlets,
        },
        {
          id: 'qty_issued',
          label: 'Qty Issued',
          render: (_value, row) => row.qty_issued,
        },
        {
          id: 'total_value',
          label: 'Total Value',
          render: (_value, row) => (
            <Typography variant="body2" className="!font-bold">
              TZS {Number(row.total_value || 0).toLocaleString()}
            </Typography>
          ),
        },
        {
          id: 'share_of_value',
          label: 'Share of Value',
          render: (_value, row) => (
            <Box className="flex items-center gap-2">
              <LinearProgress
                variant="determinate"
                value={row.share_of_value}
                className="w-24 !h-2 !rounded !bg-gray-100"
                sx={{ '& .MuiLinearProgress-bar': { borderRadius: 1 } }}
              />
              <Typography variant="caption" className="text-gray-500 w-10">
                {row.share_of_value.toFixed(1)}%
              </Typography>
            </Box>
          ),
        },
      ];
    } else if (activeTab === 'month') {
      return [
        { id: 'month', label: 'Month', render: (_value, row) => row.month },
        { id: 'issues', label: 'Issues', render: (_value, row) => row.issues },
        {
          id: 'outlets',
          label: 'Outlets',
          render: (_value, row) => row.outlets,
        },
        {
          id: 'qty_issued',
          label: 'Qty Issued',
          render: (_value, row) => row.qty_issued,
        },
        {
          id: 'total_value',
          label: 'Total Value',
          render: (_value, row) => (
            <Typography variant="body2" className="!font-bold">
              TZS {Number(row.total_value || 0).toLocaleString()}
            </Typography>
          ),
        },
        {
          id: 'share_of_value',
          label: 'Share of Value',
          render: (_value, row) => (
            <Box className="flex items-center gap-2">
              <LinearProgress
                variant="determinate"
                value={row.share_of_value}
                className="w-24 !h-2 !rounded !bg-gray-100"
                sx={{ '& .MuiLinearProgress-bar': { borderRadius: 1 } }}
              />
              <Typography variant="caption" className="text-gray-500 w-10">
                {row.share_of_value.toFixed(1)}%
              </Typography>
            </Box>
          ),
        },
      ];
    } else {
      return [
        {
          id: 'gin_number',
          label: 'GIN Number',
          render: (_value, row) => row.gin_number,
        },
        {
          id: 'issue_date',
          label: 'Issue Date',
          render: (_value, row) =>
            row.issue_date
              ? new Date(row.issue_date).toLocaleDateString()
              : 'N/A',
        },
        {
          id: 'depot_name',
          label: 'Depot',
          render: (_value, row) => row.depot_name,
        },
        {
          id: 'outlet_name',
          label: 'Outlet',
          render: (_value, row) => row.outlet_name,
        },
        {
          id: 'item_name',
          label: 'Item Name',
          render: (_value, row) => row.item_name,
        },
        {
          id: 'quantity',
          label: 'Qty Issued',
          render: (_value, row) => row.quantity,
        },
        {
          id: 'total_value',
          label: 'Total Value',
          render: (_value, row) =>
            `TZS ${Number(row.total_value || 0).toLocaleString()}`,
        },
      ];
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(2) + 'M';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(2) + 'K';
    }
    return val.toString();
  };

  return (
    <>
      {/* Header */}
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Promotion Materials Issued
          </p>
          <p className="!text-gray-500 text-sm">
            What was issued, to whom, and what it cost. Covers approved issues
            only.
          </p>
        </Box>

        <PopConfirm
          title="Export Report to Excel"
          description="Are you sure you want to export the current report data to Excel?"
          onConfirm={handleExportToExcel}
          confirmText="Export"
          cancelText="Cancel"
          placement="bottom"
          disabled={isExporting}
        >
          <Button
            startIcon={<Download className="w-4 h-4" />}
            variant="outlined"
            loading={isExporting}
          >
            Export to Excel
          </Button>
        </PopConfirm>
      </Box>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Total Expense"
          value={`TZS ${formatCurrency(summary.total_expense)}`}
          icon={<TrendingUp size={20} />}
          color="purple"
          isLoading={isFetching}
        />
        <StatsCard
          title="Approved Issues"
          value={summary.approved_issues}
          icon={<Megaphone size={20} />}
          color="blue"
          isLoading={isFetching}
        />
        <StatsCard
          title="Outlets Reached"
          value={summary.outlets_reached}
          icon={<Store size={20} />}
          color="green"
          isLoading={isFetching}
        />
        <StatsCard
          title="Pieces Issued"
          value={summary.pieces_issued}
          icon={<BoxIcon size={20} />}
          color="amber"
          isLoading={isFetching}
        />
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <Input
              type="date"
              label="From"
              value={startDate}
              setValue={value => setStartDate(value)}
              size="small"
            />
            <Input
              type="date"
              label="To"
              value={endDate}
              setValue={value => setEndDate(value)}
              size="small"
            />
            <DepotSelect
              label=""
              value={depotId}
              onChange={val => setDepotId(val)}
              placeholder="All Depots"
              size="small"
            />
            <CustomerSelect
              name=""
              label="All Outlets"
              value={outletId}
              onChange={(_e, val) => setOutletId(val?.id)}
            />
            <div className="col-span-2">
              <AssetSelect
                name=""
                label="All Items"
                value={assetId}
                onChange={val => setAssetId(val)}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, newValue) => setActiveTab(newValue)}
            aria-label="report tabs"
            sx={{ minHeight: 40 }}
          >
            <Tab
              label="By Outlet"
              value="outlet"
              sx={{ textTransform: 'none', minHeight: 40, py: 1 }}
            />
            <Tab
              label="By Item"
              value="item"
              sx={{ textTransform: 'none', minHeight: 40, py: 1 }}
            />
            <Tab
              label="By Depot"
              value="depot"
              sx={{ textTransform: 'none', minHeight: 40, py: 1 }}
            />
            <Tab
              label="By Month"
              value="month"
              sx={{ textTransform: 'none', minHeight: 40, py: 1 }}
            />
            <Tab
              label="Detailed"
              value="detailed"
              sx={{ textTransform: 'none', minHeight: 40, py: 1 }}
            />
          </Tabs>
        </Box>

        {/* Table Content */}
        <Box className="p-0">
          <Table
            columns={getColumns()}
            data={reportData?.data || []}
            loading={isFetching}
            sortable={false}
            filterColunm={false}
            pagination={false}
            emptyMessage="No promotion materials issued found"
          />
        </Box>
      </div>
    </>
  );
};

export default PromotionMaterialsIssuedReport;
