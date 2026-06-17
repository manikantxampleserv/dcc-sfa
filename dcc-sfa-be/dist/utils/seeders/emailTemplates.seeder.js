"use strict";
/**
 * @fileoverview Email Templates Seeder
 * @description Creates email templates for request actions, approvals, and alerts
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockTemplates = void 0;
exports.seedEmailTemplates = seedEmailTemplates;
exports.clearEmailTemplates = clearEmailTemplates;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockTemplates = [
    {
        name: 'Customer Creation Rejected Template',
        key: 'customer_creation_rejected',
        channel: 'email',
        type: 'approval',
        subject: '? Customer Creation Rejected - {{customer_code}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\r\n    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">\r\n        <h1 style="margin: 0; font-size: 24px;">?? Customer Creation Rejected</h1>\r\n        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your customer creation request was not approved</p>\r\n    </div>\r\n    \r\n    <div style="padding: 20px; background-color: #f9f9f9;">\r\n        <p>Dear <strong>{{requester_name}}</strong>,</p>\r\n        \r\n        <p>We regret to inform you that your customer creation request has been <strong style="color: #f5576c;">rejected</strong>.</p>\r\n        \r\n        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f5576c;">\r\n            <h3 style="margin: 0 0 10px 0; color: #333;">?? Request Details</h3>\r\n            <table style="width: 100%; border-collapse: collapse;">\r\n                <tr>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Customer Code:</td>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{customer_code}}</td>\r\n                </tr>\r\n                <tr>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Name:</td>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{customer_name}}</td>\r\n                </tr>\r\n                <tr>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{customer_email}}</td>\r\n                </tr>\r\n                <tr>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{customer_phone}}</td>\r\n                </tr>\r\n                <tr>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Platform:</td>\r\n                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{platform_type}}</td>\r\n                </tr>\r\n                <tr>\r\n                    <td style="padding: 8px; font-weight: bold;">Rejected By:</td>\r\n                    <td style="padding: 8px;">{{approver_name}}</td>\r\n                </tr>\r\n            </table>\r\n        </div>\r\n        \r\n        {{#rejection_reason}}\r\n        <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107;">\r\n            <h4 style="margin: 0 0 10px 0; color: #856404;">?? Rejection Reason:</h4>\r\n            <p style="margin: 0; color: #856404;">{{rejection_reason}}</p>\r\n        </div>\r\n        {{/rejection_reason}}\r\n        \r\n        <div style="background: #f8d7da; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f5576c;">\r\n            <h4 style="margin: 0 0 10px 0; color: #721c24;">?? Next Steps:</h4>\r\n            <ul style="margin: 0; padding-left: 20px; color: #721c24;">\r\n                <li>Please review the rejection reason above</li>\r\n                <li>Make necessary corrections to the customer data</li>\r\n                <li>Submit a new customer creation request</li>\r\n            </ul>\r\n        </div>\r\n        \r\n        <p style="margin: 20px 0 0 0; font-size: 12px; color: #666;">\r\n            Request ID: {{request_id}} | Rejected on: {{rejected_date}} | {{company_name}}\r\n        </p>\r\n    </div>\r\n</div>',
        createdate: '2026-03-24T14:37:31.180Z',
        createdby: 1,
        updatedate: '2026-05-18T10:06:10.247Z',
        updatedby: 1,
    },
    {
        name: 'Customer Creation Approved Template',
        key: 'customer_creation_approved',
        channel: 'email',
        type: 'approval',
        subject: '? Customer Creation Approved - {{customer_code}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">\r\n        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">\r\n            <h1 style="margin: 0; font-size: 24px;">?? Customer Creation Approved!</h1>\r\n            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your customer has been successfully created</p>\r\n        </div>\r\n        <div style="padding: 20px; background-color: #f9f9f9;">\r\n            <p>Dear <strong>{{requester_name}}</strong>,</p>\r\n            <p>Great news! Your customer creation request has been <strong style="color: #11998e;">approved</strong> and the customer has been successfully created in the system.</p>\r\n            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #11998e;">\r\n                <h3 style="margin: 0 0 10px 0; color: #333;">?? Customer Details</h3>\r\n                <table style="width: 100%; border-collapse: collapse;">\r\n                    <tr>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Customer Code:</td>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee; color: #11998e; font-weight: bold;">{{customer_code}}</td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Name:</td>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{{customer_name}}</td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{{customer_email}}</td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{{customer_phone}}</td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Platform:</td>\r\n                        <td style="padding: 8px; border-bottom: 1px solid #eee;">{{platform_type}}</td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td style="padding: 8px; font-weight: bold;">Approved By:</td>\r\n                        <td style="padding: 8px;">{{approver_name}}</td>\r\n                    </tr>\r\n                </table>\r\n            </div>\r\n            <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #11998e;">\r\n                <h4 style="margin: 0 0 10px 0; color: #11998e;">?? Next Steps:</h4>\r\n                <ul style="margin: 0; padding-left: 20px; color: #333;">\r\n                    <li>The customer is now active in the system</li>\r\n                    <li>You can start creating orders for this customer</li>\r\n                    <li>All customer data and images have been saved</li>\r\n                </ul>\r\n            </div>\r\n            <p style="margin: 20px 0 0 0; font-size: 12px; color: #666;">\r\n                Request ID: {{request_id}} | Approved on: {{approved_date}} | {{company_name}}\r\n            </p>\r\n        </div>\r\n    </div>',
        createdate: '2026-03-24T13:56:41.683Z',
        createdby: 1,
        updatedate: '2026-05-18T10:06:53.303Z',
        updatedby: 1,
    },
    {
        name: 'Customer Creation Rejected',
        key: 'customerCreationRejected',
        channel: 'email',
        type: 'approval',
        subject: '? Customer Creation Rejected - {{customer_code}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;"> ... full HTML ... </div>',
        createdate: '2026-03-24T13:29:42.823Z',
        createdby: 1,
        updatedate: '2026-05-18T10:07:18.363Z',
        updatedby: 1,
    },
    {
        name: 'Customer Creation Notify Approver',
        key: 'customerCreationNotifyApprover',
        channel: 'email',
        type: 'approval',
        subject: 'New Customer Creation Request - {{customer_code}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;"> ... full HTML ... </div>',
        createdate: '2026-03-24T13:29:42.820Z',
        createdby: 1,
        updatedate: '2026-05-18T10:07:43.497Z',
        updatedby: 1,
    },
    {
        name: 'Customer Creation Approved',
        key: 'customerCreationApproved',
        channel: 'email',
        type: 'approval',
        subject: '? Customer Creation Approved - {{customer_code}}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;"> ... full HTML ... </div>',
        createdate: '2026-03-24T13:29:42.820Z',
        createdby: 1,
        updatedate: '2026-05-18T10:08:18.183Z',
        updatedby: 1,
    },
    {
        name: 'Location Reset Approved',
        key: 'location_reset_approved',
        channel: 'email',
        type: 'approval',
        subject: '? Location Reset Approved for ${customer_name}',
        body: '<html>\r\n    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\r\n      <div style="background: #d4edda; padding: 20px; border-radius: 8px; border: 1px solid #c3e6cb;">\r\n        <h2 style="color: #155724; margin-top: 0;">?? Location Reset Approved</h2>\r\n        <p>Dear ${requester_name},</p>\r\n        <p>Your location reset request has been <strong>approved</strong>.</p>\r\n        \r\n        <h3 style="color: #155724;">Updated Location:</h3>\r\n        <ul style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">\r\n          <li><strong>Customer Code:</strong> ${customer_code}</li>\r\n          <li><strong>Customer Name:</strong> ${customer_name}</li>\r\n          <li><strong>New Coordinates:</strong> ${new_latitude}, ${new_longitude}</li>\r\n          <li><strong>Approved By:</strong> ${approver_name}</li>\r\n          <li><strong>Approval Date:</strong> ${approval_date}</li>\r\n        </ul>\r\n        \r\n        <p style="margin-top: 20px;">The customer location has been updated in the system.</p>\r\n        <hr style="border: none; border-top: 1px solid #c3e6cb; margin: 20px 0;">\r\n        <p style="color: #155724; font-size: 12px;">Best regards,<br>${company_name} System</p>\r\n      </div>\r\n    </body>\r\n  </html>',
        createdate: '2026-03-24T09:29:35.073Z',
        createdby: 1,
        updatedate: '2026-05-18T10:08:51.667Z',
        updatedby: 1,
    },
    {
        name: 'Location Reset Rejected',
        key: 'location_reset_rejected',
        channel: 'email',
        type: 'approval',
        subject: '? Location Reset Rejected for ${customer_name}',
        body: '<html>\r\n    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\r\n      <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border: 1px solid #f5c6cb;">\r\n        <h2 style="color: #721c24; margin-top: 0;">?? Location Reset Rejected</h2>\r\n        <p>Dear ${requester_name},</p>\r\n        <p>Your location reset request has been <strong>rejected</strong>.</p>\r\n        \r\n        <h3 style="color: #721c24;">Request Details:</h3>\r\n        <ul style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">\r\n          <li><strong>Customer Code:</strong> ${customer_code}</li>\r\n          <li><strong>Customer Name:</strong> ${customer_name}</li>\r\n          <li><strong>Requested Coordinates:</strong> ${new_latitude}, ${new_longitude}</li>\r\n          <li><strong>Rejected By:</strong> ${approver_name}</li>\r\n          <li><strong>Rejection Date:</strong> ${rejection_date}</li>\r\n          <li><strong>Reason:</strong> ${rejection_reason}</li>\r\n        </ul>\r\n        \r\n        <p style="margin-top: 20px;">The customer location remains unchanged. Please contact the approver for more details.</p>\r\n        <hr style="border: none; border-top: 1px solid #f5c6cb; margin: 20px 0;">\r\n        <p style="color: #721c24; font-size: 12px;">Best regards,<br>${company_name} System</p>\r\n      </div>\r\n    </body>\r\n  </html>',
        createdate: '2026-03-24T09:29:35.073Z',
        createdby: 1,
        updatedate: '2026-05-18T10:09:17.037Z',
        updatedby: 1,
    },
    {
        name: 'Location Reset Notify Approver',
        key: 'location_reset_notify_approver',
        channel: 'email',
        type: 'approval',
        subject: 'Location Reset Approval Required for ${customer_name}',
        body: '<html>\r\n    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\r\n      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">\r\n        <h2 style="color: #333; margin-top: 0;">?? Location Reset Approval Required</h2>\r\n        <p>Dear ${approver_name},</p>\r\n        <p>A location reset request has been submitted and requires your approval.</p>\r\n        \r\n        <h3 style="color: #555;">Customer Information:</h3>\r\n        <ul style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">\r\n          <li><strong>Customer Code:</strong> ${customer_code}</li>\r\n          <li><strong>Customer Name:</strong> ${customer_name}</li>\r\n          <li><strong>Current Location:</strong> ${current_latitude}, ${current_longitude}</li>\r\n          <li><strong>Requested Location:</strong> ${new_latitude}, ${new_longitude}</li>\r\n          <li><strong>Reason:</strong> ${reset_reason}</li>\r\n        </ul>\r\n        \r\n        <h3 style="color: #555;">Request Details:</h3>\r\n        <ul style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">\r\n          <li><strong>Request ID:</strong> ${request_id}</li>\r\n          <li><strong>Requested By:</strong> ${requester_name}</li>\r\n          <li><strong>Request Date:</strong> ${request_date}</li>\r\n        </ul>\r\n        \r\n        <p style="margin-top: 20px;">Please review and take appropriate action.</p>\r\n        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">\r\n        <p style="color: #666; font-size: 12px;">Best regards,<br>${company_name} System</p>\r\n      </div>\r\n    </body>\r\n  </html>',
        createdate: '2026-03-24T09:29:35.070Z',
        createdby: 1,
        updatedate: '2026-05-18T10:09:41.287Z',
        updatedby: 1,
    },
    {
        name: 'Category Downgrade Alert',
        key: 'category_downgrade_alert',
        channel: 'email',
        type: 'alert',
        subject: 'Category Downgrade Required - {{customer_name}}',
        body: 'Customer: {{customer_name}}\r\nCustomer ID: {{customer_id}}\r\n\r\nAlert Type: {{alert_type}}\r\nChange Type: {{sub_type}}\r\n\r\nThis customer requires category downgrade review.\r\nSales performance indicates they no longer qualify for current category.\r\n\r\nCurrent Category: {{current_category_name}}\r\nProposed Category: {{proposed_category_name}}\r\nSales Amount: {{sales_amount}}\r\nThreshold Value: {{threshold_value}}\r\n\r\nPlease review this request and take appropriate action.\r\n\r\nCreated: {{createdate}}\r\nAction Required: {{action_required}}',
        createdate: '2026-03-20T14:49:01.643Z',
        createdby: 1,
        updatedate: '2026-05-18T10:10:23.230Z',
        updatedby: 1,
    },
    {
        name: 'Category Assignment Alert',
        key: 'category_new_assignment_alert',
        channel: 'email',
        type: 'alert',
        subject: 'Initial Category Assignment - {{customer_name}}',
        body: 'Customer: {{customer_name}}\r\nCustomer ID: {{customer_id}}\r\n\r\nAlert Type: {{alert_type}}\r\nChange Type: {{sub_type}}\r\n\r\nThis customer requires initial category assignment.\r\nSales performance indicates they qualify for a specific category.\r\n\r\nProposed Category: {{proposed_category_name}}\r\nSales Amount: {{sales_amount}}\r\nThreshold Value: {{threshold_value}}\r\n\r\nPlease review this request and take appropriate action.\r\n\r\nCreated: {{createdate}}\r\nAction Required: {{action_required}}',
        createdate: '2026-03-20T14:49:01.643Z',
        createdby: 1,
        updatedate: '2026-05-18T10:10:58.413Z',
        updatedby: 1,
    },
    {
        name: 'Category Upgrade Alert',
        key: 'category_upgrade_alert',
        channel: null,
        type: 'category_change',
        subject: 'Category Upgrade Required - {{customer_name}}',
        body: 'Customer: {{customer_name}}\r\nCustomer ID: {{customer_id}}\r\n\r\nAlert Type: {{alert_type}}\r\nChange Type: {{sub_type}}\r\n\r\nThis customer requires category upgrade review.\r\nSales performance indicates they qualify for a higher category.\r\n\r\nCurrent Category: {{current_category_name}}\r\nProposed Category: {{proposed_category_name}}\r\nSales Amount: {{sales_amount}}\r\nThreshold Value: {{threshold_value}}\r\n\r\nPlease review this request and take appropriate action.\r\n\r\nCreated: {{createdate}}\r\nAction Required: {{action_required}}',
        createdate: '2026-03-20T14:49:01.640Z',
        createdby: 1,
        updatedate: null,
        updatedby: null,
    },
    {
        name: 'Password Reset OTP',
        key: 'password_reset_otp',
        channel: 'email',
        type: 'password_reset',
        subject: 'Password Reset OTP - {{user_name}}',
        body: '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n<meta charset="UTF-8">\r\n<title>Password Reset OTP</title>\r\n</head>\r\n<body>\r\n<p>Hello <strong>{{user_name}}</strong>,</p>\r\n<p>Your OTP is:</p>\r\n\r\n<h2>{{otp_code}}</h2>\r\n\r\n<p>This OTP will expire in {{expiry_minutes}} minutes.</p>\r\n\r\n<p>If you didn\'t request a password reset, please ignore this email.</p>\r\n\r\n</body>\r\n</html>',
        createdate: '2026-03-06T09:49:41.377Z',
        createdby: 1,
        updatedate: '2026-03-12T06:15:49.987Z',
        updatedby: 1,
    },
    {
        name: 'Notify Next Approver',
        key: 'notify_next_approver',
        channel: 'email',
        type: 'notification',
        subject: 'Action Required: ${request_type} Request Pending Your Approval - ${request_number}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\r\n    <h2 style="color: #333;">Action Required: Request Approval</h2>\r\n    \r\n    <p>Dear ${approver_name},</p>\r\n    \r\n    <p>A ${request_type} request has been forwarded to you for approval. Previous steps have been completed and your action is now required.</p>\r\n    \r\n    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">\r\n        <h3 style="margin-top: 0; color: #333;">Request Details:</h3>\r\n        <p><strong>Request Number:</strong> ${request_number}</p>\r\n        <p><strong>Request Type:</strong> ${request_type}</p>\r\n        <p><strong>Requested By:</strong> ${requester_name}</p>\r\n        <p><strong>Submitted Date:</strong> ${request_date}</p>\r\n        <p><strong>Priority:</strong> ${priority}</p>\r\n    </div>\r\n    \r\n    ${request_detail}\r\n    \r\n    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">\r\n        <h3 style="margin-top: 0; color: #856404;">Action Required:</h3>\r\n        <p>Please review this request and take appropriate action:</p>\r\n        <ul>\r\n            <li>Approve the request if it meets all requirements</li>\r\n            <li>Reject the request with appropriate reasons if it doesn\'t meet requirements</li>\r\n            <li>Contact the requester if you need additional information</li>\r\n        </ul>\r\n    </div>\r\n    \r\n    <p style="margin-top: 30px;">Please log in to the system to review and take action on this request.</p>\r\n    \r\n    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">\r\n        <p style="color: #666; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>\r\n        <p style="color: #666; font-size: 12px;">If you have any questions, please contact your system administrator.</p>\r\n    </div>\r\n</div>',
        createdate: '2026-02-27T07:53:35.263Z',
        createdby: 1,
        updatedate: null,
        updatedby: null,
    },
    {
        name: 'Request Accepted',
        key: 'request_accepted',
        channel: 'email',
        type: 'notification',
        subject: 'Your ${request_type} Request Has Been Approved',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\r\n  <h2 style="color: #28a745;">Request Approved</h2>\r\n  <p>Dear <strong>${employee_name}</strong>,</p>\r\n  <p>Your <strong>${request_type}</strong> request has been <strong>approved</strong>.</p>\r\n  <p style="margin-top: 20px;">You can proceed with the next steps.</p>\r\n  <p style="font-size: 12px; color: #666;">This is an automated message from ${company_name}</p>\r\n</div>',
        createdate: '2026-02-27T07:27:27.453Z',
        createdby: 1,
        updatedate: null,
        updatedby: null,
    },
    {
        name: 'Request Rejected',
        key: 'request_rejected',
        channel: 'email',
        type: 'notification',
        subject: 'Your ${request_type} Request Has Been Rejected',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\r\n  <h2 style="color: #dc3545;">Request Rejected</h2>\r\n  <p>Dear <strong>${employee_name}</strong>,</p>\r\n  <p>Your <strong>${request_type}</strong> request has been <strong>rejected</strong>.</p>\r\n  <p><strong>Reason:</strong> ${remarks}</p>\r\n  <p style="margin-top: 20px;">Please contact your administrator if you have any questions.</p>\r\n  <p style="font-size: 12px; color: #666;">This is an automated message from ${company_name}</p>\r\n</div>',
        createdate: '2026-02-27T07:27:27.453Z',
        createdby: 1,
        updatedate: null,
        updatedby: null,
    },
    {
        name: 'Notify Approver',
        key: 'notify_approver',
        channel: 'email',
        type: 'notification',
        subject: 'Approval Required: ${request_type} Request from ${requester_name}',
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\r\n  <h2 style="color: #333;">Approval Required</h2>\r\n  <p>Dear <strong>${approver_name}</strong>,</p>\r\n  <p>You have a new <strong>${request_type}</strong> request from <strong>${requester_name}</strong> that requires your approval.</p>\r\n  ${request_detail}\r\n  <p style="margin-top: 20px;">Please review and take appropriate action.</p>\r\n  <p style="font-size: 12px; color: #666;">This is an automated message from ${company_name}</p>\r\n</div>',
        createdate: '2026-02-27T07:27:27.450Z',
        createdby: 1,
        updatedate: null,
        updatedby: null,
    },
];
exports.mockTemplates = mockTemplates;
/**
 * Seed Email Templates with mock data
 */
async function seedEmailTemplates() {
    try {
        for (const template of mockTemplates) {
            await prisma_client_1.default.sfa_d_templates.upsert({
                where: { key: template.key },
                update: {
                    name: template.name,
                    channel: template.channel,
                    type: template.type,
                    subject: template.subject,
                    body: template.body,
                    updatedate: template.updatedate
                        ? new Date(template.updatedate)
                        : new Date(),
                    updatedby: template.updatedby || 1,
                },
                create: {
                    name: template.name,
                    key: template.key,
                    channel: template.channel,
                    type: template.type,
                    subject: template.subject,
                    body: template.body,
                    createdby: template.createdby || 1,
                },
            });
        }
        console.log('Email templates seeded successfully.');
    }
    catch (error) {
        console.error('Error seeding email templates:', error);
        throw error;
    }
}
/**
 * Clear Email Templates data
 */
async function clearEmailTemplates() {
    try {
        await prisma_client_1.default.sfa_d_templates.deleteMany({});
        console.log('Email templates cleared successfully.');
    }
    catch (error) {
        console.error('Error clearing email templates:', error);
        throw error;
    }
}
//# sourceMappingURL=emailTemplates.seeder.js.map