import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';

/**
 * Status Chip/Badge component matching web color mappings.
 */
class DccStatusBadge extends StatelessWidget {
  final String status;

  const DccStatusBadge({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color border;
    String label;

    switch (status.toLowerCase()) {
      case 'delivered':
      case 'paid':
      case 'resolved':
      case 'approved':
        bg = AppColors.successLight;
        fg = AppColors.success;
        border = AppColors.successBorder;
        label = _capitalize(status);
        break;
      case 'in_transit':
        bg = AppColors.infoLight;
        fg = AppColors.info;
        border = AppColors.infoBorder;
        label = 'In Transit';
        break;
      case 'pending_approval':
        bg = AppColors.warningLight;
        fg = AppColors.warning;
        border = AppColors.warningBorder;
        label = 'Pending Approval';
        break;
      case 'in_progress':
        bg = AppColors.warningLight;
        fg = AppColors.warning;
        border = AppColors.warningBorder;
        label = 'In Progress';
        break;
      case 'partial':
        bg = AppColors.warningLight;
        fg = AppColors.warning;
        border = AppColors.warningBorder;
        label = 'Partial Paid';
        break;
      case 'overdue':
      case 'rejected':
      case 'cancelled':
        bg = AppColors.dangerLight;
        fg = AppColors.danger;
        border = AppColors.dangerBorder;
        label = _capitalize(status);
        break;
      case 'open':
        bg = AppColors.infoLight;
        fg = AppColors.info;
        border = AppColors.infoBorder;
        label = 'Open';
        break;
      default:
        bg = AppColors.surfaceMuted;
        fg = AppColors.textSecondary;
        border = AppColors.cardBorder;
        label = _capitalize(status);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: border, width: 0.8),
      ),
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: AppTypography.badgeText.copyWith(color: fg),
      ),
    );
  }

  static String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s.replaceAll('_', ' ').split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }
}
