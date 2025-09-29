import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye, Route, MapPin, Building, Users, MoreVertical, Clock, Navigation, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

interface Route {
  id: number;
  parent_id: number;
  depot_id: number;
  name: string;
  code: string;
  description: string;
  salesperson_id: number | null;
  start_location: string;
  end_location: string;
  estimated_distance: number | null;
  estimated_time: number | null;
  is_active: string;
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  // Related data
  zone_name?: string;
  depot_name?: string;
  company_name?: string;
  salesperson_name?: string;
}

interface Zone {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  depot_name: string;
}

interface Depot {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  company_name: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

export default function RoutesManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [salespersonFilter, setSalespersonFilter] = useState('all');

  const itemsPerPage = 10;

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock routes data
    const mockRoutes: Route[] = [
      {
        id: 1,
        parent_id: 1,
        depot_id: 1,
        name: 'Downtown Circuit',
        code: 'RT001',
        description: 'Main downtown business district route covering financial centers',
        salesperson_id: 201,
        start_location: 'Main Depot - 123 Business St',
        end_location: 'Financial District - 456 Wall St',
        estimated_distance: 15.5,
        estimated_time: 120,
        is_active: 'Y',
        createdate: '2024-01-15T08:30:00',
        createdby: 1,
        zone_name: 'North Zone',
        depot_name: 'Main Depot - NYC',
        company_name: 'TechCorp Inc.',
        salesperson_name: 'Alex Johnson'
      },
      {
        id: 2,
        parent_id: 1,
        depot_id: 1,
        name: 'Suburban Loop',
        code: 'RT002',
        description: 'Residential and suburban commercial areas',
        salesperson_id: 202,
        start_location: 'Main Depot - 123 Business St',
        end_location: 'Suburban Mall - 789 Mall Ave',
        estimated_distance: 22.3,
        estimated_time: 180,
        is_active: 'Y',
        createdate: '2024-01-16T09:15:00',
        createdby: 1,
        zone_name: 'North Zone',
        depot_name: 'Main Depot - NYC',
        company_name: 'TechCorp Inc.',
        salesperson_name: 'Maria Garcia'
      },
      {
        id: 3,
        parent_id: 2,
        depot_id: 1,
        name: 'Industrial Route',
        code: 'RT003',
        description: 'Manufacturing and warehouse districts',
        salesperson_id: null,
        start_location: 'Main Depot - 123 Business St',
        end_location: 'Industrial Park - 321 Factory Rd',
        estimated_distance: 18.7,
        estimated_time: 150,
        is_active: 'N',
        createdate: '2024-01-17T10:45:00',
        createdby: 1,
        zone_name: 'South Zone',
        depot_name: 'Main Depot - NYC',
        company_name: 'TechCorp Inc.',
        salesperson_name: ""
      },
      {
        id: 4,
        parent_id: 3,
        depot_id: 2,
        name: 'Coastal Highway',
        code: 'RT004',
        description: 'Coastal businesses and tourist areas',
        salesperson_id: 203,
        start_location: 'West Coast Depot - 555 Ocean Blvd',
        end_location: 'Pier District - 888 Seaside Ave',
        estimated_distance: 28.9,
        estimated_time: 210,
        is_active: 'Y',
        createdate: '2024-01-18T11:20:00',
        createdby: 1,
        zone_name: 'East Zone',
        depot_name: 'West Coast Depot - LA',
        company_name: 'TechCorp Inc.',
        salesperson_name: 'David Wilson'
      }
    ];

    // Mock zones data
    const mockZones: Zone[] = [
      { id: 1, parent_id: 1, name: 'North Zone', code: 'NZ001', depot_name: 'Main Depot - NYC' },
      { id: 2, parent_id: 1, name: 'South Zone', code: 'SZ001', depot_name: 'Main Depot - NYC' },
      { id: 3, parent_id: 2, name: 'East Zone', code: 'EZ001', depot_name: 'West Coast Depot - LA' },
      { id: 4, parent_id: 2, name: 'West Zone', code: 'WZ001', depot_name: 'West Coast Depot - LA' }
    ];

    // Mock depots data
    const mockDepots: Depot[] = [
      { id: 1, parent_id: 1, name: 'Main Depot - NYC', code: 'MD001', company_name: 'TechCorp Inc.' },
      { id: 2, parent_id: 1, name: 'West Coast Depot - LA', code: 'WCD001', company_name: 'TechCorp Inc.' },
      { id: 3, parent_id: 2, name: 'Central Hub - Chicago', code: 'CH001', company_name: 'Global Solutions Ltd.' }
    ];

    // Mock employees data
    const mockEmployees: Employee[] = [
      { id: 201, name: 'Alex Johnson', role: 'Sales Representative' },
      { id: 202, name: 'Maria Garcia', role: 'Sales Representative' },
      { id: 203, name: 'David Wilson', role: 'Sales Representative' },
      { id: 204, name: 'Lisa Chen', role: 'Sales Representative' },
      { id: 205, name: 'Robert Brown', role: 'Sales Representative' }
    ];

    setRoutes(mockRoutes);
    setZones(mockZones);
    setDepots(mockDepots);
    setEmployees(mockEmployees);
  }, []);

  // Get unique salespersons for filter
  const salespersons = [...new Set(routes.map(r => r.salesperson_name).filter(Boolean))];

  // Sorting function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // Filter routes based on search and filters
  let filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.zone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.depot_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.start_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.end_location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || route.is_active === (statusFilter === 'active' ? 'Y' : 'N');
    const matchesZone = zoneFilter === 'all' || route.parent_id.toString() === zoneFilter;
    const matchesDepot = depotFilter === 'all' || route.depot_id.toString() === depotFilter;
    const matchesSalesperson = salespersonFilter === 'all' || route.salesperson_name === salespersonFilter;
    
    return matchesSearch && matchesStatus && matchesZone && matchesDepot && matchesSalesperson;
  });

  // Apply sorting
  if (sortField) {
    filteredRoutes = [...filteredRoutes].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'code':
          aValue = a.code || '';
          bValue = b.code || '';
          break;
        case 'zone':
          aValue = a.zone_name || '';
          bValue = b.zone_name || '';
          break;
        case 'depot':
          aValue = a.depot_name || '';
          bValue = b.depot_name || '';
          break;
        case 'salesperson':
          aValue = a.salesperson_name || '';
          bValue = b.salesperson_name || '';
          break;
        case 'distance':
          aValue = a.estimated_distance || 0;
          bValue = b.estimated_distance || 0;
          break;
        case 'time':
          aValue = a.estimated_time || 0;
          bValue = b.estimated_time || 0;
          break;
        case 'status':
          aValue = a.is_active || '';
          bValue = b.is_active || '';
          break;
        case 'created':
          aValue = new Date(a.createdate);
          bValue = new Date(b.createdate);
          break;
        default:
          return 0;
      }

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoutes = filteredRoutes.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: routes.length,
    active: routes.filter(r => r.is_active === 'Y').length,
    inactive: routes.filter(r => r.is_active === 'N').length,
    assigned: routes.filter(r => r.salesperson_id !== null).length,
    totalDistance: routes.reduce((sum, r) => sum + (r.estimated_distance || 0), 0),
    avgTime: routes.length > 0 ? Math.round(routes.reduce((sum, r) => sum + (r.estimated_time || 0), 0) / routes.length) : 0
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedRoute(null);
    setShowModal(true);
  };

  const handleEdit = (route: Route) => {
    setModalMode('edit');
    setSelectedRoute(route);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleView = (route: Route) => {
    setModalMode('view');
    setSelectedRoute(route);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleDelete = (route: Route) => {
    if (window.confirm(`Are you sure you want to delete route "${route.name}"?`)) {
      setRoutes(routes.filter(r => r.id !== route.id));
    }
    setShowDropdown(null);
  };

  const handleToggleStatus = (route: Route) => {
    const updatedRoutes = routes.map(r => 
      r.id === route.id 
        ? { ...r, is_active: r.is_active === 'Y' ? 'N' : 'Y', updatedate: new Date().toISOString(), updatedby: 1 }
        : r
    );
    setRoutes(updatedRoutes);
    setShowDropdown(null);
  };

  const handleSubmit = (formData: any) => {
    if (modalMode === 'create') {
      const selectedZone = zones.find(z => z.id === formData.parent_id);
      const selectedDepot = depots.find(d => d.id === formData.depot_id);
      const selectedSalesperson = formData.salesperson_id ? employees.find(e => e.id === formData.salesperson_id) : null;
      
      const newRoute: Route = {
        id: Math.max(...routes.map(r => r.id)) + 1,
        ...formData,
        createdate: new Date().toISOString(),
        createdby: 1,
        zone_name: selectedZone?.name,
        depot_name: selectedDepot?.name,
        company_name: selectedDepot?.company_name,
        salesperson_name: selectedSalesperson?.name || null
      };
      setRoutes([...routes, newRoute]);
    } else if (modalMode === 'edit' && selectedRoute) {
      const selectedZone = zones.find(z => z.id === formData.parent_id);
      const selectedDepot = depots.find(d => d.id === formData.depot_id);
      const selectedSalesperson = formData.salesperson_id ? employees.find(e => e.id === formData.salesperson_id) : null;
      
      const updatedRoutes = routes.map(r => 
        r.id === selectedRoute.id 
          ? { 
              ...r, 
              ...formData, 
              updatedate: new Date().toISOString(), 
              updatedby: 1,
              zone_name: selectedZone?.name,
              depot_name: selectedDepot?.name,
              company_name: selectedDepot?.company_name,
              salesperson_name: selectedSalesperson?.name || null
            }
          : r
      );
      setRoutes(updatedRoutes);
    }
    setShowModal(false);
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Routes Management</h1>
        <p className="text-gray-600">Manage sales routes within zones and assign salespersons</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Route className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Route className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Routes</p>
              <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Route className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-3xl font-bold text-purple-600">{stats.assigned}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Distance</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalDistance.toFixed(1)}</p>
              <p className="text-xs text-gray-500">km</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Navigation className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Time</p>
              <p className="text-3xl font-bold text-teal-600">{stats.avgTime}</p>
              <p className="text-xs text-gray-500">minutes</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <Clock className="w-6 h-6 text-teal-600" />
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
                placeholder="Search routes..."
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
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Zones</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id.toString()}>{zone.name}</option>
              ))}
            </select>

            <select
              value={depotFilter}
              onChange={(e) => setDepotFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Depots</option>
              {depots.map(depot => (
                <option key={depot.id} value={depot.id.toString()}>{depot.name}</option>
              ))}
            </select>

            <select
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Salespersons</option>
              {salespersons.map(salesperson => (
                <option key={salesperson} value={salesperson}>{salesperson}</option>
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
              Add Route
            </button>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Route Info</span>
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('zone')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Zone & Depot</span>
                    <SortIcon field="zone" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('salesperson')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Salesperson</span>
                    <SortIcon field="salesperson" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locations</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('distance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Distance & Time</span>
                    <SortIcon field="distance" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{route.name}</div>
                      <div className="text-sm text-gray-500">{route.code}</div>
                      {route.description && (
                        <div className="text-xs text-gray-400 max-w-xs truncate mt-1" title={route.description}>
                          {route.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {route.zone_name}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        {route.depot_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {route.salesperson_name ? (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{route.salesperson_name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">From:</div>
                      <div className="text-gray-600 text-xs mb-2 max-w-xs truncate" title={route.start_location}>
                        {route.start_location}
                      </div>
                      <div className="text-gray-900 font-medium">To:</div>
                      <div className="text-gray-600 text-xs max-w-xs truncate" title={route.end_location}>
                        {route.end_location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <Navigation className="w-4 h-4 text-gray-400 mr-2" />
                        {route.estimated_distance ? `${route.estimated_distance} km` : 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {formatTime(route.estimated_time)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      route.is_active === 'Y' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {route.is_active === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === route.id ? null : route.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showDropdown === route.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleView(route)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEdit(route)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(route)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Filter className="w-4 h-4 mr-2" />
                              {route.is_active === 'Y' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(route)}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRoutes.length)} of {filteredRoutes.length} routes
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
        <RouteModal
          mode={modalMode}
          route={selectedRoute}
          zones={zones}
          depots={depots}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// Route Modal Component
interface RouteModalProps {
  mode: 'create' | 'edit' | 'view';
  route: Route | null;
  zones: Zone[];
  depots: Depot[];
  employees: Employee[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function RouteModal({ mode, route, zones, depots, employees, onClose, onSubmit }: RouteModalProps) {
  const [formData, setFormData] = useState({
    parent_id: route?.parent_id || '',
    depot_id: route?.depot_id || '',
    name: route?.name || '',
    code: route?.code || '',
    description: route?.description || '',
    salesperson_id: route?.salesperson_id || '',
    start_location: route?.start_location || '',
    end_location: route?.end_location || '',
    estimated_distance: route?.estimated_distance || '',
    estimated_time: route?.estimated_time || '',
    is_active: route?.is_active || 'Y'
  });

  // Filter zones based on selected depot
  const availableZones = zones.filter(zone => 
    !formData.depot_id || zone.parent_id.toString() === formData.depot_id.toString()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit({
        ...formData,
        parent_id: parseInt(formData.parent_id.toString()),
        depot_id: parseInt(formData.depot_id.toString()),
        salesperson_id: formData.salesperson_id ? parseInt(formData.salesperson_id.toString()) : null,
        estimated_distance: formData.estimated_distance ? parseFloat(formData.estimated_distance.toString()) : null,
        estimated_time: formData.estimated_time ? parseInt(formData.estimated_time.toString()) : null
      });
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Route' : mode === 'edit' ? 'Edit Route' : 'Route Details'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depot <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.depot_id}
                onChange={(e) => setFormData({ ...formData, depot_id: e.target.value, parent_id: '' })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Depot</option>
                {depots.map(depot => (
                  <option key={depot.id} value={depot.id}>
                    {depot.name} ({depot.company_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                disabled={isReadOnly || !formData.depot_id}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Zone</option>
                {availableZones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter route name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter route code"
              />
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter route description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Location
              </label>
              <input
                type="text"
                value={formData.start_location}
                onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter start location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Location
              </label>
              <input
                type="text"
                value={formData.end_location}
                onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter end location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.estimated_distance}
                onChange={(e) => setFormData({ ...formData, estimated_distance: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter distance in km"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimated_time}
                onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter time in minutes"
              />
            </div>
          </div>

          {mode === 'view' && route && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{new Date(route.createdate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created By:</span>
                  <span className="ml-2 text-gray-600">User ID: {route.createdby}</span>
                </div>
                {route.updatedate && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-gray-600">{new Date(route.updatedate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated By:</span>
                      <span className="ml-2 text-gray-600">User ID: {route.updatedby}</span>
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
                {mode === 'create' ? 'Create Route' : 'Update Route'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}