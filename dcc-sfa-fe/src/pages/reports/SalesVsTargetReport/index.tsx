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

  const getSalespersonName = (id: number) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.name}` : 'N/A';
  };

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
      id: 'salesperson_id',
      label: 'Sales Person',
      render: value => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-600">
              {getSalespersonName(value)
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U'}
            </span>
          </div>
          <span className="font-semibold text-sm">
            {getSalespersonName(value)}
          </span>
        </div>
      ),
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Person</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_salespeople}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_categories}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Target Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{summary.total_target_amount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actual Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{summary.total_actual_sales.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Achievement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.achievement_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Salesperson Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Performance by Sales Person
        </h2>
        <Table
          columns={performanceColumns}
          data={performance}
          loading={isLoading}
          pagination={false}
          isPermission={isRead}
        />
      </div>

      {/* Category Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Performance by Category
        </h2>
        <Table
          columns={categoryColumns}
          data={categoryPerformance}
          loading={isLoading}
          pagination={false}
          isPermission={isRead}
        />
      </div>
    </div>
  );
};

export default SalesVsTargetReport;
