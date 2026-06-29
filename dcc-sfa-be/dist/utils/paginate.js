"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
async function paginate({ model, filters = {}, page = 1, limit = 10, select, include, orderBy = { id: 'desc' }, }) {
    const skip = (page - 1) * limit;
    const total_count = await model.count({ where: filters });
    const data = await model.findMany({
        where: filters,
        skip,
        take: limit,
        select,
        include,
        orderBy,
    });
    return {
        data,
        pagination: {
            current_page: page,
            total_pages: Math.ceil(total_count / limit),
            total_count,
            has_next: page * limit < total_count,
            has_previous: page > 1,
        },
    };
}
//# sourceMappingURL=paginate.js.map