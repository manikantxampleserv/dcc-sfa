import prisma from '../../configs/prisma.client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import { generateEmailContent } from '../../utils/emailTemplates';

export const alertsController = {
  async getAllAlerts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        alert_type,
        sub_type,
        status,
        priority,
        target_type,
      } = req.query;

      const whereClause: any = {
        is_active: 'Y',
        ...(alert_type && { alert_type: alert_type as string }),
        ...(sub_type && { sub_type: sub_type as string }),
        ...(status && { status: status as string }),
        ...(priority && { priority: priority as string }),
        ...(target_type && { target_type: target_type as string }),
      };

      if (req.user?.role !== 'admin') {
        whereClause.OR = [{ status: 'P' }, { approver_id: req.user?.id }];
      }

      const { data, pagination } = await paginate({
        model: prisma.alerts,
        filters: whereClause,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        orderBy: { createdate: 'desc' },
        include: {
          alerts_template: {
            select: { id: true, name: true, key: true, body: true },
          },
          approver_users: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      const formattedData = await Promise.all(
        data.map(async (alert: any) => {
          const canSeeContent =
            req.user?.role === 'admin' ||
            alert.status === 'P' ||
            alert.approver_id === req.user?.id;

          let renderedContent = null;
          if (canSeeContent && alert.alerts_template) {
            const templateVariables = {
              customer_name: alert.target_name,
              customer_id: alert.target_id,
              alert_type: alert.alert_type,
              sub_type: alert.sub_type,
              createdate: alert.createdate,
              current_category_name:
                alert.sub_type === 'upgrade'
                  ? 'Previous Category'
                  : alert.sub_type === 'downgrade'
                    ? 'Current Category'
                    : 'None',
              proposed_category_name:
                alert.sub_type === 'upgrade'
                  ? 'Proposed Category'
                  : alert.sub_type === 'downgrade'
                    ? 'New Category'
                    : 'Assigned Category',
              sales_amount: 'Sales Amount',
              threshold_value: 'Threshold Value',
              change_type: alert.sub_type,
              action_required: 'Review Required',
            };

            try {
              const emailTemplate = await generateEmailContent(
                alert.alerts_template.key,
                templateVariables
              );
              renderedContent = emailTemplate.body;
            } catch (error) {
              console.error('Template rendering failed:', error);
              renderedContent = alert.alerts_template.body;
            }
          }

          return {
            ...alert,
            content: renderedContent,
            alerts_template: canSeeContent ? alert.alerts_template : null,
          };
        })
      );

      return res.status(200).json({
        message: 'Alerts retrieved successfully',
        data: formattedData,
        pagination,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getAlertById(req: Request, res: Response) {
    try {
      const alertId = Number(req.params.id);

      const alert = await prisma.alerts.findUnique({
        where: { id: alertId },
        include: {
          alerts_template: {
            select: { id: true, name: true, key: true, body: true },
          },
        },
      });

      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      // Check if user can see this alert
      const canSeeContent =
        req.user?.role === 'admin' ||
        alert.status === 'P' ||
        alert.approver_id === req.user?.id;

      let renderedContent = null;
      if (canSeeContent && alert.alerts_template) {
        const templateVariables = {
          customer_name: alert.target_name,
          customer_id: alert.target_id,
          alert_type: alert.alert_type,
          sub_type: alert.sub_type,
          createdate: alert.createdate,
          current_category_name:
            alert.sub_type === 'upgrade'
              ? 'Previous Category'
              : alert.sub_type === 'downgrade'
                ? 'Current Category'
                : 'None',
          proposed_category_name:
            alert.sub_type === 'upgrade'
              ? 'Proposed Category'
              : alert.sub_type === 'downgrade'
                ? 'New Category'
                : 'Assigned Category',
          sales_amount: 'Sales Amount',
          threshold_value: 'Threshold Value',
          change_type: alert.sub_type,
          action_required: 'Review Required',
        };

        try {
          const emailTemplate = await generateEmailContent(
            alert.alerts_template.key,
            templateVariables
          );
          renderedContent = emailTemplate.body;
        } catch (error) {
          console.error('Template rendering failed:', error);
          renderedContent = alert.alerts_template.body;
        }
      }

      return res.status(200).json({
        message: 'Alert retrieved successfully',
        data: {
          ...alert,
          content: renderedContent,
          alerts_template: canSeeContent ? alert.alerts_template : null,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async createAlert(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        alert_type,
        sub_type,
        priority = 'M',
        target_type,
        target_id,
        target_name,
        template_id,
        scheduled_date,
        due_date,
      } = req.body;

      const alert = await prisma.alerts.create({
        data: {
          title,
          description,
          alert_type,
          sub_type,
          priority,
          target_type,
          target_id,
          target_name,
          template_id,
          scheduled_date,
          due_date,
          createdby: req.user?.id || 1,
        },
      });

      return res.status(201).json({
        message: 'Alert created successfully',
        data: alert,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async updateAlert(req: Request, res: Response) {
    try {
      const alertId = Number(req.params.id);
      const {
        title,
        description,
        alert_type,
        sub_type,
        priority,
        target_type,
        target_id,
        target_name,
        template_id,
        scheduled_date,
        due_date,
        is_active,
      } = req.body;

      const alert = await prisma.alerts.update({
        where: { id: alertId },
        data: {
          title,
          description,
          alert_type,
          sub_type,
          priority,
          target_type,
          target_id,
          target_name,
          template_id,
          scheduled_date,
          due_date,
          is_active,
          updatedby: req.user?.id,
          updatedate: new Date(),
        },
      });

      return res.status(200).json({
        message: 'Alert updated successfully',
        data: alert,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async deleteAlert(req: Request, res: Response) {
    try {
      const alertId = Number(req.params.id);

      const alert = await prisma.alerts.update({
        where: { id: alertId },
        data: {
          is_active: 'N',
          updatedby: req.user?.id,
          updatedate: new Date(),
        },
      });

      return res.status(200).json({
        message: 'Alert deleted successfully',
        data: alert,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async processAlert(req: Request, res: Response) {
    try {
      const alertId = Number(req.params.id);
      const { action, notes } = req.body;

      const alert = await prisma.alerts.findUnique({
        where: { id: alertId },
        include: {
          alerts_template: true,
        },
      });

      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      if (alert.status !== 'P') {
        return res.status(400).json({
          message: `Alert already ${alert.status}`,
        });
      }

      await prisma.$transaction(async tx => {
        // Update alert
        await tx.alerts.update({
          where: { id: alertId },
          data: {
            status:
              action === 'acknowledge' ? 'C' : action === 'approve' ? 'A' : 'R',
            approver_id: req.user?.id,
            approver_notes: notes,
            approved_date: new Date(),
            action_taken: action,
            action_details: notes,
            updatedby: req.user?.id,
            updatedate: new Date(),
          },
        });

        // If it's a category change approval, apply the change
        if (alert.alert_type === 'category_change' && action === 'approve') {
          // Extract proposed category ID from template or alert context
          // This could be stored in a separate field or derived from the alert

          // For now, this is a placeholder implementation
          // You may need to adjust based on how you store category info

          // Example: If you have a way to get the proposed category
          const proposedCategoryId = await getProposedCategoryId(alert);

          if (proposedCategoryId) {
            await tx.customers.update({
              where: { id: alert.target_id! },
              data: {
                customer_category_id: proposedCategoryId,
                updatedate: new Date(),
                updatedby: req.user?.id,
              },
            });
          }
        }
      });

      return res.status(200).json({
        message: `Alert ${action}d successfully`,
        action,
        alertType: alert.alert_type,
        targetName: alert.target_name,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async bulkProcessAlerts(req: Request, res: Response) {
    try {
      const { alertIds, action, notes } = req.body;

      const results = {
        processed: 0,
        approved: 0,
        rejected: 0,
        acknowledged: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const alertId of alertIds) {
        try {
          await processSingleAlert(alertId, action, notes, req.user?.id || 1);
          results.processed++;
          if (action === 'approve') results.approved++;
          else if (action === 'reject') results.rejected++;
          else if (action === 'acknowledge') results.acknowledged++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Alert ${alertId}: ${error.message}`);
        }
      }

      return res.status(200).json({
        message: `Bulk ${action} completed`,
        results,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getAlertStats(req: Request, res: Response) {
    try {
      const stats = await Promise.all([
        prisma.alerts.count({ where: { is_active: 'Y' } }),
        prisma.alerts.count({ where: { is_active: 'Y', status: 'P' } }),
        prisma.alerts.count({
          where: { is_active: 'Y', alert_type: 'category_change' },
        }),
        prisma.alerts.count({ where: { is_active: 'Y', priority: 'H' } }),
        prisma.alerts.count({ where: { is_active: 'Y', status: 'P' } }),
      ]);

      return res.status(200).json({
        message: 'Alert statistics retrieved',
        data: {
          total: stats[0],
          pending: stats[1],
          categoryChanges: stats[2],
          highPriority: stats[3],
          pendingApproval: stats[4],
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },
};

async function getProposedCategoryId(alert: any): Promise<number | null> {
  return null;
}

async function processSingleAlert(
  alertId: number,
  action: string,
  notes: string,
  userId: number
) {
  const alert = await prisma.alerts.findUnique({
    where: { id: alertId },
    include: { alerts_template: true },
  });

  if (!alert) {
    throw new Error('Alert not found');
  }

  if (alert.status !== 'P') {
    throw new Error(`Alert already ${alert.status}`);
  }

  await prisma.alerts.update({
    where: { id: alertId },
    data: {
      status: action === 'acknowledge' ? 'C' : action === 'approve' ? 'A' : 'R',
      approver_id: userId,
      approver_notes: notes,
      approved_date: new Date(),
      action_taken: action,
      action_details: notes,
      updatedby: userId,
      updatedate: new Date(),
    },
  });
}
