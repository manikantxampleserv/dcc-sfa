import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/orders_provider.dart';
import '../../../shared/widgets/dcc_button.dart';
import '../../../shared/widgets/dcc_status_badge.dart';
import '../widgets/order_timeline.dart';
import '../../issues/presentation/raise_issue_screen.dart';
import '../../feedback/presentation/feedback_screen.dart';

/**
 * Detailed Order Information and Tracking View.
 */
class OrderDetailScreen extends StatelessWidget {
  final String orderNumber;

  const OrderDetailScreen({
    super.key,
    required this.orderNumber,
  });

  @override
  Widget build(BuildContext context) {
    final ordersProvider = context.watch<OrdersProvider>();
    final order = ordersProvider.getOrderByNumber(orderNumber);

    if (order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Order Not Found')),
        body: const Center(child: Text('Order record does not exist.')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(order.orderNumber, style: AppTypography.headingMedium),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /** Overview Card */
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Placed on ${DateFormatter.format(order.createdAt)}',
                        style: AppTypography.bodySmall,
                      ),
                      DccStatusBadge(status: order.status),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    CurrencyFormatter.format(order.totalAmount),
                    style: AppTypography.metricValue
                        .copyWith(color: AppColors.primary700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'SAP Account: ${order.customerSapCode} • ${order.customerName}',
                    style: AppTypography.bodySmall.copyWith(fontSize: 11),
                  ),
                  if (order.notes != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary50,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Note: ${order.notes}',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.primary800,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            /** Delivery Tracking Timeline */
            OrderTimeline(status: order.status),
            const SizedBox(height: 16),

            /** Items List */
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
                  Text('Ordered Items (${order.items.length})',
                      style: AppTypography.headingSmall),
                  const SizedBox(height: 12),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: order.items.length,
                    separatorBuilder: (_, _) => const Divider(height: 16),
                    itemBuilder: (context, index) {
                      final item = order.items[index];
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.productName,
                                  style: AppTypography.headingSmall
                                      .copyWith(fontSize: 13),
                                ),
                                Text(
                                  '${item.quantity} units × ${CurrencyFormatter.format(item.unitPrice)}',
                                  style: AppTypography.bodySmall
                                      .copyWith(fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            CurrencyFormatter.format(item.totalPrice),
                            style: AppTypography.bodyMedium
                                .copyWith(fontWeight: FontWeight.w600),
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            /** Action buttons */
            Row(
              children: [
                Expanded(
                  child: DccButton(
                    text: 'Report Issue',
                    variant: DccButtonVariant.outlined,
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) =>
                              RaiseIssueScreen(prefilledOrderNumber: order.orderNumber),
                        ),
                      );
                    },
                  ),
                ),
                if (order.status.toLowerCase() == 'delivered') ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: DccButton(
                      text: 'Rate Delivery',
                      variant: DccButtonVariant.secondary,
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) =>
                                FeedbackScreen(orderNumber: order.orderNumber),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
