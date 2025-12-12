import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface VisitSerialized {
  id: number;
  customer_id: number;
  sales_person_id: number;
  route_id?: number | null;
  zones_id?: number | null;
  visit_date?: Date | null;
  visit_time?: string | null;
  purpose?: string | null;
  status?: string | null;
  start_time?: Date | null;
  end_time?: Date | null;
  duration?: number | null;
  start_latitude?: string | null;
  start_longitude?: string | null;
  end_latitude?: string | null;
  end_longitude?: string | null;
  check_in_time?: Date | null;
  check_out_time?: Date | null;
  orders_created?: number | null;
  amount_collected?: string | null;
  visit_notes?: string | null;
  customer_feedback?: string | null;
  next_visit_date?: Date | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  customer?: {
    id: number;
    name: string;
    code: string;
    type?: string | null;
    contact_person?: string | null;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    outstanding_amount: number;
    credit_limit: number;
    is_active: string;
  } | null;
  salesperson?: { id: number; name: string; email: string } | null;
  route?: { id: number; name: string; code: string } | null;
  zone?: { id: number; name: string; code: string } | null;
}

// interface BulkVisitInput {
//   visit: {
//     visit_id?: number;
//     customer_id: number;
//     sales_person_id: number;
//     route_id?: number | null;
//     zones_id?: number | null;
//     visit_date?: Date | string | null;
//     visit_time?: string | null;
//     purpose?: string | null;
//     status?: string | null;
//     start_time?: Date | string | null;
//     end_time?: Date | string | null;
//     duration?: number | null;
//     start_latitude?: string | null;
//     start_longitude?: string | null;
//     end_latitude?: string | null;
//     end_longitude?: string | null;
//     check_in_time?: Date | string | null;
//     check_out_time?: Date | string | null;
//     orders_created?: number | null;
//     amount_collected?: string | null;
//     visit_notes?: string | null;
//     customer_feedback?: string | null;
//     next_visit_date?: Date | string | null;
//     is_active?: string;
//     createdby?: number;
//   };
//   orders?: Array<{
//     slip_id?: number;
//     visit_id?: number;
//     slip_number?: string;
//     slip_type?: string;
//     total_quantity?: number;
//     total_amount?: number;
//     total_volume?: number;
//     created_at?: Date | string;
//     items?: Array<{
//       item_id?: number;
//       product_id: number;
//       product_name?: string;
//       quantity: number;
//       rate: number;
//       amount: number;
//     }>;
//   }>;
//   payments?: Array<{
//     collection_id?: number;
//     visit_id?: number;
//     customer_id: number;
//     collected_by: number;
//     total_amount: number;
//     payment_method: string;
//     reference_number?: string | null;
//     notes?: string | null;
//     createdate?: Date | string;
//   }>;
//   cooler_inspections?: Array<{
//     inspection_id?: number;
//     visit_id?: number;
//     inspected_by: number;
//     inspection_date?: Date | string;
//     temperature?: number;
//     is_working?: string;
//     issues?: string;
//     action_required?: string;
//     action_taken?: string;
//     next_inspection_due?: Date | string;
//     cooler?: {
//       cooler_id?: number;
//       code?: string;
//       brand?: string;
//       model?: string;
//       serial_number?: string;
//       customer_id?: number;
//       location?: string;
//       capacity?: number;
//       // installation_date?: Date | string;
//       warranty_expiry?: Date | string;
//       is_active?: string;
//     };
//   }>;
//   survey?: {
//     survey_response: {
//       response_id?: number;
//       survey_id: number;
//       customer_id?: number;
//       user_id: number;
//       is_submitted?: number;
//       location?: string;
//       photo_url?: string;
//       createdate?: Date | string;
//       survey_answers?: Array<{
//         answer_id?: number;
//         field_id: number;
//         // question_id: number;
//         value: string;
//         // answer_value?: number;
//       }>;
//     };
//   };
// }

interface BulkVisitInput {
  visit: {
    visit_id?: number;
    customer_id: number;
    sales_person_id: number;
    route_id?: number | null;
    zones_id?: number | null;
    visit_date?: Date | string | null;
    visit_time?: string | null;
    purpose?: string | null;
    status?: string | null;
    start_time?: Date | string | null;
    end_time?: Date | string | null;
    duration?: number | null;
    start_latitude?: string | null;
    start_longitude?: string | null;
    end_latitude?: string | null;
    end_longitude?: string | null;
    check_in_time?: Date | string | null;
    check_out_time?: Date | string | null;
    orders_created?: number | null;
    amount_collected?: string | null;
    visit_notes?: string | null;
    customer_feedback?: string | null;
    next_visit_date?: Date | string | null;
    is_active?: string;
    createdby?: number;
  };
  orders?: Array<{
    order_id?: number;
    visit_id?: number;
    order_number?: string;
    order_type?: string;
    order_date?: Date | string;
    delivery_date?: Date | string;
    status?: string;
    priority?: string;
    payment_method?: string;
    payment_terms?: string;
    subtotal?: number;
    discount_amount?: number;
    tax_amount?: number;
    shipping_amount?: number;
    total_amount?: number;
    notes?: string;
    shipping_address?: string;
    approval_status?: string;
    approved_by?: number;
    approved_at?: Date | string;
    is_active?: string;
    items?: Array<{
      item_id?: number;
      product_id: number;
      product_name?: string;
      unit?: string;
      quantity: number;
      unit_price: number;
      discount_amount?: number;
      tax_amount?: number;
      total_amount?: number;
      notes?: string;
    }>;
  }>;
  payments?: Array<{
    payment_id?: number;
    visit_id?: number;
    payment_number?: string;
    customer_id: number;
    payment_date?: Date | string;
    collected_by: number;
    method: string;
    reference_number?: string | null;
    total_amount: number;
    notes?: string | null;
    is_active?: string;
    currency_id?: number;
  }>;
  cooler_inspections?: Array<{
    id?: number;
    visit_id?: number;
    inspected_by: number;
    inspection_date?: Date | string;
    temperature?: number;
    is_working?: string;
    issues?: string;
    images?: string;
    latitude?: number;
    longitude?: number;
    action_required?: string;
    action_taken?: string;
    next_inspection_due?: Date | string;
    cooler?: {
      id?: number;
      code?: string;
      brand?: string;
      model?: string;
      serial_number?: string;
      customer_id?: number;
      capacity?: number | string;
      install_date?: Date | string;
      last_service_date?: Date | string;
      next_service_due?: Date | string;
      status?: string;
      temperature?: number;
      energy_rating?: string;
      warranty_expiry?: Date | string;
      maintenance_contract?: string;
      technician_id?: number;
      last_scanned_date?: Date | string;
      is_active?: string;
    };
  }>;
  survey?: {
    survey_response: {
      id?: number;
      parent_id: number;
      customer_id?: number;
      submitted_by: number;
      submitted_at?: Date | string;
      location?: string;
      photo_url?: string;
      is_active?: string;
      survey_answers?: Array<{
        id?: number;
        parent_id?: number;
        field_id: number;
        answer?: string;
      }>;
    };
  };
}
const serializeVisit = (visit: any): VisitSerialized => ({
  id: visit.id,
  customer_id: visit.customer_id,
  sales_person_id: visit.sales_person_id,
  route_id: visit.route_id,
  zones_id: visit.zones_id,
  visit_date: visit.visit_date,
  visit_time: visit.visit_time,
  purpose: visit.purpose,
  status: visit.status,
  start_time: visit.start_time,
  end_time: visit.end_time,
  duration: visit.duration,
  start_latitude: visit.start_latitude,
  start_longitude: visit.start_longitude,
  end_latitude: visit.end_latitude,
  end_longitude: visit.end_longitude,
  check_in_time: visit.check_in_time,
  check_out_time: visit.check_out_time,
  orders_created: visit.orders_created,
  amount_collected: visit.amount_collected,
  visit_notes: visit.visit_notes,
  customer_feedback: visit.customer_feedback,
  next_visit_date: visit.next_visit_date,
  is_active: visit.is_active,
  createdate: visit.createdate,
  createdby: visit.createdby,
  updatedate: visit.updatedate,
  updatedby: visit.updatedby,
  log_inst: visit.log_inst,
  customer: visit.visit_customers
    ? {
        id: visit.visit_customers.id,
        name: visit.visit_customers.name,
        code: visit.visit_customers.code,
        type: visit.visit_customers.type,
        contact_person: visit.visit_customers.contact_person,
        phone_number: visit.visit_customers.phone_number,
        email: visit.visit_customers.email,
        address: visit.visit_customers.address,
        city: visit.visit_customers.city,
        state: visit.visit_customers.state,
        zipcode: visit.visit_customers.zipcode,
        outstanding_amount: visit.visit_customers.outstanding_amount,
        credit_limit: visit.visit_customers.credit_limit,
        is_active: visit.visit_customers.is_active,
      }
    : null,
  salesperson: visit.visits_salesperson
    ? {
        id: visit.visits_salesperson.id,
        name: visit.visits_salesperson.name,
        email: visit.visits_salesperson.email,
      }
    : null,
  route: visit.visit_routes
    ? {
        id: visit.visit_routes.id,
        name: visit.visit_routes.name,
        code: visit.visit_routes.code,
      }
    : null,
  zone: visit.visit_zones
    ? {
        id: visit.visit_zones.id,
        name: visit.visit_zones.name,
        code: visit.visit_zones.code,
      }
    : null,
});

export const visitsController = {
  async createVisits(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.customer_id || !data.sales_person_id) {
        return res
          .status(400)
          .json({ message: 'Customer ID and Sales Person ID are required' });
      }

      const processedData = {
        ...data,
        visit_date: data.visit_date ? new Date(data.visit_date) : undefined,
        start_time: data.start_time ? new Date(data.start_time) : undefined,
        end_time: data.end_time ? new Date(data.end_time) : undefined,
        check_in_time: data.check_in_time
          ? new Date(data.check_in_time)
          : undefined,
        check_out_time: data.check_out_time
          ? new Date(data.check_out_time)
          : undefined,
        next_visit_date: data.next_visit_date
          ? new Date(data.next_visit_date)
          : undefined,
      };

      const visit = await prisma.visits.create({
        data: {
          ...processedData,
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
        },
        include: {
          visit_customers: true,
          visits_salesperson: true,
          visit_routes: true,
          visit_zones: true,
        },
      });

      res.status(201).json({
        message: 'Visit created successfully',
        data: serializeVisit(visit),
      });
    } catch (error: any) {
      console.error('Create Visit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async bulkUpsertVisits(req: Request, res: Response) {
    try {
      const inputData: BulkVisitInput | BulkVisitInput[] = req.body;
      const dataArray: BulkVisitInput[] = Array.isArray(inputData)
        ? inputData
        : [inputData];

      if (!dataArray || dataArray.length === 0) {
        return res.status(400).json({
          message: 'No visit data provided',
        });
      }

      const results = {
        created: [] as any[],
        updated: [] as any[],
        failed: [] as any[],
      };

      for (const data of dataArray) {
        try {
          const { visit, orders, payments, cooler_inspections, survey } = data;

          if (!visit) {
            results.failed.push({
              data,
              error: 'Visit data is required',
            });
            continue;
          }

          if (!visit.customer_id || !visit.sales_person_id) {
            results.failed.push({
              data,
              error: 'Customer ID and Sales Person ID are required',
            });
            continue;
          }

          const isUpdate = visit.visit_id && visit.visit_id > 0;

          const processedVisitData = {
            customer_id: visit.customer_id,
            sales_person_id: visit.sales_person_id,
            route_id: visit.route_id,
            zones_id: visit.zones_id,
            visit_date: visit.visit_date
              ? new Date(visit.visit_date)
              : undefined,
            visit_time: visit.visit_time,
            purpose: visit.purpose,
            status: visit.status,
            start_time: visit.start_time
              ? new Date(visit.start_time)
              : undefined,
            end_time: visit.end_time ? new Date(visit.end_time) : undefined,
            duration: visit.duration,
            start_latitude: visit.start_latitude,
            start_longitude: visit.start_longitude,
            end_latitude: visit.end_latitude,
            end_longitude: visit.end_longitude,
            check_in_time: visit.check_in_time
              ? new Date(visit.check_in_time)
              : undefined,
            check_out_time: visit.check_out_time
              ? new Date(visit.check_out_time)
              : undefined,
            orders_created: visit.orders_created,
            amount_collected: visit.amount_collected,
            visit_notes: visit.visit_notes,
            customer_feedback: visit.customer_feedback,
            next_visit_date: visit.next_visit_date
              ? new Date(visit.next_visit_date)
              : undefined,
            is_active: visit.is_active || 'Y',
          };

          const result = await prisma.$transaction(async tx => {
            let visitRecord;

            if (isUpdate) {
              const existingVisit = await tx.visits.findUnique({
                where: { id: visit.visit_id },
              });

              if (!existingVisit) {
                throw new Error(`Visit with id ${visit.visit_id} not found`);
              }

              visitRecord = await tx.visits.update({
                where: { id: visit.visit_id },
                data: {
                  ...processedVisitData,
                  updatedate: new Date(),
                  updatedby: (req as any).user?.id || visit.createdby || 1,
                },
              });
            } else {
              visitRecord = await tx.visits.create({
                data: {
                  ...processedVisitData,
                  createdate: new Date(),
                  createdby: visit.createdby || (req as any).user?.id || 1,
                  log_inst: 1,
                },
              });
            }

            const visitId = visitRecord.id;

            if (orders && orders.length > 0) {
              for (const orderData of orders) {
                const orderItems = orderData.items || [];

                const processedOrderData = {
                  order_number:
                    orderData.order_number ||
                    `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                  parent_id: visit.customer_id,
                  salesperson_id: visit.sales_person_id,
                  order_date: orderData.order_date
                    ? new Date(orderData.order_date)
                    : new Date(),
                  delivery_date: orderData.delivery_date
                    ? new Date(orderData.delivery_date)
                    : undefined,
                  status: orderData.status || 'draft',
                  priority: orderData.priority || 'medium',
                  order_type: orderData.order_type || 'regular',
                  payment_method: orderData.payment_method || 'credit',
                  payment_terms: orderData.payment_terms || 'Net 30',
                  subtotal: orderData.subtotal || 0,
                  discount_amount: orderData.discount_amount || 0,
                  tax_amount: orderData.tax_amount || 0,
                  shipping_amount: orderData.shipping_amount || 0,
                  total_amount: orderData.total_amount || 0,
                  notes: orderData.notes,
                  shipping_address: orderData.shipping_address,
                  approval_status: orderData.approval_status || 'pending',
                  approved_by: orderData.approved_by,
                  approved_at: orderData.approved_at
                    ? new Date(orderData.approved_at)
                    : undefined,
                  is_active: orderData.is_active || 'Y',
                };

                let createdOrder: Awaited<ReturnType<typeof tx.orders.create>>;

                if (orderData.order_id) {
                  createdOrder = await tx.orders.update({
                    where: { id: orderData.order_id },
                    data: {
                      ...processedOrderData,
                      updatedate: new Date(),
                      updatedby: (req as any).user?.id || visit.createdby || 1,
                    },
                  });

                  if (orderItems.length > 0) {
                    for (const item of orderItems) {
                      const itemData = {
                        product_id: item.product_id,
                        product_name: item.product_name,
                        unit: item.unit,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        discount_amount: item.discount_amount || 0,
                        tax_amount: item.tax_amount || 0,
                        total_amount: item.total_amount,
                        notes: item.notes,
                      };

                      if (item.item_id) {
                        await tx.order_items.update({
                          where: { id: item.item_id },
                          data: itemData,
                        });
                      } else {
                        await tx.order_items.create({
                          data: {
                            ...itemData,
                            parent_id: createdOrder.id,
                          },
                        });
                      }
                    }
                  }
                } else {
                  createdOrder = await tx.orders.create({
                    data: {
                      ...processedOrderData,
                      createdate: new Date(),
                      createdby: visit.createdby || (req as any).user?.id || 1,
                      log_inst: 1,
                    },
                  });

                  if (orderItems.length > 0) {
                    await tx.order_items.createMany({
                      data: orderItems.map(item => ({
                        parent_id: createdOrder.id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        unit: item.unit,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        discount_amount: item.discount_amount || 0,
                        tax_amount: item.tax_amount || 0,
                        total_amount: item.total_amount,
                        notes: item.notes,
                      })),
                    });
                  }
                }
              }
            }
            if (payments && payments.length > 0) {
              for (const payment of payments) {
                const processedPaymentData = {
                  payment_number:
                    payment.payment_number ||
                    `PAY-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                  customer_id: payment.customer_id,
                  payment_date: payment.payment_date
                    ? new Date(payment.payment_date)
                    : new Date(),
                  collected_by: payment.collected_by,
                  method: payment.method,
                  reference_number: payment.reference_number,
                  total_amount: payment.total_amount,
                  notes: payment.notes,
                  is_active: payment.is_active || 'Y',
                  currency_id: payment.currency_id,
                };

                if (payment.payment_id) {
                  await tx.payments.update({
                    where: { id: payment.payment_id },
                    data: {
                      ...processedPaymentData,
                      updatedate: new Date(),
                      updatedby: (req as any).user?.id || visit.createdby || 1,
                    },
                  });
                } else {
                  await tx.payments.create({
                    data: {
                      ...processedPaymentData,
                      createdate: new Date(),
                      createdby: visit.createdby || (req as any).user?.id || 1,
                      log_inst: 1,
                    },
                  });
                }
              }
            }

            if (cooler_inspections && cooler_inspections.length > 0) {
              for (const inspection of cooler_inspections) {
                let coolerId = inspection.cooler?.id;

                if (inspection.cooler) {
                  const coolerData = inspection.cooler;

                  const processedCoolerData = {
                    code:
                      coolerData.code ||
                      `COOL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    brand: coolerData.brand,
                    model: coolerData.model,
                    serial_number: coolerData.serial_number,
                    customer_id: coolerData.customer_id || visit.customer_id,
                    capacity: coolerData.capacity
                      ? typeof coolerData.capacity === 'number'
                        ? coolerData.capacity
                        : parseInt(
                            String(coolerData.capacity).replace(/[^0-9]/g, '')
                          ) || null
                      : null,
                    install_date: coolerData.install_date
                      ? new Date(coolerData.install_date)
                      : undefined,
                    last_service_date: coolerData.last_service_date
                      ? new Date(coolerData.last_service_date)
                      : undefined,
                    next_service_due: coolerData.next_service_due
                      ? new Date(coolerData.next_service_due)
                      : undefined,
                    status: coolerData.status || 'working',
                    temperature: coolerData.temperature || undefined,
                    energy_rating: coolerData.energy_rating,
                    warranty_expiry: coolerData.warranty_expiry
                      ? new Date(coolerData.warranty_expiry)
                      : undefined,
                    maintenance_contract: coolerData.maintenance_contract,
                    technician_id: coolerData.technician_id,
                    last_scanned_date: coolerData.last_scanned_date
                      ? new Date(coolerData.last_scanned_date)
                      : undefined,
                    is_active: coolerData.is_active || 'Y',
                  };

                  if (coolerData.id) {
                    await tx.coolers.update({
                      where: { id: coolerData.id },
                      data: {
                        ...processedCoolerData,
                        updatedate: new Date(),
                        updatedby:
                          (req as any).user?.id || visit.createdby || 1,
                      },
                    });
                    coolerId = coolerData.id;
                  } else {
                    const newCooler = await tx.coolers.create({
                      data: {
                        ...processedCoolerData,
                        createdate: new Date(),
                        createdby:
                          visit.createdby || (req as any).user?.id || 1,
                        log_inst: 1,
                      },
                    });
                    coolerId = newCooler.id;
                  }
                }

                if (!coolerId) {
                  throw new Error('Cooler ID is required for inspection');
                }

                const processedInspectionData = {
                  cooler_id: coolerId,
                  visit_id: visitId,
                  inspected_by: inspection.inspected_by,
                  inspection_date: inspection.inspection_date
                    ? new Date(inspection.inspection_date)
                    : new Date(),
                  temperature: inspection.temperature || undefined,
                  is_working: inspection.is_working || 'Y',
                  issues: inspection.issues,
                  images: inspection.images,
                  latitude: inspection.latitude || undefined,
                  longitude: inspection.longitude || undefined,
                  action_required: inspection.action_required || 'N',
                  action_taken: inspection.action_taken,
                  next_inspection_due: inspection.next_inspection_due
                    ? new Date(inspection.next_inspection_due)
                    : undefined,
                };

                if (inspection.id) {
                  await tx.cooler_inspections.update({
                    where: { id: inspection.id },
                    data: {
                      ...processedInspectionData,
                      updatedate: new Date(),
                      updatedby: (req as any).user?.id || visit.createdby || 1,
                    },
                  });
                } else {
                  await tx.cooler_inspections.create({
                    data: {
                      ...processedInspectionData,
                      createdate: new Date(),
                      createdby: visit.createdby || (req as any).user?.id || 1,
                      log_inst: 1,
                    },
                  });
                }
              }
            }

            if (survey && survey.survey_response) {
              const { survey_response } = survey;
              const surveyAnswers = survey_response.survey_answers || [];

              const processedSurveyData = {
                parent_id: survey_response.parent_id,
                customer_id: survey_response.customer_id || visit.customer_id,
                submitted_by: survey_response.submitted_by,
                submitted_at: survey_response.submitted_at
                  ? new Date(survey_response.submitted_at)
                  : new Date(),
                location: survey_response.location,
                photo_url: survey_response.photo_url,
                is_active: survey_response.is_active || 'Y',
              };

              let surveyResponseRecord: Awaited<
                ReturnType<typeof tx.survey_responses.create>
              >;

              if (survey_response.id) {
                surveyResponseRecord = await tx.survey_responses.update({
                  where: { id: survey_response.id },
                  data: {
                    ...processedSurveyData,
                    updatedate: new Date(),
                    updatedby: (req as any).user?.id || visit.createdby || 1,
                  },
                });

                if (surveyAnswers.length > 0) {
                  for (const answer of surveyAnswers) {
                    const answerData = {
                      parent_id: surveyResponseRecord.id,
                      field_id: answer.field_id,
                      answer: answer.answer,
                    };

                    if (answer.id) {
                      await tx.survey_answers.update({
                        where: { id: answer.id },
                        data: answerData,
                      });
                    } else {
                      await tx.survey_answers.create({
                        data: answerData,
                      });
                    }
                  }
                }
              } else {
                surveyResponseRecord = await tx.survey_responses.create({
                  data: {
                    ...processedSurveyData,
                    createdate: new Date(),
                    createdby: visit.createdby || (req as any).user?.id || 1,
                    log_inst: 1,
                  },
                });

                if (surveyAnswers.length > 0) {
                  await tx.survey_answers.createMany({
                    data: surveyAnswers.map(answer => ({
                      parent_id: surveyResponseRecord.id,
                      field_id: answer.field_id,
                      answer: answer.answer,
                    })),
                  });
                }
              }
            }

            return await tx.visits.findUnique({
              where: { id: visitId },
              include: {
                visit_customers: true,
                visits_salesperson: true,
                visit_routes: true,
                visit_zones: true,
                cooler_inspections: {
                  include: {
                    coolers: true,
                    users: true,
                  },
                },
              },
            });
          });

          if (isUpdate) {
            results.updated.push({
              visit: serializeVisit(result),
              visit_id: result?.id,
              message: `Visit ${visit.visit_id} updated successfully`,
            });
          } else {
            results.created.push({
              visit: serializeVisit(result),
              visit_id: result?.id,
              message: 'Visit created successfully',
            });
          }
        } catch (error: any) {
          console.error('Visit Processing Error:', error);
          results.failed.push({
            data: data?.visit || data,
            error: error.message || 'Unknown error occurred',
            stack:
              process.env.NODE_ENV === 'development' ? error.stack : undefined,
          });
        }
      }

      const statusCode =
        results.failed.length === dataArray.length
          ? 400
          : results.failed.length > 0
            ? 207
            : results.created.length > 0
              ? 201
              : 200;

      res.status(statusCode).json({
        success: results.failed.length === 0,
        message: 'Bulk upsert completed',
        summary: {
          total: dataArray.length,
          created: results.created.length,
          updated: results.updated.length,
          failed: results.failed.length,
        },
        results: {
          created: results.created,
          updated: results.updated,
          failed: results.failed,
        },
      });
    } catch (error: any) {
      console.error('Bulk Upsert Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  },

  async getAllVisits(req: any, res: any) {
    try {
      console.log('Request Query:', req.query);
      console.log('Request User:', req.user);

      const {
        page,
        limit,
        search,
        sales_person_id,
        status,
        isActive,
        startDate,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(limit as string, 10) || 10)
      );
      const searchLower = search ? (search as string).toLowerCase().trim() : '';

      console.log('Parsed Pagination:', { pageNum, limitNum });
      console.log('Search Term:', searchLower);

      const allowedStatuses = [
        'pending',
        'completed',
        'cancelled',
        'in_progress',
      ];
      if (status && !allowedStatuses.includes(status as string)) {
        console.log('Invalid status:', status);
        return res.status(400).json({ message: 'Invalid status value' });
      }

      if (isActive && !['Y', 'N'].includes(isActive as string)) {
        console.log('Invalid isActive:', isActive);
        return res.status(400).json({ message: 'Invalid isActive value' });
      }

      const filters: any = {};
      const userRole = req.user?.role?.toLowerCase();
      const userId = req.user?.id;

      console.log('User Role:', userRole, 'User ID:', userId);

      if (userRole === 'technician') {
        console.log('Applying Technician filters - inspection visits only');
        filters.sales_person_id = userId;
        filters.cooler_inspections = {
          some: {},
        };
        console.log('Technician filters:', filters);
      } else if (userRole === 'salesman' || userRole === 'salesperson') {
        console.log(
          'Applying Salesman/Salesperson filters - sales visits only'
        );
        filters.sales_person_id = userId;
        filters.OR = [
          { purpose: { contains: 'sales' } },
          { purpose: { contains: 'order' } },
          { purpose: { contains: 'follow_up' } },
          { purpose: { contains: 'new_customer' } },
        ];
        console.log('Salesman filters:', filters);
      } else if (userRole === 'merchandiser') {
        console.log(
          'Applying Merchandiser filters - merchandising visits only'
        );
        filters.sales_person_id = userId;
        filters.OR = [
          { purpose: { contains: 'merchandising' } },
          { purpose: { contains: 'shelf_arrangement' } },
          { purpose: { contains: 'stock_check' } },
          { purpose: { contains: 'display_setup' } },
        ];
        console.log('Merchandiser filters:', filters);
      } else if (userRole === 'supervisor') {
        console.log('Applying Supervisor filters - own visits only');
        filters.sales_person_id = userId;
        console.log('Supervisor filters:', filters);
      } else if (userRole === 'admin' || userRole === 'manager') {
        console.log(
          'Admin/Manager role - can see all visits or filter by sales_person_id'
        );
        if (sales_person_id) {
          const salesPersonIdNum = parseInt(sales_person_id as string, 10);
          if (isNaN(salesPersonIdNum)) {
            console.log('Invalid sales_person_id (NaN):', sales_person_id);
            return res.status(400).json({ message: 'Invalid sales_person_id' });
          }
          filters.sales_person_id = salesPersonIdNum;
          console.log('Filtered by sales_person_id:', salesPersonIdNum);
        } else {
          console.log('No sales_person_id filter - showing all visits');
        }
      } else {
        console.log('Unknown role, restricting to own data');
        filters.sales_person_id = parseInt(userId as string, 10);
      }

      if (startDate) {
        console.log('Processing startDate:', startDate);
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          console.log('Invalid date format:', startDate);
          return res.status(400).json({
            message: 'Invalid date format. Please use YYYY-MM-DD',
          });
        }

        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        end.setHours(23, 59, 59, 999);

        filters.visit_date = { gte: start, lte: end };
        console.log('Date range filter:', { start, end });
      }

      if (searchLower) {
        console.log('Applying search filter for term:', searchLower);
        const searchOr = [
          { purpose: { contains: searchLower } },
          { status: { contains: searchLower } },
          { visit_notes: { contains: searchLower } },
        ];

        console.log('Search OR conditions:', searchOr);

        if (filters.OR) {
          console.log('Combining search with existing OR filters');
          console.log('Existing OR:', filters.OR);
          filters.AND = [{ OR: filters.OR }, { OR: searchOr }];
          delete filters.OR;
          console.log('Combined AND filters:', filters.AND);
        } else {
          filters.OR = searchOr;
          console.log('Applied search OR filters');
        }
      }

      if (status) {
        console.log('Applying status filter:', status);
        filters.status = status as string;
      }

      if (isActive) {
        console.log('Applying isActive filter:', isActive);
        filters.is_active = isActive as string;
      }

      console.log(JSON.stringify(filters, null, 2));

      const { data, pagination } = await paginate({
        model: prisma.visits,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          visit_customers: true,
          visits_salesperson: true,
          visit_routes: true,
          visit_zones: true,
          cooler_inspections: true,
        },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const [totalVisits, activeVisits, inactiveVisits, newVisitsThisMonth] =
        await Promise.all([
          prisma.visits.count({ where: filters }),
          prisma.visits.count({ where: { ...filters, is_active: 'Y' } }),
          prisma.visits.count({ where: { ...filters, is_active: 'N' } }),
          prisma.visits.count({
            where: {
              ...filters,
              createdate: { gte: startOfMonth, lte: endOfMonth },
            },
          }),
        ]);

      console.log('Statistics:', {
        totalVisits,
        activeVisits,
        inactiveVisits,
        newVisitsThisMonth,
      });

      const serializedData = data.map((visit: any) => serializeVisit(visit));

      res.success(
        'Visits retrieved successfully',
        serializedData,
        200,
        pagination,
        {
          total_visits: totalVisits,
          active_visits: activeVisits,
          inactive_visits: inactiveVisits,
          new_visits: newVisitsThisMonth,
        }
      );
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
  async getVisitsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const visit = await prisma.visits.findUnique({
        where: { id: Number(id) },
        include: {
          visit_customers: true,
          visits_salesperson: true,
          visit_routes: true,
          visit_zones: true,
        },
      });
      if (!visit) {
        return res.status(404).json({ message: 'Visit not found' });
      }
      res.status(200).json({
        message: 'Visit retrieved successfully',
        data: serializeVisit(visit),
      });
    } catch (error: any) {
      console.error('Get Visit Error:', error);

      res.status(500).json({ message: error.message });
    }
  },

  async updateVisits(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingVisit = await prisma.visits.findUnique({
        where: { id: Number(id) },
      });
      if (!existingVisit) {
        return res.status(404).json({ message: 'Visit not found' });
      }
      const processedData = {
        ...req.body,
        visit_date: req.body.visit_date
          ? new Date(req.body.visit_date)
          : undefined,
        start_time: req.body.start_time
          ? new Date(req.body.start_time)
          : undefined,
        end_time: req.body.end_time ? new Date(req.body.end_time) : undefined,
        check_in_time: req.body.check_in_time
          ? new Date(req.body.check_in_time)
          : undefined,
        check_out_time: req.body.check_out_time
          ? new Date(req.body.check_out_time)
          : undefined,
        next_visit_date: req.body.next_visit_date
          ? new Date(req.body.next_visit_date)
          : undefined,
      };
      const data = {
        ...processedData,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };
      const visit = await prisma.visits.update({
        where: { id: Number(id) },
        data,
        include: {
          visit_customers: true,
          visits_salesperson: true,
        },
      });
      res.status(200).json({
        message: 'Visit updated successfully',
        data: serializeVisit(visit),
      });
    } catch (error: any) {
      console.log('Update Visit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteVisits(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingVisit = await prisma.visits.findUnique({
        where: { id: Number(id) },
      });
      if (!existingVisit) {
        return res.status(404).json({ message: 'Visit not found' });
      }
      await prisma.visits.delete({ where: { id: Number(id) } });
    } catch (error: any) {
      console.log('Delete Visit Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
