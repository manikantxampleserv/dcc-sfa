import 'package:flutter/foundation.dart';
import '../mock/mock_orders_data.dart';
import '../models/cart_item_model.dart';
import '../models/order_model.dart';
import '../models/user_model.dart';

/**
 * Provider handling customer orders, tracking, filtering, and order submission.
 */
class OrdersProvider with ChangeNotifier {
  List<OrderModel> _orders = [];
  String _selectedStatusFilter = 'All';
  String _searchQuery = '';
  bool _isLoading = false;

  List<OrderModel> get orders => _orders;
  String get selectedStatusFilter => _selectedStatusFilter;
  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;

  static const List<String> statusFilters = [
    'All',
    'Pending',
    'In Transit',
    'Delivered',
  ];

  OrdersProvider() {
    _orders = MockOrdersData.getOrders();
  }

  /**
   * Filtered order list based on status and search query.
   */
  List<OrderModel> get filteredOrders {
    return _orders.where((order) {
      bool matchesStatus = true;
      if (_selectedStatusFilter == 'Pending') {
        matchesStatus = order.status == 'pending_approval' || order.status == 'draft';
      } else if (_selectedStatusFilter == 'In Transit') {
        matchesStatus = order.status == 'in_transit' || order.status == 'approved';
      } else if (_selectedStatusFilter == 'Delivered') {
        matchesStatus = order.status == 'delivered';
      }

      bool matchesSearch = true;
      if (_searchQuery.trim().isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        matchesSearch = order.orderNumber.toLowerCase().contains(query) ||
            order.items.any((item) => item.productName.toLowerCase().contains(query));
      }

      return matchesStatus && matchesSearch;
    }).toList();
  }

  /**
   * Status metrics counts for dashboard.
   */
  int get totalOrdersCount => _orders.length;
  int get pendingApprovalCount => _orders.where((o) => o.status == 'pending_approval').length;
  int get inTransitCount => _orders.where((o) => o.status == 'in_transit').length;
  int get deliveredCount => _orders.where((o) => o.status == 'delivered').length;

  void setStatusFilter(String status) {
    _selectedStatusFilter = status;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  /**
   * Finds order by orderNumber.
   */
  OrderModel? getOrderByNumber(String orderNumber) {
    try {
      return _orders.firstWhere((o) => o.orderNumber == orderNumber);
    } catch (_) {
      return null;
    }
  }

  /**
   * Submits a newly placed order from customer cart items.
   */
  Future<OrderModel> submitOrder({
    required List<CartItemModel> cartItems,
    required double totalAmount,
    required UserModel customer,
    String? notes,
  }) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 700));

    final newId = _orders.length + 1;
    final newOrderNumber = 'B2B-2026-${newId.toString().padLeft(4, '0')}';
    final nowIso = DateTime.now().toIso8601String();

    final orderItems = cartItems.asMap().entries.map((entry) {
      final idx = entry.key;
      final cartItem = entry.value;
      return OrderItemModel(
        id: idx + 1,
        productId: cartItem.product.id,
        productName: cartItem.product.name,
        productCode: cartItem.product.code,
        category: cartItem.product.category,
        quantity: cartItem.quantity,
        unitPrice: cartItem.product.unitPrice,
        totalPrice: cartItem.totalPrice,
      );
    }).toList();

    final newOrder = OrderModel(
      id: newId,
      orderNumber: newOrderNumber,
      customerName: customer.company,
      customerSapCode: customer.sapCode,
      status: 'pending_approval',
      totalAmount: totalAmount,
      createdAt: nowIso,
      updatedAt: nowIso,
      notes: notes,
      items: orderItems,
    );

    _orders.insert(0, newOrder);
    _isLoading = false;
    notifyListeners();
    return newOrder;
  }
}
