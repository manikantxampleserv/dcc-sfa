import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import dayjs from 'dayjs';
import {
  Check,
  Edit2,
  FileText,
  Package,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { mockOrders } from 'mock/data/orders';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from 'shared/Button';
import Table from 'shared/Table';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Create a deep copy of the order so we can edit it locally
  const [order, setOrder] = useState(() => {
    const found = mockOrders.find(o => o.id === Number(id));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Package className="w-12 h-12 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">Order Not Found</h2>
        <p className="text-sm mt-1">
          The order you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-600 hover:underline mt-4"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const columns = [
    {
      id: 'product_code',
      label: 'Item Code',
      render: (val: any) => (
        <span className="font-mono text-xs text-gray-500">{val}</span>
      ),
    },
    {
      id: 'product_name',
      label: 'Description',
      render: (val: any, row: any) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{val}</p>
          <p className="text-xs text-gray-400">{row.category}</p>
        </div>
      ),
    },
    {
      id: 'quantity',
      label: 'Qty',
      render: (val: any, row: any) => {
        if (editingItem === row.product_id) {
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editQty}
                onChange={e =>
                  setEditQty(
                    Math.min(
                      row.quantity,
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  )
                }
                className="w-16 p-1 border rounded text-sm"
                max={row.quantity} // Cannot increase
              />
              <IconButton
                size="small"
                onClick={() => saveQtyEdit(row)}
                color="success"
              >
                <Check className="w-4 h-4" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setEditingItem(null)}
                color="error"
              >
                <X className="w-4 h-4" />
              </IconButton>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{val}</span>
            {user?.role === 'sales_officer' && order.status === 'submitted' && (
              <button
                onClick={() => {
                  setEditingItem(row.product_id);
                  setEditQty(val);
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Reduce Quantity"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      id: 'unit_price',
      label: 'Unit Price',
      render: (val: any) => (
        <span className="text-sm text-gray-600">
          {(val as number).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'total_price',
      label: 'Total',
      render: (val: any) => (
        <span className="text-sm font-bold text-gray-800">
          TZS {(val as number).toLocaleString()}
        </span>
      ),
    },
  ];

  const saveQtyEdit = (row: any) => {
    if (editQty > row.quantity) {
      toast.error(
        'Sales Officers can only reduce quantities, not increase them.'
      );
      return;
    }
    const updatedItems = order.items.map((item: any) => {
      if (item.product_id === row.product_id) {
        return {
          ...item,
          quantity: editQty,
          total_price: editQty * item.unit_price,
        };
      }
      return item;
    });
    const newTotal = updatedItems.reduce(
      (sum: number, item: any) => sum + item.total_price,
      0
    );
    setOrder({ ...order, items: updatedItems, total_amount: newTotal });
    setEditingItem(null);
    toast.success('Quantity reduced successfully');
  };

  const handleAction = (action: string) => {
    if (action === 'reject') {
      setRejectModalOpen(true);
      return;
    }

    let newStatus = order.status;
    if (action === 'approve') newStatus = 'approved';
    if (action === 'cancel') newStatus = 'cancelled';

    setOrder({ ...order, status: newStatus });
    toast.success(`Order ${action}d successfully`);
  };

  const submitReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setOrder({ ...order, status: 'rejected', rejection_reason: rejectReason });
    setRejectModalOpen(false);
    toast.success('Order rejected');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-gray-900">
                Order {order.order_number}
              </p>
              <Chip
                size="small"
                label={order.status.replace('_', ' ').toUpperCase()}
                color={
                  order.status === 'delivered'
                    ? 'success'
                    : order.status.includes('reject') ||
                        order.status.includes('cancel')
                      ? 'error'
                      : 'primary'
                }
              />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed on {dayjs(order.created_at).format('DD MMM YYYY, HH:mm')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user?.role === 'customer' && order.status === 'submitted' && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleAction('cancel')}
            >
              Cancel Order
            </Button>
          )}
          {user?.role === 'customer' && order.status === 'rejected' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/orders/place')}
            >
              Re-Order
            </Button>
          )}
          {user?.role === 'sales_officer' &&
            (order.status === 'submitted' ||
              order.status === 'under_review') && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleAction('reject')}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAction('approve')}
                >
                  Approve
                </Button>
              </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4" /> Order Items (
                {order.items.length})
              </h2>
            </div>
            <Table columns={columns} rows={order.items} pagination={false} />
            <div className="px-5 py-4 border-t border-gray-200 flex flex-col items-end gap-2 bg-gray-50">
              <div className="flex justify-between w-64 text-sm text-gray-600">
                <span>Subtotal:</span>{' '}
                <span>TZS {order.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-64 text-sm text-gray-600">
                <span>VAT (18%):</span>{' '}
                <span>TZS {(order.total_amount * 0.18).toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-64 text-base font-bold text-gray-900 pt-2 border-t border-gray-200 mt-1">
                <span>Total:</span>{' '}
                <span>TZS {(order.total_amount * 1.18).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {order.rejection_reason && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800">
                  Order Rejected
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  {order.rejection_reason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar details */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">
              Customer Details
            </h2>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {order.customer_name}
                </p>
                <p className="text-xs text-gray-500">
                  SAP Code: {order.customer_sap_code}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">
              Timeline
            </h2>

            <div className="relative pl-4 border-l-2 border-gray-200 flex flex-col gap-4">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <p className="text-sm font-medium text-gray-800">
                  Order Placed
                </p>
                <p className="text-xs text-gray-500">
                  {dayjs(order.created_at).format('DD MMM YYYY, HH:mm')}
                </p>
              </div>

              {order.approved_by && (
                <div className="relative">
                  <div
                    className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${order.status === 'rejected' ? 'bg-red-500' : 'bg-blue-600'}`}
                  />
                  <p className="text-sm font-medium text-gray-800">
                    {order.status === 'rejected' ? 'Rejected' : 'Approved'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.approved_by} on{' '}
                    {dayjs(order.approved_at).format('DD MMM YYYY')}
                  </p>
                </div>
              )}

              {order.delivery_date && (
                <div className="relative">
                  <div
                    className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                  <p className="text-sm font-medium text-gray-800">
                    {order.status === 'delivered'
                      ? 'Delivered'
                      : 'Scheduled for Delivery'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dayjs(order.delivery_date).format('DD MMM YYYY')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notes
              </h2>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for rejecting this order. This is mandatory.
          </p>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter reason..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-6">
          <Button variant="text" onClick={() => setRejectModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={submitReject}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrderDetail;
