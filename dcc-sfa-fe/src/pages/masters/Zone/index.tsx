import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye, MapPin, Building, Users, MoreVertical } from 'lucide-react';

interface Zone {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  description: string;
  supervisor_id: number | null;
  is_active: string;
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  // Related data
  depot_name?: string;
  supervisor_name?: string;
}

interface Depot {
  id: number;
  name: string;
  code: string;
  company_name: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

export default function ZonesManagement() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const itemsPerPage = 10;

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock zones data
    const mockZones: Zone[] = [
      {
        id: 1,
        parent_id: 1,
        name: 'North Zone',
        code: 'NZ001',
        description: 'Northern region covering downtown and suburbs',
        supervisor_id: 101,
        is_active: 'Y',
        createdate: '2024-01-15T10:30:00',
        createdby: 1,
        depot_name: 'Main Depot - NYC',
        supervisor_name: 'John Smith'
      },
      {
        id: 2,
        parent_id: 1,
        name: 'South Zone',
        code: 'SZ001',
        description: 'Southern region including industrial areas',
        supervisor_id: 102,
        is_active: 'Y',
        createdate: '2024-01-16T14:20:00',
        createdby: 1,
        depot_name: 'Main Depot - NYC',
        supervisor_name: 'Sarah Johnson'
      },
      {
        id: 3,
        parent_id: 2,
        name: 'East Zone',
        code: 'EZ001',
        description: 'Eastern commercial district',
        supervisor_id: null,
        is_active: 'N',
        createdate: '2024-01-17T09:15:00',
        createdby: 1,
        depot_name: 'West Coast Depot - LA',
        supervisor_name: ""
      },
      {
        id: 4,
        parent_id: 2,
        name: 'West Zone',
        code: 'WZ001',
        description: 'Western residential and business areas',
        supervisor_id: 103,
        is_active: 'Y',
        createdate: '2024-01-18T11:45:00',
        createdby: 1,
        depot_name: 'West Coast Depot - LA',
        supervisor_name: 'Mike Davis'
      }
    ];

    // Mock depots data
    const mockDepots: Depot[] = [
      { id: 1, name: 'Main Depot - NYC', code: 'MD001', company_name: 'TechCorp Inc.' },
      { id: 2, name: 'West Coast Depot - LA', code: 'WCD001', company_name: 'TechCorp Inc.' },
      { id: 3, name: 'Central Hub - Chicago', code: 'CH001', company_name: 'Global Solutions Ltd.' }
    ];

    // Mock employees data
    const mockEmployees: Employee[] = [
      { id: 101, name: 'John Smith', role: 'Zone Supervisor' },
      { id: 102, name: 'Sarah Johnson', role: 'Zone Supervisor' },
      { id: 103, name: 'Mike Davis', role: 'Zone Supervisor' },
      { id: 104, name: 'Emily Brown', role: 'Zone Supervisor' }
    ];

    setZones(mockZones);
    setDepots(mockDepots);
    setEmployees(mockEmployees);
  }, []);

  // Filter zones based on search and filters
  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.depot_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || zone.is_active === (statusFilter === 'active' ? 'Y' : 'N');
    const matchesDepot = depotFilter === 'all' || zone.parent_id.toString() === depotFilter;
    
    return matchesSearch && matchesStatus && matchesDepot;
  });

  // Pagination
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedZones = filteredZones.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: zones.length,
    active: zones.filter(z => z.is_active === 'Y').length,
    inactive: zones.filter(z => z.is_active === 'N').length,
    depots: new Set(zones.map(z => z.parent_id)).size
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedZone(null);
    setShowModal(true);
  };

  const handleEdit = (zone: Zone) => {
    setModalMode('edit');
    setSelectedZone(zone);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleView = (zone: Zone) => {
    setModalMode('view');
    setSelectedZone(zone);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleDelete = (zone: Zone) => {
    if (window.confirm(`Are you sure you want to delete zone "${zone.name}"?`)) {
      setZones(zones.filter(z => z.id !== zone.id));
    }
    setShowDropdown(null);
  };

  const handleToggleStatus = (zone: Zone) => {
    const updatedZones = zones.map(z => 
      z.id === zone.id 
        ? { ...z, is_active: z.is_active === 'Y' ? 'N' : 'Y', updatedate: new Date().toISOString(), updatedby: 1 }
        : z
    );
    setZones(updatedZones);
    setShowDropdown(null);
  };

  const handleSubmit = (formData: any) => {
    if (modalMode === 'create') {
      const newZone: Zone = {
        id: Math.max(...zones.map(z => z.id)) + 1,
        ...formData,
        createdate: new Date().toISOString(),
        createdby: 1,
        depot_name: depots.find(d => d.id === formData.parent_id)?.name,
        supervisor_name: formData.supervisor_id ? employees.find(e => e.id === formData.supervisor_id)?.name : null
      };
      setZones([...zones, newZone]);
    } else if (modalMode === 'edit' && selectedZone) {
      const updatedZones = zones.map(z => 
        z.id === selectedZone.id 
          ? { 
              ...z, 
              ...formData, 
              updatedate: new Date().toISOString(), 
              updatedby: 1,
              depot_name: depots.find(d => d.id === formData.parent_id)?.name,
              supervisor_name: formData.supervisor_id ? employees.find(e => e.id === formData.supervisor_id)?.name : null
            }
          : z
      );
      setZones(updatedZones);
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Zones Management</h1>
        <p className="text-gray-600">Manage zones within depots and assign supervisors</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Zones</p>
              <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Depots</p>
              <p className="text-3xl font-bold text-purple-600">{stats.depots}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Building className="w-6 h-6 text-purple-600" />
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
                placeholder="Search zones..."
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
              value={depotFilter}
              onChange={(e) => setDepotFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Depots</option>
              {depots.map(depot => (
                <option key={depot.id} value={depot.id.toString()}>{depot.name}</option>
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
              Add Zone
            </button>
          </div>
        </div>
      </div>

      {/* Zones Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                      <div className="text-sm text-gray-500">{zone.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{zone.depot_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {zone.supervisor_name ? (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{zone.supervisor_name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={zone.description}>
                      {zone.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      zone.is_active === 'Y' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {zone.is_active === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(zone.createdate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === zone.id ? null : zone.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showDropdown === zone.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleView(zone)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEdit(zone)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(zone)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Filter className="w-4 h-4 mr-2" />
                              {zone.is_active === 'Y' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(zone)}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredZones.length)} of {filteredZones.length} zones
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
        <ZoneModal
          mode={modalMode}
          zone={selectedZone}
          depots={depots}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// Zone Modal Component
interface ZoneModalProps {
  mode: 'create' | 'edit' | 'view';
  zone: Zone | null;
  depots: Depot[];
  employees: Employee[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function ZoneModal({ mode, zone, depots, employees, onClose, onSubmit }: ZoneModalProps) {
  const [formData, setFormData] = useState({
    parent_id: zone?.parent_id || '',
    name: zone?.name || '',
    code: zone?.code || '',
    description: zone?.description || '',
    supervisor_id: zone?.supervisor_id || '',
    is_active: zone?.is_active || 'Y'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit({
        ...formData,
        parent_id: parseInt(formData.parent_id.toString()),
        supervisor_id: formData.supervisor_id ? parseInt(formData.supervisor_id.toString()) : null
      });
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Zone' : mode === 'edit' ? 'Edit Zone' : 'Zone Details'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depot <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
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
                Zone Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter zone name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter zone code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supervisor
              </label>
              <select
                value={formData.supervisor_id}
                onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Supervisor</option>
                {employees.filter(emp => emp.role === 'Zone Supervisor').map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
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
                placeholder="Enter zone description"
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

          {mode === 'view' && zone && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{new Date(zone.createdate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created By:</span>
                  <span className="ml-2 text-gray-600">User ID: {zone.createdby}</span>
                </div>
                {zone.updatedate && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-gray-600">{new Date(zone.updatedate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated By:</span>
                      <span className="ml-2 text-gray-600">User ID: {zone.updatedby}</span>
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
                {mode === 'create' ? 'Create Zone' : 'Update Zone'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}