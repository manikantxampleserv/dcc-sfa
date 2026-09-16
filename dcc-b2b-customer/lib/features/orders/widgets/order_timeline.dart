import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';

/**
 * Visual Order Tracking Stepper showing milestone progress.
 */
class OrderTimeline extends StatelessWidget {
  final String status;

  const OrderTimeline({
    super.key,
    required this.status,
  });

  int get _currentStep {
    switch (status.toLowerCase()) {
      case 'draft':
        return 0;
      case 'pending_approval':
        return 1;
      case 'approved':
        return 2;
      case 'in_transit':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    final steps = [
      {'title': 'Order Placed', 'desc': 'Received by system'},
      {'title': 'SO Approval', 'desc': 'Verified by Sales Officer'},
      {'title': 'Depot Processing', 'desc': 'Picked & packed for dispatch'},
      {'title': 'In Transit', 'desc': 'Dispatched with delivery vehicle'},
      {'title': 'Delivered', 'desc': 'Received & confirmed at customer gate'},
    ];

    final activeStep = _currentStep;
    final isRejected = status.toLowerCase() == 'rejected' || status.toLowerCase() == 'cancelled';

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
              Text('Order Status Tracking', style: AppTypography.headingSmall),
              if (isRejected)
                Text(
                  'Terminated',
                  style: AppTypography.badgeText.copyWith(color: AppColors.danger),
                ),
            ],
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: steps.length,
            itemBuilder: (context, index) {
              final isCompleted = index <= activeStep && !isRejected;
              final isCurrent = index == activeStep && !isRejected;
              final isLast = index == steps.length - 1;

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? AppColors.primary600
                              : AppColors.surfaceMuted,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isCompleted
                                ? AppColors.primary600
                                : AppColors.cardBorder,
                            width: 2,
                          ),
                        ),
                        child: Center(
                          child: isCompleted
                              ? const Icon(Icons.check, size: 14, color: Colors.white)
                              : Text(
                                  '${index + 1}',
                                  style: AppTypography.badgeText.copyWith(
                                    fontSize: 10,
                                    color: AppColors.textTertiary,
                                  ),
                                ),
                        ),
                      ),
                      if (!isLast)
                        Container(
                          width: 2,
                          height: 28,
                          color: index < activeStep && !isRejected
                              ? AppColors.primary600
                              : AppColors.cardBorder,
                        ),
                    ],
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            steps[index]['title']!,
                            style: AppTypography.headingSmall.copyWith(
                              fontSize: 13,
                              color: isCurrent
                                  ? AppColors.primary700
                                  : isCompleted
                                      ? AppColors.textPrimary
                                      : AppColors.textTertiary,
                              fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w500,
                            ),
                          ),
                          Text(
                            steps[index]['desc']!,
                            style: AppTypography.bodySmall.copyWith(
                              fontSize: 11,
                              color: isCurrent
                                  ? AppColors.textSecondary
                                  : AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
