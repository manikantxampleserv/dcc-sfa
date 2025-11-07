import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();
interface CustomerSerialized {
  id: number;
  name: string;
  code: string;
  zones_id?: number | null;
  type?: string | null;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  credit_limit?: string | null;
  outstanding_amount: string;
  route_id?: number | null;
  salesperson_id?: number | null;
  last_visit_date?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer_zones?: { id: number; name: string; code: string } | null;
  customer_routes?: { id: number; name: string; code: string } | null;
  customer_users?: { id: number; name: string; email: string } | null;
}

const generateCustomerCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastCustomers = await prisma.customers.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastCustomers && lastCustomers.code) {
    const match = lastCustomers.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }
  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;

  return code;
};
const serializeCustomer = (customer: any): CustomerSerialized => ({
  id: customer.id,
  name: customer.name,
  code: customer.code,
  zones_id: customer.zones_id,
  type: customer.type,
  contact_person: customer.contact_person,
  phone_number: customer.phone_number,
  email: customer.email,
  address: customer.address,
  city: customer.city,
  state: customer.state,
  zipcode: customer.zipcode,
  latitude: customer.latitude?.toString() || null,
  longitude: customer.longitude?.toString() || null,
  credit_limit: customer.credit_limit?.toString() || null,
  outstanding_amount: customer.outstanding_amount?.toString() || '0',
  route_id: customer.route_id,
  salesperson_id: customer.salesperson_id,
  last_visit_date: customer.last_visit_date,
  is_active: customer.is_active,
  createdate: customer.createdate,
  createdby: customer.createdby,
  updatedate: customer.updatedate,
  updatedby: customer.updatedby,
  log_inst: customer.log_inst,

  customer_zones: customer.customer_zones
    ? {
        id: customer.customer_zones.id,
        name: customer.customer_zones.name,
        code: customer.customer_zones.code,
      }
    : null,
  customer_routes: customer.customer_routes
    ? {
        id: customer.customer_routes.id,
        name: customer.customer_routes.name,
        code: customer.customer_routes.code,
      }
    : null,
  customer_users: customer.customer_users
    ? {
        id: customer.customer_users.id,
        name: customer.customer_users.name,
        email: customer.customer_users.email,
      }
    : null,
});

const checkIfCustomerChanged = (existing: any, incoming: any): boolean => {
  const fieldsToCompare = [
    'name',
    'zones_id',
    'type',
    'contact_person',
    'phone_number',
    'email',
    'address',
    'city',
    'state',
    'zipcode',
    'latitude',
    'longitude',
    'credit_limit',
    'outstanding_amount',
    'route_id',
    'salesperson_id',
    'is_active',
  ];

  let hasAnyChange = false;

  for (const field of fieldsToCompare) {
    if (!(field in incoming)) {
      console.log(`Field "${field}" not in incoming, skipping`);
      continue;
    }

    let existingValue = existing[field];
    let incomingValue = incoming[field];

    if (
      ['latitude', 'longitude', 'credit_limit', 'outstanding_amount'].includes(
        field
      )
    ) {
      if (existingValue !== null && existingValue !== undefined) {
        if (typeof existingValue === 'object' && existingValue.toNumber) {
          existingValue = existingValue.toNumber().toString();
        } else if (
          typeof existingValue === 'object' &&
          existingValue.toString
        ) {
          existingValue = parseFloat(existingValue.toString()).toString();
        } else {
          existingValue = parseFloat(existingValue).toString();
        }
      }

      if (incomingValue !== null && incomingValue !== undefined) {
        incomingValue = parseFloat(incomingValue).toString();
      }
    }

    const isDifferent = existingValue != incomingValue;

    if (isDifferent) {
      console.log(` Field "${field}" chang:`, {
        existing: existingValue,
        incoming: incomingValue,
        existingType: typeof existingValue,
        incomingType: typeof incomingValue,
      });
      hasAnyChange = true;
    } else {
      console.log(` Field "${field}" sme:`, existingValue);
    }
  }

  return hasAnyChange;
};
export const customerController = {
  // async bulkUpsertCustomers(req: any, res: any) {
  //   try {
  //     const customersData = req.body.customers;

  //     if (!Array.isArray(customersData) || customersData.length === 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid request. Expected an array of customers',
  //       });
  //     }

  //     const validationErrors = [];

  //     for (let i = 0; i < customersData.length; i++) {
  //       const customer = customersData[i];

  //       if ('id' in customer || customer.id !== undefined) {
  //         validationErrors.push({
  //           index: i,
  //           customer: customer,
  //           reason: 'ID field is not allowed. Use code to identify customers.',
  //         });
  //       }

  //       if (!customer.code) {
  //         validationErrors.push({
  //           index: i,
  //           customer: customer,
  //           reason: 'Customer code is required',
  //         });
  //       }

  //       if (!customer.name) {
  //         validationErrors.push({
  //           index: i,
  //           customer: customer,
  //           reason: 'Customer name is required',
  //         });
  //       }
  //     }

  //     if (validationErrors.length > 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Validation failed',
  //         errors: validationErrors,
  //       });
  //     }

  //     const codes = customersData.map((c: any) => c.code);
  //     const duplicateCodes = codes.filter(
  //       (code: string, index: number) => codes.indexOf(code) !== index
  //     );

  //     if (duplicateCodes.length > 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Duplicate codes found in request',
  //         duplicates: [...new Set(duplicateCodes)],
  //       });
  //     }

  //     const results = {
  //       created: [] as any[],
  //       updated: [] as any[],
  //       skipped: [] as any[],
  //       errors: [] as any[],
  //     };

  //     for (const customerData of customersData) {
  //       try {
  //         const {
  //           id,
  //           zones_id,
  //           route_id,
  //           salesperson_id,
  //           visit_status,
  //           ...cleanData
  //         } = customerData;

  //         const existingCustomer = await prisma.customers.findUnique({
  //           where: { code: cleanData.code },
  //         });

  //         if (existingCustomer) {
  //           const hasChanged = checkIfCustomerChanged(
  //             existingCustomer,
  //             customerData
  //           );

  //           if (!hasChanged) {
  //             results.skipped.push({
  //               code: existingCustomer.code,
  //               id: existingCustomer.id,
  //               reason: 'No changes detected',
  //             });
  //             continue;
  //           }

  //           const updateData: any = {
  //             ...cleanData,
  //             updatedate: new Date(),
  //             updatedby: req.user?.id || 1,
  //           };

  //           if (zones_id !== undefined) {
  //             if (zones_id === null) {
  //               updateData.customer_zones = { disconnect: true };
  //             } else {
  //               updateData.customer_zones = { connect: { id: zones_id } };
  //             }
  //           }

  //           if (route_id !== undefined) {
  //             if (route_id === null) {
  //               updateData.customer_routes = { disconnect: true };
  //             } else {
  //               updateData.customer_routes = { connect: { id: route_id } };
  //             }
  //           }

  //           if (salesperson_id !== undefined) {
  //             if (salesperson_id === null) {
  //               updateData.customer_users = { disconnect: true };
  //             } else {
  //               updateData.customer_users = { connect: { id: salesperson_id } };
  //             }
  //           }

  //           const updatedCustomer = await prisma.customers.update({
  //             where: { id: existingCustomer.id },
  //             data: updateData,
  //             include: {
  //               customer_zones: true,
  //               customer_routes: true,
  //               customer_users: true,
  //             },
  //           });

  //           results.updated.push(serializeCustomer(updatedCustomer));
  //         } else {
  //           const createData: any = {
  //             ...cleanData,
  //             createdby: req.user?.id || 1,
  //             log_inst: customerData.log_inst || 1,
  //             createdate: new Date(),
  //           };

  //           if (zones_id !== undefined && zones_id !== null) {
  //             createData.customer_zones = { connect: { id: zones_id } };
  //           }

  //           if (route_id !== undefined && route_id !== null) {
  //             createData.customer_routes = { connect: { id: route_id } };
  //           }

  //           if (salesperson_id !== undefined && salesperson_id !== null) {
  //             createData.customer_users = { connect: { id: salesperson_id } };
  //           }

  //           const newCustomer = await prisma.customers.create({
  //             data: createData,
  //             include: {
  //               customer_zones: true,
  //               customer_routes: true,
  //               customer_users: true,
  //             },
  //           });

  //           results.created.push(serializeCustomer(newCustomer));
  //         }
  //       } catch (error: any) {
  //         console.error('Error processing customer:', error);

  //         if (error.code === 'P2002') {
  //           return res.status(400).json({
  //             success: false,
  //             message: `Duplicate code error: ${customerData.code} already exists in database`,
  //             error: {
  //               code: customerData.code,
  //               name: customerData.name,
  //             },
  //           });
  //         }

  //         if (error.code === 'P2025') {
  //           return res.status(400).json({
  //             success: false,
  //             message: `Foreign key error: Referenced record not found (zones_id, route_id, or salesperson_id may be invalid)`,
  //             error: {
  //               code: customerData.code,
  //               name: customerData.name,
  //               details: error.meta?.cause || error.message,
  //             },
  //           });
  //         }

  //         return res.status(500).json({
  //           success: false,
  //           message: 'Database error occurred',
  //           error: error.message,
  //           customer: {
  //             code: customerData.code,
  //             name: customerData.name,
  //           },
  //         });
  //       }
  //     }

  //     res.status(200).json({
  //       success: true,
  //       message: 'Bulk upsert completed successfully',
  //       summary: {
  //         total: customersData.length,
  //         created: results.created.length,
  //         updated: results.updated.length,
  //         skipped: results.skipped.length,
  //         errors: results.errors.length,
  //       },
  //       data: results,
  //     });
  //   } catch (error: any) {
  //     console.error('Bulk Upsert Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Internal server error',
  //       error: error.message,
  //     });
  //   }
  // },

  async bulkUpsertCustomers(req: any, res: any) {
    try {
      const customersData = req.body.customers;

      if (!Array.isArray(customersData) || customersData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request. Expected an array of customers',
        });
      }

      const allowedFields = [
        'code',
        'name',
        'type',
        'contact_person',
        'phone_number',
        'email',
        'address',
        'city',
        'state',
        'zipcode',
        'latitude',
        'longitude',
        'credit_limit',
        'outstanding_amount',
        'last_visit_date',
        'is_active',
        'log_inst',
      ];

      const relationFields = ['zones_id', 'route_id', 'salesperson_id'];

      const systemFields = [
        'id',
        'createdate',
        'createdby',
        'updatedate',
        'updatedby',
      ];

      const validationErrors = [];

      for (let i = 0; i < customersData.length; i++) {
        const customer = customersData[i];

        if (!customer.name) {
          validationErrors.push({
            index: i,
            customer: customer,
            reason: 'Customer name is required',
          });
        }

        if (!customer.email && !customer.phone_number) {
          validationErrors.push({
            index: i,
            customer: customer,
            reason: 'Either email or phone_number is required',
          });
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        });
      }

      const results = {
        created: [] as any[],
        updated: [] as any[],
        skipped: [] as any[],
        errors: [] as any[],
      };

      for (const customerData of customersData) {
        try {
          const zones_id = customerData.zones_id;
          const route_id = customerData.route_id;
          const salesperson_id = customerData.salesperson_id;

          const cleanData: any = {};

          Object.keys(customerData).forEach(key => {
            if (allowedFields.includes(key)) {
              cleanData[key] = customerData[key];
            }
          });

          const ignoredFields = Object.keys(customerData).filter(
            key =>
              !allowedFields.includes(key) &&
              !relationFields.includes(key) &&
              !systemFields.includes(key)
          );

          if (ignoredFields.length > 0) {
            console.log(
              `Ignored fields for ${customerData.name}:`,
              ignoredFields
            );
          }

          const whereConditions: any = {
            AND: [{ name: cleanData.name }],
          };

          if (cleanData.email && cleanData.phone_number) {
            whereConditions.AND.push({
              OR: [
                { email: cleanData.email },
                { phone_number: cleanData.phone_number },
              ],
            });
          } else if (cleanData.email) {
            whereConditions.AND.push({ email: cleanData.email });
          } else if (cleanData.phone_number) {
            whereConditions.AND.push({ phone_number: cleanData.phone_number });
          }

          const existingCustomer = await prisma.customers.findFirst({
            where: whereConditions,
          });

          if (existingCustomer) {
            const hasChanged = checkIfCustomerChanged(
              existingCustomer,
              customerData
            );

            if (!hasChanged) {
              results.skipped.push({
                code: existingCustomer.code,
                id: existingCustomer.id,
                name: existingCustomer.name,
                reason: 'No changes detected',
              });
              continue;
            }

            const updateData: any = {
              ...cleanData,
              updatedate: new Date(),
              updatedby: req.user?.id || 1,
            };

            if (zones_id !== undefined) {
              if (zones_id === null) {
                updateData.customer_zones = { disconnect: true };
              } else {
                updateData.customer_zones = { connect: { id: zones_id } };
              }
            }

            if (route_id !== undefined) {
              if (route_id === null) {
                updateData.customer_routes = { disconnect: true };
              } else {
                updateData.customer_routes = { connect: { id: route_id } };
              }
            }

            if (salesperson_id !== undefined) {
              if (salesperson_id === null) {
                updateData.customer_users = { disconnect: true };
              } else {
                updateData.customer_users = { connect: { id: salesperson_id } };
              }
            }

            const updatedCustomer = await prisma.customers.update({
              where: { id: existingCustomer.id },
              data: updateData,
              include: {
                customer_zones: true,
                customer_routes: true,
                customer_users: true,
              },
            });

            results.updated.push(serializeCustomer(updatedCustomer));
          } else {
            if (!cleanData.code) {
              let uniqueCode = await generateCustomerCode(cleanData.name);
              let attempts = 0;
              const maxAttempts = 10;

              while (attempts < maxAttempts) {
                const codeExists = await prisma.customers.findUnique({
                  where: { code: uniqueCode },
                });

                if (!codeExists) {
                  break;
                }

                const timestamp = Date.now().toString().slice(-4);
                uniqueCode = `${uniqueCode.slice(0, -3)}${timestamp}`;
                attempts++;
              }

              if (attempts >= maxAttempts) {
                results.errors.push({
                  customer: {
                    name: customerData.name,
                    email: customerData.email,
                    phone_number: customerData.phone_number,
                  },
                  reason:
                    'Failed to generate unique code after multiple attempts',
                });
                continue;
              }

              cleanData.code = uniqueCode;
            } else {
              const codeExists = await prisma.customers.findUnique({
                where: { code: cleanData.code },
              });

              if (codeExists) {
                const isSameCustomer =
                  (cleanData.email && codeExists.email === cleanData.email) ||
                  (cleanData.phone_number &&
                    codeExists.phone_number === cleanData.phone_number);

                if (isSameCustomer) {
                  const hasChanged = checkIfCustomerChanged(
                    codeExists,
                    customerData
                  );

                  if (!hasChanged) {
                    results.skipped.push({
                      code: codeExists.code,
                      id: codeExists.id,
                      name: codeExists.name,
                      reason: 'No changes detected',
                    });
                    continue;
                  }

                  const updateData: any = {
                    ...cleanData,
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                  };

                  if (zones_id !== undefined) {
                    updateData.customer_zones =
                      zones_id === null
                        ? { disconnect: true }
                        : { connect: { id: zones_id } };
                  }

                  if (route_id !== undefined) {
                    updateData.customer_routes =
                      route_id === null
                        ? { disconnect: true }
                        : { connect: { id: route_id } };
                  }

                  if (salesperson_id !== undefined) {
                    updateData.customer_users =
                      salesperson_id === null
                        ? { disconnect: true }
                        : { connect: { id: salesperson_id } };
                  }

                  const updatedCustomer = await prisma.customers.update({
                    where: { id: codeExists.id },
                    data: updateData,
                    include: {
                      customer_zones: true,
                      customer_routes: true,
                      customer_users: true,
                    },
                  });

                  results.updated.push(serializeCustomer(updatedCustomer));
                  continue;
                } else {
                  results.errors.push({
                    customer: {
                      name: customerData.name,
                      email: customerData.email,
                      phone_number: customerData.phone_number,
                      code: cleanData.code,
                    },
                    reason: `Code ${cleanData.code} already exists for a different customer`,
                  });
                  continue;
                }
              }
            }

            const createData: any = {
              ...cleanData,
              createdby: req.user?.id || 1,
              log_inst: customerData.log_inst || 1,
              createdate: new Date(),
            };

            if (zones_id !== undefined && zones_id !== null) {
              createData.customer_zones = { connect: { id: zones_id } };
            }

            if (route_id !== undefined && route_id !== null) {
              createData.customer_routes = { connect: { id: route_id } };
            }

            if (salesperson_id !== undefined && salesperson_id !== null) {
              createData.customer_users = { connect: { id: salesperson_id } };
            }

            const newCustomer = await prisma.customers.create({
              data: createData,
              include: {
                customer_zones: true,
                customer_routes: true,
                customer_users: true,
              },
            });

            results.created.push(serializeCustomer(newCustomer));
          }
        } catch (error: any) {
          console.error('Error processing customer:', error);

          results.errors.push({
            customer: {
              name: customerData.name,
              email: customerData.email,
              phone_number: customerData.phone_number,
              code: customerData.code,
            },
            reason: error.message || 'Unknown error occurred',
            error_code: error.code,
          });

          continue;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Bulk upsert completed',
        summary: {
          total: customersData.length,
          created: results.created.length,
          updated: results.updated.length,
          skipped: results.skipped.length,
          errors: results.errors.length,
        },
        data: results,
      });
    } catch (error: any) {
      console.error('Bulk Upsert Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  },
  async createCustomers(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Customer name is required' });
      }
      const newCode = await generateCustomerCode(data.name);
      const customer = await prisma.customers.create({
        data: {
          ...data,
          code: newCode,
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
        },
      });

      res.status(201).json({
        message: 'Customer created successfully',
        data: serializeCustomer(customer),
      });
    } catch (error: any) {
      console.error('Create Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // async getAllCustomers(req: any, res: any) {
  //   try {
  //     const { page, limit, search, type } = req.query;
  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 10;
  //     const searchLower = search ? (search as string).toLowerCase() : '';

  //     const filters: any = {
  //       ...(search && {
  //         OR: [
  //           { name: { contains: searchLower } },
  //           { code: { contains: searchLower } },
  //           { email: { contains: searchLower } },
  //         ],
  //       }),
  //       ...(type && type !== 'All' && { type }),
  //     };

  //     const { data, pagination } = await paginate({
  //       model: prisma.customers,
  //       filters,
  //       page: pageNum,
  //       limit: limitNum,
  //       orderBy: { createdate: 'desc' },
  //       include: {
  //         customer_zones: true,
  //         customer_routes: true,
  //         customer_users: true,
  //       },
  //     });

  //     const distributors = await prisma.customers.count({
  //       where: { type: 'Distributor' },
  //     });
  //     const retailers = await prisma.customers.count({
  //       where: { type: 'Retailer' },
  //     });

  //     const wholesellers = await prisma.customers.count({
  //       where: { type: 'Wholesaler' },
  //     });
  //     const totalCustomers = await prisma.customers.count();
  //     const activeCustomers = await prisma.customers.count({
  //       where: { is_active: 'Y' },
  //     });
  //     const inactiveCustomers = await prisma.customers.count({
  //       where: { is_active: 'N' },
  //     });
  //     const totals = await prisma.customers.aggregate({
  //       _sum: {
  //         credit_limit: true,
  //         outstanding_amount: true,
  //       },
  //     });

  //     const totalCreditLimit = totals._sum.credit_limit || 0;
  //     const totalOutstandingAmount = totals._sum.outstanding_amount || 0;

  //     const now = new Date();
  //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  //     const newCustomersThisMonth = await prisma.customers.count({
  //       where: {
  //         createdate: {
  //           gte: startOfMonth,
  //           lte: endOfMonth,
  //         },
  //       },
  //     });
  //     res.success(
  //       'Customers retrieved successfully',
  //       data.map((c: any) => serializeCustomer(c)),
  //       200,
  //       pagination,
  //       {
  //         new_customers_this_month: newCustomersThisMonth,
  //         total_customers: totalCustomers,
  //         active_customers: activeCustomers,
  //         inactive_customers: inactiveCustomers,
  //         distributors: distributors,
  //         retailers: retailers,
  //         wholesaler: wholesellers,
  //         total_credit_limit: totalCreditLimit,
  //         total_outstanding_amount: totalOutstandingAmount,
  //       }
  //     );
  //   } catch (error: any) {
  //     console.error('Get Customers Error:', error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  async getAllCustomers(req: any, res: any) {
    try {
      const { page, limit, search, type, salesperson_id, route_id } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { email: { contains: searchLower } },
            { phone_number: { contains: searchLower } },
          ],
        }),
        ...(type && type !== 'All' && { type }),
        ...(salesperson_id && {
          salesperson_id: parseInt(salesperson_id as string, 10),
        }),
        ...(route_id && { route_id: parseInt(route_id as string, 10) }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customers,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
        },
      });

      const distributors = await prisma.customers.count({
        where: { type: 'Distributor' },
      });
      const retailers = await prisma.customers.count({
        where: { type: 'Retailer' },
      });

      const wholesellers = await prisma.customers.count({
        where: { type: 'Wholesaler' },
      });
      const totalCustomers = await prisma.customers.count();
      const activeCustomers = await prisma.customers.count({
        where: { is_active: 'Y' },
      });
      const inactiveCustomers = await prisma.customers.count({
        where: { is_active: 'N' },
      });
      const totals = await prisma.customers.aggregate({
        _sum: {
          credit_limit: true,
          outstanding_amount: true,
        },
      });

      const totalCreditLimit = totals._sum.credit_limit || 0;
      const totalOutstandingAmount = totals._sum.outstanding_amount || 0;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newCustomersThisMonth = await prisma.customers.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      res.success(
        'Customers retrieved successfully',
        data.map((c: any) => serializeCustomer(c)),
        200,
        pagination,
        {
          new_customers_this_month: newCustomersThisMonth,
          total_customers: totalCustomers,
          active_customers: activeCustomers,
          inactive_customers: inactiveCustomers,
          distributors: distributors,
          retailers: retailers,
          wholesaler: wholesellers,
          total_credit_limit: totalCreditLimit,
          total_outstanding_amount: totalOutstandingAmount,
        }
      );
    } catch (error: any) {
      console.error('Get Customers Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
  async getCustomersById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await prisma.customers.findUnique({
        where: { id: Number(id) },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
          customer_documents_customers: {
            orderBy: { createdate: 'desc' },
          },
          customer_assets_customers: {
            include: {
              customer_asset_types: {
                select: { id: true, name: true, category: true, brand: true },
              },
              customer_assets_users: {
                select: { id: true, name: true, email: true },
              },

              customers_assets_history: {
                orderBy: { change_date: 'desc' },
                include: {
                  users_customer_assets_history_changed_byTousers: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
            },
            orderBy: { createdate: 'desc' },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({
        success: true,
        message: 'Customer fetched successfully',
        data: {
          customer: serializeCustomer(customer),
          documents: customer.customer_documents_customers || [],
          assets: customer.customer_assets_customers || [],
        },
      });
    } catch (error: any) {
      console.error('Get Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCustomers(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingCustomer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const data = {
        ...req.body,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };
      const customer = await prisma.customers.update({
        where: { id: Number(id) },
        data,
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
        },
      });

      res.json({
        message: 'Customer updated successfully',
        data: serializeCustomer(customer),
      });
    } catch (error: any) {
      console.error('Update Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCustomer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      await prisma.customers.delete({ where: { id: Number(id) } });

      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      console.error('Delete Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
