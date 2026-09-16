import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../models/notification_model.dart';
import '../../../shared/widgets/dcc_empty_state.dart';
import '../../../shared/widgets/dcc_filter_chip.dart';
import '../../orders/presentation/order_detail_screen.dart';

/**
 * Customer Notifications Feed Screen displaying alerts, status updates, and milestones.
 */
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedFilter = 'All';

  final List<NotificationItemModel> _notifications = [
    NotificationItemModel(
      id: '1',
      title: 'Order Dispatched & In Transit',
      message: 'Driver Juma has departed depot with order B2B-2026-0002. Estimated arrival in 45 mins.',
      category: 'Deliveries',
      timeAgo: '25 mins ago',
      relatedOrderNumber: 'B2B-2026-0002',
      isRead: false,
    ),
    NotificationItemModel(
      id: '2',
      title: 'New Invoice Issued',
      message: 'Invoice INV-2026-0094 generated for B2B-2026-0002 (Balance due: TZS 2,120,000).',
      category: 'Invoices',
      timeAgo: '2 hours ago',
      relatedOrderNumber: 'B2B-2026-0002',
      isRead: false,
    ),
    NotificationItemModel(
      id: '3',
      title: 'Order Under Review',
      message: 'Order B2B-2026-0003 has been received and queued for Sales Officer approval.',
      category: 'Orders',
      timeAgo: '4 hours ago',
      relatedOrderNumber: 'B2B-2026-0003',
      isRead: true,
    ),
    NotificationItemModel(
      id: '4',
      title: 'Support Ticket Assigned',
      message: 'Ticket ISS-2026-0012 regarding crushed cartons assigned to customer service.',
      category: 'Orders',
      timeAgo: '1 day ago',
      relatedOrderNumber: 'B2B-2026-0001',
      isRead: true,
    ),
    NotificationItemModel(
      id: '5',
      title: 'Delivery Completed',
      message: 'Consignment B2B-2026-0001 successfully delivered and confirmed at warehouse gate.',
      category: 'Deliveries',
      timeAgo: '3 days ago',
      relatedOrderNumber: 'B2B-2026-0001',
      isRead: true,
    ),
  ];

  static const List<String> _filters = ['All', 'Orders', 'Deliveries', 'Invoices'];

  List<NotificationItemModel> get _filteredNotifications {
    if (_selectedFilter == 'All') return _notifications;
    return _notifications
        .where((n) => n.category.toLowerCase() == _selectedFilter.toLowerCase())
        .toList();
  }

  int get _unreadCount => _notifications.where((n) => !n.isRead).length;

  void _markAllAsRead() {
    setState(() {
      for (final n in _notifications) {
        n.isRead = true;
      }
    });
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'deliveries':
        return Icons.local_shipping_outlined;
      case 'invoices':
        return Icons.account_balance_wallet_outlined;
      default:
        return Icons.receipt_long_outlined;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'deliveries':
        return AppColors.info;
      case 'invoices':
        return AppColors.warning;
      default:
        return AppColors.primary600;
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredNotifications;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Notifications', style: AppTypography.headingMedium),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: Text(
                'Mark all read',
                style: AppTypography.buttonLabel.copyWith(
                  fontSize: 12,
                  color: AppColors.primary600,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          /** Filters Row */
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SizedBox(
              height: 38,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _filters.length,
                itemBuilder: (context, index) {
                  final filter = _filters[index];
                  return DccFilterChip(
                    label: filter,
                    isSelected: _selectedFilter == filter,
                    onTap: () {
                      setState(() {
                        _selectedFilter = filter;
                      });
                    },
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 4),

          /** Notifications List */
          Expanded(
            child: filtered.isEmpty
                ? DccEmptyState(
                    icon: Icons.notifications_off_outlined,
                    title: 'No notifications',
                    message: 'You have caught up with all $_selectedFilter updates.',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      final iconColor = _getCategoryColor(item.category);

                      return Material(
                        color: item.isRead ? AppColors.surface : AppColors.primary50.withOpacity(0.35),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: item.isRead ? AppColors.cardBorder : AppColors.primary200,
                            width: 1,
                          ),
                        ),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () {
                            setState(() {
                              item.isRead = true;
                            });
                            if (item.relatedOrderNumber != null) {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => OrderDetailScreen(
                                    orderNumber: item.relatedOrderNumber!,
                                  ),
                                ),
                              );
                            }
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(9),
                                  decoration: BoxDecoration(
                                    color: iconColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Icon(
                                    _getCategoryIcon(item.category),
                                    size: 20,
                                    color: iconColor,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              item.title,
                                              style: AppTypography.headingSmall.copyWith(
                                                fontSize: 13,
                                                fontWeight: item.isRead ? FontWeight.w500 : FontWeight.w600,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (!item.isRead)
                                            Container(
                                              width: 8,
                                              height: 8,
                                              decoration: const BoxDecoration(
                                                color: AppColors.primary600,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        item.message,
                                        style: AppTypography.bodySmall.copyWith(
                                          fontSize: 11,
                                          color: item.isRead ? AppColors.textSecondary : AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            item.timeAgo,
                                            style: AppTypography.bodySmall.copyWith(
                                              fontSize: 10,
                                              color: AppColors.textTertiary,
                                            ),
                                          ),
                                          if (item.relatedOrderNumber != null)
                                            Text(
                                              'View Details →',
                                              style: AppTypography.badgeText.copyWith(
                                                fontSize: 10,
                                                color: AppColors.primary700,
                                              ),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
