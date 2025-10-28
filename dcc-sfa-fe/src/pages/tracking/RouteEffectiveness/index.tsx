import { Chip, MenuItem, Skeleton } from '@mui/material';
import { useDepots } from 'hooks/useDepots';
import { useRouteEffectiveness } from 'hooks/useGPSTracking';
import { useUsers } from 'hooks/useUsers';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  MapPin,
  Navigation,
  Target,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

const RouteEffectiveness: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salespersonId, setSalespersonId] = useState<number | undefined>(
    undefined
  );
  const [depotId, setDepotId] = useState<number | undefined>(undefined);

  const { data: reportData, isLoading } = useRouteEffectiveness({
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    salesperson_id: salespersonId,
    depot_id: depotId,
  });

  const { data: usersData } = useUsers();
  const { data: depotsData } = useDepots();

  const users = usersData?.data || [];
  const depots = depotsData?.data || [];

  const summary = reportData?.summary || {
    total_routes: 0,
    total_customers: 0,
    total_planned_visits: 0,
    total_actual_visits: 0,
    total_completed_visits: 0,
    missed_visits: 0,
    avg_completion_rate: '0',
    avg_efficiency_score: '0',
    date_range: {
      start: '',
      end: '',
    },
  };

  const routes = reportData?.routes || [];

  const SummaryStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map(item => (
        <div
          key={item}
          className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton
                variant="text"
                width="60%"
                height={20}
                className="!mb-2"
              />
              <Skeleton variant="text" width="40%" height={32} />
            </div>
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              className="!bg-gray-100"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const columns: TableColumn<any>[] = [
    {
      id: 'route_name',
      label: 'Route',
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{row.route_name}</span>
            <span className="text-xs text-gray-500">{row.route_code}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'salesperson_name',
      label: 'Salesperson',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'depot_name',
      label: 'Depot',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'total_customers',
      label: 'Customers',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'completed_visits',
      label: 'Completed',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'missed_visits',
      label: 'Missed',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'completion_rate',
      label: 'Completion Rate',
      numeric: true,
      render: value => {
        const rate = Number(value);
        return (
          <Chip
            label={`${value}%`}
            size="small"
            color={rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'error'}
          />
        );
      },
    },
    {
      id: 'efficiency_score',
      label: 'Efficiency',
      numeric: true,
      render: value => {
        const score = Number(value);
        return (
          <Chip
            label={`${value}%`}
            size="small"
            color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="!font-bold text-xl !text-gray-900">
            Route Effectiveness
          </h2>
          <p className="!text-gray-500 text-sm">
            Analyze route performance and effectiveness metrics
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="Start Date"
              label="Start Date"
            />
          </div>
          <div>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              placeholder="End Date"
              label="End Date"
            />
          </div>
          <Select
            label="Salesperson"
            value={salespersonId?.toString() || 'all'}
            onChange={e =>
              setSalespersonId(
                e.target.value && e.target.value !== 'all'
                  ? parseInt(e.target.value)
                  : undefined
              )
            }
          >
            <MenuItem value="all">All Salespersons</MenuItem>
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

      {/* Summary Stats */}
      {isLoading ? (
        <SummaryStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Routes
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.total_routes}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Navigation className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.avg_completion_rate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Efficiency Score
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.avg_efficiency_score}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Missed Visits
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.missed_visits}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="!font-bold text-lg !text-gray-900 !mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Route Performance ({routes.length})
        </h2>
        <Table
          columns={columns}
          data={routes}
          loading={isLoading}
          pagination={false}
        />
      </div>

      {/* Route Details Cards */}
      {!isLoading && routes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {routes.slice(0, 4).map((route: any) => (
            <div
              key={route.route_id}
              className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {route.route_name}
                  </h3>
                  <p className="text-sm text-gray-500">{route.route_code}</p>
                </div>
                <Chip
                  label={`${route.efficiency_score}%`}
                  color={
                    Number(route.efficiency_score) >= 80
                      ? 'success'
                      : Number(route.efficiency_score) >= 60
                        ? 'warning'
                        : 'error'
                  }
                  size="small"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Customers
                  </span>
                  <span className="font-medium">{route.total_customers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                  <span className="font-medium">{route.completed_visits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Missed
                  </span>
                  <span className="font-medium text-red-600">
                    {route.missed_visits}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Distance
                  </span>
                  <span className="font-medium">
                    {route.actual_distance_km} km
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {routes.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-12">
          <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No route data available</p>
          <p className="text-gray-400 text-sm mt-2">
            Please adjust your filters to view route performance metrics
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteEffectiveness;
