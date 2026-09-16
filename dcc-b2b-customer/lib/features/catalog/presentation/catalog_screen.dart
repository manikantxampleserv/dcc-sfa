import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../mock/mock_products_data.dart';
import '../../../models/product_model.dart';
import '../../../providers/cart_provider.dart';
import '../../../shared/widgets/dcc_filter_chip.dart';
import '../../../shared/widgets/dcc_search_bar.dart';
import '../widgets/product_card.dart';
import '../../orders/presentation/place_order_screen.dart';

/**
 * Product Catalog Screen with live category filtering, search, and quick ordering.
 */
class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<ProductModel> get _filteredProducts {
    return MockProductsData.products.where((p) {
      final matchesCat =
          _selectedCategory == 'All' || p.category.toLowerCase() == _selectedCategory.toLowerCase();
      final matchesQuery = _searchQuery.isEmpty ||
          p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.code.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final products = _filteredProducts;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Product Catalog', style: AppTypography.headingMedium),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined, color: AppColors.primary700),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PlaceOrderScreen()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          /** Search Bar */
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: DccSearchBar(
              controller: _searchController,
              hintText: 'Search products by name or code...',
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                });
              },
              onClear: () {
                setState(() {
                  _searchQuery = '';
                });
              },
            ),
          ),

          /** Categories horizontal filter */
          SizedBox(
            height: 38,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: MockProductsData.categories.length,
              itemBuilder: (context, index) {
                final cat = MockProductsData.categories[index];
                return DccFilterChip(
                  label: cat,
                  isSelected: _selectedCategory == cat,
                  onTap: () {
                    setState(() {
                      _selectedCategory = cat;
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          /** Product Grid */
          Expanded(
            child: products.isEmpty
                ? Center(
                    child: Text(
                      'No products found matching "$_searchQuery"',
                      style: AppTypography.bodySmall,
                    ),
                  )
                : LayoutBuilder(
                    builder: (context, constraints) {
                      final screenWidth = MediaQuery.of(context).size.width;
                      final textScale =
                          MediaQuery.textScalerOf(context).scale(1.0);

                      /** Responsive columns based on device screen width */
                      final int crossAxisCount = screenWidth >= 600 ? 3 : 2;

                      /** Dynamic card height to fit content without cropping on any physical device */
                      final double cardHeight = (236.0 +
                              (textScale > 1.0
                                  ? (textScale - 1.0) * 45.0
                                  : 0.0))
                          .clamp(232.0, 275.0);

                      return GridView.builder(
                        padding: EdgeInsets.fromLTRB(
                            16, 4, 16, cart.isEmpty ? 16 : 80),
                        gridDelegate:
                            SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          mainAxisExtent: cardHeight,
                        ),
                        itemCount: products.length,
                        itemBuilder: (context, index) {
                          return ProductCard(product: products[index]);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),

      /** Floating Cart Checkout Bar */
      bottomSheet: cart.isEmpty
          ? null
          : Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: const Border(top: BorderSide(color: AppColors.cardBorder)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 10,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${cart.totalItemCount} items selected',
                          style: AppTypography.bodySmall.copyWith(fontSize: 11),
                        ),
                        Text(
                          CurrencyFormatter.format(cart.grandTotal),
                          style: AppTypography.metricValue.copyWith(
                            fontSize: 16,
                            color: AppColors.primary700,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const PlaceOrderScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        elevation: 0,
                      ),
                      icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                      label: Text(
                        'Review Cart',
                        style: AppTypography.buttonLabel.copyWith(
                          fontSize: 13,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
