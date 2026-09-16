import 'product_model.dart';

/**
 * Model representing an item added to the customer's active order cart.
 */
class CartItemModel {
  final ProductModel product;
  int quantity;

  CartItemModel({
    required this.product,
    required this.quantity,
  });

  double get totalPrice => product.unitPrice * quantity;
}
