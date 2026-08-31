import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import Table from 'shared/Table';
import StatsCard from 'shared/StatsCard';

const data = [
  { name: 'Week 1', OTIF: 92, FillRate: 95 },
  { name: 'Week 2', OTIF: 95, FillRate: 96 },
  { name: 'Week 3', OTIF: 88, FillRate: 91 },
  { name: 'Week 4', OTIF: 96, FillRate: 98 },
  { name: 'Week 5', OTIF: 97, FillRate: 99 },
  { name: 'Week 6', OTIF: 98, FillRate: 98 },
];

const DeliveryPerformance: React.FC = () => {
  const columns = [
    {
      id: 'week',
      label: 'Week',
      render: (val: any) => (
        <span className="font-medium text-gray-800">{val}</span>
      ),
    },
    {
      id: 'otif',
      label: 'OTIF %',
      render: (val: any) => (
        <span
          className={`font-semibold ${val >= 95 ? 'text-green-600' : val >= 90 ? 'text-orange-500' : 'text-red-600'}`}
        >
          {val}%
        </span>
      ),
    },
    {
      id: 'fillRate',
      label: 'Fill Rate %',
      render: (val: any) => (
        <span
          className={`font-semibold ${val >= 95 ? 'text-green-600' : val >= 90 ? 'text-orange-500' : 'text-red-600'}`}
        >
          {val}%
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_val: any, row: any) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${row.otif >= 95 && row.fillRate >= 95 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
        >
          {row.otif >= 95 && row.fillRate >= 95 ? 'On Target' : 'Below Target'}
        </span>
      ),
    },
  ];

  const tableData = data.map(d => ({
    id: d.name,
    week: d.name,
    otif: d.OTIF,
    fillRate: d.FillRate,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">
            Delivery Performance
          </p>
          <p className="text-sm text-gray-500">
            Track On-Time In-Full (OTIF) and Order Fill Rates
          </p>
        </div>
        <button className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Average OTIF (MTD)"
          value="94.3%"
          icon={<TrendingUp className="w-5 h-5" />}
          color="teal"
        />
        <StatsCard
          title="Average Fill Rate (MTD)"
          value="96.1%"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-6">
          Performance Trend (Last 6 Weeks)
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="OTIF"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="FillRate"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            Weekly Breakdown
          </h2>
        </div>
        <Table columns={columns} rows={tableData} />
      </div>
    </div>
  );
};

export default DeliveryPerformance;
