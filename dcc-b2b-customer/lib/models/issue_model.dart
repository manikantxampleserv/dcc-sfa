/**
 * Model representing a customer support or delivery issue ticket.
 */
class IssueModel {
  final int id;
  final String issueNumber;
  final String orderNumber;
  final String type;
  final String priority;
  final String subject;
  final String description;
  final String status;
  final String createdAt;
  final String updatedAt;
  final String? resolvedAt;
  final String? assignedTo;
  final String? resolutionNotes;

  const IssueModel({
    required this.id,
    required this.issueNumber,
    required this.orderNumber,
    required this.type,
    required this.priority,
    required this.subject,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.resolvedAt,
    this.assignedTo,
    this.resolutionNotes,
  });

  factory IssueModel.fromJson(Map<String, dynamic> json) {
    return IssueModel(
      id: json['id'] as int,
      issueNumber: json['issue_number'] as String,
      orderNumber: json['order_number'] as String,
      type: json['type'] as String,
      priority: json['priority'] as String,
      subject: json['subject'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      resolvedAt: json['resolved_at'] as String?,
      assignedTo: json['assigned_to'] as String?,
      resolutionNotes: json['resolution_notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'issue_number': issueNumber,
      'order_number': orderNumber,
      'type': type,
      'priority': priority,
      'subject': subject,
      'description': description,
      'status': status,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'resolved_at': resolvedAt,
      'assigned_to': assignedTo,
      'resolution_notes': resolutionNotes,
    };
  }
}

/**
 * Model representing order delivery and quality feedback.
 */
class FeedbackModel {
  final int id;
  final String orderNumber;
  final int rating;
  final int deliveryRating;
  final int productQualityRating;
  final String comment;
  final String submittedAt;

  const FeedbackModel({
    required this.id,
    required this.orderNumber,
    required this.rating,
    required this.deliveryRating,
    required this.productQualityRating,
    required this.comment,
    required this.submittedAt,
  });

  factory FeedbackModel.fromJson(Map<String, dynamic> json) {
    return FeedbackModel(
      id: json['id'] as int,
      orderNumber: json['order_number'] as String,
      rating: json['rating'] as int,
      deliveryRating: json['delivery_rating'] as int,
      productQualityRating: json['product_quality_rating'] as int,
      comment: json['comment'] as String,
      submittedAt: json['submitted_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_number': orderNumber,
      'rating': rating,
      'delivery_rating': deliveryRating,
      'product_quality_rating': productQualityRating,
      'comment': comment,
      'submitted_at': submittedAt,
    };
  }
}
