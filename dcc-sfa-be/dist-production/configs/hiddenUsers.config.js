"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHiddenUser = exports.hiddenUsersRawSqlWhere = exports.hiddenLoginHistoryUserFilter = exports.hiddenApiTokensUserFilter = exports.hiddenUsersPrismaFilter = exports.HIDDEN_USER_NAMES = exports.HIDDEN_USER_EMPLOYEE_IDS = exports.HIDDEN_USER_EMAILS = void 0;
const client_1 = require("@prisma/client");
/**
 * @fileoverview Hidden System Users Configuration
 * @description Centralized configuration for internal/system users that should never be visible in user listings, dropdowns, org charts, reports, or tokens.
 */
exports.HIDDEN_USER_EMAILS = ['excel.sync@dcc.com'];
exports.HIDDEN_USER_EMPLOYEE_IDS = ['EXCEL_SYNC_01'];
exports.HIDDEN_USER_NAMES = [
    'iuser',
    'IUSER',
    'Excel Sync Admin',
];
/**
 * @description Prisma where filter to exclude hidden users from prisma.users queries
 */
exports.hiddenUsersPrismaFilter = {
    name: { notIn: Array.from(exports.HIDDEN_USER_NAMES) },
    email: { notIn: Array.from(exports.HIDDEN_USER_EMAILS) },
    employee_id: { notIn: Array.from(exports.HIDDEN_USER_EMPLOYEE_IDS) },
};
/**
 * @description Prisma where filter for api_tokens relation (users_api_tokens_user_idTousers)
 */
exports.hiddenApiTokensUserFilter = {
    users_api_tokens_user_idTousers: {
        email: { notIn: Array.from(exports.HIDDEN_USER_EMAILS) },
        employee_id: { notIn: Array.from(exports.HIDDEN_USER_EMPLOYEE_IDS) },
    },
};
/**
 * @description Prisma where filter for login_history relation (users_login_history_user_idTousers)
 */
exports.hiddenLoginHistoryUserFilter = {
    users_login_history_user_idTousers: {
        email: { notIn: Array.from(exports.HIDDEN_USER_EMAILS) },
        employee_id: { notIn: Array.from(exports.HIDDEN_USER_EMPLOYEE_IDS) },
    },
};
/**
 * @description Raw SQL condition for Prisma tagged templates to filter hidden users with table alias 'u'
 */
exports.hiddenUsersRawSqlWhere = client_1.Prisma.sql `AND u.email NOT IN ('excel.sync@dcc.com') AND u.employee_id NOT IN ('EXCEL_SYNC_01') AND LOWER(u.name) NOT IN ('iuser', 'excel sync admin')`;
/**
 * @function isHiddenUser
 * @description Predicate function to check if a user is a hidden system user
 * @param {any} user - User object containing name, email, or employee_id
 * @returns {boolean} True if the user is a hidden system user
 */
const isHiddenUser = (user) => {
    if (!user)
        return false;
    if (user.name) {
        const trimmedName = user.name.trim().toLowerCase();
        if (trimmedName === 'iuser' || trimmedName === 'excel sync admin') {
            return true;
        }
    }
    if (user.email) {
        const trimmedEmail = user.email.trim().toLowerCase();
        if (exports.HIDDEN_USER_EMAILS.some(e => e.toLowerCase() === trimmedEmail)) {
            return true;
        }
    }
    if (user.employee_id) {
        const trimmedEmpId = user.employee_id.trim().toUpperCase();
        if (exports.HIDDEN_USER_EMPLOYEE_IDS.some(id => id.toUpperCase() === trimmedEmpId)) {
            return true;
        }
    }
    return false;
};
exports.isHiddenUser = isHiddenUser;
//# sourceMappingURL=hiddenUsers.config.js.map