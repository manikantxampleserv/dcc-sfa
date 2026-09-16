import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../mock/mock_products_data.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/cart_provider.dart';
import '../../../providers/invoices_provider.dart';
import '../../../providers/issues_provider.dart';
import '../../../providers/orders_provider.dart';
import '../../../shared/widgets/dcc_header.dart';
import '../../../shared/widgets/dcc_stats_card.dart';
import '../../../shared/widgets/dcc_status_badge.dart';
import '../../catalog/presentation/catalog_screen.dart';
import '../../orders/presentation/my_orders_screen.dart';
import '../../orders/presentation/order_detail_screen.dart';
import '../../orders/presentation/place_order_screen.dart';
import '../../notifications/presentation/notifications_screen.dart';

/**
 * Customer Home Dashboard Screen.
 */
class DashboardScreen extends StatelessWidget {
  final VoidCallback? onNavigateToCatalog;
  final VoidCallback? onNavigateToOrders;
  final VoidCallback? onNavigateToInvoices;

  const DashboardScreen({
    super.key,
    this.onNavigateToCatalog,
    this.onNavigateToOrders,
    this.onNavigateToInvoices,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final cart = context.watch<CartProvider>();
    final ordersProvider = context.watch<OrdersProvider>();
    final invoicesProvider = context.watch<InvoicesProvider>();
    final issuesProvider = context.watch<IssuesProvider>();

    final recentOrders = ordersProvider.orders.take(4).toList();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: Column(
        children: [
          /** Customer Info Header */
          DccHeader(
            user: auth.currentUser,
            cartCount: cart.totalItemCount,
            onCartPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PlaceOrderScreen()),
              );
            },
            onNotificationsPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),

          /** Dashboard Scrollable Area */
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                await Future.delayed(const Duration(milliseconds: 400));
              },
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    /** Quick Order Action Banner */
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary600.withOpacity(0.25),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Restock Your Inventory',
                                  style: AppTypography.headingSmall.copyWith(
                                    color: Colors.white,
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Place bulk beverage orders with direct depot dispatch & live status tracking.',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 11,
                                  ),
                                ),
                                const SizedBox(height: 14),
                                ElevatedButton.icon(
                                  onPressed:
                                      onNavigateToCatalog ??
                                      () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                const CatalogScreen(),
                                          ),
                                        );
                                      },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: AppColors.primary700,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 10,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    elevation: 0,
                                  ),
                                  icon: const Icon(
                                    Icons.add_shopping_cart,
                                    size: 16,
                                  ),
                                  label: Text(
                                    'Order Now',
                                    style: AppTypography.buttonLabel.copyWith(
                                      fontSize: 12,
                                      color: AppColors.primary700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            Icons.local_shipping_outlined,
                            size: 64,
                            color: Colors.white.withOpacity(0.25),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    /** KPI Stat Cards Grid */
                    Text(
                      'Business Overview',
                      style: AppTypography.headingSmall,
                    ),
                    const SizedBox(height: 18),
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      childAspectRatio: 1.45,
                      children: [
                        DccStatsCard(
                          title: 'Active Orders',
                          value: '${ordersProvider.totalOrdersCount}',
                          icon: Icons.receipt_long_outlined,
                          iconColor: AppColors.primary600,
                          iconBgColor: AppColors.primary50,
                          subtitle:
                              '${ordersProvider.pendingApprovalCount} pending approval',
                          onTap: onNavigateToOrders,
                        ),
                        DccStatsCard(
                          title: 'In Transit',
                          value: '${ordersProvider.inTransitCount}',
                          icon: Icons.local_shipping_outlined,
                          iconColor: AppColors.info,
                          iconBgColor: AppColors.infoLight,
                          subtitle: 'En route to your gate',
                          onTap: onNavigateToOrders,
                        ),
                        DccStatsCard(
                          title: 'Outstanding Due',
                          value: CurrencyFormatter.formatCompact(
                            invoicesProvider.totalOutstandingBalance,
                          ),
                          icon: Icons.account_balance_wallet_outlined,
                          iconColor: AppColors.warning,
                          iconBgColor: AppColors.warningLight,
                          subtitle:
                              '${invoicesProvider.overdueInvoicesCount} overdue bills',
                          onTap: onNavigateToInvoices,
                        ),
                        DccStatsCard(
                          title: 'Support Tickets',
                          value: '${issuesProvider.openIssuesCount}',
                          icon: Icons.support_agent_outlined,
                          iconColor: AppColors.success,
                          iconBgColor: AppColors.successLight,
                          subtitle: 'Active resolutions',
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    /** Popular SKUs Quick Order Carousel */
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Popular Products',
                          style: AppTypography.headingSmall,
                        ),
                        TextButton(
                          onPressed: onNavigateToCatalog,
                          child: Text(
                            'View Catalog',
                            style: AppTypography.buttonLabel.copyWith(
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 135,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: EdgeInsets.zero,
                        itemCount: MockProductsData.products.take(5).length,
                        separatorBuilder: (_, _) => const SizedBox(width: 10),
                        itemBuilder: (context, index) {
                          final product = MockProductsData.products[index];
                          return Container(
                            width: 155,
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  product.name,
                                  style: AppTypography.headingSmall.copyWith(
                                    fontSize: 12,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  CurrencyFormatter.format(product.unitPrice),
                                  style: AppTypography.bodySmall.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary700,
                                  ),
                                ),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      cart.addToCart(product);
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            'Added ${product.minOrderQty} ${product.unit}s to cart',
                                          ),
                                          duration: const Duration(seconds: 1),
                                        ),
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primary50,
                                      foregroundColor: AppColors.primary700,
                                      elevation: 0,
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 6,
                                      ),
                                    ),
                                    child: Text(
                                      '+ Quick Add',
                                      style: AppTypography.badgeText.copyWith(
                                        color: AppColors.primary700,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 12),

                    /** Recent Orders Section */
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Recent Orders',
                          style: AppTypography.headingSmall,
                        ),
                        TextButton(
                          onPressed:
                              onNavigateToOrders ??
                              () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const MyOrdersScreen(),
                                  ),
                                );
                              },
                          child: Text(
                            'See All',
                            style: AppTypography.buttonLabel.copyWith(
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      itemCount: recentOrders.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final order = recentOrders[index];
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
                                    orderNumber: order.orderNumber,
                                  ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(
                                      Icons.receipt_outlined,
                                      size: 20,
                                      color: AppColors.primary700,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          order.orderNumber,
                                          style: AppTypography.headingSmall
                                              .copyWith(fontSize: 13),
                                        ),
                                        Text(
                                          '${order.items.length} items • ${DateFormatter.format(order.createdAt)}',
                                          style: AppTypography.bodySmall
                                              .copyWith(fontSize: 11),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      DccStatusBadge(status: order.status),
                                      const SizedBox(height: 4),
                                      Text(
                                        CurrencyFormatter.format(
                                          order.totalAmount,
                                        ),
                                        style: AppTypography.bodyMedium
                                            .copyWith(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 12,
                                            ),
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
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
