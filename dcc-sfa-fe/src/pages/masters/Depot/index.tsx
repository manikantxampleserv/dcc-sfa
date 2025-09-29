import {
  Building,
  Building2,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  UserCheck,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Depot {
  id: number;
  parent_id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone_number: string;
  email: string;
  manager_id: number | null;
  supervisor_id: number | null;
  coordinator_id: number | null;
  latitude: number | null;
  longitude: number | null;
  is_active: 'Y' | 'N';
  createdate: string;
  createdby: number;
  updatedate: string | null;
  updatedby: number | null;
  log_inst: number | null;
  company_name?: string;
  manager_name?: string;
  supervisor_name?: string;
  coordinator_name?: string;
}

interface Company {
  id: number;
  name: string;
  code: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

const DepotsManagement: React.FC = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredDepots, setFilteredDepots] = useState<Depot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    parent_id: '',
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    phone_number: '',
    email: '',
    manager_id: '',
    supervisor_id: '',
    coordinator_id: '',
    latitude: '',
    longitude: '',
    is_active: 'Y' as 'Y' | 'N'
  });

  useEffect(() => {
    const mockCompanies: Company[] = [
      { id: 1, name: 'TechCorp Solutions', code: 'TECH001' },
      { id: 2, name: 'Global Industries', code: 'GLOB002' },
      { id: 3, name: 'Innovation Labs', code: 'INNO003' },
      { id: 4, name: 'Future Systems', code: 'FUTU004' }
    ];

    const mockEmployees: Employee[] = [
      { id: 1, name: 'John Smith', role: 'Manager' },
      { id: 2, name: 'Sarah Johnson', role: 'Supervisor' },
      { id: 3, name: 'Mike Davis', role: 'Coordinator' },
      { id: 4, name: 'Lisa Wilson', role: 'Manager' },
      { id: 5, name: 'David Brown', role: 'Supervisor' },
      { id: 6, name: 'Emma Taylor', role: 'Coordinator' }
    ];

    const mockDepots: Depot[] = [
      {
        id: 1,
        parent_id: 1,
        name: 'North Regional Depot',
        code: 'NRD001',
        address: '123 Industrial Blvd',
        city: 'Chicago',
        state: 'Illinois',
        zipcode: '60601',
        phone_number: '+1-312-555-0101',
        email: 'north@techcorp.com',
        manager_id: 1,
        supervisor_id: 2,
        coordinator_id: 3,
        latitude: 41.8781,
        longitude: -87.6298,
        is_active: 'Y',
        createdate: '2024-01-15T10:30:00',
        createdby: 1,
        updatedate: '2024-01-20T14:15:00',
        updatedby: 1,
        log_inst: 1,
        company_name: 'TechCorp Solutions',
        manager_name: 'John Smith',
        supervisor_name: 'Sarah Johnson',
        coordinator_name: 'Mike Davis'
      },
      {
        id: 2,
        parent_id: 2,
        name: 'South Distribution Center',
        code: 'SDC002',
        address: '456 Commerce Way',
        city: 'Atlanta',
        state: 'Georgia',
        zipcode: '30309',
        phone_number: '+1-404-555-0202',
        email: 'south@global.com',
        manager_id: 4,
        supervisor_id: 5,
        coordinator_id: 6,
        latitude: 33.7490,
        longitude: -84.3880,
        is_active: 'Y',
        createdate: '2024-01-10T09:00:00',
        createdby: 2,
        updatedate: null,
        updatedby: null,
        log_inst: 2,
        company_name: 'Global Industries',
        manager_name: 'Lisa Wilson',
        supervisor_name: 'David Brown',
        coordinator_name: 'Emma Taylor'
      },
      {
        id: 3,
        parent_id: 1,
        name: 'West Coast Hub',
        code: 'WCH003',
        address: '789 Pacific Ave',
        city: 'Los Angeles',
        state: 'California',
        zipcode: '90210',
        phone_number: '+1-213-555-0303',
        email: 'west@techcorp.com',
        manager_id: 1,
        supervisor_id: null,
        coordinator_id: null,
        latitude: 34.0522,
        longitude: -118.2437,
        is_active: 'N',
        createdate: '2024-01-05T16:45:00',
        createdby: 1, 
        updatedate: '2024-01-25T11:30:00',
        updatedby: 3,
        log_inst: 3,
        company_name: 'TechCorp Solutions',
        manager_name: 'John Smith',

      }
    ];

    setCompanies(mockCompanies);
    setEmployees(mockEmployees);
    setDepots(mockDepots);
    setFilteredDepots(mockDepots);
  }, []);

  useEffect(() => {
    let filtered = depots.filter(depot => {
      const matchesSearch = 
        depot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        depot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        depot.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        depot.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (depot.company_name && depot.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && depot.is_active === 'Y') ||
        (statusFilter === 'inactive' && depot.is_active === 'N');

      const matchesCompany = companyFilter === 'all' || 
        depot.parent_id.toString() === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });

    setFilteredDepots(filtered);
    setCurrentPage(1);
  }, [depots, searchTerm, statusFilter, companyFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      parent_id: '',
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      phone_number: '',
      email: '',
      manager_id: '',
      supervisor_id: '',
      coordinator_id: '',
      latitude: '',
      longitude: '',
      is_active: 'Y'
    });
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedDepot(null);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (depot: Depot) => {
    setModalMode('edit');
    setSelectedDepot(depot);
    setFormData({
      parent_id: depot.parent_id.toString(),
      name: depot.name,
      code: depot.code,
      address: depot.address,
      city: depot.city,
      state: depot.state,
      zipcode: depot.zipcode,
      phone_number: depot.phone_number,
      email: depot.email,
      manager_id: depot.manager_id?.toString() || '',
      supervisor_id: depot.supervisor_id?.toString() || '',
      coordinator_id: depot.coordinator_id?.toString() || '',
      latitude: depot.latitude?.toString() || '',
      longitude: depot.longitude?.toString() || '',
      is_active: depot.is_active
    });
    setShowModal(true);
  };

  const handleView = (depot: Depot) => {
    setModalMode('view');
    setSelectedDepot(depot);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to save the data
    console.log('Form submitted:', formData);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this depot?')) {
      setDepots(prev => prev.filter(depot => depot.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setDepots(prev => prev.map(depot => 
      depot.id === id 
        ? { ...depot, is_active: depot.is_active === 'Y' ? 'N' : 'Y' }
        : depot
    ));
  };

  // Pagination
  const totalPages = Math.ceil(filteredDepots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepots = filteredDepots.slice(startIndex, endIndex);

  // Statistics
  const totalDepots = depots.length;
  const activeDepots = depots.filter(d => d.is_active === 'Y').length;
  const inactiveDepots = depots.filter(d => d.is_active === 'N').length;
  const uniqueCompanies = new Set(depots.map(d => d.parent_id)).size;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                Depots Management
              </h1>
              <p className="text-gray-600 mt-2">Manage warehouse and distribution centers</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button 
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Depot
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Depots</p>
                <p className="text-2xl font-bold text-gray-900">{totalDepots}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Depots</p>
                <p className="text-2xl font-bold text-green-600">{activeDepots}</p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Depots</p>
                <p className="text-2xl font-bold text-red-600">{inactiveDepots}</p>
              </div>
              <Building className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-purple-600">{uniqueCompanies}</p>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search depots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id.toString()}>
                  {company.name}
                </option>
              ))}
            </select>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Depots Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Depot Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDepots.map((depot) => (
                  <tr key={depot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{depot.name}</div>
                        <div className="text-sm text-gray-500">{depot.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{depot.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{depot.city}, {depot.state}</div>
                      <div className="text-sm text-gray-500">{depot.zipcode}</div>
                      {depot.latitude && depot.longitude && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <MapPin className="w-3 h-3" />
                          {depot.latitude.toFixed(4)}, {depot.longitude.toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {depot.manager_name && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <User className="w-3 h-3" />
                            M: {depot.manager_name}
                          </div>
                        )}
                        {depot.supervisor_name && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            S: {depot.supervisor_name}
                          </div>
                        )}
                        {depot.coordinator_name && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <UserCheck className="w-3 h-3" />
                            C: {depot.coordinator_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {depot.phone_number}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {depot.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(depot.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          depot.is_active === 'Y'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {depot.is_active === 'Y' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(depot)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(depot)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(depot.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredDepots.length)}</span> of{' '}
                  <span className="font-medium">{filteredDepots.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' && 'Add New Depot'}
                  {modalMode === 'edit' && 'Edit Depot'}
                  {modalMode === 'view' && 'Depot Details'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {modalMode === 'view' && selectedDepot ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Depot Name</label>
                        <p className="text-gray-900">{selectedDepot.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Code</label>
                        <p className="text-gray-900">{selectedDepot.code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Company</label>
                        <p className="text-gray-900">{selectedDepot.company_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedDepot.is_active === 'Y'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedDepot.is_active === 'Y' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-gray-900">{selectedDepot.address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">City, State</label>
                        <p className="text-gray-900">{selectedDepot.city}, {selectedDepot.state}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Zip Code</label>
                        <p className="text-gray-900">{selectedDepot.zipcode}</p>
                      </div>
                      {selectedDepot.latitude && selectedDepot.longitude && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Coordinates</label>
                          <p className="text-gray-900 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            {selectedDepot.latitude.toFixed(6)}, {selectedDepot.longitude.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{selectedDepot.phone_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{selectedDepot.email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Staff</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Manager</label>
                        <p className="text-gray-900">{selectedDepot.manager_name || 'Not assigned'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Supervisor</label>
                        <p className="text-gray-900">{selectedDepot.supervisor_name || 'Not assigned'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Coordinator</label>
                        <p className="text-gray-900">{selectedDepot.coordinator_name || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created Date</label>
                        <p className="text-gray-900">{new Date(selectedDepot.createdate).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created By</label>
                        <p className="text-gray-900">User ID: {selectedDepot.createdby}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {selectedDepot.updatedate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Updated</label>
                          <p className="text-gray-900">{new Date(selectedDepot.updatedate).toLocaleString()}</p>
                        </div>
                      )}
                      {selectedDepot.updatedby && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Updated By</label>
                          <p className="text-gray-900">User ID: {selectedDepot.updatedby}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <select
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name} ({company.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Depot Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter depot name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter depot code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="is_active"
                      value={formData.is_active}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Y">Active</option>
                      <option value="N">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manager
                    </label>
                    <select
                      name="manager_id"
                      value={formData.manager_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Manager</option>
                      {employees.filter(emp => emp.role === 'Manager').map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supervisor
                    </label>
                    <select
                      name="supervisor_id"
                      value={formData.supervisor_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Supervisor</option>
                      {employees.filter(emp => emp.role === 'Supervisor').map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coordinator
                    </label>
                    <select
                      name="coordinator_id"
                      value={formData.coordinator_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Coordinator</option>
                      {employees.filter(emp => emp.role === 'Coordinator').map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter latitude"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter longitude"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {modalMode === 'create' ? 'Create Depot' : 'Update Depot'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepotsManagement;