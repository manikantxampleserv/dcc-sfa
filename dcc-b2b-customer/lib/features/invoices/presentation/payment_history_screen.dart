import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/invoices_provider.dart';
import '../../../shared/widgets/dcc_empty_state.dart';

/**
 * Customer Payment History and Receipts screen.
 */
class PaymentHistoryScreen extends StatelessWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final invoicesProvider = context.watch<InvoicesProvider>();
    final payments = invoicesProvider.payments;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Payment History', style: AppTypography.headingMedium),
      ),
      body: payments.isEmpty
          ? DccEmptyState(
              icon: Icons.receipt_outlined,
              title: 'No payments recorded',
              message: 'Past payment transactions will appear here.',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: payments.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final payment = payments[index];
                return Container(
                  padding: const EdgeInsets.all(14),
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
                            payment.paymentNumber,
                            style: AppTypography.headingSmall.copyWith(
                              fontSize: 13,
                              color: AppColors.primary700,
                              fontFamily: 'monospace',
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              payment.confirmedBy != null
                                  ? 'Confirmed'
                                  : 'Processing',
                              style: AppTypography.badgeText.copyWith(
                                fontSize: 10,
                                color: AppColors.success,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            CurrencyFormatter.format(payment.amount),
                            style: AppTypography.metricValue
                                .copyWith(fontSize: 15),
                          ),
                          Text(
                            'For ${payment.invoiceNumber}',
                            style: AppTypography.bodySmall,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Ref: ${payment.reference} • ${payment.method.replaceAll('_', ' ').toUpperCase()}',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.textTertiary,
                        ),
                      ),
                      Text(
                        'Paid on ${DateFormatter.formatWithTime(payment.paidAt)}',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 10,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
