import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Camera,
  PackageCheck,
  UploadCloud,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Button from 'shared/Button';
import { mockOrders } from 'mock/data/orders';

const DriverExecution: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [geoVerified, setGeoVerified] = useState(false);
  const [photos, setPhotos] = useState({ stock: null, signature: null });
  const [items, setItems] = useState(() => {
    const order = mockOrders.find(o => o.id === Number(id));
    return order
      ? order.items.map((item: any) => ({
          ...item,
          deliveredQty: item.quantity,
          returnedQty: 0,
        }))
      : [];
  });

  const order = mockOrders.find(o => o.id === Number(id));

  if (!order) {
    return <div className="p-5">Delivery not found</div>;
  }

  const handleVerifyLocation = () => {
    // Mock 100m geo-fence success
    toast.success('Location Verified: Within 100m of customer site.');
    setGeoVerified(true);
  };

  const handlePhotoUpload = (type: 'stock' | 'signature') => {
    // Mock photo capture
    setPhotos({ ...photos, [type]: 'photo_url_mock.jpg' });
    toast.success(
      `${type === 'stock' ? 'Stock' : 'Signature'} photo captured!`
    );
  };

  const submitDelivery = () => {
    if (!geoVerified) {
      toast.error('Please verify your location first.');
      return;
    }
    if (!photos.stock || !photos.signature) {
      toast.error('Both mandatory photos are required.');
      return;
    }
    toast.success('Delivery Executed Successfully!');
    navigate('/deliveries/schedule');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-[calc(100vh-120px)] md:my-6 md:rounded-2xl md:shadow-2xl md:border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-5 sticky top-0 z-10 shadow-md">
        <h1 className="font-bold text-xl tracking-tight">Execute Delivery</h1>
        <p className="text-sm text-blue-100 mt-1">{order.customer_name}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-blue-800 text-blue-100 text-xs px-2 py-0.5 rounded font-mono border border-blue-500/30">
            #{order.order_number}
          </span>
        </div>
      </div>

      <div className="p-5 md:p-6 flex flex-col gap-8 flex-1 bg-gray-50/50">
        {/* Step 1: Location Validation */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shadow-sm">
                1
              </span>
              Location Validation
            </h2>
            {geoVerified && (
              <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          {!geoVerified ? (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                You must be within 100m of the delivery site to unlock
                execution.
              </p>
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerifyLocation}
                fullWidth
                className="!py-2.5"
              >
                <MapPin className="w-4 h-4 mr-2" /> Verify Location
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                <MapPin className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-900 font-bold">
                  GPS Locked at Customer Site
                </p>
                <p className="text-xs text-green-700 mt-0.5 font-mono">
                  Lat: -3.3869, Lng: 36.6829
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Step 2: Quantities */}
        <section
          className={`flex flex-col gap-4 transition-opacity duration-300 ${!geoVerified ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''}`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shadow-sm">
                2
              </span>
              Confirm Quantities
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {items.map((item: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      Item Code: {item.product_code}
                    </p>
                  </div>
                  <div className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                    Invoice: {item.quantity}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Delivered
                    </label>
                    <input
                      type="number"
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={item.deliveredQty}
                      onChange={e => {
                        const val = Math.min(
                          item.quantity,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        const newItems = [...items];
                        newItems[idx].deliveredQty = val;
                        newItems[idx].returnedQty = item.quantity - val;
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Returned
                    </label>
                    <input
                      type="number"
                      className="w-full p-2.5 border border-red-200 rounded-lg text-sm bg-red-50 text-red-700 font-bold outline-none cursor-not-allowed"
                      value={item.returnedQty}
                      readOnly
                    />
                  </div>
                </div>
                {item.returnedQty > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 flex items-center gap-2 mt-1">
                    <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <p className="text-xs text-orange-800 font-medium">
                      Returns will be buffered for physical verification at
                      depot.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Step 3: Photo Evidence */}
        <section
          className={`flex flex-col gap-4 transition-opacity duration-300 ${!geoVerified ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''}`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shadow-sm">
                3
              </span>
              Evidence (Mandatory)
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handlePhotoUpload('stock')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${photos.stock ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-inner' : 'bg-white border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400 shadow-sm'}`}
            >
              <Camera
                className={`w-8 h-8 mb-3 ${photos.stock ? 'text-blue-600' : 'text-gray-400'}`}
              />
              <span className="text-sm font-bold text-center">
                Stock on Ground
              </span>
              {photos.stock && (
                <span className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Captured
                </span>
              )}
            </button>
            <button
              onClick={() => handlePhotoUpload('signature')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${photos.signature ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-inner' : 'bg-white border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400 shadow-sm'}`}
            >
              <UploadCloud
                className={`w-8 h-8 mb-3 ${photos.signature ? 'text-blue-600' : 'text-gray-400'}`}
              />
              <span className="text-sm font-bold text-center">Signed Note</span>
              {photos.signature && (
                <span className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Captured
                </span>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={submitDelivery}
          disabled={!geoVerified || !photos.stock || !photos.signature}
          className="!py-3.5 !text-base shadow-lg !rounded-xl !font-bold"
        >
          <PackageCheck className="w-5 h-5 mr-2" /> Complete Delivery
        </Button>
      </div>
    </div>
  );
};

export default DriverExecution;
