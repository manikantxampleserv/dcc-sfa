import { BarChart3, Calendar, Camera, CheckCircle, Clock, Download, Eye, FileText, MapPin, MoreVertical, Plus, Search, Send, FileSignature as Signature, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SurveyResponse {
  id: number;
  parent_id: number;
  submitted_by: number;
  submitted_at: string;
  location: string | null;
  photo_url: string | null;
  is_active: string;
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  survey_title?: string;
  survey_category?: string;
  submitter_name?: string;
  answer_count?: number;
}

interface SurveyAnswer {
  id: number;
  parent_id: number;
  field_id: number;
  answer: string;
  // Related data
  field_label?: string;
  field_type?: string;
  field_options?: string;
  is_required?: boolean;
}

interface Survey {
  id: number;
  title: string;
  category: string;
  description?: string;
  expires_at?: string;
  is_published: number;
  target_roles?: string;
}

interface SurveyField {
  id: number;
  parent_id: number;
  label: string;
  field_type: string;
  options: string;
  is_required: number;
  sort_order: number;
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

export default function SurveyAnswers() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [surveyFilter, setSurveyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'submit'>('view');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [responseAnswers, setResponseAnswers] = useState<SurveyAnswer[]>([]);
  const [surveyFields, setSurveyFields] = useState<SurveyField[]>([]);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  // Survey submission states
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [submissionData, setSubmissionData] = useState({
    submitted_by: '',
    location: null as { lat: number; lng: number } | null,
    photo_url: '',
    answers: {} as Record<number, string>
  });
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const itemsPerPage = 10;

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock survey responses data
    const mockResponses: SurveyResponse[] = [
      {
        id: 1,
        parent_id: 1,
        submitted_by: 201,
        submitted_at: '2024-01-20T14:30:00',
        location: 'POINT(-74.0060 40.7128)',
        photo_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
        is_active: 'Y',
        createdate: '2024-01-20T14:30:00',
        createdby: 201,
        survey_title: 'Monthly Cooler Inspection',
        survey_category: 'cooler_inspection',
        submitter_name: 'Alex Johnson',
        answer_count: 8
      },
      {
        id: 2,
        parent_id: 2,
        submitted_by: 202,
        submitted_at: '2024-01-21T10:15:00',
        location: 'POINT(-73.9851 40.7589)',
        photo_url: null,
        is_active: 'Y',
        createdate: '2024-01-21T10:15:00',
        createdby: 202,
        survey_title: 'Customer Satisfaction Survey',
        survey_category: 'customer_feedback',
        submitter_name: 'Maria Garcia',
        answer_count: 12
      },
      {
        id: 3,
        parent_id: 1,
        submitted_by: 203,
        submitted_at: '2024-01-22T16:45:00',
        location: null,
        photo_url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
        is_active: 'Y',
        createdate: '2024-01-22T16:45:00',
        createdby: 203,
        survey_title: 'Monthly Cooler Inspection',
        survey_category: 'cooler_inspection',
        submitter_name: 'David Wilson',
        answer_count: 7
      },
      {
        id: 4,
        parent_id: 3,
        submitted_by: 204,
        submitted_at: '2024-01-23T09:30:00',
        location: 'POINT(-118.2437 34.0522)',
        photo_url: null,
        is_active: 'Y',
        createdate: '2024-01-23T09:30:00',
        createdby: 204,
        survey_title: 'Outlet Compliance Audit',
        survey_category: 'outlet_audit',
        submitter_name: 'Lisa Chen',
        answer_count: 15
      }
    ];

    // Mock surveys data
    const mockSurveys: Survey[] = [
      { 
        id: 1, 
        title: 'Monthly Cooler Inspection', 
        category: 'cooler_inspection',
        description: 'Comprehensive inspection of cooler units and refrigeration systems',
        expires_at: '2024-03-15T23:59:59',
        is_published: 1,
        target_roles: 'Sales Representative,Field Supervisor'
      },
      { 
        id: 2, 
        title: 'Customer Satisfaction Survey', 
        category: 'customer_feedback',
        description: 'Quarterly customer feedback collection for service improvement',
        expires_at: '2024-04-20T23:59:59',
        is_published: 1,
        target_roles: 'Sales Representative'
      },
      { 
        id: 3, 
        title: 'Outlet Compliance Audit', 
        category: 'outlet_audit',
        description: 'Comprehensive audit of outlet compliance with brand standards',
        expires_at: null,
        is_published: 0,
        target_roles: 'Field Supervisor,Area Manager'
      }
    ];

    // Mock employees data
    const mockEmployees: Employee[] = [
      { id: 201, name: 'Alex Johnson', role: 'Sales Representative' },
      { id: 202, name: 'Maria Garcia', role: 'Sales Representative' },
      { id: 203, name: 'David Wilson', role: 'Sales Representative' },
      { id: 204, name: 'Lisa Chen', role: 'Field Supervisor' },
      { id: 205, name: 'Robert Brown', role: 'Area Manager' }
    ];

    setResponses(mockResponses);
    setSurveys(mockSurveys);
    setEmployees(mockEmployees);
  }, []);

  // Filter responses based on search and filters
  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.survey_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.submitter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.survey_category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSurvey = surveyFilter === 'all' || response.parent_id.toString() === surveyFilter;
    const matchesCategory = categoryFilter === 'all' || response.survey_category === categoryFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const responseDate = new Date(response.submitted_at);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesSurvey && matchesCategory && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: responses.length,
    today: responses.filter(r => {
      const responseDate = new Date(r.submitted_at);
      const today = new Date();
      return responseDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: responses.filter(r => {
      const responseDate = new Date(r.submitted_at);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length,
    withPhotos: responses.filter(r => r.photo_url).length,
    withLocation: responses.filter(r => r.location).length,
    avgAnswers: responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + (r.answer_count || 0), 0) / responses.length) : 0
  };

  const handleViewResponse = async (response: SurveyResponse) => {
    setSelectedResponse(response);
    setModalMode('view');
    
    // Mock survey fields for the selected survey
    const mockFields: SurveyField[] = [
      {
        id: 1,
        parent_id: response.parent_id,
        label: 'Cooler Temperature (°C)',
        field_type: 'number',
        options: '',
        is_required: 1,
        sort_order: 1
      },
      {
        id: 2,
        parent_id: response.parent_id,
        label: 'Overall Condition',
        field_type: 'select',
        options: 'Excellent,Good,Fair,Poor',
        is_required: 1,
        sort_order: 2
      },
      {
        id: 3,
        parent_id: response.parent_id,
        label: 'Issues Found',
        field_type: 'checkbox',
        options: 'Temperature too high,Door seal damaged,Lighting not working,Cleanliness issues',
        is_required: 0,
        sort_order: 3
      },
      {
        id: 4,
        parent_id: response.parent_id,
        label: 'Additional Comments',
        field_type: 'textarea',
        options: '',
        is_required: 0,
        sort_order: 4
      }
    ];

    // Mock answers for the selected response
    const mockAnswers: SurveyAnswer[] = [
      {
        id: 1,
        parent_id: response.id,
        field_id: 1,
        answer: '4.5',
        field_label: 'Cooler Temperature (°C)',
        field_type: 'number',
        field_options: '',
        is_required: true
      },
      {
        id: 2,
        parent_id: response.id,
        field_id: 2,
        answer: 'Good',
        field_label: 'Overall Condition',
        field_type: 'select',
        field_options: 'Excellent,Good,Fair,Poor',
        is_required: true
      },
      {
        id: 3,
        parent_id: response.id,
        field_id: 3,
        answer: 'Door seal damaged,Cleanliness issues',
        field_label: 'Issues Found',
        field_type: 'checkbox',
        field_options: 'Temperature too high,Door seal damaged,Lighting not working,Cleanliness issues',
        is_required: false
      },
      {
        id: 4,
        parent_id: response.id,
        field_id: 4,
        answer: 'Cooler is functioning well overall, but minor cleaning needed and door seal requires attention.',
        field_label: 'Additional Comments',
        field_type: 'textarea',
        field_options: '',
        is_required: false
      }
    ];

    setSurveyFields(mockFields);
    setResponseAnswers(mockAnswers);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleSubmitSurvey = () => {
    setModalMode('submit');
    setSelectedSurvey(null);
    setSubmissionData({
      submitted_by: '',
      location: null,
      photo_url: '',
      answers: {}
    });
    setShowModal(true);
  };

  const handleSurveySelection = (survey: Survey) => {
    setSelectedSurvey(survey);
    
    // Load survey fields for the selected survey
    const mockFields: SurveyField[] = survey.id === 1 ? [
      {
        id: 1,
        parent_id: survey.id,
        label: 'Cooler Temperature (°C)',
        field_type: 'number',
        options: '',
        is_required: 1,
        sort_order: 1
      },
      {
        id: 2,
        parent_id: survey.id,
        label: 'Overall Condition',
        field_type: 'select',
        options: 'Excellent,Good,Fair,Poor',
        is_required: 1,
        sort_order: 2
      },
      {
        id: 3,
        parent_id: survey.id,
        label: 'Issues Found',
        field_type: 'checkbox',
        options: 'Temperature too high,Door seal damaged,Lighting not working,Cleanliness issues',
        is_required: 0,
        sort_order: 3
      },
      {
        id: 4,
        parent_id: survey.id,
        label: 'Additional Comments',
        field_type: 'textarea',
        options: '',
        is_required: 0,
        sort_order: 4
      },
      {
        id: 5,
        parent_id: survey.id,
        label: 'Photo Evidence',
        field_type: 'photo',
        options: '',
        is_required: 0,
        sort_order: 5
      },
      {
        id: 6,
        parent_id: survey.id,
        label: 'Inspector Signature',
        field_type: 'signature',
        options: '',
        is_required: 1,
        sort_order: 6
      }
    ] : [
      {
        id: 7,
        parent_id: survey.id,
        label: 'Customer Name',
        field_type: 'text',
        options: '',
        is_required: 1,
        sort_order: 1
      },
      {
        id: 8,
        parent_id: survey.id,
        label: 'Satisfaction Rating',
        field_type: 'radio',
        options: 'Very Satisfied,Satisfied,Neutral,Dissatisfied,Very Dissatisfied',
        is_required: 1,
        sort_order: 2
      },
      {
        id: 9,
        parent_id: survey.id,
        label: 'Visit Date',
        field_type: 'date',
        options: '',
        is_required: 1,
        sort_order: 3
      },
      {
        id: 10,
        parent_id: survey.id,
        label: 'Feedback',
        field_type: 'textarea',
        options: '',
        is_required: 0,
        sort_order: 4
      }
    ];
    
    setSurveyFields(mockFields);
  };

  const handleCaptureLocation = () => {
    setIsCapturingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSubmissionData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setIsCapturingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsCapturingLocation(false);
          alert('Unable to get location. Please check your browser permissions.');
        }
      );
    } else {
      setIsCapturingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleAnswerChange = (fieldId: number, value: string) => {
    setSubmissionData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [fieldId]: value
      }
    }));
  };

  const handleFileUpload = (fieldId: number, file: File) => {
    // Mock file upload - in real app, upload to server and get URL
    const mockUrl = `https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400`;
    handleAnswerChange(fieldId, mockUrl);
  };

  const handleSubmitResponse = () => {
    if (!selectedSurvey || !submissionData.submitted_by) {
      alert('Please select a survey and submitter.');
      return;
    }

    // Validate required fields
    const requiredFields = surveyFields.filter(field => field.is_required === 1);
    const missingFields = requiredFields.filter(field => !submissionData.answers[field.id]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    // Create new survey response
    const newResponse: SurveyResponse = {
      id: Math.max(...responses.map(r => r.id)) + 1,
      parent_id: selectedSurvey.id,
      submitted_by: parseInt(submissionData.submitted_by),
      submitted_at: new Date().toISOString(),
      location: submissionData.location ? `POINT(${submissionData.location.lng} ${submissionData.location.lat})` : null,
      photo_url: submissionData.photo_url || null,
      is_active: 'Y',
      createdate: new Date().toISOString(),
      createdby: parseInt(submissionData.submitted_by),
      survey_title: selectedSurvey.title,
      survey_category: selectedSurvey.category,
      submitter_name: employees.find(e => e.id === parseInt(submissionData.submitted_by))?.name,
      answer_count: Object.keys(submissionData.answers).length
    };

    // Create survey answers
    const newAnswers: SurveyAnswer[] = Object.entries(submissionData.answers).map(([fieldId, answer]) => ({
      id: Math.max(0, ...responseAnswers.map(a => a.id)) + parseInt(fieldId),
      parent_id: newResponse.id,
      field_id: parseInt(fieldId),
      answer: answer
    }));

    // Update state
    setResponses([newResponse, ...responses]);
    setResponseAnswers([...responseAnswers, ...newAnswers]);
    
    alert('Survey response submitted successfully!');
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

  const formatLocation = (location: string | null) => {
    if (!location) return null;
    // Parse POINT(-74.0060 40.7128) format
    const match = location.match(/POINT\(([^)]+)\)/);
    if (match) {
      const [lng, lat] = match[1].split(' ');
      return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    }
    return location;
  };

  // Get available surveys for submission (published and not expired)
  const availableSurveys = surveys.filter(survey => {
    if (survey.is_published !== 1) return false;
    if (survey.expires_at) {
      const expiryDate = new Date(survey.expires_at);
      const now = new Date();
      if (expiryDate < now) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Responses</h1>
        <p className="text-gray-600">View and analyze survey responses from field operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
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
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-3xl font-bold text-green-600">{stats.today}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-purple-600">{stats.thisWeek}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Photos</p>
              <p className="text-3xl font-bold text-orange-600">{stats.withPhotos}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Camera className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Location</p>
              <p className="text-3xl font-bold text-teal-600">{stats.withLocation}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <MapPin className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Answers</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.avgAnswers}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
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
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={surveyFilter}
              onChange={(e) => setSurveyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Surveys</option>
              {surveys.map(survey => (
                <option key={survey.id} value={survey.id.toString()}>{survey.title}</option>
              ))}
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

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleSubmitSurvey}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Survey
            </button>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey & Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location & Media</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedResponses.map((response) => (
                <tr key={response.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{response.survey_title}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getCategoryColor(response.survey_category || '')}`}>
                        {getCategoryLabel(response.survey_category || '')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{response.submitter_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(response.submitted_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(response.submitted_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {response.location ? (
                        <div className="flex items-center text-gray-900 mb-1">
                          <MapPin className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-xs">{formatLocation(response.location)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400 mb-1">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-xs">No location</span>
                        </div>
                      )}
                      {response.photo_url ? (
                        <div className="flex items-center text-green-600">
                          <Camera className="w-4 h-4 mr-2" />
                          <span className="text-xs">Photo attached</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <Camera className="w-4 h-4 mr-2" />
                          <span className="text-xs">No photo</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{response.answer_count || 0}</span>
                      <span className="text-sm text-gray-500 ml-1">answers</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      response.is_active === 'Y' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {response.is_active === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === response.id ? null : response.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showDropdown === response.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewResponse(response)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Response
                            </button>
                            {response.photo_url && (
                              <button
                                onClick={() => window.open(response.photo_url!, '_blank')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                View Photo
                              </button>
                            )}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredResponses.length)} of {filteredResponses.length} responses
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
          response={selectedResponse}
          answers={responseAnswers}
          surveyFields={surveyFields}
          surveys={availableSurveys}
          employees={employees}
          selectedSurvey={selectedSurvey}
          submissionData={submissionData}
          isCapturingLocation={isCapturingLocation}
          onClose={() => setShowModal(false)}
          onSurveySelection={handleSurveySelection}
          onCaptureLocation={handleCaptureLocation}
          onAnswerChange={handleAnswerChange}
          onFileUpload={handleFileUpload}
          onSubmitResponse={handleSubmitResponse}
          setSubmissionData={setSubmissionData}
        />
      )}
    </div>
  );
}

// Survey Modal Component
interface SurveyModalProps {
  mode: 'view' | 'submit';
  response?: SurveyResponse | null;
  answers?: SurveyAnswer[];
  surveyFields: SurveyField[];
  surveys?: Survey[];
  employees?: Employee[];
  selectedSurvey?: Survey | null;
  submissionData?: any;
  isCapturingLocation?: boolean;
  onClose: () => void;
  onSurveySelection?: (survey: Survey) => void;
  onCaptureLocation?: () => void;
  onAnswerChange?: (fieldId: number, value: string) => void;
  onFileUpload?: (fieldId: number, file: File) => void;
  onSubmitResponse?: () => void;
  setSubmissionData?: (data: any) => void;
}

function SurveyModal({ 
  mode, 
  response, 
  answers = [], 
  surveyFields, 
  surveys = [], 
  employees = [],
  selectedSurvey,
  submissionData,
  isCapturingLocation,
  onClose, 
  onSurveySelection,
  onCaptureLocation,
  onAnswerChange,
  onFileUpload,
  onSubmitResponse,
  setSubmissionData
}: SurveyModalProps) {
  
  const formatLocation = (location: string | null) => {
    if (!location) return null;
    const match = location.match(/POINT\(([^)]+)\)/);
    if (match) {
      const [lng, lat] = match[1].split(' ');
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return null;
  };

  const renderAnswer = (answer: SurveyAnswer) => {
    switch (answer.field_type) {
      case 'photo':
        return answer.answer ? (
          <img src={answer.answer} alt="Response" className="max-w-xs rounded-lg border" />
        ) : (
          <span className="text-gray-500">No photo provided</span>
        );
      
      case 'signature':
        return answer.answer ? (
          <img src={answer.answer} alt="Signature" className="max-w-xs rounded-lg border bg-white" />
        ) : (
          <span className="text-gray-500">No signature provided</span>
        );
      
      case 'checkbox':
        const checkboxValues = answer.answer ? answer.answer.split(',') : [];
        return (
          <div className="space-y-1">
            {answer.field_options?.split(',').map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={checkboxValues.includes(option.trim())}
                  disabled
                  className="mr-2"
                />
                <span className="text-sm">{option.trim()}</span>
              </div>
            ))}
          </div>
        );
      
      case 'radio':
      case 'select':
        return (
          <span className={`inline-flex px-2 py-1 text-sm rounded-full ${
            answer.answer ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {answer.answer || 'No selection'}
          </span>
        );
      
      case 'textarea':
        return (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {answer.answer || 'No response provided'}
            </p>
          </div>
        );
      
      default:
        return (
          <span className="text-sm text-gray-900">
            {answer.answer || 'No response provided'}
          </span>
        );
    }
  };

  const renderFormField = (field: SurveyField) => {
    const value = submissionData?.answers[field.id] || '';
    
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your answer"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your answer"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a number"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option</option>
            {field.options.split(',').map((option, index) => (
              <option key={index} value={option.trim()}>{option.trim()}</option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.split(',').map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`field_${field.id}`}
                  value={option.trim()}
                  checked={value === option.trim()}
                  onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">{option.trim()}</label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        const selectedValues = value ? value.split(',') : [];
        return (
          <div className="space-y-2">
            {field.options.split(',').map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.trim())}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.trim()]
                      : selectedValues.filter(v => v !== option.trim());
                    onAnswerChange?.(field.id, newValues.join(','));
                  }}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">{option.trim()}</label>
              </div>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      case 'photo':
        return (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onFileUpload?.(field.id, file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {value && (
              <div className="mt-2">
                <img src={value} alt="Preview" className="max-w-xs rounded-lg border" />
              </div>
            )}
          </div>
        );
      
      case 'signature':
        return (
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Signature className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to capture signature</p>
              <button
                type="button"
                onClick={() => {
                  // Mock signature capture
                  const mockSignature = 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400';
                  onAnswerChange?.(field.id, mockSignature);
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Capture Signature
              </button>
            </div>
            {value && (
              <div className="mt-2">
                <img src={value} alt="Signature" className="max-w-xs rounded-lg border bg-white" />
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your answer"
          />
        );
    }
  };

  if (mode === 'view' && response) {
    const locationData = formatLocation(response.location);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{response.survey_title}</h2>
                <p className="text-sm text-gray-600 mt-1">Response Details</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Response Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Submitted By:</span>
                  <span className="ml-2 text-gray-600">{response.submitter_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted At:</span>
                  <span className="ml-2 text-gray-600">{new Date(response.submitted_at).toLocaleString()}</span>
                </div>
                {locationData && (
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Total Answers:</span>
                  <span className="ml-2 text-gray-600">{answers.length}</span>
                </div>
              </div>
              
              {response.photo_url && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Attached Photo:</span>
                  <div className="mt-2">
                    <img src={response.photo_url} alt="Response" className="max-w-sm rounded-lg border" />
                  </div>
                </div>
              )}
            </div>

            {/* Survey Answers */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Answers</h3>
              <div className="space-y-6">
                {surveyFields
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((field) => {
                    const answer = answers.find(a => a.field_id === field.id);
                    return (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.is_required === 1 && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {field.field_type}
                          </span>
                        </div>
                        
                        <div className="mt-2">
                          {answer ? renderAnswer(answer) : (
                            <span className="text-gray-500 italic">No response provided</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Survey submission mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Submit Survey Response</h2>
              <p className="text-sm text-gray-600 mt-1">Fill out the survey form</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!selectedSurvey ? (
            // Survey selection step
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Survey</h3>
              <div className="grid grid-cols-1 gap-4">
                {surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                    onClick={() => onSurveySelection?.(survey)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{survey.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500">Category: {survey.category}</span>
                          {survey.expires_at && (
                            <span className="text-xs text-gray-500">
                              Expires: {new Date(survey.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-blue-600 hover:text-blue-800">
                        Select →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Survey form step
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">{selectedSurvey.title}</h3>
                <p className="text-sm text-gray-600">{selectedSurvey.description}</p>
              </div>

              {/* Submission metadata */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Submission Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submitted By <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={submissionData?.submitted_by || ''}
                      onChange={(e) => setSubmissionData?.({
                        ...submissionData,
                        submitted_by: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id.toString()}>
                          {employee.name} ({employee.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={onCaptureLocation}
                        disabled={isCapturingLocation}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {isCapturingLocation ? 'Capturing...' : 'Capture Location'}
                      </button>
                      {submissionData?.location && (
                        <span className="flex items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Location captured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Survey fields */}
              <div className="space-y-6">
                {surveyFields
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((field) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.is_required === 1 && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFormField(field)}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {selectedSurvey && (
            <button
              onClick={onSubmitResponse}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Response
            </button>
          )}
        </div>
      </div>
    </div>
  );
}