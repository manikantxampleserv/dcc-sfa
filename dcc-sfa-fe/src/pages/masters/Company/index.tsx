import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Download,
  Upload,
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  logo?: string;
  is_active: 'Y' | 'N';
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
}

const CompaniesManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
    'create'
  );
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCompanies: Company[] = [
      {
        id: 1,
        name: 'TechCorp Solutions',
        code: 'TECH001',
        address: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'California',
        country: 'USA',
        zipcode: '94105',
        phone_number: '+1-555-0123',
        email: 'contact@techcorp.com',
        website: 'https://techcorp.com',
        logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        is_active: 'Y',
        createdate: '2024-01-15T10:30:00',
        createdby: 1,
        updatedate: '2024-01-20T14:45:00',
        updatedby: 1,
        log_inst: 1,
      },
      {
        id: 2,
        name: 'Global Manufacturing Inc',
        code: 'GLOB002',
        address: '456 Industrial Blvd',
        city: 'Detroit',
        state: 'Michigan',
        country: 'USA',
        zipcode: '48201',
        phone_number: '+1-555-0456',
        email: 'info@globalmanuf.com',
        website: 'https://globalmanuf.com',
        logo: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        is_active: 'Y',
        createdate: '2024-01-10T09:15:00',
        createdby: 2,
        log_inst: 2,
      },
      {
        id: 3,
        name: 'Retail Express Ltd',
        code: 'RET003',
        address: '789 Commerce Street',
        city: 'New York',
        state: 'New York',
        country: 'USA',
        zipcode: '10001',
        phone_number: '+1-555-0789',
        email: 'support@retailexpress.com',
        website: 'https://retailexpress.com',
        is_active: 'N',
        createdate: '2024-01-05T16:20:00',
        createdby: 1,
        updatedate: '2024-01-25T11:30:00',
        updatedby: 2,
        log_inst: 3,
      },
    ];
    setCompanies(mockCompanies);
    setFilteredCompanies(mockCompanies);
  }, []);

  // Filter companies based on search and status
  useEffect(() => {
    let filtered = companies.filter(company => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && company.is_active === 'Y') ||
        (statusFilter === 'inactive' && company.is_active === 'N');

      return matchesSearch && matchesStatus;
    });

    setFilteredCompanies(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, companies]);

  const handleCreateCompany = () => {
    setModalMode('create');
    setSelectedCompany(null);
    setShowModal(true);
  };

  const handleEditCompany = (company: Company) => {
    setModalMode('edit');
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleViewCompany = (company: Company) => {
    setModalMode('view');
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleDeleteCompany = (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setCompanies(
      companies.map(c =>
        c.id === id ? { ...c, is_active: c.is_active === 'Y' ? 'N' : 'Y' } : c
      )
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Companies Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your company database and organizational structure
            </p>
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
              onClick={handleCreateCompany}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies by name, code, email, or city..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e =>
                  setStatusFilter(
                    e.target.value as 'all' | 'active' | 'inactive'
                  )
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Companies
              </p>
              <p className="text-2xl font-bold text-green-600">
                {companies.filter(c => c.is_active === 'Y').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Companies
              </p>
              <p className="text-2xl font-bold text-red-600">
                {companies.filter(c => c.is_active === 'N').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(companies.map(c => c.country).filter(Boolean)).size}
              </p>
            </div>
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCompanies.map(company => (
                <tr
                  key={company.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {company.logo ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={company.logo}
                          alt={company.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        {company.website && (
                          <div className="text-sm text-blue-600 hover:text-blue-800">
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {company.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      {company.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">{company.email}</span>
                        </div>
                      )}
                      {company.phone_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">
                            {company.phone_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs">
                        {[company.city, company.state, company.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(company.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        company.is_active === 'Y'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {company.is_active === 'Y' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(company.createdate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewCompany(company)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit Company"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(endIndex, filteredCompanies.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">
                    {filteredCompanies.length}
                  </span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
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
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <CompanyModal
          mode={modalMode}
          company={selectedCompany}
          onClose={() => setShowModal(false)}
          onSave={company => {
            if (modalMode === 'create') {
              const newCompany = {
                ...company,
                id: Math.max(...companies.map(c => c.id)) + 1,
                createdate: new Date().toISOString(),
                createdby: 1, // Current user ID
                log_inst: Math.max(...companies.map(c => c.log_inst || 0)) + 1,
              };
              setCompanies([...companies, newCompany]);
            } else if (modalMode === 'edit') {
              setCompanies(
                companies.map(c =>
                  c.id === company.id
                    ? {
                        ...company,
                        updatedate: new Date().toISOString(),
                        updatedby: 1,
                      }
                    : c
                )
              );
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

// Company Modal Component
interface CompanyModalProps {
  mode: 'create' | 'edit' | 'view';
  company: Company | null;
  onClose: () => void;
  onSave: (company: Company) => void;
}

const CompanyModal: React.FC<CompanyModalProps> = ({
  mode,
  company,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    phone_number: '',
    email: '',
    website: '',
    logo: '',
    is_active: 'Y',
    ...company,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSave(formData as Company);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' && 'Add New Company'}
            {mode === 'edit' && 'Edit Company'}
            {mode === 'view' && 'Company Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                readOnly={isReadOnly}
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Code *
              </label>
              <input
                type="text"
                required
                readOnly={isReadOnly}
                value={formData.code}
                onChange={e =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                readOnly={isReadOnly}
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.city}
                onChange={e =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.state}
                onChange={e =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.country}
                onChange={e =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.zipcode}
                onChange={e =>
                  setFormData({ ...formData, zipcode: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                readOnly={isReadOnly}
                value={formData.phone_number}
                onChange={e =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                readOnly={isReadOnly}
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                readOnly={isReadOnly}
                value={formData.website}
                onChange={e =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                readOnly={isReadOnly}
                value={formData.logo}
                onChange={e =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                disabled={isReadOnly}
                value={formData.is_active}
                onChange={e =>
                  setFormData({
                    ...formData,
                    is_active: e.target.value as 'Y' | 'N',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              >
                <option value="Y">Active</option>
                <option value="N">Inactive</option>
              </select>
            </div>
          </div>

          {mode === 'view' && company && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                System Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(company.createdate).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Created By:</span>
                  <span className="ml-2 text-gray-900">
                    User {company.createdby}
                  </span>
                </div>
                {company.updatedate && (
                  <>
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(company.updatedate).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated By:</span>
                      <span className="ml-2 text-gray-900">
                        User {company.updatedby}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {mode === 'create' ? 'Create Company' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompaniesManagement;
