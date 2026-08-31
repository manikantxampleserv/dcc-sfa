import React from 'react';
import { mockKPIData } from 'mock/data/kpi';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LinearProgress } from '@mui/material';

const getClassificationColor = (classification: string) => {
  switch (classification) {
    case 'Platinum':
      return 'bg-slate-800 text-slate-100';
    case 'Gold':
      return 'bg-yellow-100 text-yellow-800';
    case 'Silver':
      return 'bg-gray-200 text-gray-800';
    case 'Bronze':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};

const KPIScorecard: React.FC = () => {
  const data = mockKPIData;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">KPI Scorecard</p>
          <p className="text-sm text-gray-500">
            Balanced scorecard view of performance across all metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Overall Score
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {data.overallScore}
              <span className="text-sm text-gray-500 font-normal">/100</span>
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg shadow-sm ${getClassificationColor(data.classification)}`}
          >
            <p className="text-sm font-bold uppercase tracking-wider">
              {data.classification}
            </p>
          </div>
        </div>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.categories.map(category => (
          <div
            key={category.id}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {category.name}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {category.weight}% Weight
              </span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">
                {category.score}
              </span>
              <span className="text-sm text-gray-500 mb-1">
                / {category.weight} pts
              </span>
            </div>
            <LinearProgress
              variant="determinate"
              value={(category.score / category.weight) * 100}
              className="rounded mt-2"
              sx={{
                height: 6,
                backgroundColor: '#f3f4f6',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#3b82f6',
                  borderRadius: 4,
                },
              }}
            />
          </div>
        ))}
      </div>

      {/* Detailed KPI Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.categories.map(category => (
          <div
            key={category.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">{category.name}</h3>
              <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {category.score} / {category.weight}
              </span>
            </div>
            <div className="p-5 flex flex-col gap-6">
              {category.kpis.map(kpi => (
                <div key={kpi.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">
                        {kpi.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {kpi.value}
                          {kpi.unit}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          Target: {kpi.target}
                        </span>
                      </div>
                      {kpi.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                      {kpi.trend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      {kpi.trend === 'neutral' && (
                        <Minus className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Bar for KPI */}
                  {kpi.unit === '%' ? (
                    <div className="relative pt-1">
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Math.max(0, kpi.value))}
                        className="rounded"
                        sx={{
                          height: 8,
                          backgroundColor: '#f3f4f6',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor:
                              kpi.value >= kpi.targetValue
                                ? '#10b981'
                                : kpi.value >= kpi.targetValue * 0.9
                                  ? '#f59e0b'
                                  : '#ef4444',
                            borderRadius: 4,
                          },
                        }}
                      />
                      {/* Target Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-800 z-10"
                        style={{ left: `${kpi.targetValue}%`, height: '100%' }}
                        title={`Target: ${kpi.target}`}
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 rounded h-2 overflow-hidden relative">
                      <div
                        className={`h-full rounded ${
                          kpi.unit === 'hrs' && kpi.value <= kpi.targetValue
                            ? 'bg-green-500'
                            : kpi.unit === 'hrs' && kpi.value > kpi.targetValue
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (kpi.value / (kpi.targetValue * 1.5)) * 100)}%`,
                        }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-800 z-10"
                        style={{
                          left: `${(kpi.targetValue / (kpi.targetValue * 1.5)) * 100}%`,
                          height: '100%',
                        }}
                        title={`Target: ${kpi.target}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIScorecard;
