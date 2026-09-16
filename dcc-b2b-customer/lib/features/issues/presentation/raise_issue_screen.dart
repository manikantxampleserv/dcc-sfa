import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../providers/issues_provider.dart';
import '../../../providers/orders_provider.dart';
import '../../../shared/widgets/dcc_button.dart';
import '../../../shared/widgets/dcc_text_field.dart';

/**
 * Screen allowing customers to raise delivery complaints, damage, or shortage tickets.
 */
class RaiseIssueScreen extends StatefulWidget {
  final String? prefilledOrderNumber;

  const RaiseIssueScreen({
    super.key,
    this.prefilledOrderNumber,
  });

  @override
  State<RaiseIssueScreen> createState() => _RaiseIssueScreenState();
}

class _RaiseIssueScreenState extends State<RaiseIssueScreen> {
  late final TextEditingController _orderController;
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _descController = TextEditingController();

  String _selectedType = 'damage';
  String _selectedPriority = 'high';
  bool _isSubmitting = false;

  final Map<String, String> _typeLabels = {
    'damage': 'Product / Bottle Damage',
    'shortage': 'Consignment Shortage',
    'wrong_product': 'Incorrect SKUs Dispatched',
    'late_delivery': 'Delayed Delivery',
    'pricing_dispute': 'Invoice Pricing Dispute',
    'other': 'Other Inquiries',
  };

  @override
  void initState() {
    super.initState();
    _orderController =
        TextEditingController(text: widget.prefilledOrderNumber ?? 'B2B-2026-0001');
  }

  @override
  void dispose() {
    _orderController.dispose();
    _subjectController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (_subjectController.text.trim().isEmpty ||
        _descController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter subject and description.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final issuesProvider = context.read<IssuesProvider>();
      final newTicket = await issuesProvider.raiseIssue(
        orderNumber: _orderController.text.trim(),
        type: _selectedType,
        priority: _selectedPriority,
        subject: _subjectController.text.trim(),
        description: _descController.text.trim(),
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Ticket ${newTicket.issueNumber} logged successfully.'),
          backgroundColor: AppColors.success,
        ),
      );

      Navigator.of(context).pop();
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
    final orders = context.watch<OrdersProvider>().orders;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Raise Support Issue', style: AppTypography.headingMedium),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.primary50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primary100),
              ),
              child: Row(
                children: [
                  const Icon(Icons.support_agent,
                      size: 28, color: AppColors.primary700),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Report damaged items, missing crates, or delivery concerns directly to customer service.',
                      style: AppTypography.bodySmall
                          .copyWith(color: AppColors.primary900),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            /** Order Reference */
            Text('Associated Order',
                style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: orders.any((o) => o.orderNumber == _orderController.text)
                  ? _orderController.text
                  : (orders.isNotEmpty ? orders.first.orderNumber : null),
              decoration: const InputDecoration(
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              items: orders.map((o) {
                return DropdownMenuItem(
                  value: o.orderNumber,
                  child: Text('${o.orderNumber} (${o.status})'),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  _orderController.text = val;
                }
              },
            ),
            const SizedBox(height: 14),

            /** Issue Type */
            Text('Issue Category',
                style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: _selectedType,
              decoration: const InputDecoration(
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              items: _typeLabels.entries.map((e) {
                return DropdownMenuItem(value: e.key, child: Text(e.value));
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedType = val);
              },
            ),
            const SizedBox(height: 14),

            /** Priority */
            Text('Priority Level',
                style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: _selectedPriority,
              decoration: const InputDecoration(
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              items: const [
                DropdownMenuItem(value: 'low', child: Text('Low - General inquiry')),
                DropdownMenuItem(
                    value: 'medium', child: Text('Medium - Non-critical')),
                DropdownMenuItem(
                    value: 'high', child: Text('High - Action required')),
                DropdownMenuItem(
                    value: 'critical', child: Text('Critical - Shipment halted')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _selectedPriority = val);
              },
            ),
            const SizedBox(height: 14),

            /** Subject */
            DccTextField(
              label: 'Subject',
              hintText: 'e.g. 2 crates broken during drop-off',
              controller: _subjectController,
            ),
            const SizedBox(height: 14),

            /** Description */
            DccTextField(
              label: 'Detailed Description',
              hintText:
                  'Provide batch numbers, quantities, driver notes, or details...',
              controller: _descController,
              maxLines: 4,
            ),
            const SizedBox(height: 24),

            /** Submit */
            DccButton(
              text: 'Log Support Ticket',
              isLoading: _isSubmitting,
              onPressed: _handleSubmit,
              trailingIcon: const Icon(Icons.send_rounded,
                  size: 16, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
