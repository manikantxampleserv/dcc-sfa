import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Building, Phone, Mail, Hash, MapPin, Tag, AlertTriangle } from 'lucide-react';
import { TextField } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import Button from 'shared/Button';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your account details and contact info
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-white rounded-xl shadow-md p-1">
              <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-2xl">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              {!isEditing ? (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <div className="mt-1 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Full Name
                  </p>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {user.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Contact IT support to change email
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Phone Number
                  </p>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      value={formData.phone}
                      onChange={e =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-gray-400">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Company Name
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {user.company}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-gray-400">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    SAP Code
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {user.sapCode}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-gray-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Customer Type
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    Stockist
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Secondary (Delivery) Route
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    Arusha Central Route
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Business Rule Banner */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Van Sales Blocked</p>
              <p className="text-sm text-amber-700 mt-1">
                As a Stockist or Credit Customer, your account is restricted to the Indent Sales channel. Van sales and direct-slip purchasing are not permitted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
