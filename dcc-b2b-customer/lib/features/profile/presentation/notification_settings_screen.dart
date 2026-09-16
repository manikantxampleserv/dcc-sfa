import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';

/**
 * Customer Notifications and Alerts Preferences Screen.
 */
class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  bool _orderUpdates = true;
  bool _deliveryTracking = true;
  bool _invoiceDue = true;
  bool _promotions = false;

  Widget _buildToggleTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 14)),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            activeColor: AppColors.primary600,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: const Text('Notification Preferences'),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildToggleTile(
            title: 'Order Status Changes',
            subtitle: 'Instant alerts when orders are approved, dispatched, or delayed',
            value: _orderUpdates,
            onChanged: (v) => setState(() => _orderUpdates = v),
          ),
          const SizedBox(height: 10),
          _buildToggleTile(
            title: 'Live Delivery Dispatch',
            subtitle: 'GPS vehicle departure alerts and estimated delivery times',
            value: _deliveryTracking,
            onChanged: (v) => setState(() => _deliveryTracking = v),
          ),
          const SizedBox(height: 10),
          _buildToggleTile(
            title: 'Invoice Due Date Reminders',
            subtitle: 'Reminders 5 days prior to 30-day payment maturity',
            value: _invoiceDue,
            onChanged: (v) => setState(() => _invoiceDue = v),
          ),
          const SizedBox(height: 10),
          _buildToggleTile(
            title: 'Seasonal Restock Promos',
            subtitle: 'Volume discounts and new SKU availability',
            value: _promotions,
            onChanged: (v) => setState(() => _promotions = v),
          ),
        ],
      ),
    );
  }
}
