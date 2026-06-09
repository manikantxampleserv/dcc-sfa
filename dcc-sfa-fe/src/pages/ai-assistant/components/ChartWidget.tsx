import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import type { ChartData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartWidget = React.memo(({ chartData }: { chartData: ChartData }) => {
  if (!chartData || !chartData.type || !chartData.labels || !chartData.data) {
    return null;
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartData.label || 'Value',
        data: chartData.data,
        backgroundColor:
          chartData.type === 'pie' || chartData.type === 'doughnut'
            ? [
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                '#f59e0b',
                '#10b981',
                '#06b6d4',
                '#f43f5e',
              ]
            : 'rgba(59, 130, 246, 0.8)',
        borderColor:
          chartData.type === 'pie' || chartData.type === 'doughnut'
            ? '#ffffff'
            : '#3b82f6',
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartData.type === 'pie' || chartData.type === 'doughnut',
        position: 'bottom' as const,
        labels: {
          font: { size: 11 },
          boxWidth: 12,
        },
      },
    },
    scales:
      chartData.type === 'pie' || chartData.type === 'doughnut'
        ? undefined
        : {
            y: {
              beginAtZero: true,
              grid: { color: '#f3f4f6' },
              ticks: { font: { size: 10 } },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } },
            },
          },
  };

  const ChartComponent = () => {
    switch (chartData.type) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-[350px] flex flex-col justify-between w-full">
      <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100 pb-1.5 mb-2">
        {chartData.label || 'Visualization'}
      </div>
      <div className="flex-1 min-h-0 relative">
        <ChartComponent />
      </div>
    </div>
  );
});

export default ChartWidget;
