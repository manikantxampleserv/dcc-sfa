import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/invoice_model.dart';
import '../../../providers/invoices_provider.dart';
import '../../../shared/widgets/dcc_button.dart';
import '../../../shared/widgets/dcc_empty_state.dart';
import '../../../shared/widgets/dcc_filter_chip.dart';
import '../../../shared/widgets/dcc_status_badge.dart';
import '../../../shared/widgets/dcc_text_field.dart';
import 'payment_history_screen.dart';

/**
 * Customer Invoices & Statements Screen.
 */
class InvoiceListScreen extends StatelessWidget {
  const InvoiceListScreen({super.key});

  void _showPaymentModal(BuildContext context, InvoiceModel invoice) {
    final amountController =
        TextEditingController(text: invoice.balanceDue.toStringAsFixed(0));
    final refController = TextEditingController(text: 'MPESA-B2B-${DateTime.now().millisecondsSinceEpoch % 100000}');
    String selectedMethod = 'mobile_money';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Submit Payment', style: AppTypography.headingSmall),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Paying for ${invoice.invoiceNumber} (Balance: ${CurrencyFormatter.format(invoice.balanceDue)})',
                style: AppTypography.bodySmall,
              ),
              const SizedBox(height: 16),
              DccTextField(
                label: 'Payment Amount (TZS)',
                controller: amountController,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              Text('Payment Channel',
                  style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: selectedMethod,
                decoration: const InputDecoration(
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                items: const [
                  DropdownMenuItem(
                      value: 'mobile_money', child: Text('M-Pesa / Tigo Pesa')),
                  DropdownMenuItem(
                      value: 'bank_transfer',
                      child: Text('CRDB / NMB Bank Transfer')),
                  DropdownMenuItem(value: 'cheque', child: Text('Cheque')),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setModalState(() {
                      selectedMethod = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 12),
              DccTextField(
                label: 'Transaction Reference',
                controller: refController,
                hintText: 'e.g. CRDB-TXN-12345 or M-Pesa Code',
              ),
              const SizedBox(height: 20),
              DccButton(
                text: 'Confirm & Submit Payment',
                onPressed: () async {
                  final amount = double.tryParse(amountController.text) ?? 0;
                  if (amount <= 0) return;

                  final invoicesProvider = context.read<InvoicesProvider>();
                  await invoicesProvider.makePayment(
                    invoiceNumber: invoice.invoiceNumber,
                    amount: amount,
                    method: selectedMethod,
                    reference: refController.text.trim(),
                  );

                  if (context.mounted) {
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Payment submitted successfully!'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final invoicesProvider = context.watch<InvoicesProvider>();
    final invoices = invoicesProvider.filteredInvoices;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Invoices & Statements', style: AppTypography.headingMedium),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: AppColors.primary700),
            tooltip: 'Payment History',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /** Financial Summary Banner */
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppColors.cardHeaderGradient,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary900.withOpacity(0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Outstanding Balance',
                        style: AppTypography.bodySmall.copyWith(
                          color: Colors.white70,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: invoicesProvider.overdueInvoicesCount > 0
                              ? AppColors.danger
                              : AppColors.success,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          invoicesProvider.overdueInvoicesCount > 0
                              ? '${invoicesProvider.overdueInvoicesCount} Overdue'
                              : 'Account Current',
                          style: AppTypography.badgeText.copyWith(
                            color: Colors.white,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    CurrencyFormatter.format(
                        invoicesProvider.totalOutstandingBalance),
                    style: AppTypography.headingLarge.copyWith(
                      color: Colors.white,
                      fontSize: 26,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'SAP Account Credit Status: Standard 30 Days',
                    style: AppTypography.bodySmall.copyWith(
                      color: Colors.white60,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            /** Filter Chips */
            SizedBox(
              height: 38,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: InvoicesProvider.filters.length,
                itemBuilder: (context, index) {
                  final filter = InvoicesProvider.filters[index];
                  return DccFilterChip(
                    label: filter,
                    isSelected: invoicesProvider.selectedFilter == filter,
                    onTap: () => invoicesProvider.setFilter(filter),
                  );
                },
              ),
            ),
            const SizedBox(height: 14),

            /** Invoices List */
            if (invoices.isEmpty)
              DccEmptyState(
                icon: Icons.receipt_long_outlined,
                title: 'No invoices found',
                message: 'No invoices matching the selected status.',
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: invoices.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final invoice = invoices[index];
                  final hasBalance = invoice.balanceDue > 0;

                  return Container(
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
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  invoice.invoiceNumber,
                                  style: AppTypography.headingSmall.copyWith(
                                    fontSize: 14,
                                    color: AppColors.primary700,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                Text(
                                  'Order ${invoice.orderNumber}',
                                  style: AppTypography.bodySmall
                                      .copyWith(fontSize: 11),
                                ),
                              ],
                            ),
                            DccStatusBadge(status: invoice.status),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Total',
                                    style: AppTypography.bodySmall
                                        .copyWith(fontSize: 11)),
                                Text(
                                  CurrencyFormatter.format(
                                      invoice.totalAmount),
                                  style: AppTypography.headingSmall
                                      .copyWith(fontSize: 13),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Paid',
                                    style: AppTypography.bodySmall
                                        .copyWith(fontSize: 11)),
                                Text(
                                  CurrencyFormatter.format(
                                      invoice.amountPaid),
                                  style: AppTypography.headingSmall.copyWith(
                                    fontSize: 13,
                                    color: AppColors.success,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('Balance Due',
                                    style: AppTypography.bodySmall
                                        .copyWith(fontSize: 11)),
                                Text(
                                  CurrencyFormatter.format(
                                      invoice.balanceDue),
                                  style: AppTypography.headingSmall.copyWith(
                                    fontSize: 13,
                                    color: hasBalance
                                        ? AppColors.danger
                                        : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Due: ${DateFormatter.format(invoice.dueDate)}',
                              style: AppTypography.bodySmall.copyWith(
                                fontSize: 11,
                                color: AppColors.textTertiary,
                              ),
                            ),
                            if (hasBalance)
                              ElevatedButton(
                                onPressed: () =>
                                    _showPaymentModal(context, invoice),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary600,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 14, vertical: 6),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  elevation: 0,
                                ),
                                child: Text(
                                  'Make Payment',
                                  style: AppTypography.buttonLabel
                                      .copyWith(fontSize: 11, color: Colors.white),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
