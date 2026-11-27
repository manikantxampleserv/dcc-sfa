import { Chip } from '@mui/material';
import { useMockDb } from 'context/MockDataContext';
import { Camera, Check, MapPin, Package, UploadCloud } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from 'shared/Button';
import useSessionStorage from '../../../../src/hooks/useSessionStorage';

/**
 * Driver Delivery Execution Page
 * Follows the existing DCC-B2B corporate pattern, shadows, and borders.
 */
const DriverExecution: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, deliveries, executeDelivery } = useMockDb();

  /** Find delivery and associated order by either delivery ID or order ID */
  const delivery = deliveries.find(
    d =>
      d.id === Number(id) ||
      orders.find(o => o.id === Number(id))?.order_number === d.order_number
  );
  const order = orders.find(
    o => o.id === Number(id) || o.order_number === delivery?.order_number
  );

  const storageKey =
    order?.order_number || delivery?.order_number || `delivery_${id}`;

  const isAlreadyDelivered =
    delivery?.status === 'delivered' || order?.status === 'delivered';

  const [geoVerified, setGeoVerified] = useSessionStorage<boolean>(
    `b2b_exec_geo_${storageKey}`,
    isAlreadyDelivered
  );

  const initialPhotos = useMemo(
    () => ({
      stock: delivery?.pod_image || null,
      signature: delivery?.pod_image || null,
    }),
    [delivery?.pod_image]
  );

  const [photos, setPhotos] = useSessionStorage<{
    stock: string | null;
    signature: string | null;
  }>(`b2b_exec_photos_${storageKey}`, initialPhotos);

  const defaultItems = useMemo(() => {
    return order
      ? order.items.map((item: any) => ({
          ...item,
          deliveredQty: item.quantity,
          returnedQty: 0,
        }))
      : [];
  }, [order]);

  const [items, setItems] = useSessionStorage<any[]>(
    `b2b_exec_items_${storageKey}`,
    defaultItems
  );

  const currentItems = items && items.length > 0 ? items : defaultItems;

  if (!order) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center gap-3">
        <p className="text-gray-600 font-semibold text-base">
          Delivery order not found
        </p>
        <Button
          variant="outlined"
          onClick={() => navigate('/deliveries/schedule')}
        >
          Back to Delivery Schedule
        </Button>
      </div>
    );
  }

  const totalInvoicedQty = currentItems.reduce(
    (s: number, it: any) => s + (Number(it.quantity) || 0),
    0
  );
  const totalDeliveredQty = currentItems.reduce(
    (s: number, it: any) => s + (Number(it.deliveredQty) || 0),
    0
  );
  const totalReturnedQty = currentItems.reduce(
    (s: number, it: any) => s + (Number(it.returnedQty) || 0),
    0
  );

  const handleVerifyLocation = () => {
    setGeoVerified(true);
    toast.success('Location Verified: Within 100m of customer site.');
  };

  const handlePhotoUpload = (type: 'stock' | 'signature') => {
    setPhotos({
      ...photos,
      [type]: `pod_${type}_mock.jpg`,
    });
    toast.success(
      `${type === 'stock' ? 'Stock on ground' : 'Customer signature'} captured successfully.`
    );
  };

  const handleDeliveredChange = (idx: number, val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    const updated = currentItems.map((item: any, i: number) => {
      if (i !== idx) return item;
      const validDelivered = Math.min(item.quantity, num);
      const validReturned = item.quantity - validDelivered;
      return {
        ...item,
        deliveredQty: validDelivered,
        returnedQty: validReturned,
      };
    });
    setItems(updated);
  };

  const handleReturnedChange = (idx: number, val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    const updated = currentItems.map((item: any, i: number) => {
      if (i !== idx) return item;
      const validReturned = Math.min(item.quantity, num);
      const validDelivered = item.quantity - validReturned;
      return {
        ...item,
        returnedQty: validReturned,
        deliveredQty: validDelivered,
      };
    });
    setItems(updated);
  };

  const submitDelivery = () => {
    if (!geoVerified && !isAlreadyDelivered) {
      toast.error('Please verify delivery location first.');
      return;
    }

    const targetId = delivery ? delivery.id : Number(id);
    executeDelivery(targetId, {
      pod_lat: -6.8235,
      pod_lng: 39.2695,
      notes: `Delivered ${totalDeliveredQty} units${
        totalReturnedQty > 0 ? `, ${totalReturnedQty} returned` : ''
      }`,
      pod_image: photos.stock || photos.signature || 'pod_signature_mock.jpg',
    });

    setGeoVerified(true);
    toast.success('Delivery Executed Successfully!');
    navigate('/deliveries/schedule');
  };

  return (
    <div className="flex flex-col gap-4">
      {/** Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              Execute Delivery #{order.order_number}
            </h1>
            <Chip
              size="small"
              label={isAlreadyDelivered ? 'DELIVERED' : 'OUT FOR DELIVERY'}
              color={isAlreadyDelivered ? 'success' : 'primary'}
            />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Customer: {order.customer_name} ({order.customer_sap_code})
          </p>
        </div>
      </div>

      {/** Two Column Layout matching OrderDetail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/** Main Content: Location & Items */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {/** Location Verification Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" /> Site Location
                Verification
              </h2>
              {geoVerified && (
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded">
                  Verified On-Site
                </span>
              )}
            </div>

            <div className="p-5">
              {!geoVerified ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Destination:{' '}
                      {delivery?.delivery_address ||
                        '45 Kariakoo Market Street, Dar es Salaam'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      GPS proximity check within 100m is required before
                      confirming handover.
                    </p>
                  </div>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleVerifyLocation}
                  >
                    Verify Location
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        GPS Location Verified
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Coordinates: Lat -6.8235, Lng 39.2695 · Proximity: 18m
                        (Within 100m threshold)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                    Locked
                  </span>
                </div>
              )}
            </div>
          </div>

          {/** Order Items Handover Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" /> Confirm Quantities
                ({currentItems.length} SKUs)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Product Description</th>
                    <th className="px-5 py-3 text-right">Invoiced</th>
                    <th className="px-5 py-3 text-right">Delivered</th>
                    <th className="px-5 py-3 text-right">Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          Code: {item.product_code}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-gray-700">
                        {item.quantity} units
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.deliveredQty ?? item.quantity}
                          onChange={e =>
                            handleDeliveredChange(idx, e.target.value)
                          }
                          className="w-24 px-2.5 py-1.5 border border-gray-300 rounded text-right text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.returnedQty ?? 0}
                          onChange={e =>
                            handleReturnedChange(idx, e.target.value)
                          }
                          className="w-24 px-2.5 py-1.5 border border-gray-300 rounded text-right text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
              <span>
                Total Invoiced:{' '}
                <strong className="text-gray-900">
                  {totalInvoicedQty} units
                </strong>
              </span>
              <div className="flex items-center gap-4">
                <span>
                  Delivered:{' '}
                  <strong className="text-gray-900">
                    {totalDeliveredQty} units
                  </strong>
                </span>
                {totalReturnedQty > 0 && (
                  <span className="text-amber-700 font-medium">
                    Returning: <strong>{totalReturnedQty} units</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/** Sidebar: POD Photos & Execution Summary */}
        <div className="flex flex-col gap-5">
          {/** Proof of Delivery Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-500" /> Proof of Delivery
              </h2>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div className="border border-gray-200 rounded-lg p-3.5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Stock on Ground
                    </p>
                    <p className="text-xs text-gray-500">
                      {photos.stock ? 'Photo captured' : 'Delivery photo'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePhotoUpload('stock')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {photos.stock ? 'Retake' : 'Capture'}
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-3.5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Customer Signature
                    </p>
                    <p className="text-xs text-gray-500">
                      {photos.signature
                        ? 'Signature captured'
                        : 'Signed delivery note'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePhotoUpload('signature')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {photos.signature ? 'Retake' : 'Capture'}
                </button>
              </div>
            </div>
          </div>

          {/** Execution Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">
              Execution Summary
            </h2>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Invoiced Value:</span>
                <span className="font-semibold text-gray-900">
                  TZS {order.total_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Location:</span>
                <span
                  className={`font-medium ${geoVerified ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {geoVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>POD Photos:</span>
                <span
                  className={`font-medium ${photos.stock || photos.signature ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {photos.stock && photos.signature
                    ? 'Both Captured'
                    : photos.stock || photos.signature
                      ? '1 Captured'
                      : 'Optional'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                <span>Total Delivered:</span>
                <span className="font-bold text-gray-900">
                  {totalDeliveredQty} units
                </span>
              </div>
              {totalReturnedQty > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Total Returning:</span>
                  <span className="font-bold">{totalReturnedQty} units</span>
                </div>
              )}
            </div>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={submitDelivery}
              disabled={isAlreadyDelivered}
            >
              {isAlreadyDelivered ? 'Delivery Completed' : 'Complete Delivery'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverExecution;
