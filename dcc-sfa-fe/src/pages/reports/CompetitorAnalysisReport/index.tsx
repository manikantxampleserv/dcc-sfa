import { Box, Chip } from '@mui/material';
import { useCurrency } from 'hooks/useCurrency';
import { usePermission } from 'hooks/usePermission';
import { useCompetitorAnalysisReport } from 'hooks/useReports';
import { AlertCircle, Download, Eye, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { exportCompetitorAnalysisReport } from 'services/reports/competitorAnalysis';
import Button from 'shared/Button';
import CustomerSelect from 'shared/CustomerSelect';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';

const CompetitorAnalysisReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [brandName, setBrandName] = useState('');
  const { formatCurrency } = useCurrency();
  const { isRead } = usePermission('report');

  const { data: reportData, isLoading } = useCompetitorAnalysisReport(
    {
      start_date: startDate,
      end_date: endDate,
      customer_id: customerId,
      brand_name: brandName,
    },
    {
      enabled: isRead,
    }
  );

  const summary = reportData?.summary || {
    total_observations: 0,
    unique_brands: 0,
    unique_customers: 0,
    avg_visibility_score: 0,
  };

  const activities = reportData?.data?.activities || [];
  const brandsSummary = reportData?.data?.brands_summary || [];

  const handleExportToExcel = useCallback(async () => {
    try {
      await exportCompetitorAnalysisReport({
        start_date: startDate,
        end_date: endDate,
        customer_id: customerId,
        brand_name: brandName,
      });
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
    }
  }, [startDate, endDate, customerId, brandName]);

  const activitiesColumns: TableColumn<any>[] = [
    {
      id: 'brand_name',
      label: 'Brand',
      render: value => (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-sm">{value}</span>
        </div>
      ),
    },
    {
      id: 'product_name',
      label: 'Product',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'customer_name',
      label: 'Customer',
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.customer_name}</span>
          <span className="text-xs text-gray-500">{row.customer_address}</span>
        </div>
      ),
    },
    {
      id: 'observed_price',
      label: 'Price',
      numeric: true,
      render: value => formatCurrency(Number(value)),
    },
    {
      id: 'visibility_score',
      label: 'Visibility',
      numeric: true,
      render: value => (
        <Chip
          label={value}
          size="small"
          color={
            Number(value) >= 7
              ? 'success'
              : Number(value) >= 5
                ? 'warning'
                : 'error'
          }
          variant="outlined"
        />
      ),
    },
    {
      id: 'promotion_details',
      label: 'Promotion',
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      id: 'visit_status',
      label: 'Visit Status',
      render: value => {
        const statusLower = String(value || '').toLowerCase();
        let chipColor: 'success' | 'warning' | 'error' | 'info' | 'default' =
          'default';

        if (statusLower === 'completed') {
          chipColor = 'success';
        } else if (statusLower === 'planned') {
          chipColor = 'info';
        } else if (statusLower === 'cancelled') {
          chipColor = 'error';
        }

        return (
          <Chip
            label={value}
            size="small"
            className="!capitalize"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
  ];

  const brandsColumns: TableColumn<any>[] = [
    {
      id: 'brand_name',
      label: 'Brand',
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'observation_count',
      label: 'Observations',
      numeric: true,
      render: value => <span className="font-semibold text-sm">{value}</span>,
    },
    {
      id: 'avg_price',
      label: 'Avg Price',
      numeric: true,
      render: value => formatCurrency(Number(value)),
    },
    {
      id: 'avg_visibility',
      label: 'Avg Visibility',
      numeric: true,
      render: value => (
        <Chip
          label={Number(value).toFixed(1)}
          size="small"
          color={
            Number(value) >= 7
              ? 'success'
              : Number(value) >= 5
                ? 'warning'
                : 'error'
          }
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Competitor Analysis Report
          </p>
          <p className="!text-gray-500 text-sm">
            Track competitor activities and market insights
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
            setValue={setStartDate}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            setValue={setEndDate}
          />

          <CustomerSelect
            name="customer_id"
            label="Customer"
            value={customerId?.toString() || 'all'}
            setValue={setCustomerId}
          />
          <Input
            label="Brand Name"
            value={brandName}
            setValue={setBrandName}
            placeholder="Search by brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <StatsCard
          title="Total Observations"
          value={summary.total_observations}
          icon={<Eye className="w-6 h-6" />}
          color="blue"
        />

        <StatsCard
          title="Unique Brands"
          value={summary.unique_brands}
          icon={<AlertCircle className="w-6 h-6" />}
          color="orange"
        />

        <StatsCard
          title="Customers"
          value={summary.unique_customers}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />

        <StatsCard
          title="Avg Visibility"
          value={summary.avg_visibility_score.toFixed(1)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
      </div>

      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Competitor Activities ({activities.length})
          </Box>
        }
        columns={activitiesColumns}
        data={activities}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
      <Table
        actions={
          <Box className="flex font-bold items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Brands Summary (
            {brandsSummary.length})
          </Box>
        }
        columns={brandsColumns}
        data={brandsSummary}
        loading={isLoading}
        pagination={false}
        isPermission={isRead}
      />
    </div>
  );
};

export default CompetitorAnalysisReport;
