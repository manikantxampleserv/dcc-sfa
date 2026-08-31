import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Table from 'shared/Table';
import { AlertCircle, TrendingDown } from 'lucide-react';

const data = [
  { name: 'Jan', Water: 4000, Soda: 2400, Juice: 2400 },
  { name: 'Feb', Water: 3000, Soda: 1398, Juice: 2210 },
  { name: 'Mar', Water: 2000, Soda: 9800, Juice: 2290 },
  { name: 'Apr', Water: 2780, Soda: 3908, Juice: 2000 },
  { name: 'May', Water: 1890, Soda: 4800, Juice: 2181 },
  { name: 'Jun', Water: 2390, Soda: 3800, Juice: 2500 },
];

const stockoutData = [
  { id: 'SKU-789', name: 'Premium Orange Juice 1L', timesReduced: 12, timesRejected: 4, impact: 'TZS 450,000' },
  { id: 'SKU-456', name: 'Sparkling Water 500ml', timesReduced: 8, timesRejected: 1, impact: 'TZS 120,000' },
  { id: 'SKU-123', name: 'Cola Classic 330ml', timesReduced: 5, timesRejected: 0, impact: 'TZS 75,000' },
];

const OrderSummary: React.FC = () => {
  const columns = [
    {
      id: 'month',
      label: 'Month',
      render: (val: any) => (
        <span className="font-medium text-gray-800">{val}</span>
      ),
    },
    {
      id: 'water',
      label: 'Water (Cases)',
      render: (val: any) => (
        <span className="text-gray-600">{val.toLocaleString()}</span>
      ),
    },
    {
      id: 'soda',
      label: 'Soda (Cases)',
      render: (val: any) => (
        <span className="text-gray-600">{val.toLocaleString()}</span>
      ),
    },
    {
      id: 'juice',
      label: 'Juice (Cases)',
      render: (val: any) => (
        <span className="text-gray-600">{val.toLocaleString()}</span>
      ),
    },
    {
      id: 'total',
      label: 'Total Volume',
      render: (_val: any, row: any) => (
        <span className="font-bold text-gray-900">
          {(row.water + row.soda + row.juice).toLocaleString()}
        </span>
      ),
    },
  ];

  const tableData = data.map(d => ({
    id: d.name,
    month: d.name,
    water: d.Water,
    soda: d.Soda,
    juice: d.Juice,
  }));

  const stockoutColumns = [
    {
      id: 'id',
      label: 'SKU Code',
      render: (val: any) => <span className="font-mono text-xs text-gray-500">{val}</span>,
    },
    {
      id: 'name',
      label: 'Product Name',
      render: (val: any) => <span className="font-medium text-gray-800">{val}</span>,
    },
    {
      id: 'timesReduced',
      label: 'Times Reduced',
      render: (val: any) => (
        <div className="flex items-center gap-1 text-orange-600">
          <TrendingDown className="w-3.5 h-3.5" />
          <span className="font-medium">{val}</span>
        </div>
      ),
    },
    {
      id: 'timesRejected',
      label: 'Times Rejected',
      render: (val: any) => (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="font-medium">{val}</span>
        </div>
      ),
    },
    {
      id: 'impact',
      label: 'Est. Revenue Impact',
      render: (val: any) => <span className="text-gray-900 font-semibold">{val}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">
            Order Summary Report
          </p>
          <p className="text-sm text-gray-500">
            Analyze your ordering patterns across categories
          </p>
        </div>
        <button className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
          Export CSV
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-6">
          Volume by Category (Last 6 Months)
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="Water"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 4, 4]}
              />
              <Bar dataKey="Soda" stackId="a" fill="#f59e0b" />
              <Bar
                dataKey="Juice"
                stackId="a"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            Monthly Breakdown
          </h2>
        </div>
        <Table columns={columns} rows={tableData} />
      </div>

      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden mt-2">
        <div className="px-5 py-4 border-b border-red-100 bg-red-50/30 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> Stockout Analysis
            </h2>
            <p className="text-xs text-red-600 mt-1">Frequently reduced or rejected items due to stock limitations.</p>
          </div>
        </div>
        <Table columns={stockoutColumns} rows={stockoutData} pagination={false} />
      </div>
    </div>
  );
};

export default OrderSummary;
