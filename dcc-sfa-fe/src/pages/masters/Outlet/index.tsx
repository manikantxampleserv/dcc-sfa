import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye, Store, MapPin, Phone, Mail, DollarSign, MoreVertical, Users, Route, Calendar, CreditCard, TrendingUp } from 'lucide-react';

interface Outlet {
  id: number;
  name: string;
  code: string;
  type: 'distributor' | 'retailer' | 'wholesaler';
  contact_person: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number | null;
  longitude: number | null;
  credit_limit: number | null;
  outstanding_amount: number;
  route_id: number | null;
  salesperson_id: number | null;
  last_visit_date: string | null;
  is_active: string;
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  // Related data
  route_name?: string;
  salesperson_name?: string;
  zone_name?: string;
  depot_name?: string;
}

interface Route {
  id: number;
  name: string;
  code: string;
  zone_name: string;
  depot_name: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

export default function OutletsManagement() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const itemsPerPage = 10;

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock outlets data
    const mockOutlets: Outlet[] = [
      {
        id: 1,
        name: 'Metro Supermarket',
        code: 'OUT001',
        type: 'retailer',
        contact_person: 'John Smith',
        phone_number: '+1-555-0101',
        email: 'john@metrosupermarket.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
        latitude: 40.7128,
        longitude: -74.0060,
        credit_limit: 50000.00,
        outstanding_amount: 12500.00,
        route_id: 1,
        salesperson_id: 201,
        last_visit_date: '2024-01-20T14:30:00',
        is_active: 'Y',
        createdate: '2024-01-15T10:30:00',
        createdby: 1,
        route_name: 'Downtown Circuit',
        salesperson_name: 'Alex Johnson',
        zone_name: 'North Zone',
        depot_name: 'Main Depot - NYC'
      },
      {
        id: 2,
        name: 'City Wholesale Hub',
        code: 'OUT002',
        type: 'wholesaler',
        contact_person: 'Sarah Wilson',
        phone_number: '+1-555-0102',
        email: 'sarah@citywholesale.com',
        address: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        zipcode: '10002',
        latitude: 40.7589,
        longitude: -73.9851,
        credit_limit: 100000.00,
        outstanding_amount: 25000.00,
        route_id: 1,
        salesperson_id: 201,
        last_visit_date: '2024-01-18T11:15:00',
        is_active: 'Y',
        createdate: '2024-01-16T14:20:00',
        createdby: 1,
        route_name: 'Downtown Circuit',
        salesperson_name: 'Alex Johnson',
        zone_name: 'North Zone',
        depot_name: 'Main Depot - NYC'
      },
      {
        id: 3,
        name: 'Regional Distribution Center',
        code: 'OUT003',
        type: 'distributor',
        contact_person: 'Mike Davis',
        phone_number: '+1-555-0103',
        email: 'mike@regionaldist.com',
        address: '789 Industrial Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipcode: '90001',
        latitude: 34.0522,
        longitude: -118.2437,
        credit_limit: 200000.00,
        outstanding_amount: 45000.00,
        route_id: 4,
        salesperson_id: 203,
        last_visit_date: '2024-01-19T16:45:00',
        is_active: 'Y',
        createdate: '2024-01-17T09:15:00',
        createdby: 1,
        route_name: 'Coastal Highway',
        salesperson_name: 'David Wilson',
        zone_name: 'East Zone',
        depot_name: 'West Coast Depot - LA'
      },
      {
        id: 4,
        name: 'Corner Store Plus',
        code: 'OUT004',
        type: 'retailer',
        contact_person: 'Lisa Chen',
        phone_number: '+1-555-0104',
        email: 'lisa@cornerstoreplus.com',
        address: '321 Neighborhood St',
        city: 'Chicago',
        state: 'IL',
        zipcode: '60601',
        latitude: 41.8781,
        longitude: -87.6298,
        credit_limit: 25000.00,
        outstanding_amount: 5000.00,
        route_id: null,
        salesperson_id: null,
        last_visit_date: null,
        is_active: 'N',
        createdate: '2024-01-18T11:45:00',
        createdby: 1,
        route_name: null,
        salesperson_name: null,
        zone_name: null,
        depot_name: null
      }
    ];

    // Mock routes data
    const mockRoutes: Route[] = [
      { id: 1, name: 'Downtown Circuit', code: 'RT001', zone_name: 'North Zone', depot_name: 'Main Depot - NYC' },
      { id: 2, name: 'Suburban Loop', code: 'RT002', zone_name: 'North Zone', depot_name: 'Main Depot - NYC' },
      { id: 3, name: 'Industrial Route', code: 'RT003', zone_name: 'South Zone', depot_name: 'Main Depot - NYC' },
      { id: 4, name: 'Coastal Highway', code: 'RT004', zone_name: 'East Zone', depot_name: 'West Coast Depot - LA' }
    ];

    // Mock employees data
    const mockEmployees: Employee[] = [
      { id: 201, name: 'Alex Johnson', role: 'Sales Representative' },
      { id: 202, name: 'Maria Garcia', role: 'Sales Representative' },
      { id: 203, name: 'David Wilson', role: 'Sales Representative' },
      { id: 204, name: 'Lisa Chen', role: 'Sales Representative' },
      { id: 205, name: 'Robert Brown', role: 'Sales Representative' }
    ];

    setOutlets(mockOutlets);
    setRoutes(mockRoutes);
    setEmployees(mockEmployees);
  }, []);

  // Filter outlets based on search and filters
  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch = outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.route_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || outlet.is_active === (statusFilter === 'active' ? 'Y' : 'N');
    const matchesType = typeFilter === 'all' || outlet.type === typeFilter;
    const matchesRoute = routeFilter === 'all' || outlet.route_id?.toString() === routeFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesRoute;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOutlets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOutlets = filteredOutlets.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: outlets.length,
    active: outlets.filter(o => o.is_active === 'Y').length,
    inactive: outlets.filter(o => o.is_active === 'N').length,
    distributors: outlets.filter(o => o.type === 'distributor').length,
    retailers: outlets.filter(o => o.type === 'retailer').length,
    wholesalers: outlets.filter(o => o.type === 'wholesaler').length,
    totalCredit: outlets.reduce((sum, o) => sum + (o.credit_limit || 0), 0),
    totalOutstanding: outlets.reduce((sum, o) => sum + (o.outstanding_amount || 0), 0)
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedOutlet(null);
    setShowModal(true);
  };

  const handleEdit = (outlet: Outlet) => {
    setModalMode('edit');
    setSelectedOutlet(outlet);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleView = (outlet: Outlet) => {
    setModalMode('view');
    setSelectedOutlet(outlet);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleDelete = (outlet: Outlet) => {
    if (window.confirm(`Are you sure you want to delete outlet "${outlet.name}"?`)) {
      setOutlets(outlets.filter(o => o.id !== outlet.id));
    }
    setShowDropdown(null);
  };

  const handleToggleStatus = (outlet: Outlet) => {
    const updatedOutlets = outlets.map(o => 
      o.id === outlet.id 
        ? { ...o, is_active: o.is_active === 'Y' ? 'N' : 'Y', updatedate: new Date().toISOString(), updatedby: 1 }
        : o
    );
    setOutlets(updatedOutlets);
    setShowDropdown(null);
  };

  const handleSubmit = (formData: any) => {
    if (modalMode === 'create') {
      const selectedRoute = routes.find(r => r.id === formData.route_id);
      const selectedSalesperson = formData.salesperson_id ? employees.find(e => e.id === formData.salesperson_id) : null;
      
      const newOutlet: Outlet = {
        id: Math.max(...outlets.map(o => o.id)) + 1,
        ...formData,
        outstanding_amount: formData.outstanding_amount || 0,
        createdate: new Date().toISOString(),
        createdby: 1,
        route_name: selectedRoute?.name || null,
        salesperson_name: selectedSalesperson?.name || null,
        zone_name: selectedRoute?.zone_name || null,
        depot_name: selectedRoute?.depot_name || null
      };
      setOutlets([...outlets, newOutlet]);
    } else if (modalMode === 'edit' && selectedOutlet) {
      const selectedRoute = routes.find(r => r.id === formData.route_id);
      const selectedSalesperson = formData.salesperson_id ? employees.find(e => e.id === formData.salesperson_id) : null;
      
      const updatedOutlets = outlets.map(o => 
        o.id === selectedOutlet.id 
          ? { 
              ...o, 
              ...formData, 
              outstanding_amount: formData.outstanding_amount || 0,
              updatedate: new Date().toISOString(), 
              updatedby: 1,
              route_name: selectedRoute?.name || null,
              salesperson_name: selectedSalesperson?.name || null,
              zone_name: selectedRoute?.zone_name || null,
              depot_name: selectedRoute?.depot_name || null
            }
          : o
      );
      setOutlets(updatedOutlets);
    }
    setShowModal(false);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'distributor': return 'bg-purple-100 text-purple-800';
      case 'retailer': return 'bg-blue-100 text-blue-800';
      case 'wholesaler': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distributor': return <TrendingUp className="w-4 h-4" />;
      case 'retailer': return <Store className="w-4 h-4" />;
      case 'wholesaler': return <Users className="w-4 h-4" />;
      default: return <Store className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Outlets Management</h1>
        <p className="text-gray-600">Manage customer outlets, distributors, retailers, and wholesalers</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outlets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Outlets</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Store className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credit Limit</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalCredit)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Amount</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Type Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Distributors</p>
              <p className="text-3xl font-bold text-purple-600">{stats.distributors}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retailers</p>
              <p className="text-3xl font-bold text-blue-600">{stats.retailers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wholesalers</p>
              <p className="text-3xl font-bold text-green-600">{stats.wholesalers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search outlets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="distributor">Distributors</option>
              <option value="retailer">Retailers</option>
              <option value="wholesaler">Wholesalers</option>
            </select>

            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Routes</option>
              {routes.map(route => (
                <option key={route.id} value={route.id.toString()}>{route.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Outlet
            </button>
          </div>
        </div>
      </div>

      {/* Outlets Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route & Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOutlets.map((outlet) => (
                <tr key={outlet.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{outlet.name}</div>
                      <div className="text-sm text-gray-500">{outlet.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(outlet.type)}`}>
                          {getTypeIcon(outlet.type)}
                          <span className="ml-1 capitalize">{outlet.type}</span>
                        </span>
                      </div>
                      <div className="text-sm text-gray-900">{outlet.contact_person}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {outlet.phone_number}
                      </div>
                      {outlet.email && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="w-4 h-4 mr-1" />
                          {outlet.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {outlet.city}, {outlet.state}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">{outlet.zipcode}</div>
                      {outlet.latitude && outlet.longitude && (
                        <div className="text-gray-400 text-xs mt-1">
                          {outlet.latitude.toFixed(4)}, {outlet.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {outlet.route_name ? (
                      <div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Route className="w-4 h-4 text-gray-400 mr-2" />
                          {outlet.route_name}
                        </div>
                        {outlet.salesperson_name && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            {outlet.salesperson_name}
                          </div>
                        )}
                        {outlet.last_visit_date && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {new Date(outlet.last_visit_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        {formatCurrency(outlet.credit_limit)}
                      </div>
                      <div className="flex items-center text-red-600 mt-1">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        {formatCurrency(outlet.outstanding_amount)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      outlet.is_active === 'Y' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {outlet.is_active === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === outlet.id ? null : outlet.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showDropdown === outlet.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleView(outlet)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEdit(outlet)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(outlet)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Filter className="w-4 h-4 mr-2" />
                              {outlet.is_active === 'Y' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(outlet)}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOutlets.length)} of {filteredOutlets.length} outlets
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <OutletModal
          mode={modalMode}
          outlet={selectedOutlet}
          routes={routes}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// Outlet Modal Component
interface OutletModalProps {
  mode: 'create' | 'edit' | 'view';
  outlet: Outlet | null;
  routes: Route[];
  employees: Employee[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function OutletModal({ mode, outlet, routes, employees, onClose, onSubmit }: OutletModalProps) {
  const [formData, setFormData] = useState({
    name: outlet?.name || '',
    code: outlet?.code || '',
    type: outlet?.type || 'retailer',
    contact_person: outlet?.contact_person || '',
    phone_number: outlet?.phone_number || '',
    email: outlet?.email || '',
    address: outlet?.address || '',
    city: outlet?.city || '',
    state: outlet?.state || '',
    zipcode: outlet?.zipcode || '',
    latitude: outlet?.latitude || '',
    longitude: outlet?.longitude || '',
    credit_limit: outlet?.credit_limit || '',
    outstanding_amount: outlet?.outstanding_amount || '',
    route_id: outlet?.route_id || '',
    salesperson_id: outlet?.salesperson_id || '',
    last_visit_date: outlet?.last_visit_date ? outlet.last_visit_date.split('T')[0] : '',
    is_active: outlet?.is_active || 'Y'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit({
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude.toString()) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude.toString()) : null,
        credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit.toString()) : null,
        outstanding_amount: formData.outstanding_amount ? parseFloat(formData.outstanding_amount.toString()) : 0,
        route_id: formData.route_id ? parseInt(formData.route_id.toString()) : null,
        salesperson_id: formData.salesperson_id ? parseInt(formData.salesperson_id.toString()) : null,
        last_visit_date: formData.last_visit_date ? new Date(formData.last_visit_date).toISOString() : null
      });
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Outlet' : mode === 'edit' ? 'Edit Outlet' : 'Outlet Details'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outlet Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter outlet name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outlet Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter outlet code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'distributor' | 'retailer' | 'wholesaler' })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter email address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isReadOnly}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter state"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter zip code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter latitude"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.00000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter longitude"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Limit
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter credit limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outstanding Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.outstanding_amount}
                onChange={(e) => setFormData({ ...formData, outstanding_amount: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter outstanding amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <select
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Route</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.zone_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salesperson
              </label>
              <select
                value={formData.salesperson_id}
                onChange={(e) => setFormData({ ...formData, salesperson_id: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Salesperson</option>
                {employees.filter(emp => emp.role === 'Sales Representative').map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Visit Date
              </label>
              <input
                type="date"
                value={formData.last_visit_date}
                onChange={(e) => setFormData({ ...formData, last_visit_date: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="Y">Active</option>
                <option value="N">Inactive</option>
              </select>
            </div>
          </div>

          {mode === 'view' && outlet && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{new Date(outlet.createdate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created By:</span>
                  <span className="ml-2 text-gray-600">User ID: {outlet.createdby}</span>
                </div>
                {outlet.updatedate && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-gray-600">{new Date(outlet.updatedate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated By:</span>
                      <span className="ml-2 text-gray-600">User ID: {outlet.updatedby}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === 'create' ? 'Create Outlet' : 'Update Outlet'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}