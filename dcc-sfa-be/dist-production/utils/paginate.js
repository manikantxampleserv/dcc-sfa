"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
const client_1 = require("@prisma/client");
async function paginate({ model, filters = {}, page = 1, limit = 10, select, include, orderBy = { id: 'desc' }, maxRetries = 3, }) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 1000);
    const skip = (safePage - 1) * safeLimit;
    let attempt = 0;
    while (true) {
        try {
            const [total_count, data] = await Promise.all([
                model.count({ where: filters }),
                model.findMany({
                    where: filters,
                    skip,
                    take: safeLimit,
                    select,
                    include,
                    orderBy,
                }),
            ]);
            return {
                data,
                pagination: {
                    current_page: safePage,
                    total_pages: Math.ceil(total_count / safeLimit),
                    total_count,
                    has_next: safePage * safeLimit < total_count,
                    has_previous: safePage > 1,
                },
            };
        }
        catch (error) {
            const isDeadlock = error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2034';
            if (isDeadlock && attempt < maxRetries) {
                attempt++;
                const delay = 100 * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
}
//# sourceMappingURL=paginate.js.map