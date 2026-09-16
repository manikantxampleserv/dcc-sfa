import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/product_model.dart';
import '../../../providers/cart_provider.dart';

/**
 * Product Card component used in customer product catalog & order placement.
 */
class ProductCard extends StatelessWidget {
  final ProductModel product;

  const ProductCard({
    super.key,
    required this.product,
  });

  Color _parsePlaceholderColor(String hexString) {
    try {
      final buffer = StringBuffer();
      if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
      buffer.write(hexString.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (_) {
      return AppColors.primary50;
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final inCartQty = cart.getProductQuantity(product.id);
    final placeholderBg = _parsePlaceholderColor(product.imagePlaceholderColor);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.015),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /** Product visual banner */
          Container(
            height: 82,
            width: double.infinity,
            decoration: BoxDecoration(
              color: placeholderBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(11)),
            ),
            child: Stack(
              children: [
                Center(
                  child: Icon(
                    product.category == 'Water'
                        ? Icons.water_drop_outlined
                        : product.category == 'Soda'
                            ? Icons.local_drink_outlined
                            : product.category == 'Juice'
                                ? Icons.emoji_food_beverage_outlined
                                : Icons.bolt_outlined,
                    size: 40,
                    color: AppColors.primary700.withOpacity(0.6),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      product.category,
                      style: AppTypography.badgeText.copyWith(
                        fontSize: 10,
                        color: AppColors.primary700,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: product.inStock
                          ? AppColors.successLight
                          : AppColors.dangerLight,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      product.inStock ? 'In Stock' : 'Out of Stock',
                      style: AppTypography.badgeText.copyWith(
                        fontSize: 10,
                        color: product.inStock
                            ? AppColors.success
                            : AppColors.danger,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          /** Details */
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: AppTypography.headingSmall.copyWith(fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    product.code,
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 10,
                      color: AppColors.textTertiary,
                      fontFamily: 'monospace',
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        CurrencyFormatter.format(product.unitPrice),
                        style: AppTypography.metricValue.copyWith(
                          fontSize: 14,
                          color: AppColors.primary700,
                        ),
                      ),
                      Text(
                        '/${product.unit}',
                        style: AppTypography.bodySmall.copyWith(fontSize: 10),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'MOQ: ${product.minOrderQty} ${product.unit}s',
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),

                  /** Add to Cart or Stepper */
                  if (!product.inStock) ...[
                    Container(
                      height: 34,
                      width: double.infinity,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Unavailable',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.textTertiary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ] else if (inCartQty == 0) ...[
                    SizedBox(
                      height: 34,
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          cart.addToCart(product);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary600,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.add_shopping_cart,
                                size: 14, color: Colors.white),
                            const SizedBox(width: 4),
                            Text(
                              'Add (${product.minOrderQty})',
                              style: AppTypography.buttonLabel.copyWith(
                                fontSize: 12,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ] else ...[
                    Container(
                      height: 34,
                      decoration: BoxDecoration(
                        color: AppColors.primary50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.primary100),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove,
                                size: 16, color: AppColors.primary700),
                            onPressed: () => cart.decrementQuantity(product.id),
                            constraints: const BoxConstraints(
                                minWidth: 32, minHeight: 32),
                            padding: EdgeInsets.zero,
                          ),
                          Text(
                            '$inCartQty',
                            style: AppTypography.headingSmall.copyWith(
                              fontSize: 13,
                              color: AppColors.primary700,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add,
                                size: 16, color: AppColors.primary700),
                            onPressed: () => cart.incrementQuantity(product.id),
                            constraints: const BoxConstraints(
                                minWidth: 32, minHeight: 32),
                            padding: EdgeInsets.zero,
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
