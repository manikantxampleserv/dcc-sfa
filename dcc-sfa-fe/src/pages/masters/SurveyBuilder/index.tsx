import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye, FileText, Users, Calendar, BarChart3, Camera, Clock, CheckCircle, XCircle, MoreVertical, Settings, Copy, Play, Pause, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface Survey {
  id: number;
  title: string;
  description: string;
  category: 'cooler_inspection' | 'customer_feedback' | 'outlet_audit' | 'competitor_analysis' | 'brand_visibility' | 'general';
  target_roles: string;
  is_published: number; // BIT field (0 or 1)
  published_at: string | null;
  expires_at: string | null;
  response_count: number;
  is_active: string;
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
}

interface SurveyField {
  id: number;
  parent_id: number;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'photo' | 'signature';
  options: string;
  is_required: number; // BIT field (0 or 1)
  sort_order: number;
}

export default function SurveyBuilder() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'builder'>('create');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [surveyFields, setSurveyFields] = useState<SurveyField[]>([]);

  const itemsPerPage = 10;

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockSurveys: Survey[] = [
      {
        id: 1,
        title: 'Monthly Cooler Inspection',
        description: 'Comprehensive inspection of cooler units and refrigeration systems',
        category: 'cooler_inspection',
        target_roles: 'Sales Representative,Field Supervisor',
        is_published: 1,
        published_at: '2024-01-15T10:30:00',
        expires_at: '2024-03-15T23:59:59',
        response_count: 45,
        is_active: 'Y',
        createdate: '2024-01-15T10:30:00',
        createdby: 1
      },
      {
        id: 2,
        title: 'Customer Satisfaction Survey',
        description: 'Quarterly customer feedback collection for service improvement',
        category: 'customer_feedback',
        target_roles: 'Sales Representative',
        is_published: 1,
        published_at: '2024-01-20T09:00:00',
        expires_at: '2024-04-20T23:59:59',
        response_count: 128,
        is_active: 'Y',
        createdate: '2024-01-20T09:00:00',
        createdby: 1
      },
      {
        id: 3,
        title: 'Outlet Compliance Audit',
        description: 'Comprehensive audit of outlet compliance with brand standards',
        category: 'outlet_audit',
        target_roles: 'Field Supervisor,Area Manager',
        is_published: 0,
        published_at: null,
        expires_at: null,
        response_count: 0,
        is_active: 'Y',
        createdate: '2024-01-25T14:15:00',
        createdby: 1
      }
    ];

    setSurveys(mockSurveys);
  }, []);

  // Filter surveys based on search and filters
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && survey.is_published === 1) ||
                         (statusFilter === 'draft' && survey.is_published === 0) ||
                         (statusFilter === 'active' && survey.is_active === 'Y') ||
                         (statusFilter === 'inactive' && survey.is_active === 'N');
    
    const matchesCategory = categoryFilter === 'all' || survey.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: surveys.length,
    published: surveys.filter(s => s.is_published === 1).length,
    draft: surveys.filter(s => s.is_published === 0).length,
    active: surveys.filter(s => s.is_active === 'Y').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.response_count, 0),
    categories: new Set(surveys.map(s => s.category)).size
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedSurvey(null);
    setShowModal(true);
  };

  const handleEdit = (survey: Survey) => {
    setModalMode('edit');
    setSelectedSurvey(survey);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleView = (survey: Survey) => {
    setModalMode('view');
    setSelectedSurvey(survey);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleBuilder = (survey: Survey) => {
    setModalMode('builder');
    setSelectedSurvey(survey);
    // Load survey fields for the selected survey
    loadSurveyFields(survey.id);
    setShowModal(true);
    setShowDropdown(null);
  };

  const loadSurveyFields = (surveyId: number) => {
    // Mock survey fields - in real app, fetch from API based on survey ID
    const mockFields: SurveyField[] = surveyId === 1 ? [
      {
        id: 1,
        parent_id: surveyId,
        label: 'Cooler Temperature',
        field_type: 'number',
        options: '',
        is_required: 1,
        sort_order: 1
      },
      {
        id: 2,
        parent_id: surveyId,
        label: 'Overall Condition',
        field_type: 'select',
        options: 'Excellent,Good,Fair,Poor',
        is_required: 1,
        sort_order: 2
      },
      {
        id: 3,
        parent_id: surveyId,
        label: 'Additional Comments',
        field_type: 'textarea',
        options: '',
        is_required: 0,
        sort_order: 3
      },
      {
        id: 4,
        parent_id: surveyId,
        label: 'Photo Evidence',
        field_type: 'photo',
        options: '',
        is_required: 0,
        sort_order: 4
      }
    ] : [];
    setSurveyFields(mockFields);
  };

  const handleDelete = (survey: Survey) => {
    if (window.confirm(`Are you sure you want to delete survey "${survey.title}"?`)) {
      setSurveys(surveys.filter(s => s.id !== survey.id));
    }
    setShowDropdown(null);
  };

  const handleToggleStatus = (survey: Survey) => {
    const updatedSurveys = surveys.map(s => 
      s.id === survey.id 
        ? { ...s, is_active: s.is_active === 'Y' ? 'N' : 'Y', updatedate: new Date().toISOString(), updatedby: 1 }
        : s
    );
    setSurveys(updatedSurveys);
    setShowDropdown(null);
  };

  const handlePublish = (survey: Survey) => {
    const updatedSurveys = surveys.map(s => 
      s.id === survey.id 
        ? { 
            ...s, 
            is_published: s.is_published === 1 ? 0 : 1, 
            published_at: s.is_published === 0 ? new Date().toISOString() : null,
            updatedate: new Date().toISOString(), 
            updatedby: 1 
          }
        : s
    );
    setSurveys(updatedSurveys);
    setShowDropdown(null);
  };

  const handleSaveSurveyFields = (surveyId: number, fields: SurveyField[]) => {
    // In real app, this would save to survey_fields table
    setSurveyFields(fields);
    console.log('Saving survey fields for survey', surveyId, fields);
  };
  const handleSubmit = (formData: any) => {
    if (modalMode === 'create') {
      const newSurvey: Survey = {
        id: Math.max(...surveys.map(s => s.id)) + 1,
        ...formData,
        is_published: 0,
        published_at: null,
        response_count: 0,
        createdate: new Date().toISOString(),
        createdby: 1
      };
      setSurveys([...surveys, newSurvey]);
    } else if (modalMode === 'edit' && selectedSurvey) {
      const updatedSurveys = surveys.map(s => 
        s.id === selectedSurvey.id 
          ? { 
              ...s, 
              ...formData, 
              updatedate: new Date().toISOString(), 
              updatedby: 1
            }
          : s
      );
      setSurveys(updatedSurveys);
    }
    setShowModal(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      cooler_inspection: 'bg-blue-100 text-blue-800',
      customer_feedback: 'bg-green-100 text-green-800',
      outlet_audit: 'bg-purple-100 text-purple-800',
      competitor_analysis: 'bg-red-100 text-red-800',
      brand_visibility: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      cooler_inspection: 'Cooler Inspection',
      customer_feedback: 'Customer Feedback',
      outlet_audit: 'Outlet Audit',
      competitor_analysis: 'Competitor Analysis',
      brand_visibility: 'Brand Visibility',
      general: 'General'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Builder</h1>
        <p className="text-gray-600">Create and manage dynamic surveys for field operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Surveys</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600">{stats.published}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-3xl font-bold text-orange-600">{stats.draft}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Pause className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-purple-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-teal-600">{stats.totalResponses}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.categories}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Filter className="w-6 h-6 text-indigo-600" />
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
                placeholder="Search surveys..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="cooler_inspection">Cooler Inspection</option>
              <option value="customer_feedback">Customer Feedback</option>
              <option value="outlet_audit">Outlet Audit</option>
              <option value="competitor_analysis">Competitor Analysis</option>
              <option value="brand_visibility">Brand Visibility</option>
              <option value="general">General</option>
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
              Create Survey
            </button>
          </div>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fields</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSurveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                      {survey.description && (
                        <div className="text-xs text-gray-400 max-w-xs truncate mt-1" title={survey.description}>
                          {survey.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(survey.category)}`}>
                      {getCategoryLabel(survey.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{survey.target_roles}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        survey.is_published === 1
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {survey.is_published === 1 ? 'Published' : 'Draft'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        survey.is_active === 'Y' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {survey.is_active === 'Y' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{survey.response_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        Created: {new Date(survey.createdate).toLocaleDateString()}
                      </div>
                      {survey.published_at && (
                        <div className="flex items-center mt-1">
                          <Play className="w-4 h-4 text-gray-400 mr-1" />
                          Published: {new Date(survey.published_at).toLocaleDateString()}
                        </div>
                      )}
                      {survey.expires_at && (
                        <div className="flex items-center mt-1">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          Expires: {new Date(survey.expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {surveyFields.filter(f => f.parent_id === survey.id).length} fields
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === survey.id ? null : survey.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showDropdown === survey.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleView(survey)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleBuilder(survey)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Survey Builder
                            </button>
                            <button
                              onClick={() => handleEdit(survey)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handlePublish(survey)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              {survey.is_published === 1 ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                              {survey.is_published === 1 ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(survey)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Filter className="w-4 h-4 mr-2" />
                              {survey.is_active === 'Y' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(survey)}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSurveys.length)} of {filteredSurveys.length} surveys
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
        <SurveyModal
          mode={modalMode}
          survey={selectedSurvey}
          surveyFields={surveyFields}
          setSurveyFields={setSurveyFields}
          onSaveSurveyFields={handleSaveSurveyFields}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// Survey Modal Component
interface SurveyModalProps {
  mode: 'create' | 'edit' | 'view' | 'builder';
  survey: Survey | null;
  surveyFields: SurveyField[];
  setSurveyFields: (fields: SurveyField[]) => void;
  onSaveSurveyFields: (surveyId: number, fields: SurveyField[]) => void;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function SurveyModal({ mode, survey, surveyFields, setSurveyFields, onSaveSurveyFields, onClose, onSubmit }: SurveyModalProps) {
  const [formData, setFormData] = useState({
    title: survey?.title || '',
    description: survey?.description || '',
    category: survey?.category || 'general',
    target_roles: survey?.target_roles || '',
    expires_at: survey?.expires_at ? survey.expires_at.split('T')[0] : '',
    is_active: survey?.is_active || 'Y'
  });

  const [newField, setNewField] = useState({
    label: '',
    field_type: 'text' as SurveyField['field_type'],
    options: '',
    is_required: 0
  });

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'photo', label: 'Photo Upload' },
    { value: 'signature', label: 'Signature' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view' && mode !== 'builder') {
      onSubmit(formData);
    }
  };

  const handleAddField = () => {
    if (newField.label.trim()) {
      const field: SurveyField = {
        id: Math.max(0, ...surveyFields.map(f => f.id)) + 1,
        parent_id: survey?.id || 0,
        label: newField.label,
        field_type: newField.field_type,
        options: newField.options,
        is_required: newField.is_required,
        sort_order: surveyFields.length + 1
      };
      setSurveyFields([...surveyFields, field]);
      setNewField({
        label: '',
        field_type: 'text',
        options: '',
        is_required: 0
      });
    }
  };

  const handleRemoveField = (fieldId: number) => {
    setSurveyFields(surveyFields.filter(f => f.id !== fieldId));
  };

  const handleMoveField = (fieldId: number, direction: 'up' | 'down') => {
    const fieldIndex = surveyFields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newFields = [...surveyFields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];
      
      // Update sort_order
      newFields.forEach((field, index) => {
        field.sort_order = index + 1;
      });
      
      setSurveyFields(newFields);
    }
  };

  const handleSaveBuilder = () => {
    if (survey) {
      onSaveSurveyFields(survey.id, surveyFields);
    }
    onClose();
  };
  const isReadOnly = mode === 'view';

  if (mode === 'builder') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Survey Builder - {survey?.title}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Field Builder */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Field</h3>
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter field label"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type
                    </label>
                    <select
                      value={newField.field_type}
                      onChange={(e) => setNewField({ ...newField, field_type: e.target.value as SurveyField['field_type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {(newField.field_type === 'select' || newField.field_type === 'radio' || newField.field_type === 'checkbox') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newField.options}
                        onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={newField.is_required === 1}
                      onChange={(e) => setNewField({ ...newField, is_required: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                      Required field
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddField}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Field
                  </button>
                </div>
              </div>

              {/* Survey Preview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Preview</h3>
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                  {surveyFields.map((field, index) => (
                    <div key={field.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <span className="text-xs text-gray-500">#{field.sort_order}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveField(field.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveField(field.id, 'down')}
                            disabled={index === surveyFields.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(field.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                          {field.is_required === 1 && <span className="text-red-500 ml-1">*</span>}
                        </label>
                      </div>
                      
                      {field.field_type === 'text' && (
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                      )}
                      
                      {field.field_type === 'textarea' && (
                        <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                      )}
                      
                      {field.field_type === 'number' && (
                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                      )}
                      
                      {field.field_type === 'select' && (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                          <option>Select an option</option>
                          {field.options.split(',').map((option, i) => (
                            <option key={i} value={option.trim()}>{option.trim()}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.field_type === 'radio' && (
                        <div className="space-y-2">
                          {field.options.split(',').map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input type="radio" name={`field_${field.id}`} className="mr-2" disabled />
                              <label className="text-sm text-gray-700">{option.trim()}</label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {field.field_type === 'checkbox' && (
                        <div className="space-y-2">
                          {field.options.split(',').map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input type="checkbox" className="mr-2" disabled />
                              <label className="text-sm text-gray-700">{option.trim()}</label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {field.field_type === 'date' && (
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                      )}
                      
                      {field.field_type === 'time' && (
                        <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />
                      )}
                      
                      {field.field_type === 'photo' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-500">Photo upload area</p>
                        </div>
                      )}
                      
                      {field.field_type === 'signature' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-500">Signature capture area</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {surveyFields.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No fields added yet. Add fields using the form on the left.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveBuilder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Survey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Survey' : mode === 'edit' ? 'Edit Survey' : 'Survey Details'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter survey title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Survey['category'] })}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="general">General</option>
                <option value="cooler_inspection">Cooler Inspection</option>
                <option value="customer_feedback">Customer Feedback</option>
                <option value="outlet_audit">Outlet Audit</option>
                <option value="competitor_analysis">Competitor Analysis</option>
                <option value="brand_visibility">Brand Visibility</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Roles
              </label>
              <input
                type="text"
                value={formData.target_roles}
                onChange={(e) => setFormData({ ...formData, target_roles: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="e.g., Sales Representative, Field Supervisor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isReadOnly}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter survey description"
              />
            </div>
          </div>

          {mode === 'view' && survey && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{new Date(survey.createdate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created By:</span>
                  <span className="ml-2 text-gray-600">User ID: {survey.createdby}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Published:</span>
                  <span className="ml-2 text-gray-600">{survey.is_published === 1 ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Response Count:</span>
                  <span className="ml-2 text-gray-600">{survey.response_count}</span>
                </div>
                {survey.published_at && (
                  <div>
                    <span className="font-medium text-gray-700">Published At:</span>
                    <span className="ml-2 text-gray-600">{new Date(survey.published_at).toLocaleString()}</span>
                  </div>
                )}
                {survey.updatedate && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-gray-600">{new Date(survey.updatedate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated By:</span>
                      <span className="ml-2 text-gray-600">User ID: {survey.updatedby}</span>
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
                {mode === 'create' ? 'Create Survey' : 'Update Survey'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}