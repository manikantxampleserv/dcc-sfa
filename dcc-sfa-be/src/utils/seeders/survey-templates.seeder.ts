/**
 * @fileoverview Survey Templates Seeder
 * @description Creates sample survey templates for customer feedback, employee evaluation, and market research
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import logger from '../../configs/logger';
import prisma from '../../configs/prisma.client';

interface MockSurveyTemplate {
  title: string;
  description?: string;
  category: string;
  target_roles?: string;
  is_published: boolean;
  published_at?: Date;
  expires_at?: Date;
  is_active: string;
}

const mockSurveyTemplates: MockSurveyTemplate[] = [
  {
    title: 'Customer Satisfaction Survey',
    description: 'Comprehensive survey to measure customer satisfaction levels',
    category: 'Customer Feedback',
    target_roles: 'Salesperson,Manager',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    is_active: 'Y',
  },
  {
    title: 'Product Quality Assessment',
    description:
      'Survey to assess product quality and identify improvement areas',
    category: 'Product Feedback',
    target_roles: 'Salesperson,Quality Manager',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    is_active: 'Y',
  },
  {
    title: 'Employee Performance Review',
    description: 'Quarterly performance evaluation survey for employees',
    category: 'HR Evaluation',
    target_roles: 'Manager,HR',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    is_active: 'Y',
  },
  {
    title: 'Market Research - Competitor Analysis',
    description: 'Survey to gather information about competitor activities',
    category: 'Market Research',
    target_roles: 'Salesperson,Marketing Manager',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    is_active: 'Y',
  },
  {
    title: 'Service Delivery Feedback',
    description: 'Survey to evaluate service delivery quality and timeliness',
    category: 'Service Quality',
    target_roles: 'Salesperson,Customer Service',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    is_active: 'Y',
  },
  {
    title: 'Training Effectiveness Survey',
    description: 'Post-training survey to measure training effectiveness',
    category: 'Training Evaluation',
    target_roles: 'All',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    is_active: 'Y',
  },
  {
    title: 'Safety Compliance Check',
    description: 'Monthly safety compliance and awareness survey',
    category: 'Safety',
    target_roles: 'All',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    is_active: 'Y',
  },
  {
    title: 'Technology Adoption Survey',
    description: 'Survey to assess technology adoption and digital readiness',
    category: 'Technology',
    target_roles: 'All',
    is_published: false,
    is_active: 'Y',
  },
  {
    title: 'Supplier Performance Evaluation',
    description: 'Quarterly evaluation of supplier performance and reliability',
    category: 'Supplier Management',
    target_roles: 'Procurement Manager,Quality Manager',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    is_active: 'Y',
  },
  {
    title: 'Customer Retention Analysis',
    description: 'Survey to understand customer retention factors and loyalty',
    category: 'Customer Analytics',
    target_roles: 'Salesperson,Marketing Manager',
    is_published: true,
    published_at: new Date(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    is_active: 'Y',
  },
  {
    title: 'Draft Survey Template',
    description: 'Template under development - not yet published',
    category: 'Development',
    target_roles: 'Manager',
    is_published: false,
    is_active: 'N',
  },
];

/**
 * Seed Survey Templates with mock data
 */
export async function seedSurveyTemplates(): Promise<void> {
  try {
    let templatesCreated = 0;
    let templatesSkipped = 0;

    for (const template of mockSurveyTemplates) {
      const existingTemplate = await prisma.surveys.findFirst({
        where: { title: template.title },
      });

      if (!existingTemplate) {
        // Convert target_roles string to role ID
        let targetRoleId: number | null = null;
        if (template.target_roles) {
          // Get the first role from the comma-separated string
          const firstRoleName = template.target_roles.split(',')[0].trim();
          const role = await prisma.roles.findFirst({
            where: { name: firstRoleName },
          });
          targetRoleId = role?.id || null;
        }

        await prisma.surveys.create({
          data: {
            title: template.title,
            description: template.description,
            category: template.category,
            target_roles: targetRoleId,
            is_published: template.is_published,
            published_at: template.published_at,
            expires_at: template.expires_at,
            response_count: 0,
            is_active: template.is_active,
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        templatesCreated++;
      } else {
        templatesSkipped++;
      }
    }

    logger.info(
      `Survey Templates seeding completed: ${templatesCreated} created, ${templatesSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding survey templates:', error);
    throw error;
  }
}

/**
 * Clear Survey Templates data
 */
export async function clearSurveyTemplates(): Promise<void> {
  try {
    await prisma.surveys.deleteMany({});
  } catch (error) {
    throw error;
  }
}
