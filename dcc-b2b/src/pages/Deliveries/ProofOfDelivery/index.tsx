import React, { useState } from 'react';
import { Chip, Dialog, DialogContent, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import {
  Image as ImageIcon,
  MapPin,
  X,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { mockDeliveries } from 'mock/data/deliveries';
import type { Delivery } from 'mock/data/deliveries';
import StatsCard from 'shared/StatsCard';
import Table from 'shared/Table';
import type { TableColumn } from 'shared/Table';
import { ActionButton } from 'shared/ActionButton';

const ProofOfDelivery: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState<Delivery | null>(null);

  // Completed/Failed deliveries have PODs
  const pastDeliveries = mockDeliveries.filter(d =>
    ['delivered', 'failed'].includes(d.status)
  );

  const columns: TableColumn<Delivery>[] = [
    {
      id: 'order_number',
      label: 'Order #',
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {row.order_number}
        </span>
      ),
    },
    {
      id: 'delivered_at',
      label: 'Delivered Time',
      render: (_, row) => (
        <span className="text-sm font-medium text-gray-800">
          {row.delivered_at
            ? dayjs(row.delivered_at).format('DD MMM YYYY, HH:mm')
            : '-'}
        </span>
      ),
    },
    {
      id: 'driver',
      label: 'Driver',
      render: (_, row) => (
        <span className="text-sm text-gray-800">{row.driver_name}</span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, row) => (
        <Chip
          label={row.status === 'delivered' ? 'Delivered' : 'Failed'}
          size="small"
          color={row.status === 'delivered' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      label: 'POD Evidence',
      render: (_, row) =>
        row.status === 'delivered' ? (
          <ActionButton
            onClick={() => setSelectedPod(row)}
            icon={<ImageIcon className="w-4 h-4" />}
            color="info"
            tooltip="View POD"
            size="small"
          />
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Proof of Delivery</h1>
          <p className="text-sm text-gray-500">
            View digital signatures, photos and coordinates
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Deliveries"
          value={mockDeliveries.length}
          icon={<Truck className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Delivered"
          value={mockDeliveries.filter(d => d.status === 'delivered').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Out for Delivery"
          value={
            mockDeliveries.filter(d => d.status === 'out_for_delivery').length
          }
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatsCard
          title="Failed Deliveries"
          value={mockDeliveries.filter(d => d.status === 'failed').length}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      <Table
        columns={columns}
        rows={pastDeliveries}
        emptyMessage="No past deliveries found."
      />

      {/* POD Viewer Modal */}
      <Dialog
        open={!!selectedPod}
        onClose={() => setSelectedPod(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPod && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                POD: {selectedPod.order_number}
              </h2>
              <IconButton onClick={() => setSelectedPod(null)} size="small">
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <DialogContent className="!p-5 flex flex-col gap-5">
              <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-xl border border-gray-200 border-dashed">
                <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Photo Evidence Captured</p>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  IMG_20260820_143045.jpg
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Delivered At
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {dayjs(selectedPod.delivered_at).format(
                      'DD MMM YYYY, HH:mm'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Driver
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedPod.driver_name}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    GPS Coordinates
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-mono text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                    <MapPin className="w-4 h-4" />
                    {selectedPod.pod_lat}, {selectedPod.pod_lng}
                  </div>
                </div>
                {selectedPod.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                      Delivery Notes
                    </p>
                    <p className="text-sm text-gray-700 italic">
                      {selectedPod.notes}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ProofOfDelivery;
