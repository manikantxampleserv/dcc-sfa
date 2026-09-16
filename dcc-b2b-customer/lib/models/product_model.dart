/**
 * Model representing a Product in the B2B catalog.
 */
class ProductModel {
  final int id;
  final String name;
  final String code;
  final String category;
  final double unitPrice;
  final String unit;
  final String description;
  final int minOrderQty;
  final bool inStock;
  final int stockQty;
  final String imagePlaceholderColor;

  const ProductModel({
    required this.id,
    required this.name,
    required this.code,
    required this.category,
    required this.unitPrice,
    required this.unit,
    required this.description,
    required this.minOrderQty,
    required this.inStock,
    required this.stockQty,
    required this.imagePlaceholderColor,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as int,
      name: json['name'] as String,
      code: json['code'] as String,
      category: json['category'] as String,
      unitPrice: (json['unit_price'] as num).toDouble(),
      unit: json['unit'] as String,
      description: json['description'] as String,
      minOrderQty: json['min_order_qty'] as int,
      inStock: json['in_stock'] as bool,
      stockQty: json['stock_qty'] as int,
      imagePlaceholderColor: json['image_placeholder_color'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'category': category,
      'unit_price': unitPrice,
      'unit': unit,
      'description': description,
      'min_order_qty': minOrderQty,
      'in_stock': inStock,
      'stock_qty': stockQty,
      'image_placeholder_color': imagePlaceholderColor,
    };
  }
}
