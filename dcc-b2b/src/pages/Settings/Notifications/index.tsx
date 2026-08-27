import { Switch } from '@mui/material';
import { Bell, Mail, Smartphone } from 'lucide-react';
import React, { useState } from 'react';

const Notifications: React.FC = () => {
  const [settings, setSettings] = useState({
    orderStatus: { email: true, sms: true, push: true },
    deliveryUpdates: { email: true, sms: true, push: true },
    invoices: { email: true, sms: false, push: true },
    promotions: { email: false, sms: false, push: true },
  });

  const handleChange = (
    category: keyof typeof settings,
    type: 'email' | 'sms' | 'push'
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [type]: !prev[category][type] },
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xl font-bold text-gray-900">
          Notification Preferences
        </p>
        <p className="text-sm text-gray-500">
          Control how and when you want to be notified
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 px-6 py-4 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
          <div className="col-span-1">Notification Type</div>
          <div className="col-span-1 text-center flex items-center justify-center gap-1">
            <Mail className="w-4 h-4" /> Email
          </div>
          <div className="col-span-1 text-center flex items-center justify-center gap-1">
            <Smartphone className="w-4 h-4" /> SMS
          </div>
          <div className="col-span-1 text-center flex items-center justify-center gap-1">
            <Bell className="w-4 h-4" /> Push
          </div>
        </div>

        <div className="flex flex-col divide-y divide-gray-100">
          <div className="grid grid-cols-4 px-6 py-5 items-center">
            <div className="col-span-1">
              <p className="font-medium text-gray-900">Order Status</p>
              <p className="text-xs text-gray-500 mt-1">
                Updates on approvals and rejections
              </p>
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.orderStatus.email}
                onChange={() => handleChange('orderStatus', 'email')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.orderStatus.sms}
                onChange={() => handleChange('orderStatus', 'sms')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.orderStatus.push}
                onChange={() => handleChange('orderStatus', 'push')}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 px-6 py-5 items-center">
            <div className="col-span-1">
              <p className="font-medium text-gray-900">Delivery Updates</p>
              <p className="text-xs text-gray-500 mt-1">
                When drivers are out for delivery
              </p>
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.deliveryUpdates.email}
                onChange={() => handleChange('deliveryUpdates', 'email')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.deliveryUpdates.sms}
                onChange={() => handleChange('deliveryUpdates', 'sms')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.deliveryUpdates.push}
                onChange={() => handleChange('deliveryUpdates', 'push')}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 px-6 py-5 items-center">
            <div className="col-span-1">
              <p className="font-medium text-gray-900">Invoices & Payments</p>
              <p className="text-xs text-gray-500 mt-1">
                New invoices and payment confirmations
              </p>
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.invoices.email}
                onChange={() => handleChange('invoices', 'email')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.invoices.sms}
                onChange={() => handleChange('invoices', 'sms')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.invoices.push}
                onChange={() => handleChange('invoices', 'push')}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 px-6 py-5 items-center">
            <div className="col-span-1">
              <p className="font-medium text-gray-900">Promotions</p>
              <p className="text-xs text-gray-500 mt-1">
                Special offers and new products
              </p>
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.promotions.email}
                onChange={() => handleChange('promotions', 'email')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.promotions.sms}
                onChange={() => handleChange('promotions', 'sms')}
              />
            </div>
            <div className="col-span-1 text-center">
              <Switch
                checked={settings.promotions.push}
                onChange={() => handleChange('promotions', 'push')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
