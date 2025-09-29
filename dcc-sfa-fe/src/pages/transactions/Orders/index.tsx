import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye, ShoppingCart, User, Calendar, DollarSign, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle, MoreVertical, FileText, CreditCard } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  parent_id: number;
  salesperson_id: number;
  order_date: string;
  delivery_date: string | null;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order_type: 'regular' | 'urgent' | 'promotional' | 'sample';
  payment_method: 'cash' | 'credit' | 'cheque' | 'bank_transfer';
  payment_terms: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  notes: string | null;
  shipping_address: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by: number | null;
  approved_at: string | null;
  is_active: string;
  createdate: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  // Related data
  customer_name?: string;
  customer_code?: string;
  customer_type?: string;
  salesperson_name?: string;
  approver_name?: string;
  item_count?: number;
}

interface OrderItem {
  id: number;
  parent_id: number;
  product_id: number;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  // Related data
  product_code?: string;
  product_category?: string;
}

interface Customer {
  id: number;
  name: string;
  code: string;
  type: string;
}

interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  unit_of_measure: string;
  base_price: number;
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const itemsPerPage = 10;

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock orders data
    const mockOrders: Order[] = [
      {
        id: 1,
        order_number: 'ORD-2024-001',
        parent_id: 1,
        salesperson_id: 201,
        order_date: '2024-01-20T10:30:00',
        delivery_date: '2024-01-25T14:00:00',
        status: 'confirmed',
        priority: 'high',
        order_type: 'regular',
        payment_method: 'credit',
        payment_terms: 'Net 30',
        subtotal: 2500.00,
        discount_amount: 125.00,
        tax_amount: 195.00,
        shipping_amount: 50.00,
        total_amount: 2620.00,
        notes: 'Rush order for new product launch',
        shipping_address: '123 Main Street, New York, NY 10001',
        approval_status: 'approved',
        approved_by: 101,
        approved_at: '2024-01-20T11:15:00',
        is_active: 'Y',
        createdate: '2024-01-20T10:30:00',
        createdby: 201,
        customer_name: 'Metro Supermarket',
        customer_code: 'OUT001',
        customer_type: 'retailer',
        salesperson_name: 'Alex Johnson',
        approver_name: 'John Smith',
        item_count: 5
      },
      {
        id: 2,
        order_number: 'ORD-2024-002',
        parent_id: 2,
        salesperson_id: 202,
        order_date: '2024-01-21T14:20:00',
        delivery_date: '2024-01-28T10:00:00',
        status: 'processing',
        priority: 'medium',
        order_type: 'promotional',
        payment_method: 'bank_transfer',
        payment_terms: 'Net 15',
        subtotal: 5000.00,
        discount_amount: 500.00,
        tax_amount: 360.00,
        shipping_amount: 75.00,
        total_amount: 4935.00,
        notes: 'Promotional campaign order',
        shipping_address: '456 Business Ave, New York, NY 10002',
        approval_status: 'approved',
        approved_by: 101,
        approved_at: '2024-01-21T15:00:00',
        is_active: 'Y',
        createdate: '2024-01-21T14:20:00',
        createdby: 202,
        customer_name: 'City Wholesale Hub',
        customer_code: 'OUT002',
        customer_type: 'wholesaler',
        salesperson_name: 'Maria Garcia',
        approver_name: 'John Smith',
        item_count: 8
      },
      {
        id: 3,
        order_number: 'ORD-2024-003',
        parent_id: 3,
        salesperson_id: 203,
        order_date: '2024-01-22T09:15:00',
        delivery_date: null,
        status: 'draft',
        priority: 'low',
        order_type: 'sample',
        payment_method: 'cash',
        payment_terms: 'COD',
        subtotal: 150.00,
        discount_amount: 0.00,
        tax_amount: 12.00,
        shipping_amount: 25.00,
        total_amount: 187.00,
        notes: 'Sample order for evaluation',
        shipping_address: '789 Industrial Blvd, Los Angeles, CA 90001',
        approval_status: 'pending',
        approved_by: null,
        approved_at: null,
        is_active: 'Y',
        createdate: '2024-01-22T09:15:00',
        createdby: 203,
        customer_name: 'Regional Distribution Center',
        customer_code: 'OUT003',
        customer_type: 'distributor',
        salesperson_name: 'David Wilson',
        approver_name: "",
        item_count: 3
      }
    ];

    // Mock customers data
    const mockCustomers: Customer[] = [
      { id: 1, name: 'Metro Supermarket', code: 'OUT001', type: 'retailer' },
      { id: 2, name: 'City Wholesale Hub', code: 'OUT002', type: 'wholesaler' },
      { id: 3, name: 'Regional Distribution Center', code: 'OUT003', type: 'distributor' }
    ];

    // Mock products data
    const mockProducts: Product[] = [
      { id: 1, name: 'Premium Wireless Headphones', code: 'PRD001', category: 'Electronics', unit_of_measure: 'Piece', base_price: 299.99 },
      { id: 2, name: 'Smart Fitness Tracker', code: 'PRD002', category: 'Wearables', unit_of_measure: 'Piece', base_price: 199.99 },
      { id: 3, name: 'Organic Coffee Beans', code: 'PRD003', category: 'Food & Beverage', unit_of_measure: 'Kilogram', base_price: 24.99 }
    ];

    // Mock employees data
    const mockEmployees: Employee[] = [
      { id: 101, name: 'John Smith', role: 'Manager' },
      { id: 201, name: 'Alex Johnson', role: 'Sales Representative' },
      { id: 202, name: 'Maria Garcia', role: 'Sales Representative' },
      { id: 203, name: 'David Wilson', role: 'Sales Representative' }
    ];

    setOrders(mockOrders);
    setCustomers(mockCustomers);
    setProducts(mockProducts);
    setEmployees(mockEmployees);
  }, []);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.salesperson_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || order.order_type === typeFilter;
    const matchesApproval = approvalFilter === 'all' || order.approval_status === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesApproval;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: orders.length,
    draft: orders.filter(o => o.status === 'draft').length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalValue: orders.reduce((sum, o) => sum + o.total_amount, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length : 0,
    pendingApproval: orders.filter(o => o.approval_status === 'pending').length
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedOrder(null);
    setOrderItems([]);
    setShowModal(true);
  };

  const handleEdit = (order: Order) => {
    setModalMode('edit');
    setSelectedOrder(order);
    // Load order items
    const mockItems: OrderItem[] = [
      {
        id: 1,
        parent_id: order.id,
        product_id: 1,
        product_name: 'Premium Wireless Headphones',
        unit: 'Piece',
        quantity: 2,
        unit_price: 299.99,
        discount_amount: 30.00,
        tax_amount: 43.20,
        total_amount: 613.18,
        notes: null,
        product_code: 'PRD001',
        product_category: 'Electronics'
      }
    ];
    setOrderItems(mockItems);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleView = (order: Order) => {
    setModalMode('view');
    setSelectedOrder(order);
    // Load order items
    const mockItems: OrderItem[] = [
      {
        id: 1,
        parent_id: order.id,
        product_id: 1,
        product_name: 'Premium Wireless Headphones',
        unit: 'Piece',
        quantity: 2,
        unit_price: 299.99,
        discount_amount: 30.00,
        tax_amount: 43.20,
        total_amount: 613.18,
        notes: null,
        product_code: 'PRD001',
        product_category: 'Electronics'
      }
    ];
    setOrderItems(mockItems);
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleDelete = (order: Order) => {
    if (window.confirm(`Are you sure you want to delete order "${order.order_number}"?`)) {
      setOrders(orders.filter(o => o.id !== order.id));
    }
    setShowDropdown(null);
  };

  const handleStatusChange = (order: Order, newStatus: Order['status']) => {
    const updatedOrders = orders.map(o => 
      o.id === order.id 
        ? { ...o, status: newStatus, updatedate: new Date().toISOString(), updatedby: 1 }
        : o
    );
    setOrders(updatedOrders);
    setShowDropdown(null);
  };

  const handleSubmit = (formData: any) => {
    if (modalMode === 'create') {
      const newOrder: Order = {
        id: Math.max(...orders.map(o => o.id)) + 1,
        order_number: `ORD-2024-${String(Math.max(...orders.map(o => o.id)) + 1).padStart(3, '0')}`,
        ...formData,
        createdate: new Date().toISOString(),
        createdby: 1,
        customer_name: customers.find(c => c.id === formData.parent_id)?.name,
        customer_code: customers.find(c => c.id === formData.parent_id)?.code,
        customer_type: customers.find(c => c.id === formData.parent_id)?.type,
        salesperson_name: employees.find(e => e.id === formData.salesperson_id)?.name,
        approver_name: formData.approved_by ? employees.find(e => e.id === formData.approved_by)?.name : null,
        item_count: orderItems.length
      };
      setOrders([...orders, newOrder]);
    } else if (modalMode === 'edit' && selectedOrder) {
      const updatedOrders = orders.map(o => 
        o.id === selectedOrder.id 
          ? { 
              ...o, 
              ...formData, 
              updatedate: new Date().toISOString(), 
              updatedby: 1,
              customer_name: customers.find(c => c.id === formData.parent_id)?.name,
              customer_code: customers.find(c => c.id === formData.parent_id)?.code,
              customer_type: customers.find(c => c.id === formData.parent_id)?.type,
              salesperson_name: employees.find(e => e.id === formData.salesperson_id)?.name,
              approver_name: formData.approved_by ? employees.find(e => e.id === formData.approved_by)?.name : null,
              item_count: orderItems.length
            }
          : o
      );
      setOrders(updatedOrders);
    }
    setShowModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getApprovalColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">Manage customer orders, track status, and process deliveries</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgOrderValue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingApproval}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          <div className="text-sm text-gray-500">Draft</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.processing}</div>
          <div className="text-sm text-gray-500">Processing</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.shipped}</div>
          <div className="text-sm text-gray-500">Shipped</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          <div className="text-sm text-gray-500">Delivered</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
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
                placeholder="Search orders..."
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="regular">Regular</option>
              <option value="urgent">Urgent</option>
              <option value="promotional">Promotional</option>
              <option value="sample">Sample</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Approval</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
              Create Order
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesperson</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-sm text-gray-500 capitalize">{order.order_type} order</div>
                      <div className="text-xs text-gray-400">{order.item_count} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_code}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        order.customer_type === 'distributor' ? 'bg-purple-100 text-purple-800' :
                        order.customer_type === 'retailer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.customer_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{order.salesperson_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        Order: {new Date(order.order_date).toLocaleDateString()}
                      </div>
                      {order.delivery_date && (
                        <div className="flex items-center mt-1">
                          <Truck className="w-4 h-4 text-gray-400 mr-1" />
                          Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</div>
                      <div className="text-gray-500">Subtotal: {formatCurrency(order.subtotal)}</div>
                      {order.discount_amount > 0 && (
                        <div className="text-green-600">Discount: -{formatCurrency(order.discount_amount)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(order.approval_status)}`}>
                        {order.approval_status}
                      </span>
                      {order.approver_name && (
                        <div className="text-xs text-gray-500 mt-1">by {order.approver_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === order.id ? null : order.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showDropdown === order.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleView(order)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEdit(order)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(order, 'confirmed')}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Confirm Order
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order, 'cancelled')}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Order
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(order)}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
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
        <OrderModal
          mode={modalMode}
          order={selectedOrder}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          customers={customers}
          products={products}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// Order Modal Component
interface OrderModalProps {
  mode: 'create' | 'edit' | 'view';
  order: Order | null;
  orderItems: OrderItem[];
  setOrderItems: (items: OrderItem[]) => void;
  customers: Customer[];
  products: Product[];
  employees: Employee[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function OrderModal({ mode, order, orderItems, setOrderItems, customers, products, employees, onClose, onSubmit }: OrderModalProps) {
  const [formData, setFormData] = useState({
    parent_id: order?.parent_id || '',
    salesperson_id: order?.salesperson_id || '',
    order_date: order?.order_date ? order.order_date.split('T')[0] : new Date().toISOString().split('T')[0],
    delivery_date: order?.delivery_date ? order.delivery_date.split('T')[0] : '',
    status: order?.status || 'draft',
    priority: order?.priority || 'medium',
    order_type: order?.order_type || 'regular',
    payment_method: order?.payment_method || 'credit',
    payment_terms: order?.payment_terms || 'Net 30',
    subtotal: order?.subtotal || 0,
    discount_amount: order?.discount_amount || 0,
    tax_amount: order?.tax_amount || 0,
    shipping_amount: order?.shipping_amount || 0,
    total_amount: order?.total_amount || 0,
    notes: order?.notes || '',
    shipping_address: order?.shipping_address || '',
    approval_status: order?.approval_status || 'pending',
    approved_by: order?.approved_by || '',
    is_active: order?.is_active || 'Y'
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    tax_amount: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit({
        ...formData,
        parent_id: parseInt(formData.parent_id.toString()),
        salesperson_id: parseInt(formData.salesperson_id.toString()),
        approved_by: formData.approved_by ? parseInt(formData.approved_by.toString()) : null,
        order_date: new Date(formData.order_date).toISOString(),
        delivery_date: formData.delivery_date ? new Date(formData.delivery_date).toISOString() : null
      });
    }
  };

  const handleAddItem = () => {
    if (newItem.product_id) {
      const product = products.find(p => p.id === parseInt(newItem.product_id));
      if (product) {
        const item: OrderItem = {
          id: Math.max(0, ...orderItems.map(i => i.id)) + 1,
          parent_id: order?.id || 0,
          product_id: parseInt(newItem.product_id),
          product_name: product.name,
          unit: product.unit_of_measure,
          quantity: newItem.quantity,
          unit_price: newItem.unit_price || product.base_price,
          discount_amount: newItem.discount_amount,
          tax_amount: newItem.tax_amount,
          total_amount: (newItem.quantity * (newItem.unit_price || product.base_price)) - newItem.discount_amount + newItem.tax_amount,
          notes: newItem.notes || null,
          product_code: product.code,
          product_category: product.category
        };
        setOrderItems([...orderItems, item]);
        setNewItem({
          product_id: '',
          quantity: 1,
          unit_price: 0,
          discount_amount: 0,
          tax_amount: 0,
          notes: ''
        });
      }
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems(orderItems.filter(i => i.id !== itemId));
  };

  const isReadOnly = mode === 'view';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Order' : mode === 'edit' ? 'Edit Order' : 'Order Details'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    disabled={isReadOnly}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salesperson <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.salesperson_id}
                    onChange={(e) => setFormData({ ...formData, salesperson_id: e.target.value })}
                    disabled={isReadOnly}
                    required
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
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Order['status'] })}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Order['priority'] })}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Type
                  </label>
                  <select
                    value={formData.order_type}
                    onChange={(e) => setFormData({ ...formData, order_type: e.target.value as Order['order_type'] })}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="regular">Regular</option>
                    <option value="urgent">Urgent</option>
                    <option value="promotional">Promotional</option>
                    <option value="sample">Sample</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as Order['payment_method'] })}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit">Credit</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="e.g., Net 30, COD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address
                </label>
                <textarea
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter shipping address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter order notes"
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              
              {!isReadOnly && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-gray-900">Add Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                      <select
                        value={newItem.product_id}
                        onChange={(e) => {
                          const product = products.find(p => p.id === parseInt(e.target.value));
                          setNewItem({ 
                            ...newItem, 
                            product_id: e.target.value,
                            unit_price: product?.base_price || 0
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.unit_price}
                        onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.discount_amount}
                        onChange={(e) => setNewItem({ ...newItem, discount_amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orderItems.map((item) => (
                  <div key={item.id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                        <p className="text-sm text-gray-500">{item.product_code} - {item.product_category}</p>
                      </div>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                      </div>
                      <div>
                        <span className="font-medium">Unit Price:</span> {formatCurrency(item.unit_price)}
                      </div>
                      <div>
                        <span className="font-medium">Discount:</span> {formatCurrency(item.discount_amount)}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> {formatCurrency(item.total_amount)}
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {item.notes}
                      </div>
                    )}
                  </div>
                ))}
                
                {orderItems.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No items added yet. Add items using the form above.
                  </div>
                )}
              </div>

              {/* Order Totals */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(formData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(formData.discount_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(formData.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(formData.shipping_amount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(formData.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {mode === 'view' && order && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{new Date(order.createdate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created By:</span>
                  <span className="ml-2 text-gray-600">User ID: {order.createdby}</span>
                </div>
                {order.approved_at && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Approved:</span>
                      <span className="ml-2 text-gray-600">{new Date(order.approved_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Approved By:</span>
                      <span className="ml-2 text-gray-600">{order.approver_name}</span>
                    </div>
                  </>
                )}
                {order.updatedate && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-gray-600">{new Date(order.updatedate).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated By:</span>
                      <span className="ml-2 text-gray-600">User ID: {order.updatedby}</span>
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
                {mode === 'create' ? 'Create Order' : 'Update Order'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}