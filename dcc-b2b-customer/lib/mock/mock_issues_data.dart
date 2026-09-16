import '../models/issue_model.dart';

/**
 * Mock issues and customer feedback dataset.
 */
abstract final class MockIssuesData {
  static List<IssueModel> getIssues() {
    final now = DateTime.now();
    return [
      IssueModel(
        id: 1,
        issueNumber: 'ISS-2026-0012',
        orderNumber: 'B2B-2026-0001',
        type: 'damage',
        priority: 'high',
        subject: 'Damaged cartons of Bonite Water 500ml',
        description:
            '2 cartons received with crushed bottles during transit unloading.',
        status: 'in_progress',
        createdAt: now.subtract(const Duration(days: 6)).toIso8601String(),
        updatedAt: now.subtract(const Duration(days: 4)).toIso8601String(),
        assignedTo: 'Grace Mwangi (Customer Service)',
        resolutionNotes: 'Credit note requested for 2 cartons.',
      ),
      IssueModel(
        id: 2,
        issueNumber: 'ISS-2026-0008',
        orderNumber: 'B2B-2025-0980',
        type: 'late_delivery',
        priority: 'medium',
        subject: 'Delayed dispatch by 48 hours',
        description:
            'Delivery vehicle had mechanical failure on Morogoro road.',
        status: 'resolved',
        createdAt: now.subtract(const Duration(days: 20)).toIso8601String(),
        updatedAt: now.subtract(const Duration(days: 18)).toIso8601String(),
        resolvedAt: now.subtract(const Duration(days: 18)).toIso8601String(),
        assignedTo: 'Logistics Supervisor',
        resolutionNotes: 'Consignment rerouted via standby truck.',
      ),
    ];
  }

  static List<FeedbackModel> getFeedbacks() {
    final now = DateTime.now();
    return [
      FeedbackModel(
        id: 1,
        orderNumber: 'B2B-2026-0001',
        rating: 4,
        deliveryRating: 4,
        productQualityRating: 5,
        comment:
            'Great product condition, packaging was neat and driver was courteous.',
        submittedAt: now.subtract(const Duration(days: 5)).toIso8601String(),
      ),
    ];
  }
}
