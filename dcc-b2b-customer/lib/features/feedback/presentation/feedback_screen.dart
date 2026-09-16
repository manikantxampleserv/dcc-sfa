import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../providers/issues_provider.dart';
import '../../../shared/widgets/dcc_button.dart';
import '../../../shared/widgets/dcc_text_field.dart';

/**
 * Customer Feedback and Rating Screen.
 */
class FeedbackScreen extends StatefulWidget {
  final String orderNumber;

  const FeedbackScreen({
    super.key,
    required this.orderNumber,
  });

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  int _overallRating = 5;
  int _deliveryRating = 5;
  int _productRating = 5;
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Widget _buildStarSelector(String title, int currentRating, ValueChanged<int> onSelect) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTypography.bodySmall.copyWith(
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: List.generate(5, (index) {
            final star = index + 1;
            return IconButton(
              icon: Icon(
                star <= currentRating ? Icons.star : Icons.star_border,
                color: star <= currentRating ? const Color(0xFFF59E0B) : AppColors.cardBorder,
                size: 30,
              ),
              onPressed: () => onSelect(star),
              splashRadius: 20,
            );
          }),
        ),
      ],
    );
  }

  Future<void> _handleSubmit() async {
    setState(() {
      _isSubmitting = true;
    });

    try {
      final issuesProvider = context.read<IssuesProvider>();
      await issuesProvider.submitFeedback(
        orderNumber: widget.orderNumber,
        rating: _overallRating,
        deliveryRating: _deliveryRating,
        productQualityRating: _productRating,
        comment: _commentController.text.trim(),
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Thank you! Your feedback has been received.'),
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
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Order Feedback', style: AppTypography.headingMedium),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Order: ${widget.orderNumber}',
                      style: AppTypography.headingSmall),
                  const SizedBox(height: 4),
                  Text(
                    'Help us improve our stockist delivery and packaging service.',
                    style: AppTypography.bodySmall,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            _buildStarSelector(
              'Overall Delivery Satisfaction',
              _overallRating,
              (r) => setState(() => _overallRating = r),
            ),
            const SizedBox(height: 14),

            _buildStarSelector(
              'Driver & Punctuality Service',
              _deliveryRating,
              (r) => setState(() => _deliveryRating = r),
            ),
            const SizedBox(height: 14),

            _buildStarSelector(
              'Product Condition & Packaging',
              _productRating,
              (r) => setState(() => _productRating = r),
            ),
            const SizedBox(height: 20),

            DccTextField(
              label: 'Comments & Observations',
              hintText: 'Share remarks about pallet quality, loading, or turnaround time...',
              controller: _commentController,
              maxLines: 3,
            ),
            const SizedBox(height: 24),

            DccButton(
              text: 'Submit Feedback',
              isLoading: _isSubmitting,
              onPressed: _handleSubmit,
              trailingIcon: const Icon(Icons.check, size: 18, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
