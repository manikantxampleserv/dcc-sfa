/**
 * Model representing a Customer Notification Item.
 */
class NotificationItemModel {
  final String id;
  final String title;
  final String message;
  final String category;
  final String timeAgo;
  final String? relatedOrderNumber;
  bool isRead;

  NotificationItemModel({
    required this.id,
    required this.title,
    required this.message,
    required this.category,
    required this.timeAgo,
    this.relatedOrderNumber,
    this.isRead = false,
  });
}
