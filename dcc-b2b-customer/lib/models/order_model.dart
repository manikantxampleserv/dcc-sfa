/**
 * Model representing an order item line within a customer order.
 */
class OrderItemModel {
  final int id;
  final int productId;
  final String productName;
  final String productCode;
  final String category;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  const OrderItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productCode,
    required this.category,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] as int,
      productId: json['product_id'] as int,
      productName: json['product_name'] as String,
      productCode: json['product_code'] as String,
      category: json['category'] as String,
      quantity: json['quantity'] as int,
      unitPrice: (json['unit_price'] as num).toDouble(),
      totalPrice: (json['total_price'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'product_name': productName,
      'product_code': productCode,
      'category': category,
      'quantity': quantity,
      'unit_price': unitPrice,
      'total_price': totalPrice,
    };
  }
}

/**
 * Model representing a B2B Purchase Order.
 */
class OrderModel {
  final int id;
  final String orderNumber;
  final String customerName;
  final String customerSapCode;
  final String status;
  final double totalAmount;
  final String createdAt;
  final String updatedAt;
  final String? approvedBy;
  final String? approvedAt;
  final String? rejectionReason;
  final String? deliveryDate;
  final String? notes;
  final List<OrderItemModel> items;

  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.customerSapCode,
    required this.status,
    required this.totalAmount,
    required this.createdAt,
    required this.updatedAt,
    this.approvedBy,
    this.approvedAt,
    this.rejectionReason,
    this.deliveryDate,
    this.notes,
    required this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as int,
      orderNumber: json['order_number'] as String,
      customerName: json['customer_name'] as String,
      customerSapCode: json['customer_sap_code'] as String,
      status: json['status'] as String,
      totalAmount: (json['total_amount'] as num).toDouble(),
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      approvedBy: json['approved_by'] as String?,
      approvedAt: json['approved_at'] as String?,
      rejectionReason: json['rejection_reason'] as String?,
      deliveryDate: json['delivery_date'] as String?,
      notes: json['notes'] as String?,
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => OrderItemModel.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_number': orderNumber,
      'customer_name': customerName,
      'customer_sap_code': customerSapCode,
      'status': status,
      'total_amount': totalAmount,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'approved_by': approvedBy,
      'approved_at': approvedAt,
      'rejection_reason': rejectionReason,
      'delivery_date': deliveryDate,
      'notes': notes,
      'items': items.map((i) => i.toJson()).toList(),
    };
  }
}
