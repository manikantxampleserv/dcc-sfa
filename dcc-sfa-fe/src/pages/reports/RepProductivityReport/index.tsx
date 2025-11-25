import { Box, Chip, MenuItem } from '@mui/material';
import { useDepots } from 'hooks/useDepots';
import { usePermission } from 'hooks/usePermission';
import { useRepProductivityReport } from 'hooks/useReports';
import { useUsers } from 'hooks/useUsers';
import {
  Download,
  User,
  Calendar,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  Activity,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportRepProductivityReport } from 'services/reports/repProductivity';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

const RepProductivityReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salespersonId, setSalespersonId] = useState<number | undefined>(
    undefined
  );
  const [depotId, setDepotId] = useState<number | undefined>(undefined);
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useRepProductivityReport(
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      salesperson_id: salespersonId,
      depot_id: depotId,
    },
    {
      enabled: isRead,
    }
  );

  const { data: usersData } = useUsers();
  const { data: depotsData } = useDepots();

  const users = usersData?.data || [];
  const depots = depotsData?.data || [];

  const summary = reportData?.summary || {
    total_reps: 0,
    total_visits: 0,
    completed_tasks: 0,
    total_orders: 0,
    total_order_value: 0,
    total_collection: 0,
  };

  const reps = reportData?.data?.reps || [];

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportRepProductivityReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        salesperson_id: salespersonId,
        depot_id: depotId,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, salespersonId, depotId]);

  const repsColumns: TableColumn<any>[] = [
    {
      id: 'name',
      label: 'Rep Name',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{row.name}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'employee_id',
      label: 'Employee ID',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'depot_name',
      label: 'Depot',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'total_visits',
      label: 'Visits',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },

    {
      id: 'total_orders',
      label: 'Orders',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'order_value',
      label: 'Order Value',
      numeric: true,
      render: value => `₹${Number(value).toLocaleString()}`,
    },
    {
      id: 'total_collection',
      label: 'Collection',
      numeric: true,
      render: value => (
        <span className="font-semibold text-green-600">
          ₹{Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'days_active',
      label: 'Days Active',
      numeric: true,
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'productivity_score',
      label: 'Score',
      numeric: true,
      render: value => (
        <Chip
          label={value}
          size="small"
          className="!font-semibold"
          color={value > 50 ? 'success' : value > 25 ? 'warning' : 'error'}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Rep Productivity Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track individual sales rep performance and productivity
          </p>
        </Box>
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
      </Box>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
          <Select
            label="Sales Rep"
            value={salespersonId?.toString() || 'all'}
            onChange={e =>
              setSalespersonId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
          >
            <MenuItem value="all">All Reps</MenuItem>
            {users.map((user: any) => (
              <MenuItem key={user.id} value={user.id.toString()}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            label="Depot"
            value={depotId?.toString() || 'all'}
            onChange={e =>
              setDepotId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
          >
            <MenuItem value="all">All Depots</MenuItem>
            {depots.map((depot: any) => (
              <MenuItem key={depot.id} value={depot.id.toString()}>
                {depot.name}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reps</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_reps}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_visits}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_orders}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Completed Tasks
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.completed_tasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{summary.total_order_value.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-和技术 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Collection
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{summary.total_collection.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <User className="w-5 h-5" />
            Rep Performance ({reps.length})
          </Box>
        }
        columns={repsColumns}
        data={reps}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default RepProductivityReport;
