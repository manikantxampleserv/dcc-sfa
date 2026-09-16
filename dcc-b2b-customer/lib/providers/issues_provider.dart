import 'package:flutter/foundation.dart';
import '../mock/mock_issues_data.dart';
import '../models/issue_model.dart';

/**
 * Provider handling customer complaints, support issues, and feedback.
 */
class IssuesProvider with ChangeNotifier {
  List<IssueModel> _issues = [];
  List<FeedbackModel> _feedbacks = [];

  List<IssueModel> get issues => _issues;
  List<FeedbackModel> get feedbacks => _feedbacks;

  int get openIssuesCount => _issues.where((i) => i.status == 'open' || i.status == 'in_progress').length;

  IssuesProvider() {
    _issues = MockIssuesData.getIssues();
    _feedbacks = MockIssuesData.getFeedbacks();
  }

  /**
   * Submits a newly raised customer support issue.
   */
  Future<IssueModel> raiseIssue({
    required String orderNumber,
    required String type,
    required String priority,
    required String subject,
    required String description,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final newId = _issues.length + 1;
    final nowIso = DateTime.now().toIso8601String();

    final newIssue = IssueModel(
      id: newId,
      issueNumber: 'ISS-2026-${newId.toString().padLeft(4, '0')}',
      orderNumber: orderNumber,
      type: type,
      priority: priority,
      subject: subject,
      description: description,
      status: 'open',
      createdAt: nowIso,
      updatedAt: nowIso,
    );

    _issues.insert(0, newIssue);
    notifyListeners();
    return newIssue;
  }

  /**
   * Submits satisfaction feedback for a completed order.
   */
  Future<void> submitFeedback({
    required String orderNumber,
    required int rating,
    required int deliveryRating,
    required int productQualityRating,
    required String comment,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final newFeedback = FeedbackModel(
      id: _feedbacks.length + 1,
      orderNumber: orderNumber,
      rating: rating,
      deliveryRating: deliveryRating,
      productQualityRating: productQualityRating,
      comment: comment,
      submittedAt: DateTime.now().toIso8601String(),
    );

    _feedbacks.insert(0, newFeedback);
    notifyListeners();
  }
}
