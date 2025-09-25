import React from 'react';
import {
  FaBoxes,
  FaChartLine,
  FaClipboardList,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTruck,
  FaUsers,
} from 'react-icons/fa';

const ExecutiveDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Orders',
      value: '1,247',
      description: '+12% This Month',
      icon: FaShoppingCart,
      color: 'blue',
      progress: 78,
    },
    {
      title: 'Sales Revenue',
      value: '₹8.5L',
      description: '+18% vs Target',
      icon: FaMoneyBillWave,
      color: 'green',
      progress: 85,
    },
    {
      title: 'Deliveries',
      value: '1,156',
      description: '92% Success Rate',
      icon: FaTruck,
      color: 'cyan',
      progress: 92,
    },
    {
      title: 'Active Outlets',
      value: '342',
      description: '+5 New This Week',
      icon: FaUsers,
      color: 'pink',
      progress: 68,
    },
  ];

  const quickActions = [
    { title: 'New Order Entry', icon: FaClipboardList, color: 'blue' },
    { title: 'Delivery Scheduling', icon: FaTruck, color: 'green' },
    { title: 'Inventory Check', icon: FaBoxes, color: 'purple' },
    { title: 'Route Planning', icon: FaMapMarkerAlt, color: 'orange' },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: {
      [key: string]: {
        bg: string;
        text: string;
        icon: string;
        progress: string;
      };
    } = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100',
        progress: 'bg-blue-500',
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        icon: 'bg-pink-100',
        progress: 'bg-pink-500',
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        icon: 'bg-cyan-100',
        progress: 'bg-cyan-500',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100',
        progress: 'bg-green-500',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100',
        progress: 'bg-purple-500',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-100',
        progress: 'bg-orange-500',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-1">
              Executive Dashboard
            </h2>
            <p className="text-gray-500 text-sm">
              Track your sales performance, orders, and field operations
            </p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              ₹8.5L Revenue MTD
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              1,247 Orders
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              92% Delivery Success
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={stat.title}
              className="bg-white shadow-sm p-6 rounded-lg border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-gray-500 font-medium">
                  {stat.title}
                </span>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.icon}`}
                >
                  <stat.icon size={16} />
                </div>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                <span className={`text-sm font-medium ${colors.text}`}>
                  {stat.description}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colors.progress}`}
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const colors = getColorClasses(action.color);
          return (
            <button
              key={index}
              className={`${colors.bg} ${colors.text} p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left w-full`}
            >
              <div className="flex items-center gap-3">
                <div className={`${colors.icon} p-2 rounded-lg`}>
                  <action.icon size={20} />
                </div>
                <span className="font-medium">{action.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales Performance & Trends
            </h3>
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                  <FaChartLine size={48} />
                </div>
                <span className="text-gray-500">Sales Analytics Chart</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white shadow-sm p-6 rounded-lg border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Route Effectiveness
            </h3>
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mx-auto mb-2 flex justify-center">
                  <FaMapMarkerAlt size={48} />
                </div>
                <span className="text-gray-500">Route Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
