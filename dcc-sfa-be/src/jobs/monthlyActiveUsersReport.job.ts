import cron from 'node-cron';
import ExcelJS from 'exceljs';
import prisma from '../configs/prisma.client';
import { hiddenUsersPrismaFilter } from '../configs/hiddenUsers.config';
import logger from '../configs/logger';
import { generateEmailContent } from '../utils/emailTemplates';
import { sendEmail } from '../utils/mailer';

const TEMPLATE_KEY = 'monthly_active_users_report';

export const ensureTemplateExists = async () => {
  try {
    const existing = await prisma.sfa_d_templates.findUnique({
      where: { key: TEMPLATE_KEY },
    });

    if (!existing) {
      await prisma.sfa_d_templates.create({
        data: {
          name: 'Monthly Active Users Report',
          key: TEMPLATE_KEY,
          channel: 'email',
          type: 'report',
          subject:
            'Monthly Active Users Report - ${month_year} | ${company_name}',
          body: `<div style="font-family: Arial, sans-serif; max-width: 750px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333333;">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 600;">Monthly Active Users Report</h1>
    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Summary Period: \${month_year}</p>
  </div>
  <div style="padding: 24px; background-color: #f9fafb;">
    <p style="font-size: 15px; margin-top: 0;">Dear <strong>\${client_name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">Below is the monthly active users summary for <strong>\${company_name}</strong>. An Excel sheet containing complete details is also attached to this email.</p>
    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #111827;">Report Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280; width: 180px;">Company Name:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #111827;">\${company_name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Total Active Users:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #16a34a;">\${total_active_users}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Report Date:</td>
          <td style="padding: 6px 0; color: #374151;">\${generated_date}</td>
        </tr>
      </table>
    </div>
    <h3 style="margin: 20px 0 10px 0; font-size: 15px; color: #111827;">Active Users Roster</h3>
    <div style="overflow-x: auto; margin-bottom: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px;">
      \${users_table}
    </div>
    <p style="font-size: 12px; color: #6b7280; margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
      This is an automated monthly notification sent from the DCC SFA System. Please contact support if you have any questions.
    </p>
  </div>
</div>`,
          createdate: new Date(),
          createdby: 1,
        },
      });
      logger.info(
        `[MonthlyActiveUsersReport] Created default template "${TEMPLATE_KEY}" in sfa_d_templates.`
      );
    }
  } catch (error: any) {
    logger.error(
      '[MonthlyActiveUsersReport] Error ensuring template exists:',
      error.message
    );
  }
};

/**
 * Checks whether today is the last day of the current calendar month.
 */
export const isLastDayOfMonth = (date: Date = new Date()): boolean => {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  return tomorrow.getDate() === 1;
};

/**
 * Builds HTML table for active users to embed into email body.
 */
export const buildUsersTableHtml = (users: any[]): string => {
  if (!users || users.length === 0) {
    return '<p style="padding: 16px; color: #6b7280; margin: 0;">No active users found.</p>';
  }

  const rows = users
    .map(
      (u, idx) => `
    <tr style="border-bottom: 1px solid #f3f4f6; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${u.employee_id || 'N/A'}</td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #111827;">${u.name || ''}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #4b5563;">${u.email || ''}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${u.user_role?.name || 'N/A'}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${u.user_depot?.name || 'N/A'}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #6b7280;">${
        u.last_login
          ? new Date(u.last_login).toLocaleDateString('en-GB')
          : 'Never'
      }</td>
    </tr>`
    )
    .join('');

  return `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; text-align: left;">
      <thead>
        <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase;">Emp ID</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase;">Name</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase;">Email</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase;">Role</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase;">Depot</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase;">Last Login</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

/**
 * Generates an Excel workbook buffer listing active users.
 */
export const generateUsersExcelBuffer = async (
  users: any[],
  companyName: string,
  monthYear: string
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DCC SFA System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Active Users', {
    properties: { tabColor: { argb: '1E3A8A' } },
  });

  // Title Rows
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${companyName} - Monthly Active Users Report (${monthYear})`;
  titleCell.font = {
    name: 'Calibri',
    size: 14,
    bold: true,
    color: { argb: 'FFFFFF' },
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E3A8A' },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('A2:H2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Generated on: ${new Date().toLocaleString()} | Total Active Users: ${users.length}`;
  subCell.font = {
    name: 'Calibri',
    size: 10,
    italic: true,
    color: { argb: '374151' },
  };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 20;

  // Header Row
  const headers = [
    'S.No',
    'Employee ID',
    'Name',
    'Email',
    'Phone Number',
    'Role',
    'Depot',
    'Last Login',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell(cell => {
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563EB' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Data Rows
  users.forEach((user, index) => {
    const row = worksheet.addRow([
      index + 1,
      user.employee_id || 'N/A',
      user.name || '',
      user.email || '',
      user.phone_number || 'N/A',
      user.user_role?.name || 'N/A',
      user.user_depot?.name || 'N/A',
      user.last_login
        ? new Date(user.last_login).toLocaleDateString('en-GB')
        : 'Never',
    ]);

    row.height = 20;
    const isEven = index % 2 === 0;
    row.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 10 };
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F9FAFB' },
        };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } },
      };
    });
  });

  // Auto-fit column widths
  worksheet.columns = [
    { width: 8 }, // S.No
    { width: 16 }, // Employee ID
    { width: 26 }, // Name
    { width: 30 }, // Email
    { width: 18 }, // Phone Number
    { width: 20 }, // Role
    { width: 22 }, // Depot
    { width: 16 }, // Last Login
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

/**
 * Core function to send active users summary to client/companies.
 * Can be run for all companies or an individual company.
 */
export const sendMonthlyActiveUsersEmail = async (targetCompanyId?: number) => {
  logger.info(
    '[MonthlyActiveUsersJob] Starting active users report dispatch...'
  );

  try {
    await ensureTemplateExists();

    const companyWhere: any = { is_active: 'Y' };
    if (targetCompanyId) {
      companyWhere.id = targetCompanyId;
    }

    const companies = await prisma.companies.findMany({
      where: companyWhere,
      orderBy: { id: 'asc' },
    });

    if (!companies.length) {
      logger.warn(
        '[MonthlyActiveUsersJob] No active companies found to send report to.'
      );
      return { success: 0, failed: 0 };
    }

    const now = new Date();
    const monthYear = now.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const formattedDate = now.toLocaleDateString('en-GB');

    let successCount = 0;
    let failedCount = 0;

    for (const company of companies) {
      const recipientEmail = company.email;
      if (!recipientEmail) {
        logger.warn(
          `[MonthlyActiveUsersJob] Skipping company "${company.name}" (ID: ${company.id}): No email configured.`
        );
        failedCount++;
        continue;
      }

      // Query active users for this company (or where parent_id is null if single-tenant)
      const activeUsers = await prisma.users.findMany({
        where: {
          is_active: 'Y',
          ...hiddenUsersPrismaFilter,
          OR: [{ parent_id: company.id }, { parent_id: null }],
        },
        include: {
          user_role: true,
          user_depot: true,
        },
        orderBy: { name: 'asc' },
      });

      logger.info(
        `[MonthlyActiveUsersJob] Company "${company.name}": Found ${activeUsers.length} active users.`
      );

      const usersTableHtml = buildUsersTableHtml(activeUsers);

      const variables = {
        company_name: company.name,
        client_name: company.name,
        month_year: monthYear,
        total_active_users: activeUsers.length.toString(),
        generated_date: formattedDate,
        users_table: usersTableHtml,
      };

      const template = await generateEmailContent(TEMPLATE_KEY, variables);

      if (
        template.subject === '__SKIP_EMAIL__' ||
        template.body === '__SKIP_EMAIL__'
      ) {
        logger.warn(
          `[MonthlyActiveUsersJob] Template "${TEMPLATE_KEY}" skipped.`
        );
        failedCount++;
        continue;
      }

      // Generate Excel attachment
      let attachmentBuffer: Buffer | undefined;
      try {
        attachmentBuffer = await generateUsersExcelBuffer(
          activeUsers,
          company.name,
          monthYear
        );
      } catch (excelError: any) {
        logger.error(
          '[MonthlyActiveUsersJob] Error generating Excel attachment:',
          excelError.message
        );
      }

      const sanitizedCompanyName = company.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Active_Users_${sanitizedCompanyName}_${monthYear.replace(/\s+/g, '_')}.xlsx`;

      const attachments = attachmentBuffer
        ? [
            {
              filename,
              content: attachmentBuffer,
            },
          ]
        : undefined;

      const sent = await sendEmail({
        to: recipientEmail,
        subject: template.subject,
        html: template.body,
        attachments,
        log_inst: company.log_inst || undefined,
        createdby: company.created_by,
      });

      if (sent) {
        successCount++;
        logger.info(
          `[MonthlyActiveUsersJob] Successfully sent monthly active users report to ${recipientEmail} for company ${company.name}`
        );
      } else {
        failedCount++;
        logger.error(
          `[MonthlyActiveUsersJob] Failed to send email to ${recipientEmail} for company ${company.name}`
        );
      }
    }

    logger.info(
      `[MonthlyActiveUsersJob] Completed report run. Sent: ${successCount}, Failed: ${failedCount}`
    );
    return { success: successCount, failed: failedCount };
  } catch (error: any) {
    logger.error(
      '[MonthlyActiveUsersJob] Unexpected error in monthly active users job:',
      error
    );
    throw error;
  }
};

let scheduledTask: any = null;

/**
 * Initializes the cron task for month-end dispatch.
 * Checks at 23:50 on days 28-31 of every month, executing on the final day.
 */
export const scheduleMonthlyActiveUsersReport = () => {
  if (scheduledTask) {
    scheduledTask.stop();
  }

  // Runs at 23:50 on 28th to 31st of every month
  scheduledTask = cron.schedule('50 23 28-31 * *', async () => {
    if (isLastDayOfMonth()) {
      logger.info(
        '[MonthlyActiveUsersCron] Triggered at end of month. Dispatching reports...'
      );
      try {
        await sendMonthlyActiveUsersEmail();
      } catch (err: any) {
        logger.error('[MonthlyActiveUsersCron] Execution error:', err.message);
      }
    }
  });

  logger.info(
    '[MonthlyActiveUsersCron] Monthly active users report cron job registered (50 23 28-31 * *).'
  );
};
