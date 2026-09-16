import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../models/cart_item_model.dart';
import '../models/product_model.dart';

/**
 * Cart State Provider managing items, quantities, and order totals.
 */
class CartProvider with ChangeNotifier {
  final List<CartItemModel> _items = [];

  List<CartItemModel> get items => List.unmodifiable(_items);

  int get totalItemCount => _items.fold(0, (sum, item) => sum + item.quantity);

  int get uniqueItemCount => _items.length;

  bool get isEmpty => _items.isEmpty;

  double get subtotal => _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get vatAmount => subtotal * AppConstants.vatPercentage;

  double get grandTotal => subtotal + vatAmount;

  /**
   * Retrieves quantity for a specific product currently in cart.
   */
  int getProductQuantity(int productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index != -1) {
      return _items[index].quantity;
    }
    return 0;
  }

  /**
   * Adds or increments product in cart.
   */
  void addToCart(ProductModel product, {int? quantity}) {
    final addQty = quantity ?? product.minOrderQty;
    final existingIndex = _items.indexWhere((item) => item.product.id == product.id);

    if (existingIndex != -1) {
      _items[existingIndex].quantity += addQty;
    } else {
      _items.add(CartItemModel(product: product, quantity: addQty));
    }
    notifyListeners();
  }

  /**
   * Increments product quantity by 1 unit or step.
   */
  void incrementQuantity(int productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index != -1) {
      _items[index].quantity++;
      notifyListeners();
    }
  }

  /**
   * Decrements product quantity or removes if below minimum.
   */
  void decrementQuantity(int productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index != -1) {
      if (_items[index].quantity > 1) {
        _items[index].quantity--;
      } else {
        _items.removeAt(index);
      }
      notifyListeners();
    }
  }

  /**
   * Removes specific item from cart.
   */
  void removeItem(int productId) {
    _items.removeWhere((item) => item.product.id == productId);
    notifyListeners();
  }

  /**
   * Clears all items in cart.
   */
  void clear() {
    _items.clear();
    notifyListeners();
  }
}
