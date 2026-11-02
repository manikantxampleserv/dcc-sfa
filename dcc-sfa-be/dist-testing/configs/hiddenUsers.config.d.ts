import { Prisma } from '@prisma/client';
/**
 * @fileoverview Hidden System Users Configuration
 * @description Centralized configuration for internal/system users that should never be visible in user listings, dropdowns, org charts, reports, or tokens.
 */
export declare const HIDDEN_USER_EMAILS: readonly ["excel.sync@dcc.com"];
export declare const HIDDEN_USER_EMPLOYEE_IDS: readonly ["EXCEL_SYNC_01"];
export declare const HIDDEN_USER_NAMES: readonly ["iuser", "IUSER", "Excel Sync Admin"];
/**
 * @description Prisma where filter to exclude hidden users from prisma.users queries
 */
export declare const hiddenUsersPrismaFilter: {
    name: {
        notIn: ("iuser" | "IUSER" | "Excel Sync Admin")[];
    };
    email: {
        notIn: "excel.sync@dcc.com"[];
    };
    employee_id: {
        notIn: "EXCEL_SYNC_01"[];
    };
};
/**
 * @description Prisma where filter for api_tokens relation (users_api_tokens_user_idTousers)
 */
export declare const hiddenApiTokensUserFilter: {
    users_api_tokens_user_idTousers: {
        email: {
            notIn: "excel.sync@dcc.com"[];
        };
        employee_id: {
            notIn: "EXCEL_SYNC_01"[];
        };
    };
};
/**
 * @description Prisma where filter for login_history relation (users_login_history_user_idTousers)
 */
export declare const hiddenLoginHistoryUserFilter: {
    users_login_history_user_idTousers: {
        email: {
            notIn: "excel.sync@dcc.com"[];
        };
        employee_id: {
            notIn: "EXCEL_SYNC_01"[];
        };
    };
};
/**
 * @description Raw SQL condition for Prisma tagged templates to filter hidden users with table alias 'u'
 */
export declare const hiddenUsersRawSqlWhere: Prisma.Sql;
/**
 * @function isHiddenUser
 * @description Predicate function to check if a user is a hidden system user
 * @param {any} user - User object containing name, email, or employee_id
 * @returns {boolean} True if the user is a hidden system user
 */
export declare const isHiddenUser: (user?: {
    name?: string | null;
    email?: string | null;
    employee_id?: string | null;
} | null) => boolean;
//# sourceMappingURL=hiddenUsers.config.d.ts.map