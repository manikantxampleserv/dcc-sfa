// async getCustomersWithVisits(req: any, res: any) {
//   try {
//     const { page, limit, search } = req.query;
//     const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
//     const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));

//     const filters: any = {
//       visits: {
//         some: {} // Only customers with at least one visit
//       }
//     };

//     if (search) {
//       filters.OR = [
//         { name: { contains: search.toLowerCase() } },
//         { code: { contains: search.toLowerCase() } },
//         { phone_number: { contains: search } }
//       ];
//     }

//     const { data, pagination } = await paginate({
//       model: prisma.customers,
//       filters,
//       page: pageNum,
//       limit: limitNum,
//       orderBy: { name: 'asc' },
//       include: {
//         visits: {
//           orderBy: { visit_date: 'desc' },
//           take: 5, // Latest 5 visits
//           include: {
//             visits_salesperson: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true
//               }
//             }
//           }
//         },
//         _count: {
//           select: {
//             visits: true
//           }
//         }
//       }
//     });

//     const serializedData = data.map((customer: any) => ({
//       id: customer.id,
//       name: customer.name,
//       code: customer.code,
//       type: customer.type,
//       contact_person: customer.contact_person,
//       phone_number: customer.phone_number,
//       email: customer.email,
//       address: customer.address,
//       city: customer.city,
//       state: customer.state,
//       zipcode: customer.zipcode,
//       outstanding_amount: customer.outstanding_amount,
//       credit_limit: customer.credit_limit,
//       is_active: customer.is_active,
//       total_visits: customer._count.visits,
//       recent_visits: customer.visits.map((visit: any) => ({
//         id: visit.id,
//         visit_date: visit.visit_date,
//         status: visit.status,
//         purpose: visit.purpose,
//         salesperson: visit.visits_salesperson
//       }))
//     }));

//     res.success(
//       'Customers with visits retrieved successfully',
//       serializedData,
//       200,
//       pagination
//     );
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// }
