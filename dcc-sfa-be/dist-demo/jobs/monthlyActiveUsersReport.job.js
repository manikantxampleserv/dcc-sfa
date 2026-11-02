"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleMonthlyActiveUsersReport = exports.sendMonthlyActiveUsersEmail = exports.generateUsersPdfBuffer = exports.generateUsersExcelBuffer = exports.buildUsersTableHtml = exports.isLastDayOfMonth = exports.ensureTemplateExists = exports.HARDCODED_REPORT_CC = exports.HARDCODED_REPORT_TO = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const hiddenUsers_config_1 = require("../configs/hiddenUsers.config");
const logger_1 = __importDefault(require("../configs/logger"));
const emailTemplates_1 = require("../utils/emailTemplates");
const mailer_1 = require("../utils/mailer");
const TEMPLATE_KEY = 'monthly_active_users_report';
exports.HARDCODED_REPORT_TO = 'ashok.kumar@ampleserv.com';
exports.HARDCODED_REPORT_CC = 'anil.kumar@ampleserv.com, shivrawat2002@gmail.com';
const ensureTemplateExists = async () => {
    try {
        const existing = await prisma_client_1.default.sfa_d_templates.findUnique({
            where: { key: TEMPLATE_KEY },
        });
        const defaultBody = `<div style="font-family: Arial, sans-serif; max-width: 750px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333333;">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 600;">Monthly Active Users Report</h1>
    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Summary Period: \${month_year}</p>
  </div>
  <div style="padding: 24px; background-color: #f9fafb;">
    <p style="font-size: 15px; margin-top: 0;">Dear <strong>\${client_name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">Below is the monthly active users summary for <strong>\${company_name}</strong>. Complete details are attached to this email in both <strong>Excel (.xlsx)</strong> and <strong>PDF (.pdf)</strong> formats.</p>
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
          <td style="padding: 6px 0; color: #6b7280;">Logged-in This Month:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #2563eb;">\${logged_in_users}</td>
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
</div>`;
        if (!existing) {
            await prisma_client_1.default.sfa_d_templates.create({
                data: {
                    name: 'Monthly Active Users Report',
                    key: TEMPLATE_KEY,
                    channel: 'email',
                    type: 'report',
                    subject: 'Monthly Active Users Report - ${month_year} | ${company_name}',
                    body: defaultBody,
                    createdate: new Date(),
                    createdby: 1,
                },
            });
            logger_1.default.info(`[MonthlyActiveUsersReport] Created default template "${TEMPLATE_KEY}" in sfa_d_templates.`);
        }
        else if (existing.body &&
            existing.body.includes('An Excel sheet containing complete details')) {
            await prisma_client_1.default.sfa_d_templates.update({
                where: { key: TEMPLATE_KEY },
                data: { body: defaultBody },
            });
            logger_1.default.info(`[MonthlyActiveUsersReport] Updated template "${TEMPLATE_KEY}" with PDF and Excel attachment notice.`);
        }
    }
    catch (error) {
        logger_1.default.error('[MonthlyActiveUsersReport] Error ensuring template exists:', error.message);
    }
};
exports.ensureTemplateExists = ensureTemplateExists;
const isLastDayOfMonth = (date = new Date()) => {
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    return tomorrow.getDate() === 1;
};
exports.isLastDayOfMonth = isLastDayOfMonth;
const buildUsersTableHtml = (users) => {
    if (!users || users.length === 0) {
        return '<p style="padding: 16px; color: #6b7280; margin: 0;">No active users found.</p>';
    }
    const rows = users
        .map((u, idx) => `
    <tr style="border-bottom: 1px solid #f3f4f6; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${u.employee_id || 'N/A'}</td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #111827;">${u.name || ''}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #4b5563;">${u.email || ''}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${u.user_role?.name || 'N/A'}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${u.user_depot?.name || 'N/A'}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #6b7280;">${u.last_login
        ? new Date(u.last_login).toLocaleDateString('en-GB')
        : 'Never'}</td>
    </tr>`)
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
exports.buildUsersTableHtml = buildUsersTableHtml;
const generateUsersExcelBuffer = async (users, companyName, monthYear) => {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'DCC SFA System';
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet('Active Users', {
        properties: { tabColor: { argb: '1E3A8A' } },
    });
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
    subCell.value = `Generated on: ${new Date().toLocaleString()} | Users Logged in This Month: ${users.length}`;
    subCell.font = {
        name: 'Calibri',
        size: 10,
        italic: true,
        color: { argb: '374151' },
    };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;
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
    worksheet.columns = [
        { width: 8 },
        { width: 16 },
        { width: 26 },
        { width: 30 },
        { width: 18 },
        { width: 20 },
        { width: 22 },
        { width: 16 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
};
exports.generateUsersExcelBuffer = generateUsersExcelBuffer;
const generateUsersPdfBuffer = async (users, companyName, monthYear, stats) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                layout: 'landscape',
                margin: 30,
                bufferPages: true,
                autoFirstPage: true,
            });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const margin = 30;
            const contentWidth = pageWidth - margin * 2;
            const primaryColor = '#1E3A8A';
            const secondaryColor = '#2563EB';
            const darkTextColor = '#111827';
            const grayTextColor = '#4B5563';
            const lightBgColor = '#F8FAFC';
            const borderColor = '#E2E8F0';
            const columns = [
                { key: 'sno', label: '#', width: 32, align: 'center' },
                { key: 'emp_id', label: 'Emp ID', width: 75, align: 'left' },
                {
                    key: 'name',
                    label: 'Employee Name',
                    width: 145,
                    align: 'left',
                },
                {
                    key: 'email',
                    label: 'Email Address',
                    width: 175,
                    align: 'left',
                },
                {
                    key: 'phone',
                    label: 'Phone Number',
                    width: 95,
                    align: 'left',
                },
                { key: 'role', label: 'Role', width: 95, align: 'left' },
                { key: 'depot', label: 'Depot', width: 85, align: 'left' },
                {
                    key: 'last_login',
                    label: 'Last Login',
                    width: 79,
                    align: 'center',
                },
            ];
            const drawHeader = (isFirstPage) => {
                const headerHeight = isFirstPage ? 56 : 32;
                doc.rect(margin, margin, contentWidth, headerHeight).fill(primaryColor);
                doc
                    .fillColor('#FFFFFF')
                    .font('Helvetica-Bold')
                    .fontSize(isFirstPage ? 15 : 11)
                    .text(isFirstPage
                    ? `Monthly Active Users Report - ${monthYear}`
                    : `Monthly Active Users Report - ${companyName} (${monthYear})`, margin + 16, margin + (isFirstPage ? 12 : 10), { width: contentWidth - 32 });
                if (isFirstPage) {
                    doc
                        .fillColor('#E0E7FF')
                        .font('Helvetica')
                        .fontSize(9.5)
                        .text(`Company: ${companyName}   |   Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, margin + 16, margin + 34, { width: contentWidth - 32 });
                }
            };
            const drawStatsCards = (startY) => {
                const cardHeight = 44;
                const cardWidth = (contentWidth - 24) / 3;
                const totalEnrolled = stats?.totalActive ?? users.length;
                const loggedInCount = stats?.loggedInThisMonth ?? users.length;
                const notLoggedInCount = Math.max(0, totalEnrolled - loggedInCount);
                const cards = [
                    {
                        label: 'Total Active Users',
                        value: totalEnrolled.toString(),
                        color: '#1E3A8A',
                        bg: '#EFF6FF',
                    },
                    {
                        label: 'Logged in This Month',
                        value: loggedInCount.toString(),
                        color: '#16A34A',
                        bg: '#F0FDF4',
                    },
                    {
                        label: 'Not Logged in This Month',
                        value: notLoggedInCount.toString(),
                        color: '#D97706',
                        bg: '#FFFBEB',
                    },
                ];
                cards.forEach((card, idx) => {
                    const x = margin + idx * (cardWidth + 12);
                    doc
                        .rect(x, startY, cardWidth, cardHeight)
                        .fillAndStroke(card.bg, borderColor);
                    doc
                        .fillColor(grayTextColor)
                        .font('Helvetica')
                        .fontSize(8.5)
                        .text(card.label, x + 12, startY + 8);
                    doc
                        .fillColor(card.color)
                        .font('Helvetica-Bold')
                        .fontSize(13)
                        .text(card.value, x + 12, startY + 22);
                });
                return startY + cardHeight + 14;
            };
            const drawTableHeader = (startY) => {
                const headerHeight = 22;
                doc
                    .rect(margin, startY, contentWidth, headerHeight)
                    .fill(secondaryColor);
                let currentX = margin;
                columns.forEach(col => {
                    doc
                        .fillColor('#FFFFFF')
                        .font('Helvetica-Bold')
                        .fontSize(8.5)
                        .text(col.label, currentX + 4, startY + 6, {
                        width: col.width - 8,
                        align: col.align,
                    });
                    currentX += col.width;
                });
                return startY + headerHeight;
            };
            drawHeader(true);
            let currentY = drawStatsCards(margin + 64);
            currentY = drawTableHeader(currentY);
            const rowHeight = 19;
            const maxY = pageHeight - margin - 30;
            if (users.length === 0) {
                doc
                    .rect(margin, currentY, contentWidth, 28)
                    .fillAndStroke('#FFFFFF', borderColor);
                doc
                    .fillColor(grayTextColor)
                    .font('Helvetica-Oblique')
                    .fontSize(9.5)
                    .text('No active users found for this period.', margin + 12, currentY + 8, {
                    width: contentWidth - 24,
                    align: 'center',
                });
            }
            else {
                users.forEach((user, index) => {
                    if (currentY + rowHeight > maxY) {
                        doc.addPage();
                        drawHeader(false);
                        currentY = drawTableHeader(margin + 38);
                    }
                    const isEven = index % 2 === 0;
                    const rowBg = isEven ? '#FFFFFF' : lightBgColor;
                    doc
                        .rect(margin, currentY, contentWidth, rowHeight)
                        .fillAndStroke(rowBg, borderColor);
                    const lastLoginStr = user.last_login
                        ? new Date(user.last_login).toLocaleDateString('en-GB')
                        : 'Never';
                    const rowData = [
                        (index + 1).toString(),
                        user.employee_id || 'N/A',
                        user.name || 'N/A',
                        user.email || 'N/A',
                        user.phone_number || 'N/A',
                        user.user_role?.name || 'N/A',
                        user.user_depot?.name || 'N/A',
                        lastLoginStr,
                    ];
                    let colX = margin;
                    columns.forEach((col, cIdx) => {
                        doc
                            .fillColor(darkTextColor)
                            .font(cIdx === 2 ? 'Helvetica-Bold' : 'Helvetica')
                            .fontSize(8)
                            .text(rowData[cIdx], colX + 4, currentY + 5, {
                            width: col.width - 8,
                            align: col.align,
                            ellipsis: true,
                            lineBreak: false,
                        });
                        colX += col.width;
                    });
                    currentY += rowHeight;
                });
            }
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                const footerY = pageHeight - margin - 14;
                doc
                    .moveTo(margin, footerY - 4)
                    .lineTo(pageWidth - margin, footerY - 4)
                    .strokeColor(borderColor)
                    .stroke();
                doc
                    .fillColor(grayTextColor)
                    .font('Helvetica')
                    .fontSize(8)
                    .text('DCC SFA System • Automated Monthly Active Users Report', margin, footerY, {
                    width: contentWidth / 2,
                    align: 'left',
                });
                doc
                    .fillColor(grayTextColor)
                    .font('Helvetica')
                    .fontSize(8)
                    .text(`Page ${i + 1} of ${range.count}`, pageWidth - margin - 120, footerY, {
                    width: 120,
                    align: 'right',
                });
            }
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
};
exports.generateUsersPdfBuffer = generateUsersPdfBuffer;
const sendMonthlyActiveUsersEmail = async (targetCompanyId, options) => {
    logger_1.default.info('[MonthlyActiveUsersJob] Starting active users report dispatch...');
    try {
        await (0, exports.ensureTemplateExists)();
        const companyWhere = { is_active: 'Y' };
        if (targetCompanyId) {
            companyWhere.id = targetCompanyId;
        }
        const companies = await prisma_client_1.default.companies.findMany({
            where: companyWhere,
            orderBy: { id: 'asc' },
        });
        if (!companies.length) {
            logger_1.default.warn('[MonthlyActiveUsersJob] No active companies found to send report to.');
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
            const recipientTo = exports.HARDCODED_REPORT_TO;
            const recipientCc = exports.HARDCODED_REPORT_CC;
            const userWhere = {
                is_active: 'Y',
                OR: [{ parent_id: company.id }, { parent_id: null }],
            };
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const totalEnrolledCount = await prisma_client_1.default.users.count({
                where: {
                    is_active: 'Y',
                    ...hiddenUsers_config_1.hiddenUsersPrismaFilter,
                    OR: [{ parent_id: company.id }, { parent_id: null }],
                },
            });
            userWhere.last_login = {
                gte: startOfMonth,
                lte: endOfMonth,
            };
            if (options?.includeAllUsers) {
                delete userWhere.last_login;
            }
            if (options?.onlyLoggedInThisMonth === false) {
                delete userWhere.last_login;
            }
            const activeUsers = await prisma_client_1.default.users.findMany({
                where: userWhere,
                include: {
                    user_role: true,
                    user_depot: true,
                },
                orderBy: { last_login: 'desc' },
            });
            const loggedInCount = activeUsers.filter(u => u.last_login &&
                new Date(u.last_login) >= startOfMonth &&
                new Date(u.last_login) <= endOfMonth).length;
            logger_1.default.info(`[MonthlyActiveUsersJob] Company "${company.name}": Found ${activeUsers.length} logged-in users this month (Total enrolled: ${totalEnrolledCount}).`);
            const usersTableHtml = (0, exports.buildUsersTableHtml)(activeUsers);
            const variables = {
                company_name: company.name,
                client_name: company.name,
                month_year: monthYear,
                total_active_users: totalEnrolledCount.toString(),
                logged_in_users: loggedInCount.toString(),
                generated_date: formattedDate,
                users_table: usersTableHtml,
            };
            const template = await (0, emailTemplates_1.generateEmailContent)(TEMPLATE_KEY, variables);
            if (template.subject === '__SKIP_EMAIL__' ||
                template.body === '__SKIP_EMAIL__') {
                logger_1.default.warn(`[MonthlyActiveUsersJob] Template "${TEMPLATE_KEY}" skipped.`);
                failedCount++;
                continue;
            }
            let excelBuffer;
            try {
                excelBuffer = await (0, exports.generateUsersExcelBuffer)(activeUsers, company.name, monthYear);
            }
            catch (excelError) {
                logger_1.default.error('[MonthlyActiveUsersJob] Error generating Excel attachment:', excelError.message);
            }
            let pdfBuffer;
            try {
                pdfBuffer = await (0, exports.generateUsersPdfBuffer)(activeUsers, company.name, monthYear, {
                    totalActive: totalEnrolledCount,
                    loggedInThisMonth: loggedInCount,
                });
            }
            catch (pdfError) {
                logger_1.default.error('[MonthlyActiveUsersJob] Error generating PDF attachment:', pdfError.message);
            }
            const sanitizedCompanyName = company.name.replace(/[^a-zA-Z0-9_-]/g, '_');
            const baseFilename = `Active_Users_${sanitizedCompanyName}_${monthYear.replace(/\s+/g, '_')}`;
            const attachments = [];
            if (excelBuffer) {
                attachments.push({
                    filename: `${baseFilename}.xlsx`,
                    content: excelBuffer,
                });
            }
            if (pdfBuffer) {
                attachments.push({
                    filename: `${baseFilename}.pdf`,
                    content: pdfBuffer,
                });
            }
            const sent = await (0, mailer_1.sendEmail)({
                to: recipientTo,
                cc: recipientCc,
                subject: template.subject,
                html: template.body,
                attachments: attachments.length > 0 ? attachments : undefined,
                log_inst: company.log_inst || undefined,
                createdby: company.created_by,
            });
            if (sent) {
                successCount++;
                logger_1.default.info(`[MonthlyActiveUsersJob] Successfully sent monthly active users report (Excel & PDF) to ${recipientTo} (CC: ${recipientCc}) for company ${company.name}`);
            }
            else {
                failedCount++;
                logger_1.default.error(`[MonthlyActiveUsersJob] Failed to send email to ${recipientTo} (CC: ${recipientCc}) for company ${company.name}`);
            }
        }
        logger_1.default.info(`[MonthlyActiveUsersJob] Completed report run. Sent: ${successCount}, Failed: ${failedCount}`);
        return { success: successCount, failed: failedCount };
    }
    catch (error) {
        logger_1.default.error('[MonthlyActiveUsersJob] Unexpected error in monthly active users job:', error);
        throw error;
    }
};
exports.sendMonthlyActiveUsersEmail = sendMonthlyActiveUsersEmail;
let scheduledTask = null;
const scheduleMonthlyActiveUsersReport = () => {
    if (scheduledTask) {
        scheduledTask.stop();
    }
    scheduledTask = node_cron_1.default.schedule('30 23 28-31 * *', async () => {
        if ((0, exports.isLastDayOfMonth)()) {
            logger_1.default.info('[MonthlyActiveUsersCron] Triggered at end of month (11:30 PM). Dispatching reports with Excel & PDF...');
            try {
                await (0, exports.sendMonthlyActiveUsersEmail)();
            }
            catch (err) {
                logger_1.default.error('MonthlyActiveUsersCron Execution error:', err.message);
            }
        }
    });
    logger_1.default.info('MonthlyActiveUsersCron Monthly active users report cron job registered for 11:30 PM (30 23 28-31 * *).');
};
exports.scheduleMonthlyActiveUsersReport = scheduleMonthlyActiveUsersReport;
//# sourceMappingURL=monthlyActiveUsersReport.job.js.map