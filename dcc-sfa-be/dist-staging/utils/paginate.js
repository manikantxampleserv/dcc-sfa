"use strict";
// interface PaginationParams {
//   model: any;
//   filters?: any;
//   page?: number;
//   limit?: number;
//   select?: any;
//   include?: any;
//   orderBy?: any;
// }
// export async function paginate<T>({
//   model,
//   filters = {},
//   page = 1,
//   limit = 10,
//   select,
//   include,
//   orderBy = { id: 'desc' },
// }: PaginationParams): Promise<{
//   data: T[];
//   pagination: {
//     current_page: number;
//     total_pages: number;
//     total_count: number;
//     has_next: boolean;
//     has_previous: boolean;
//   };
// }> {
//   const skip = (page - 1) * limit;
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
//   const total_count = await model.count({ where: filters });
//   const data = await model.findMany({
//     where: filters,
//     skip,
//     take: limit,
//     select,
//     include,
//     orderBy,
//   });
//   return {
//     data,
//     pagination: {
//       current_page: page,
//       total_pages: Math.ceil(total_count / limit),
//       total_count,
//       has_next: page * limit < total_count,
//       has_previous: page > 1,
//     },
//   };
// }
const client_1 = require("@prisma/client");
async function paginate({ model, filters = {}, page = 1, limit = 10, select, include, orderBy = { id: 'desc' }, maxRetries = 3, }) {
    const skip = (page - 1) * limit;
    let attempt = 0;
    while (true) {
        try {
            const [total_count, data] = await Promise.all([
                model.count({ where: filters }),
                model.findMany({
                    where: filters,
                    skip,
                    take: limit,
                    select,
                    include,
                    orderBy,
                }),
            ]);
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