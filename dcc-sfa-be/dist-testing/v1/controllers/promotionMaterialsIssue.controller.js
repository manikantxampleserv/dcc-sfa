"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionMaterialsIssueController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const paginate_1 = require("../../utils/paginate");
const requests_controller_1 = require("./requests.controller");
const serializePromotionMaterialsIssue = (issue, currentApprover = null) => {
    return {
        id: issue.id,
        gin_number: issue.gin_number,
        depot_id: issue.depot_id,
        outlet_id: issue.outlet_id,
        issue_date: issue.issue_date?.toISOString(),
        issued_by_id: issue.issued_by_id || issue.issued_by?.id,
        campaign_reference: issue.campaign_reference,
        remarks: issue.remarks,
        total_value: Number(issue.total_value),
        approval_status: issue.approval_status,
        createdby: issue.createdby,
        createdate: issue.createdate?.toISOString(),
        updatedby: issue.updatedby,
        updatedate: issue.updatedate?.toISOString(),
        depot: issue.depot
            ? { id: issue.depot.id, name: issue.depot.name, code: issue.depot.code }
            : null,
        outlet: issue.outlet
            ? {
                id: issue.outlet.id,
                name: issue.outlet.name,
                code: issue.outlet.code,
            }
            : null,
        issued_by: issue.issued_by
            ? {
                id: issue.issued_by.id,
                name: issue.issued_by.name,
                sap_code: issue.issued_by.sap_code,
                email: issue.issued_by.email,
            }
            : null,
        items: issue.items,
        current_approver: currentApprover,
    };
};
exports.promotionMaterialsIssueController = {
    async getPromotionMaterialsIssues(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const search = req.query.search;
            const status = req.query.status;
            const where = { is_active: 'Y' };
            if (search) {
                where.OR = [
                    { gin_number: { contains: search } },
                    { outlet: { name: { contains: search } } },
                ];
            }
            if (status) {
                where.approval_status = status;
            }
            if (req.query.depot_id) {
                where.depot_id = parseInt(req.query.depot_id);
            }
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.promotion_materials_issue,
                filters: where,
                page,
                limit,
                orderBy: { issue_date: 'desc' },
                include: {
                    depot: true,
                    outlet: true,
                    issued_by: true,
                    items: {
                        where: { is_active: 'Y' },
                        include: { material: true },
                    },
                },
            });
            res.json({
                success: true,
                message: 'Promotion materials issues retrieved successfully',
                meta: {
                    requestDuration: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...pagination,
                },
                data: data.map((d) => serializePromotionMaterialsIssue(d)),
            });
        }
        catch (error) {
            console.error('getPromotionMaterialsIssues Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getPromotionMaterialsIssueById(req, res) {
        try {
            const { id } = req.params;
            const issue = await prisma_client_1.default.promotion_materials_issue.findUnique({
                where: { id: Number(id) },
                include: {
                    depot: true,
                    outlet: true,
                    issued_by: true,
                    items: {
                        where: { is_active: 'Y' },
                        include: { material: true },
                    },
                },
            });
            if (!issue || issue.is_active !== 'Y') {
                return res
                    .status(404)
                    .json({ success: false, message: 'Issue not found' });
            }
            const linkedRequest = await prisma_client_1.default.sfa_d_requests.findFirst({
                where: {
                    request_type: 'PROMOTION_MATERIAL_ISSUE',
                    reference_id: issue.id,
                    status: 'P',
                },
                include: {
                    sfa_d_requests_approvals_request: {
                        where: { status: 'P' },
                        orderBy: { sequence: 'asc' },
                        take: 1,
                        include: {
                            sfa_d_requests_approvals_approver: {
                                select: { id: true, name: true, email: true },
                            },
                        },
                    },
                },
            });
            const currentApprover = linkedRequest?.sfa_d_requests_approvals_request?.[0]
                ?.sfa_d_requests_approvals_approver?.name || null;
            res.json({
                success: true,
                message: 'Issue retrieved successfully',
                data: serializePromotionMaterialsIssue(issue, currentApprover),
            });
        }
        catch (error) {
            console.error('getPromotionMaterialsIssueById Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async createPromotionMaterialsIssue(req, res) {
        try {
            const userId = req.user?.id || 1;
            const { depot_id, outlet_id, issue_date, issued_by_id, campaign_reference, notes, items, } = req.body;
            const depot = await prisma_client_1.default.depots.findUnique({
                where: { id: Number(depot_id) },
            });
            const depotCode = depot?.code || 'DEP';
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const datePart = `${dd}${mm}`;
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const todayIssuesCount = await prisma_client_1.default.promotion_materials_issue.count({
                where: {
                    depot_id: Number(depot_id),
                    createdate: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            });
            const sequence = String(todayIssuesCount + 1).padStart(4, '0');
            const ginNumber = `GIN-${depotCode}-${datePart}-${sequence}`;
            const total_value = items.reduce((sum, item) => sum + (Number(item.total_value) || 0), 0);
            const issue = await prisma_client_1.default.promotion_materials_issue.create({
                data: {
                    gin_number: ginNumber,
                    depot_id: Number(depot_id),
                    outlet_id: Number(outlet_id),
                    issue_date: new Date(issue_date),
                    issued_by_id: Number(issued_by_id),
                    campaign_reference,
                    notes,
                    total_value,
                    approval_status: 'P',
                    createdby: userId,
                    items: {
                        create: items.map((item) => ({
                            material_id: Number(item.material_id),
                            quantity: Number(item.quantity),
                            unit_value: Number(item.unit_value) || 0,
                            total_value: Number(item.total_value) || 0,
                            createdby: userId,
                        })),
                    },
                },
                include: { items: true },
            });
            console.log(`promotonal material issued Created issue #${issue.id} (${issue.gin_number}) with status '${issue.approval_status}', ${issue.items.length} item(s) for outlet #${issue.outlet_id}`);
            try {
                await (0, requests_controller_1.createRequest)({
                    requester_id: Number(issued_by_id),
                    request_type: 'PROMOTION_MATERIAL_ISSUE',
                    reference_id: issue.id,
                    request_data: JSON.stringify({
                        gin_number: ginNumber,
                        depot_id: Number(depot_id),
                        outlet_id: Number(outlet_id),
                        total_value,
                        items_count: items.length,
                    }),
                    createdby: userId,
                    log_inst: 1,
                });
                console.log(`promotonal material issued Approval workflow created for issue ${issue.id} (${ginNumber})`);
            }
            catch (workflowErr) {
                console.warn(`promotonal material issued  No approval workflow defined for PROMOTION_MATERIAL_ISSUE — issue ${issue.id} will remain in pending status until approved manually. ${workflowErr.message}`);
            }
            res.status(201).json({
                success: true,
                data: serializePromotionMaterialsIssue(issue),
                message: 'Issue created successfully and sent for approval',
            });
        }
        catch (error) {
            console.error('createPromotionMaterialsIssue Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updatePromotionMaterialsIssue(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || 1;
            const { depot_id, outlet_id, issue_date, issued_by_id, campaign_reference, notes, approval_status, items, } = req.body;
            const existingIssue = await prisma_client_1.default.promotion_materials_issue.findUnique({
                where: { id: Number(id) },
            });
            if (!existingIssue) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Issue not found' });
            }
            const total_value = items
                ? items.reduce((sum, item) => sum + (Number(item.total_value) || 0), 0)
                : existingIssue.total_value;
            await prisma_client_1.default.$transaction(async (tx) => {
                await tx.promotion_materials_issue.update({
                    where: { id: Number(id) },
                    data: {
                        ...(depot_id && { depot_id: Number(depot_id) }),
                        ...(outlet_id && { outlet_id: Number(outlet_id) }),
                        ...(issue_date && { issue_date: new Date(issue_date) }),
                        ...(issued_by_id && { issued_by_id: Number(issued_by_id) }),
                        campaign_reference,
                        notes,
                        ...(approval_status && { approval_status }),
                        total_value,
                        updatedby: userId,
                        updatedate: new Date(),
                    },
                });
                if (items) {
                    await tx.promotion_materials_issue_items.updateMany({
                        where: { issue_id: Number(id) },
                        data: { is_active: 'N', updatedby: userId, updatedate: new Date() },
                    });
                    for (const item of items) {
                        await tx.promotion_materials_issue_items.create({
                            data: {
                                issue_id: Number(id),
                                material_id: Number(item.material_id),
                                quantity: Number(item.quantity),
                                unit_value: Number(item.unit_value) || 0,
                                total_value: Number(item.total_value) || 0,
                                createdby: userId,
                            },
                        });
                    }
                }
            });
            res.json({ success: true, message: 'Issue updated successfully' });
        }
        catch (error) {
            console.error('updatePromotionMaterialsIssue Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async deletePromotionMaterialsIssue(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || 1;
            const existingIssue = await prisma_client_1.default.promotion_materials_issue.findUnique({
                where: { id: Number(id) },
                include: {
                    items: true,
                },
            });
            if (!existingIssue) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Issue not found' });
            }
            await prisma_client_1.default.$transaction(async (tx) => {
                /**
                 * Soft-delete the promotion materials issue record
                 */
                await tx.promotion_materials_issue.update({
                    where: { id: Number(id) },
                    data: { is_active: 'N', updatedby: userId, updatedate: new Date() },
                });
                /**
                 * Soft-delete child issue items
                 */
                await tx.promotion_materials_issue_items.updateMany({
                    where: { issue_id: Number(id) },
                    data: { is_active: 'N', updatedby: userId, updatedate: new Date() },
                });
                /**
                 * Cancel pending approval requests for this issue
                 */
                await tx.sfa_d_requests.updateMany({
                    where: {
                        request_type: 'PROMOTION_MATERIAL_ISSUE',
                        reference_id: Number(id),
                        status: 'P',
                    },
                    data: {
                        status: 'R',
                        updatedby: userId,
                        updatedate: new Date(),
                    },
                });
                /**
                 * Soft-delete any customer promotional materials linked to this issue
                 */
                await tx.customers_promotional_materials.updateMany({
                    where: {
                        OR: [
                            { issue_id: Number(id) },
                            { gin_number: existingIssue.gin_number },
                        ],
                    },
                    data: {
                        is_active: 'N',
                        status: 'Removed',
                        updatedby: userId,
                        updatedate: new Date(),
                    },
                });
            });
            res.json({ success: true, message: 'Issue deleted successfully' });
        }
        catch (error) {
            console.error('deletePromotionMaterialsIssue Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    /**
     * Generates and returns the Goods Issue Note printable document matching exact template.
     */
    async getGoodsIssueNote(req, res) {
        try {
            const { id } = req.params;
            const issue = await prisma_client_1.default.promotion_materials_issue.findUnique({
                where: { id: Number(id) },
                include: {
                    depot: true,
                    outlet: {
                        include: {
                            customer_routes: true,
                            customer_zones: true,
                            customers_city: true,
                        },
                    },
                    issued_by: true,
                    items: {
                        where: { is_active: 'Y' },
                        include: {
                            material: true,
                        },
                    },
                },
            });
            if (!issue || issue.is_active !== 'Y') {
                return res
                    .status(404)
                    .json({ success: false, message: 'Issue not found' });
            }
            const formatNoteDate = (date) => {
                if (!date)
                    return '-';
                const d = new Date(date);
                if (isNaN(d.getTime()))
                    return '-';
                const months = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ];
                return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
            };
            const formatNoteDateTime = (date) => {
                if (!date)
                    return '-';
                const d = new Date(date);
                if (isNaN(d.getTime()))
                    return '-';
                const months = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ];
                let hours = d.getHours();
                const minutes = String(d.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                const hoursStr = String(hours).padStart(2, '0');
                return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}, ${hoursStr}:${minutes} ${ampm}`;
            };
            let approvedByText = 'Pending Approval';
            if (issue.approval_status === 'A') {
                const linkedRequest = await prisma_client_1.default.sfa_d_requests.findFirst({
                    where: {
                        request_type: 'PROMOTION_MATERIAL_ISSUE',
                        reference_id: issue.id,
                    },
                    include: {
                        sfa_d_requests_approvals_request: {
                            include: {
                                sfa_d_requests_approvals_approver: {
                                    select: { id: true, name: true, email: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdate: 'desc' },
                });
                const approvedStep = linkedRequest?.sfa_d_requests_approvals_request?.find((s) => s.status === 'A');
                const approverName = approvedStep?.sfa_d_requests_approvals_approver?.name || 'Admin';
                const approvalDate = approvedStep?.updatedate || issue.updatedate || issue.createdate;
                approvedByText = `Approved by: ${approverName} on ${formatNoteDateTime(approvalDate)}`;
            }
            else if (issue.approval_status === 'R') {
                approvedByText = 'Rejected';
            }
            const depotName = issue.depot?.name || 'Moshi Depot';
            const issuedByName = issue.issued_by?.name || 'Admin';
            const outletName = issue.outlet?.name || 'Unknown Outlet';
            const outletCodeText = issue.outlet?.code ? `(${issue.outlet.code})` : '';
            const contactPerson = issue.outlet?.contact_person || '';
            const phone = issue.outlet?.phone_number || '';
            const contactLine = [contactPerson, phone].filter(Boolean).join(' · ');
            const streetAddress = issue.outlet?.address ||
                issue.outlet?.customers_city?.name ||
                'Kiusa Street, Moshi';
            const routeName = issue.outlet?.customer_routes?.name || 'N/A';
            const zoneName = issue.outlet?.customer_zones?.name || 'N/A';
            const items = issue.items || [];
            const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
            const rowsHtml = items
                .map((item, index) => {
                const itemCode = item.material?.code ||
                    `PM-${item.material_id}`;
                const description = item.material?.name || 'Promotional Item';
                const uom = item.material?.uom || 'Pcs';
                const qty = Number(item.quantity) || 0;
                return `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td class="text-left font-mono">${itemCode}</td>
              <td class="text-left">${description}</td>
              <td class="text-center">${uom}</td>
              <td class="text-center font-bold">${qty}</td>
              <td></td>
              <td></td>
            </tr>
          `;
            })
                .join('');
            const referenceText = issue.campaign_reference || 'Rainy season visibility drive';
            const notesText = issue.notes || 'None';
            const printedByName = req.user?.name || 'Admin';
            const printedTimestamp = formatNoteDateTime(new Date());
            if (req.headers['accept']?.includes('application/json') ||
                req.query.format === 'json') {
                return res.json({
                    success: true,
                    data: {
                        issue,
                        depotName,
                        issuedByName,
                        approvedByText,
                        outletName,
                        outletCode: issue.outlet?.code,
                        contactLine,
                        streetAddress,
                        routeName,
                        zoneName,
                        items,
                        totalQty,
                        referenceText,
                        notesText,
                        printedByName,
                        printedTimestamp,
                    },
                });
            }
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Goods Issue Note - ${issue.gin_number}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      background-color: #f3f4f6;
      font-size: 11px;
      line-height: 1.4;
    }
    .page-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 28px 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .company-title {
      font-size: 19px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 3px 0;
    }
    .company-sub {
      font-size: 11px;
      color: #4b5563;
      margin: 1px 0;
      line-height: 1.4;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #111827;
      margin: 0;
    }
    .doc-subtitle {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #4b5563;
      margin: 3px 0 8px 0;
      text-transform: uppercase;
    }
    .meta-table {
      margin-left: auto;
      border-collapse: collapse;
      text-align: left;
    }
    .meta-table td {
      padding: 1.5px 0;
      font-size: 11px;
    }
    .meta-label {
      color: #4b5563;
      padding-right: 18px !important;
      min-width: 75px;
    }
    .meta-val {
      color: #111827;
    }
    .font-bold {
      font-weight: 700;
    }
    .font-mono {
      font-family: monospace;
    }
    .divider {
      border-bottom: 1.5px solid #111827;
      margin: 12px 0 16px 0;
    }
    .boxes-row {
      display: flex;
      gap: 14px;
      margin-bottom: 16px;
    }
    .box {
      flex: 1;
      border: 1px solid #4b5563;
      border-radius: 0;
      padding: 10px 14px;
      background-color: #ffffff;
      min-height: 90px;
    }
    .box-title {
      font-size: 10px;
      font-weight: 700;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .box-name {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 3px;
    }
    .box-line {
      font-size: 11px;
      color: #374151;
      line-height: 1.45;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .items-table th {
      border: 1px solid #4b5563;
      background-color: #ffffff;
      color: #111827;
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 700;
      vertical-align: middle;
      line-height: 1.3;
    }
    .items-table td {
      border: 1px solid #4b5563;
      padding: 6px 8px;
      font-size: 11px;
      color: #111827;
    }
    .items-table tfoot td {
      border: 1px solid #4b5563;
      background-color: #ffffff;
      padding: 6px 8px;
    }
    .text-center {
      text-align: center;
    }
    .text-left {
      text-align: left;
    }
    .text-right {
      text-align: right;
    }
    .notes-section {
      font-size: 11px;
      color: #111827;
      margin: 10px 0 12px 0;
    }
    .confirmation-text {
      font-size: 11px;
      color: #374151;
      margin-bottom: 16px;
    }
    .signatures-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .sig-box {
      flex: 1;
      border: 1px solid #4b5563;
      border-radius: 0;
      padding: 10px 12px;
      background: #ffffff;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 700;
      color: #111827;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .sig-field {
      font-size: 11px;
      color: #374151;
      margin-bottom: 12px;
      display: flex;
      align-items: flex-end;
    }
    .sig-line {
      flex: 1;
      border-bottom: 1px solid #4b5563;
      margin-left: 4px;
      height: 1px;
    }
    .stamp-box {
      border: 1px dashed #6b7280;
      border-radius: 0;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #6b7280;
      margin-top: 6px;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #6b7280;
      padding-top: 12px;
      margin-top: 10px;
    }
    .action-bar {
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background-color: #2563eb;
      color: white;
    }
    .btn-primary:hover {
      background-color: #1d4ed8;
    }
    .btn-secondary {
      background-color: #ffffff;
      color: #374151;
      border-color: #d1d5db;
    }
    .btn-secondary:hover {
      background-color: #f3f4f6;
    }
    @media print {
      body {
        padding: 0;
        margin: 0;
        background: transparent;
      }
      .page-container {
        max-width: 100%;
        width: 100%;
        margin: 0;
        padding: 10mm 14mm;
        box-shadow: none;
        border-radius: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="btn btn-secondary" onclick="window.close()">Close</button>
    <button class="btn btn-primary" onclick="window.print()">Print Goods Issue Note</button>
  </div>

  <div class="page-container">
    <div class="header">
      <div class="company-info">
        <h1 class="company-title">BONITE BOTTLERS LTD</h1>
        <p class="company-sub">P.O.BOX 1352,MOSHI-TANZANIA</p>
        <p class="company-sub">Tel: +255 27 54422/7</p>
      </div>
      <div class="doc-meta">
        <h2 class="doc-title">GOODS ISSUE NOTE</h2>
        <div class="doc-subtitle">PROMOTION MATERIALS</div>
        <table class="meta-table">
          <tr>
            <td class="meta-label">GIN No.</td>
            <td class="meta-val font-bold">${issue.gin_number}</td>
          </tr>
          <tr>
            <td class="meta-label">Issue Date</td>
            <td class="meta-val">${formatNoteDate(issue.issue_date)}</td>
          </tr>
          <tr>
            <td class="meta-label">Depot</td>
            <td class="meta-val">${depotName}</td>
          </tr>
          <tr>
            <td class="meta-label">Reference</td>
            <td class="meta-val">${referenceText}</td>
          </tr>
        </table>
      </div>
    </div>

    <div class="divider"></div>

    <div class="boxes-row">
      <div class="box">
        <div class="box-title">ISSUED FROM</div>
        <div class="box-name">${depotName}</div>
        <div class="box-line">Issued by: ${issuedByName}</div>
        <div class="box-line">${approvedByText}</div>
      </div>
      <div class="box">
        <div class="box-title">ISSUED TO</div>
        <div class="box-name">${outletName} ${outletCodeText}</div>
        <div class="box-line">${contactLine}</div>
        <div class="box-line">${streetAddress}</div>
        <div class="box-line">Route: ${routeName} · Zone: ${zoneName}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45px;" class="text-center">S/No</th>
          <th style="width: 100px;" class="text-left">Item Code</th>
          <th class="text-left">Description</th>
          <th style="width: 60px;" class="text-center">UOM</th>
          <th style="width: 75px;" class="text-center">Qty<br>Issued</th>
          <th style="width: 85px;" class="text-center">Qty<br>Received</th>
          <th style="width: 130px;" class="text-left">Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" class="font-bold text-left" style="padding-left: 14px;">Total Quantity</td>
          <td class="font-bold text-center">${totalQty}</td>
          <td></td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="notes-section">
      <strong>Notes:</strong> ${notesText}
    </div>

    <div class="confirmation-text">
      We confirm receipt of the promotional materials listed above in good condition and in the quantities shown.
    </div>

    <div class="signatures-row">
      <div class="sig-box">
        <div class="sig-title">ISSUED BY (STOREKEEPER)</div>
        <div class="sig-field">Name: <span class="sig-line"></span></div>
        <div class="sig-field">Signature: <span class="sig-line"></span></div>
        <div class="sig-field">Date: <span class="sig-line"></span></div>
      </div>
      <div class="sig-box">
        <div class="sig-title">AUTHORIZED BY</div>
        <div class="sig-field">Name: <span class="sig-line"></span></div>
        <div class="sig-field">Signature: <span class="sig-line"></span></div>
        <div class="sig-field">Date: <span class="sig-line"></span></div>
      </div>
      <div class="sig-box">
        <div class="sig-title">RECEIVED BY (OUTLET)</div>
        <div class="sig-field">Name: <span class="sig-line"></span></div>
        <div class="sig-field">Signature: <span class="sig-line"></span></div>
        <div class="stamp-box">Outlet stamp</div>
      </div>
    </div>

    <div class="footer-row">
      <div>Original: Outlet · Duplicate: Depot · Triplicate: Accounts</div>
      <div>Printed ${printedTimestamp} by ${printedByName}</div>
    </div>
  </div>

  <script>
    if (window.location.search.includes('print=true')) {
      window.onload = function() {
        window.print();
      };
    }
  </script>
</body>
</html>`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(html);
        }
        catch (error) {
            console.error('getGoodsIssueNote Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
};
//# sourceMappingURL=promotionMaterialsIssue.controller.js.map