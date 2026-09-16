import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/orders_provider.dart';
import '../../../shared/widgets/dcc_empty_state.dart';
import '../../../shared/widgets/dcc_filter_chip.dart';
import '../../../shared/widgets/dcc_search_bar.dart';
import '../../../shared/widgets/dcc_status_badge.dart';
import 'order_detail_screen.dart';
import 'place_order_screen.dart';

/**
 * My Orders screen with tabs, search, and status tracking.
 */
class MyOrdersScreen extends StatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  State<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersProvider = context.watch<OrdersProvider>();
    final orders = ordersProvider.filteredOrders;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('My Orders', style: AppTypography.headingMedium),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_shopping_cart, color: AppColors.primary700),
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
          /** Search bar */
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: DccSearchBar(
              controller: _searchController,
              hintText: 'Search order number or product...',
              onChanged: (val) => ordersProvider.setSearchQuery(val),
              onClear: () => ordersProvider.setSearchQuery(''),
            ),
          ),

          /** Filter chips */
          SizedBox(
            height: 38,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: OrdersProvider.statusFilters.length,
              itemBuilder: (context, index) {
                final filter = OrdersProvider.statusFilters[index];
                return DccFilterChip(
                  label: filter,
                  isSelected: ordersProvider.selectedStatusFilter == filter,
                  onTap: () => ordersProvider.setStatusFilter(filter),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          /** Orders list */
          Expanded(
            child: orders.isEmpty
                ? DccEmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'No orders found',
                    message: 'No orders matching your selected status or query.',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    itemCount: orders.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: InkWell(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => OrderDetailScreen(
                                    orderNumber: order.orderNumber),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      order.orderNumber,
                                      style: AppTypography.headingSmall.copyWith(
                                        fontSize: 14,
                                        color: AppColors.primary700,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    DccStatusBadge(status: order.status),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${order.items.length} items • Placed ${DateFormatter.format(order.createdAt)}',
                                  style: AppTypography.bodySmall,
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      CurrencyFormatter.format(order.totalAmount),
                                      style: AppTypography.metricValue
                                          .copyWith(fontSize: 15),
                                    ),
                                    Row(
                                      children: [
                                        Text(
                                          'Track',
                                          style: AppTypography.bodySmall.copyWith(
                                            color: AppColors.primary600,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Icon(
                                          Icons.arrow_forward_ios,
                                          size: 12,
                                          color: AppColors.primary600,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
