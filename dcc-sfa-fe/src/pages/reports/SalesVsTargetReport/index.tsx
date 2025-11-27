import { Box, Chip, MenuItem } from '@mui/material';
import { usePermission } from 'hooks/usePermission';
import { useSalesVsTargetReport } from 'hooks/useReports';
import { useProductCategories } from 'hooks/useProductCategories';
import { useUsers } from 'hooks/useUsers';
import { TrendingUp, Target, BarChart3, Download, Users } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Select from 'shared/Select';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { PopConfirm } from 'shared/DeleteConfirmation';
import { exportSalesVsTargetReport } from 'services/reports/salesVsTarget';

const SalesVsTargetReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salespersonId, setSalespersonId] = useState<number | undefined>(
    undefined
  );
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useSalesVsTargetReport(
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      salesperson_id: salespersonId,
      product_category_id: categoryId,
    },
    {
      enabled: isRead,
    }
  );

  const { data: categoriesData } = useProductCategories();
  const { data: usersData } = useUsers();

  const categories = categoriesData?.data || [];
  const users = usersData?.data || [];

  const summary = reportData?.summary || {
    total_salespeople: 0,
    total_categories: 0,
    total_target_amount: 0,
    total_actual_sales: 0,
    achievement_percentage: 0,
  };

  const performance = reportData?.performance || [];
  const categoryPerformance = reportData?.category_performance || [];

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportSalesVsTargetReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        salesperson_id: salespersonId,
        product_category_id: categoryId,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, salespersonId, categoryId]);

  const performanceColumns: TableColumn<any>[] = [
    {
      id: 'salesperson_name',
      label: 'Sales Person',
      render: (_value, row) => {
        const salespersonName = row.salesperson_name || 'N/A';
        const initials =
          salespersonName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-600">
                {initials}
              </span>
            </div>
            <span className="font-semibold text-sm">{salespersonName}</span>
          </div>
        );
      },
    },
    {
      id: 'category_name',
      label: 'Category',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'target_amount',
      label: 'Target',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'actual_sales',
      label: 'Actual Sales',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'achievement_percentage',
      label: 'Achievement %',
      numeric: true,
      render: value => {
        const percentage = Number(value);
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';
        if (percentage >= 100) {
          chipColor = 'success';
        } else if (percentage >= 75) {
          chipColor = 'info';
        } else if (percentage >= 50) {
          chipColor = 'warning';
        } else {
          chipColor = 'error';
        }

        return (
          <Chip
            label={`${percentage.toFixed(1)}%`}
            size="small"
            variant="outlined"
            color={chipColor}
          />
        );
      },
    },
    {
      id: 'gap',
      label: 'Gap',
      numeric: true,
      render: value => (
        <span
          className={`font-semibold ${
            Number(value) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {Number(value) >= 0 ? '+' : ''}₹{Number(value).toLocaleString()}
        </span>
      ),
    },
  ];

  const categoryColumns: TableColumn<any>[] = [
    {
      id: 'category_name',
      label: 'Category',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'target_amount',
      label: 'Target',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'actual_sales',
      label: 'Actual Sales',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'achievement_percentage',
      label: 'Achievement %',
      numeric: true,
      render: value => {
        const percentage = Number(value);
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (percentage >= 100) {
          chipColor = 'success';
        } else if (percentage >= 75) {
          chipColor = 'info';
        } else if (percentage >= 50) {
          chipColor = 'warning';
        } else {
          chipColor = 'error';
        }

        return (
          <Chip
            label={`${percentage.toFixed(1)}%`}
            size="small"
            variant="outlined"
            color={chipColor}
          />
        );
      },
    },
    {
      id: 'gap',
      label: 'Gap',
      numeric: true,
      render: value => (
        <span
          className={`font-semibold ${
            Number(value) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {Number(value) >= 0 ? '+' : ''}₹{Number(value).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Sales vs Target Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track sales performance against targets
          </p>
        </Box>
        {isRead && (
          <PopConfirm
            title="Export Report to Excel"
            description="Are you sure you want to export the current report data to Excel?"
            onConfirm={handleExportToExcel}
            confirmText="Export"
            cancelText="Cancel"
            placement="bottom"
          >
            <Button
              startIcon={<Download className="w-4 h-4" />}
              variant="outlined"
            >
              Export to Excel
            </Button>
          </PopConfirm>
        )}
      </Box>

      {isRead && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                type="date"
                value={startDate}
                setValue={setStartDate}
                placeholder="Start Date"
                label="Start Date"
              />
            </div>
            <div>
              <Input
                type="date"
                value={endDate}
                setValue={setEndDate}
                placeholder="End Date"
                label="End Date"
              />
            </div>
            <div>
              <Select
                label="Sales Person"
                fullWidth
                value={salespersonId ? salespersonId.toString() : 'all'}
                onChange={e =>
                  setSalespersonId(
                    e.target.value === 'all'
                      ? undefined
                      : parseInt(e.target.value)
                  )
                }
              >
                <MenuItem value="all">All Salespeople</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <Select
                value={categoryId ? categoryId.toString() : 'all'}
                fullWidth
                label="Product Category"
                onChange={e =>
                  setCategoryId(
                    e.target.value === 'all'
                      ? undefined
                      : parseInt(e.target.value)
                  )
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category: any) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}

      {isRead && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
          <StatsCard
            title="Sales Person"
            value={summary.total_salespeople}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            isLoading={isLoading}
          />
          <StatsCard
            title="Categories"
            value={summary.total_categories}
            icon={<BarChart3 className="w-6 h-6" />}
            color="purple"
            isLoading={isLoading}
          />
          <StatsCard
            title="Target Amount"
            value={`₹${summary.total_target_amount.toLocaleString()}`}
            icon={<Target className="w-6 h-6" />}
            color="orange"
            isLoading={isLoading}
          />
          <StatsCard
            title="Actual Sales"
            value={`₹${summary.total_actual_sales.toLocaleString()}`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
            isLoading={isLoading}
          />
          <StatsCard
            title="Achievement"
            value={`${summary.achievement_percentage.toFixed(1)}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="emerald"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Performance by Salesperson Table */}
      <Table
        columns={performanceColumns}
        actions={
          <Box className="flex font-bold items-center gap-2">
            <Users className="w-5 h-5" /> Performance by Sales Person (
            {performance.length})
          </Box>
        }
        data={performance}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />

      {/* Category Performance Table */}
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Performance by Category (
            {categoryPerformance.length})
          </Box>
        }
        columns={categoryColumns}
        data={categoryPerformance}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default SalesVsTargetReport;
