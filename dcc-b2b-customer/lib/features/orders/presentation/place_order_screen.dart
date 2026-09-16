import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/cart_provider.dart';
import '../../../providers/orders_provider.dart';
import '../../../shared/widgets/dcc_button.dart';
import '../../../shared/widgets/dcc_empty_state.dart';
import '../../../shared/widgets/dcc_text_field.dart';
import 'order_detail_screen.dart';

/**
 * Place Order & Cart Review Screen.
 */
class PlaceOrderScreen extends StatefulWidget {
  const PlaceOrderScreen({super.key});

  @override
  State<PlaceOrderScreen> createState() => _PlaceOrderScreenState();
}

class _PlaceOrderScreenState extends State<PlaceOrderScreen> {
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleConfirmOrder() async {
    final cart = context.read<CartProvider>();
    final auth = context.read<AuthProvider>();
    final ordersProvider = context.read<OrdersProvider>();

    if (cart.isEmpty || auth.currentUser == null) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final newOrder = await ordersProvider.submitOrder(
        cartItems: cart.items,
        totalAmount: cart.grandTotal,
        customer: auth.currentUser!,
        notes: _notesController.text.trim().isNotEmpty
            ? _notesController.text.trim()
            : null,
      );

      cart.clear();

      if (!mounted) return;

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: AppColors.successLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_outline,
                    size: 48, color: AppColors.success),
              ),
              const SizedBox(height: 16),
              Text('Order Submitted!', style: AppTypography.headingMedium),
              const SizedBox(height: 8),
              Text(
                'Order ${newOrder.orderNumber} has been transmitted to your Sales Officer for approval.',
                style: AppTypography.bodySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              DccButton(
                text: 'View Order Details',
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (_) =>
                          OrderDetailScreen(orderNumber: newOrder.orderNumber),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Cart & Checkout', style: AppTypography.headingMedium),
        actions: [
          if (!cart.isEmpty)
            TextButton(
              onPressed: () {
                cart.clear();
              },
              child: Text(
                'Clear',
                style: AppTypography.buttonLabel.copyWith(
                  color: AppColors.danger,
                  fontSize: 13,
                ),
              ),
            ),
        ],
      ),
      body: cart.isEmpty
          ? DccEmptyState(
              icon: Icons.remove_shopping_cart_outlined,
              title: 'Your cart is empty',
              message:
                  'Select beverage products from the catalog to build your order.',
              actionText: 'Browse Catalog',
              onAction: () => Navigator.of(context).pop(),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /** Cart Items Section */
                  Text('Selected Products (${cart.uniqueItemCount})',
                      style: AppTypography.headingSmall),
                  const SizedBox(height: 12),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: cart.items.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppColors.primary50,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Center(
                                child: Text(
                                  item.product.category.substring(0, 1),
                                  style: AppTypography.headingSmall.copyWith(
                                    color: AppColors.primary700,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    style: AppTypography.headingSmall
                                        .copyWith(fontSize: 13),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    '${CurrencyFormatter.format(item.product.unitPrice)} / ${item.product.unit}',
                                    style: AppTypography.bodySmall
                                        .copyWith(fontSize: 11),
                                  ),
                                  Text(
                                    CurrencyFormatter.format(item.totalPrice),
                                    style: AppTypography.headingSmall.copyWith(
                                      fontSize: 13,
                                      color: AppColors.primary700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove, size: 16),
                                  onPressed: () => cart.decrementQuantity(
                                      item.product.id),
                                  constraints: const BoxConstraints(
                                      minWidth: 32, minHeight: 32),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary50,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '${item.quantity}',
                                    style: AppTypography.headingSmall
                                        .copyWith(fontSize: 12),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.add, size: 16),
                                  onPressed: () => cart.incrementQuantity(
                                      item.product.id),
                                  constraints: const BoxConstraints(
                                      minWidth: 32, minHeight: 32),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 20),

                  /** Delivery Notes */
                  Text('Order Instructions / Notes',
                      style: AppTypography.headingSmall),
                  const SizedBox(height: 8),
                  DccTextField(
                    controller: _notesController,
                    hintText: 'e.g. Delivery gate, urgent restocking...',
                    maxLines: 2,
                  ),
                  const SizedBox(height: 20),

                  /** Cost Breakdown Summary */
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Price Breakdown',
                            style: AppTypography.headingSmall),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Subtotal', style: AppTypography.bodySmall),
                            Text(CurrencyFormatter.format(cart.subtotal),
                                style: AppTypography.bodyMedium),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('VAT (18%)', style: AppTypography.bodySmall),
                            Text(CurrencyFormatter.format(cart.vatAmount),
                                style: AppTypography.bodyMedium),
                          ],
                        ),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Total Amount',
                              style: AppTypography.headingSmall
                                  .copyWith(fontSize: 14),
                            ),
                            Text(
                              CurrencyFormatter.format(cart.grandTotal),
                              style: AppTypography.metricValue
                                  .copyWith(color: AppColors.primary700),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  /** Submit Button */
                  DccButton(
                    text: 'Submit Order for Approval',
                    isLoading: _isSubmitting,
                    onPressed: _handleConfirmOrder,
                    trailingIcon: const Icon(Icons.check_circle_outline,
                        size: 18, color: Colors.white),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }
}
