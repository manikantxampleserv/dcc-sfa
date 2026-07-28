"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeFilter = getTimeFilter;
function getTimeFilter(timeFilter) {
    if (!timeFilter || timeFilter === 'all')
        return undefined;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (timeFilter) {
        case 'today':
            return { gte: today };
        case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { gte: yesterday, lt: today };
        }
        case 'this_week': {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return { gte: startOfWeek };
        }
        case 'this_month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { gte: startOfMonth };
        }
        case 'prev_month': {
            const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { gte: startOfPrevMonth, lt: startOfMonth };
        }
        case 'this_year': {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return { gte: startOfYear };
        }
        case 'prev_year': {
            const startOfPrevYear = new Date(today.getFullYear() - 1, 0, 1);
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return { gte: startOfPrevYear, lt: startOfYear };
        }
        default:
            return undefined;
    }
}
//# sourceMappingURL=dateFilters.js.map