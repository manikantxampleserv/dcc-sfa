import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/widgets/dcc_button.dart';
import '../../issues/presentation/my_issues_screen.dart';
import 'notification_settings_screen.dart';

/**
 * Customer Account and Business Profile Screen.
 */
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Widget _buildInfoRow(String label, String value, {bool isMono = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.bodySmall),
          Text(
            value,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
              fontFamily: isMono ? 'monospace' : null,
              color: isMono ? AppColors.primary700 : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.primary600, size: 20),
        ),
        title: Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 13)),
        subtitle: Text(subtitle, style: AppTypography.bodySmall.copyWith(fontSize: 11)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textTertiary),
        onTap: onTap,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Customer Account', style: AppTypography.headingMedium),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            /** Profile Header Card */
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        user?.name.isNotEmpty == true ? user!.name.substring(0, 1) : 'A',
                        style: AppTypography.headingLarge.copyWith(color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(user?.company ?? 'Customer Company', style: AppTypography.headingMedium),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary50,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      user?.sapCode ?? 'SAP-001234',
                      style: AppTypography.badgeText.copyWith(
                        color: AppColors.primary700,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  const Divider(height: 24),
                  _buildInfoRow('Primary Contact', user?.name ?? '-'),
                  _buildInfoRow('Official Email', user?.email ?? '-'),
                  _buildInfoRow('Phone', user?.phone ?? '-'),
                  _buildInfoRow('Primary Depot', 'Moshi Central Depot (DCC)'),
                ],
              ),
            ),
            const SizedBox(height: 18),

            /** Quick Navigation Links */
            _buildNavTile(
              icon: Icons.support_agent_outlined,
              title: 'Support & Tickets',
              subtitle: 'Track complaints and delivery dispute resolutions',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const MyIssuesScreen()),
                );
              },
            ),
            _buildNavTile(
              icon: Icons.notifications_none_outlined,
              title: 'Notification Preferences',
              subtitle: 'Configure SMS & order dispatch alerts',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                      builder: (_) => const NotificationSettingsScreen()),
                );
              },
            ),
            const SizedBox(height: 16),

            /** Sign Out Button */
            DccButton(
              text: 'Log Out',
              variant: DccButtonVariant.outlined,
              leadingIcon: const Icon(Icons.logout, size: 18, color: AppColors.primary600),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Log Out'),
                    content: const Text('Are you sure you want to log out of DCC B2B?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          context.read<AuthProvider>().logout();
                        },
                        child: const Text('Log Out', style: TextStyle(color: AppColors.danger)),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
            Text(
              'DCC Sales Force Automation • B2B Customer v1.0.0',
              style: AppTypography.bodySmall.copyWith(fontSize: 10, color: AppColors.textTertiary),
            ),
          ],
        ),
      ),
    );
  }
}
