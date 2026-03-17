"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHistoryImportExportService = void 0;
const import_export_service_1 = require("../base/import-export.service");
const prisma_client_1 = __importDefault(require("../../../configs/prisma.client"));
class LoginHistoryImportExportService extends import_export_service_1.ImportExportService {
    modelName = 'login_history';
    displayName = 'Login History';
    uniqueFields = ['id'];
    searchFields = [
        'ip_address',
        'device_info',
        'os_info',
        'app_version',
        'failure_reason',
    ];
    columns = [
        {
            key: 'user_id',
            header: 'User ID',
            width: 15,
            required: true,
            type: 'number',
            validation: value => {
                if (!value || isNaN(Number(value)))
                    return 'User ID must be a valid number';
                if (Number(value) < 1)
                    return 'User ID must be a positive integer';
                return true;
            },
            description: 'ID of the user who logged in (required, positive integer)',
        },
        {
            key: 'login_time',
            header: 'Login Time',
            width: 20,
            type: 'date',
            validation: value => !value ||
                !isNaN(Date.parse(value)) ||
                'Login time must be a valid date',
            description: 'Date and time when user logged in (optional, ISO format)',
        },
        {
            key: 'logout_time',
            header: 'Logout Time',
            width: 20,
            type: 'date',
            validation: value => !value ||
                !isNaN(Date.parse(value)) ||
                'Logout time must be a valid date',
            description: 'Date and time when user logged out (optional, ISO format)',
        },
        {
            key: 'ip_address',
            header: 'IP Address',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 50 ||
                'IP address must be less than 50 characters',
            description: 'IP address of the login (optional, max 50 chars)',
        },
        {
            key: 'device_info',
            header: 'Device Info',
            width: 30,
            type: 'string',
            validation: value => !value ||
                value.length <= 255 ||
                'Device info must be less than 255 characters',
            description: 'Information about the device used (optional, max 255 chars)',
        },
        {
            key: 'os_info',
            header: 'OS Info',
            width: 25,
            type: 'string',
            validation: value => !value ||
                value.length <= 100 ||
                'OS info must be less than 100 characters',
            description: 'Operating system information (optional, max 100 chars)',
        },
        {
            key: 'app_version',
            header: 'App Version',
            width: 20,
            type: 'string',
            validation: value => !value ||
                value.length <= 50 ||
                'App version must be less than 50 characters',
            description: 'Application version used (optional, max 50 chars)',
        },
        {
            key: 'location_latitude',
            header: 'Latitude',
            width: 15,
            type: 'number',
            validation: value => !value ||
                !isNaN(Number(value)) ||
                'Latitude must be a valid decimal number',
            description: 'Geographic latitude (optional, decimal)',
        },
        {
            key: 'location_longitude',
            header: 'Longitude',
            width: 15,
            type: 'number',
            validation: value => !value ||
                !isNaN(Number(value)) ||
                'Longitude must be a valid decimal number',
            description: 'Geographic longitude (optional, decimal)',
        },
        {
            key: 'login_status',
            header: 'Login Status',
            width: 15,
            type: 'string',
            validation: value => !value ||
                ['success', 'failed'].includes(value) ||
                'Login status must be either success or failed',
            description: 'Status of the login attempt (optional: success/failed)',
        },
        {
            key: 'failure_reason',
            header: 'Failure Reason',
            width: 30,
            type: 'string',
            validation: value => !value ||
                value.length <= 255 ||
                'Failure reason must be less than 255 characters',
            description: 'Reason for login failure if applicable (optional, max 255 chars)',
        },
        {
            key: 'is_active',
            header: 'Is Active',
            width: 12,
            type: 'string',
            validation: value => !value || ['Y', 'N'].includes(value) || 'Is active must be Y or N',
            description: 'Whether the record is active (optional: Y/N)',
        },
    ];
    async getSampleData() {
        return [
            {
                user_id: 1,
                login_time: new Date().toISOString(),
                logout_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
                ip_address: '192.168.1.100',
                device_info: 'Chrome Browser on Windows 10',
                os_info: 'Windows 10',
                app_version: '1.0.0',
                location_latitude: 28.6139,
                location_longitude: 77.209,
                login_status: 'success',
                failure_reason: '',
                is_active: 'Y',
            },
            {
                user_id: 2,
                login_time: new Date().toISOString(),
                logout_time: '',
                ip_address: '192.168.1.101',
                device_info: 'Mobile App on Android',
                os_info: 'Android 12',
                app_version: '1.0.1',
                location_latitude: 28.614,
                location_longitude: 77.2091,
                login_status: 'failed',
                failure_reason: 'Invalid credentials',
                is_active: 'Y',
            },
        ];
    }
    getColumnDescription() {
        return `
# Login History Import Template

## Required Fields:
- **User ID**: ID of the user who logged in (must be a positive integer)

## Optional Fields:
- **Login Time**: Date and time when user logged in (ISO format)
- **Logout Time**: Date and time when user logged out (ISO format)
- **IP Address**: IP address of the login (max 50 characters)
- **Device Info**: Information about the device used (max 255 characters)
- **OS Info**: Operating system information (max 100 characters)
- **App Version**: Application version used (max 50 characters)
- **Latitude**: Geographic latitude (decimal number)
- **Longitude**: Geographic longitude (decimal number)
- **Login Status**: Status of the login attempt (success/failed)
- **Failure Reason**: Reason for login failure if applicable (max 255 characters)
- **Is Active**: Whether the record is active (Y/N)

## Notes:
- All fields except User ID are optional
- Date fields should be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
- Login status should be either 'success' or 'failed'
- Is active should be either 'Y' or 'N'
- Geographic coordinates are optional decimal numbers
    `;
    }
    async transformDataForExport(data) {
        return data.map(item => ({
            user_id: item.user_id,
            login_time: item.login_time
                ? new Date(item.login_time).toISOString()
                : '',
            logout_time: item.logout_time
                ? new Date(item.logout_time).toISOString()
                : '',
            ip_address: item.ip_address || '',
            device_info: item.device_info || '',
            os_info: item.os_info || '',
            app_version: item.app_version || '',
            location_latitude: item.location_latitude || '',
            location_longitude: item.location_longitude || '',
            login_status: item.login_status || 'success',
            failure_reason: item.failure_reason || '',
            is_active: item.is_active || 'Y',
        }));
    }
    async checkDuplicate(data) {
        // For login history, we don't check duplicates as each login is unique
        return null;
    }
    async transformDataForImport(data) {
        return data.map(item => ({
            user_id: Number(item.user_id),
            login_time: item.login_time ? new Date(item.login_time) : new Date(),
            logout_time: item.logout_time ? new Date(item.logout_time) : null,
            ip_address: item.ip_address || null,
            device_info: item.device_info || null,
            os_info: item.os_info || null,
            app_version: item.app_version || null,
            location_latitude: item.location_latitude
                ? Number(item.location_latitude)
                : null,
            location_longitude: item.location_longitude
                ? Number(item.location_longitude)
                : null,
            login_status: item.login_status || 'success',
            failure_reason: item.failure_reason || null,
            is_active: item.is_active || 'Y',
            createdby: 1, // Default created by
            log_inst: 1, // Default log instance
        }));
    }
    async validateForeignKeys(data) {
        const errors = [];
        const userIds = [...new Set(data.map(item => item.user_id))];
        // Check if all user IDs exist
        const existingUsers = await prisma_client_1.default.users.findMany({
            where: { id: { in: userIds } },
            select: { id: true },
        });
        const existingUserIds = existingUsers.map(user => user.id);
        const invalidUserIds = userIds.filter(id => !existingUserIds.includes(id));
        if (invalidUserIds.length > 0) {
            errors.push(`Invalid user IDs: ${invalidUserIds.join(', ')}`);
        }
        return errors.length > 0 ? errors.join(', ') : null;
    }
    async prepareDataForImport(data) {
        return this.transformDataForImport(data);
    }
    async updateExisting(id, data) {
        return prisma_client_1.default.login_history.update({
            where: { id },
            data: {
                ...data,
                updatedate: new Date(),
                updatedby: 1, // Default updated by
            },
        });
    }
}
exports.LoginHistoryImportExportService = LoginHistoryImportExportService;
//# sourceMappingURL=loginHistory-import-export.service.js.map