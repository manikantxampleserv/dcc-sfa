import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/issues_provider.dart';
import '../../../shared/widgets/dcc_empty_state.dart';
import '../../../shared/widgets/dcc_status_badge.dart';
import 'raise_issue_screen.dart';

/**
 * Customer Support Issues and Tickets tracking screen.
 */
class MyIssuesScreen extends StatelessWidget {
  const MyIssuesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final issuesProvider = context.watch<IssuesProvider>();
    final issues = issuesProvider.issues;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text('Help & Support Tickets', style: AppTypography.headingMedium),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: AppColors.primary700),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const RaiseIssueScreen()),
              );
            },
          ),
        ],
      ),
      body: issues.isEmpty
          ? DccEmptyState(
              icon: Icons.check_circle_outline,
              title: 'No open support issues',
              message: 'Your account has no reported tickets at this time.',
              actionText: 'Raise New Issue',
              onAction: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const RaiseIssueScreen()),
                );
              },
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: issues.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final issue = issues[index];
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
                          Text(
                            issue.issueNumber,
                            style: AppTypography.headingSmall.copyWith(
                              fontSize: 13,
                              color: AppColors.primary700,
                              fontFamily: 'monospace',
                            ),
                          ),
                          DccStatusBadge(status: issue.status),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        issue.subject,
                        style: AppTypography.headingSmall.copyWith(fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        issue.description,
                        style: AppTypography.bodySmall,
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceMuted,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.receipt_outlined,
                                size: 12, color: AppColors.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              'Order: ${issue.orderNumber} • ${issue.type.toUpperCase()}',
                              style: AppTypography.bodySmall.copyWith(
                                fontSize: 10,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (issue.resolutionNotes != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Resolution: ${issue.resolutionNotes}',
                          style: AppTypography.bodySmall.copyWith(
                            fontSize: 11,
                            color: AppColors.success,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                      const SizedBox(height: 6),
                      Text(
                        'Logged on ${DateFormatter.format(issue.createdAt)}${issue.assignedTo != null ? ' • Assigned to ${issue.assignedTo}' : ''}',
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 10,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const RaiseIssueScreen()),
          );
        },
        backgroundColor: AppColors.primary600,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: Text('Report Issue', style: AppTypography.buttonLabel.copyWith(color: Colors.white)),
      ),
    );
  }
}
