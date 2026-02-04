import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { parse } from 'path';
import { deleteFile, uploadFile } from '../../utils/blackbaze';
import type { orders, survey_responses } from '@prisma/client';

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

  orders?: Array<{
    id: number;
    order_number: string;
    order_type: string;
    order_date: Date;
    delivery_date?: Date | null;
    status: string;
    priority: string;
    payment_method: string;
    payment_terms: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    shipping_amount: number;
    total_amount: number;
    notes?: string | null;
    shipping_address?: string | null;
    approval_status: string;
    is_active: string;
    items: Array<{
      id: number;
      product_id: number;
      product_name?: string | null;
      unit?: string | null;
      quantity: number;
      unit_price: number;
      discount_amount: number;
      tax_amount: number;
      total_amount: number;
      notes?: string | null;
    }>;
  }>;

  payments?: Array<{
    id: number;
    payment_number: string;
    customer_id: number;
    payment_date: Date;
    collected_by: number;
    method: string;
    reference_number?: string | null;
    total_amount: number;
    notes?: string | null;
    is_active: string;
    currency_id?: number | null;
  }>;

  cooler_inspections?: Array<{
    id: number;
    cooler_id: number;
    inspected_by: number;
    inspection_date: Date;
    temperature?: number | null;
    is_working: string;
    issues?: string | null;
    images?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    action_required: string;
    action_taken?: string | null;
    next_inspection_due?: Date | null;
    cooler?: {
      id: number;
      code: string;
      brand?: string | null;
      model?: string | null;
      serial_number?: string | null;
      customer_id: number;
      capacity?: number | null;
      status: string;
    } | null;
  }>;

  survey_responses?: Array<{
    id: number;
    parent_id: number;
    customer_id: number;
    submitted_by: number;
    submitted_at: Date;
    location?: string | null;
    photo_url?: string | null;
    is_active: string;
    survey_answers: Array<{
      id: number;
      field_id: number;
      answer?: string | null;
    }>;
  }>;
}

interface BulkVisitInput {
  visit: {
    id?: number;
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

function serializeVisit(visit: any) {
  return {
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

    images: {
      self: visit.self_image ? visit.self_image.split(',').filter(Boolean) : [],
      customer: visit.customer_image
        ? visit.customer_image.split(',').filter(Boolean)
        : [],
      cooler: visit.cooler_image
        ? visit.cooler_image.split(',').filter(Boolean)
        : [],
    },

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

    route: visit.visit_routes,
    zone: visit.visit_zones,

    // orders:
    //   visit.orders?.map((order: any) => ({
    //     id: order.id,
    //     order_number: order.order_number,
    //     order_type: order.order_type,
    //     order_date: order.order_date,
    //     delivery_date: order.delivery_date,
    //     status: order.status,
    //     priority: order.priority,
    //     payment_method: order.payment_method,
    //     payment_terms: order.payment_terms,
    //     subtotal: order.subtotal,
    //     discount_amount: order.discount_amount,
    //     tax_amount: order.tax_amount,
    //     shipping_amount: order.shipping_amount,
    //     total_amount: order.total_amount,
    //     notes: order.notes,
    //     shipping_address: order.shipping_address,
    //     approval_status: order.approval_status,
    //     is_active: order.is_active,
    //     items:
    //       order.order_items?.map((item: any) => ({
    //         id: item.id,
    //         product_id: item.product_id,
    //         product_name: item.product_name,
    //         unit: item.unit,
    //         quantity: item.quantity,
    //         unit_price: item.unit_price,
    //         discount_amount: item.discount_amount,
    //         tax_amount: item.tax_amount,
    //         total_amount: item.total_amount,
    //         notes: item.notes,
    //       })) || [],
    //   })) || [],

    payments:
      visit.payments?.map((payment: any) => ({
        id: payment.id,
        payment_number: payment.payment_number,
        customer_id: payment.customer_id,
        payment_date: payment.payment_date,
        collected_by: payment.collected_by,
        method: payment.method,
        reference_number: payment.reference_number,
        total_amount: payment.total_amount,
        notes: payment.notes,
        is_active: payment.is_active,
        currency_id: payment.currency_id,
      })) || [],

    cooler_inspections:
      visit.cooler_inspections?.map((inspection: any) => ({
        id: inspection.id,
        cooler_id: inspection.cooler_id,
        inspected_by: inspection.inspected_by,
        inspection_date: inspection.inspection_date,
        temperature: inspection.temperature,
        is_working: inspection.is_working,
        issues: inspection.issues,
        images: inspection.images,
        latitude: inspection.latitude,
        longitude: inspection.longitude,
        action_required: inspection.action_required,
        action_taken: inspection.action_taken,
        next_inspection_due: inspection.next_inspection_due,
        cooler: inspection.coolers
          ? {
              id: inspection.coolers.id,
              code: inspection.coolers.code,
              brand: inspection.coolers.brand,
              model: inspection.coolers.model,
              serial_number: inspection.coolers.serial_number,
              customer_id: inspection.coolers.customer_id,
              capacity: inspection.coolers.capacity,
              status: inspection.coolers.status,
            }
          : null,
      })) || [],

    survey_responses: visit.survey_responses || [],
  };
}

const generatePaymentNumberInTransaction = async (tx: any) => {
  const prefix = 'PAY';
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const lastPayment = await tx.payments.findFirst({
    where: {
      createdate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { id: 'desc' },
    select: { payment_number: true },
  });

  let newNumber = 1;
  if (lastPayment && lastPayment.payment_number) {
    const match = lastPayment.payment_number.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }

  const paymentNumber = `${prefix}-${date}-${newNumber.toString().padStart(3, '0')}`;

  const existing = await tx.payments.findFirst({
    where: { payment_number: paymentNumber },
  });

  if (existing) {
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${date}-${newNumber.toString().padStart(3, '0')}-${timestamp}`;
  }

  return paymentNumber;
};

const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string,
  visitId?: number
): Promise<string | null> => {
  try {
    if (!files || files.length === 0) return null;

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const fileName = `${folder}/${visitId || 'temp'}-${timestamp}-${file.originalname}`;
      const uploadedUrl = await uploadFile(
        file.buffer,
        fileName,
        file.mimetype
      );
      uploadedUrls.push(uploadedUrl);
    }

    return uploadedUrls.join(',');
  } catch (error) {
    console.error(`Error uploading images to ${folder}:`, error);
    throw error;
  }
};

const deleteOldImages = async (imageUrls: string | null): Promise<void> => {
  if (!imageUrls) return;

  try {
    const urls = imageUrls.split(',').map(url => url.trim());
    for (const url of urls) {
      if (url) {
        await deleteFile(url);
      }
    }
  } catch (error) {
    console.error('Error deleting old images:', error);
  }
};

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
        start_latitude:
          data.start_latitude && data.start_latitude.trim() !== ''
            ? parseFloat(data.start_latitude)
            : null,
        start_longitude:
          data.start_longitude && data.start_longitude.trim() !== ''
            ? parseFloat(data.start_longitude)
            : null,
        end_latitude:
          data.end_latitude && data.end_latitude.trim() !== ''
            ? parseFloat(data.end_latitude)
            : null,
        end_longitude:
          data.end_longitude && data.end_longitude.trim() !== ''
            ? parseFloat(data.end_longitude)
            : null,
        amount_collected:
          data.amount_collected && data.amount_collected.trim() !== ''
            ? parseFloat(data.amount_collected)
            : null,
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
      const inputData = req.body;
      let dataArray: BulkVisitInput[] = [];

      if (typeof inputData.visits === 'string') {
        try {
          dataArray = JSON.parse(inputData.visits);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: 'Invalid visits JSON string',
            error: 'Please provide valid JSON in visits field',
          });
        }
      } else if (inputData.visits && Array.isArray(inputData.visits)) {
        dataArray = inputData.visits;
      } else if (inputData.visit && Array.isArray(inputData.visit)) {
        dataArray = inputData.visit.map((item: any) => ({
          visit: {
            id: item.id,
            customer_id: item.customer_id,
            sales_person_id: item.sales_person_id,
            route_id: item.route_id,
            zones_id: item.zones_id,
            visit_date: item.visit_date,
            visit_time: item.visit_time,
            purpose: item.purpose,
            status: item.status,
            start_time: item.start_time,
            end_time: item.end_time,
            duration: item.duration,
            start_latitude: item.start_latitude,
            start_longitude: item.start_longitude,
            end_latitude: item.end_latitude,
            end_longitude: item.end_longitude,
            check_in_time: item.check_in_time,
            check_out_time: item.check_out_time,
            orders_created: item.orders_created,
            amount_collected: item.amount_collected,
            visit_notes: item.visit_notes,
            customer_feedback: item.customer_feedback,
            next_visit_date: item.next_visit_date,
            is_active: item.is_active,
            createdby: item.createdby,
            visit_id: item.visit_id,
          },
          orders: item.orders || [],
          payments: item.payments || [],
          cooler_inspections: item.cooler_inspections || [],
          survey: item.survey,
        }));
      } else if (Array.isArray(inputData)) {
        dataArray = inputData;
      } else if (inputData.visit) {
        dataArray = [inputData];
      } else {
        return res.status(400).json({
          success: false,
          message:
            'Invalid input format. Expected { visits: [...] }, { visit: [...] }, or [{ visit: {...} }]',
        });
      }

      if (!dataArray || dataArray.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No visit data provided',
        });
      }

      const organizedFiles = (req as any).organizedFiles || {};

      console.log(`\n Starting bulk upsert for ${dataArray.length} visit(s)`);
      console.log(
        `📎 Files received: ${Object.keys(organizedFiles).length > 0 ? Object.keys(organizedFiles).join(', ') : 'None'}`
      );

      const results = {
        created: [] as any[],
        updated: [] as any[],
        failed: [] as any[],
      };

      for (let index = 0; index < dataArray.length; index++) {
        const data = dataArray[index];

        try {
          const { visit, orders, payments, cooler_inspections, survey } = data;

          if (!visit) {
            results.failed.push({
              visitIndex: index,
              data,
              error: 'Visit data is required',
            });
            continue;
          }

          if (!visit.customer_id || !visit.sales_person_id) {
            results.failed.push({
              visitIndex: index,
              data,
              error: 'Customer ID and Sales Person ID are required',
            });
            continue;
          }

          const isUpdate = (visit.id ?? visit.visit_id ?? 0) > 0;
          const visitIdToUpdate = visit.id ?? visit.visit_id;
          console.log(
            `\nProcessing visit ${index + 1}/${dataArray.length} (Customer: ${visit.customer_id}${isUpdate ? `, Visit ID: ${visitIdToUpdate}` : ''})`
          );

          const selfImagesFiles =
            organizedFiles[`visit_${index}_self_images`] || [];
          const customerImagesFiles =
            organizedFiles[`visit_${index}_customer_images`] || [];
          const coolerImagesFiles =
            organizedFiles[`visit_${index}_cooler_images`] || [];

          console.log(
            ` Images: Self(${selfImagesFiles.length}) Customer(${customerImagesFiles.length}) Cooler(${coolerImagesFiles.length})`
          );

          let selfImageUrls: string[] = [];
          let customerImageUrls: string[] = [];
          let coolerImageUrls: string[] = [];
          let uploadedImagePaths: string[] = [];

          try {
            if (selfImagesFiles.length > 0) {
              const uploadedPath = await uploadMultipleImages(
                selfImagesFiles,
                'visits/self',
                visitIdToUpdate || Date.now() + index
              );
              selfImageUrls = uploadedPath ? uploadedPath.split(',') : [];
              uploadedImagePaths.push(...selfImageUrls);
              console.log(`Uploaded ${selfImagesFiles.length} self image(s)`);
            }

            if (customerImagesFiles.length > 0) {
              const uploadedPath = await uploadMultipleImages(
                customerImagesFiles,
                'visits/customer',
                visitIdToUpdate || Date.now() + index
              );
              customerImageUrls = uploadedPath ? uploadedPath.split(',') : [];
              uploadedImagePaths.push(...customerImageUrls);
              console.log(
                `Uploaded ${customerImagesFiles.length} customer image(s)`
              );
            }

            if (coolerImagesFiles.length > 0) {
              const uploadedPath = await uploadMultipleImages(
                coolerImagesFiles,
                'visits/cooler',
                visitIdToUpdate || Date.now() + index
              );
              coolerImageUrls = uploadedPath ? uploadedPath.split(',') : [];
              uploadedImagePaths.push(...coolerImageUrls);
              console.log(
                `Uploaded ${coolerImagesFiles.length} cooler image(s)`
              );
            }
          } catch (uploadError: any) {
            console.error(`Image upload failed:`, uploadError.message);
            results.failed.push({
              visitIndex: index,
              data,
              error: `Image upload failed: ${uploadError.message}`,
            });
            continue;
          }

          const processedVisitData = {
            customer_id: visit.customer_id,
            sales_person_id: visit.sales_person_id,
            ...(visit.route_id !== undefined &&
              visit.route_id !== null && {
                route_id: visit.route_id,
              }),
            ...(visit.zones_id !== undefined &&
              visit.zones_id !== null && {
                zones_id: visit.zones_id,
              }),
            ...(visit.visit_date && {
              visit_date: new Date(visit.visit_date),
            }),
            ...(visit.visit_time && { visit_time: visit.visit_time }),
            ...(visit.purpose && { purpose: visit.purpose }),
            ...(visit.status && { status: visit.status }),
            ...(visit.start_time && {
              start_time: new Date(visit.start_time),
            }),
            ...(visit.end_time && {
              end_time: new Date(visit.end_time),
            }),
            ...(visit.duration !== undefined && { duration: visit.duration }),
            ...(visit.start_latitude &&
              visit.start_latitude.trim() !== '' && {
                start_latitude: parseFloat(visit.start_latitude),
              }),
            ...(visit.start_longitude &&
              visit.start_longitude.trim() !== '' && {
                start_longitude: parseFloat(visit.start_longitude),
              }),
            ...(visit.end_latitude &&
              visit.end_latitude.trim() !== '' && {
                end_latitude: parseFloat(visit.end_latitude),
              }),
            ...(visit.end_longitude &&
              visit.end_longitude.trim() !== '' && {
                end_longitude: parseFloat(visit.end_longitude),
              }),
            ...(visit.check_in_time && {
              check_in_time: new Date(visit.check_in_time),
            }),
            ...(visit.check_out_time && {
              check_out_time: new Date(visit.check_out_time),
            }),
            ...(visit.orders_created !== undefined && {
              orders_created: visit.orders_created,
            }),
            ...(visit.amount_collected &&
              visit.amount_collected.trim() !== '' && {
                amount_collected: parseFloat(visit.amount_collected),
              }),
            ...(visit.visit_notes && { visit_notes: visit.visit_notes }),
            ...(visit.customer_feedback && {
              customer_feedback: visit.customer_feedback,
            }),
            ...(visit.next_visit_date && {
              next_visit_date: new Date(visit.next_visit_date),
            }),
            ...(selfImageUrls.length > 0 && {
              self_image: selfImageUrls.join(','),
            }),
            ...(customerImageUrls.length > 0 && {
              customer_image: customerImageUrls.join(','),
            }),
            ...(coolerImageUrls.length > 0 && {
              cooler_image: coolerImageUrls.join(','),
            }),
            is_active: visit.is_active || 'Y',
          };

          console.log(
            ` Processing visit ${isUpdate ? 'update' : 'creation'} for customer ${visit.customer_id}`
          );
          console.log(` Payments to process: ${payments?.length || 0}`);
          console.log(`Orders to process: ${orders?.length || 0}`);
          console.log(
            `Cooler inspections to process: ${cooler_inspections?.length || 0}`
          );

          let oldSelfImages: string | null = null;
          let oldCustomerImages: string | null = null;
          let oldCoolerImages: string | null = null;

          if (isUpdate) {
            const existingVisit = await prisma.visits.findUnique({
              where: { id: visitIdToUpdate },
              select: {
                id: true,
                self_image: true,
                customer_image: true,
                cooler_image: true,
              },
            });

            if (!existingVisit) {
              results.failed.push({
                visitIndex: index,
                data,
                error: `Visit with id ${visitIdToUpdate} not found`,
              });
              continue;
            }

            oldSelfImages = existingVisit.self_image;
            oldCustomerImages = existingVisit.customer_image;
            oldCoolerImages = existingVisit.cooler_image;
          }

          try {
            const result = await prisma.$transaction(
              async tx => {
                const orderIds: number[] = [];
                const paymentIds: number[] = [];
                const inspectionIds: number[] = [];
                const surveyResponseIds: number[] = [];

                let visitRecord;

                if (isUpdate) {
                  visitRecord = await tx.visits.update({
                    where: { id: visitIdToUpdate },
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
                  console.log(`Processing ${orders.length} order(s)...`);

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

                    let createdOrder: any = undefined;

                    if (orderData.order_id || (orderData as any).id) {
                      const orderIdToUpdate =
                        (orderData as any).id || orderData.order_id;
                      createdOrder = await tx.orders.update({
                        where: { id: orderIdToUpdate },
                        data: {
                          ...processedOrderData,
                          updatedate: new Date(),
                          updatedby:
                            (req as any).user?.id || visit.createdby || 1,
                        },
                      });

                      orderIds.push(createdOrder.id);

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

                          if (item.item_id || (item as any).id) {
                            const itemIdToUpdate =
                              (item as any).id || item.item_id;
                            await tx.order_items.update({
                              where: { id: itemIdToUpdate },
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
                          createdby:
                            visit.createdby || (req as any).user?.id || 1,
                          log_inst: 1,
                        },
                      });

                      orderIds.push(createdOrder.id);

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

                    if (createdOrder) {
                      console.log(
                        `Order ${createdOrder.order_number} processed`
                      );
                    }
                  }
                }

                if (payments && payments.length > 0) {
                  console.log(` Processing ${payments.length} payment(s)...`);

                  for (const payment of payments) {
                    try {
                      let paymentNumber = payment.payment_number;
                      if (!paymentNumber) {
                        paymentNumber =
                          await generatePaymentNumberInTransaction(tx);
                      }

                      const processedPaymentData = {
                        payment_number: paymentNumber,
                        customer_id: payment.customer_id || visit.customer_id,
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

                      let paymentRecord;

                      if (payment.payment_id || (payment as any).id) {
                        const paymentIdToUpdate =
                          (payment as any).id || payment.payment_id;
                        paymentRecord = await tx.payments.update({
                          where: { id: paymentIdToUpdate },
                          data: {
                            ...processedPaymentData,
                            updatedate: new Date(),
                            updatedby:
                              (req as any).user?.id || visit.createdby || 1,
                          },
                        });
                      } else {
                        paymentRecord = await tx.payments.upsert({
                          where: {
                            payment_number: processedPaymentData.payment_number,
                          },
                          update: {
                            ...processedPaymentData,
                            updatedate: new Date(),
                            updatedby:
                              (req as any).user?.id || visit.createdby || 1,
                          },
                          create: {
                            ...processedPaymentData,
                            createdate: new Date(),
                            createdby:
                              visit.createdby || (req as any).user?.id || 1,
                            log_inst: 1,
                          },
                        });
                      }

                      paymentIds.push(paymentRecord.id);
                      console.log(
                        ` Payment ${paymentRecord.payment_number} processed (₹${paymentRecord.total_amount})`
                      );
                    } catch (paymentError: any) {
                      console.error(
                        'Payment processing failed:',
                        paymentError.message
                      );
                      throw paymentError;
                    }
                  }
                }

                if (cooler_inspections && cooler_inspections.length > 0) {
                  console.log(
                    `   ❄️  Processing ${cooler_inspections.length} cooler inspection(s)...`
                  );

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
                        customer_id:
                          coolerData.customer_id || visit.customer_id,
                        capacity: coolerData.capacity
                          ? typeof coolerData.capacity === 'number'
                            ? coolerData.capacity
                            : parseInt(
                                String(coolerData.capacity).replace(
                                  /[^0-9]/g,
                                  ''
                                )
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
                      const updatedInspection =
                        await tx.cooler_inspections.update({
                          where: { id: inspection.id },
                          data: {
                            ...processedInspectionData,
                            updatedate: new Date(),
                            updatedby:
                              (req as any).user?.id || visit.createdby || 1,
                          },
                        });

                      inspectionIds.push(updatedInspection.id);
                    } else {
                      const newInspection = await tx.cooler_inspections.create({
                        data: {
                          ...processedInspectionData,
                          createdate: new Date(),
                          createdby:
                            visit.createdby || (req as any).user?.id || 1,
                          log_inst: 1,
                        },
                      });

                      inspectionIds.push(newInspection.id);
                    }

                    console.log(
                      `   Cooler inspection processed (Cooler ID: ${coolerId})`
                    );
                  }
                }

                if (survey && survey.survey_response) {
                  console.log(`    Processing survey response...`);

                  const { survey_response } = survey;
                  const surveyAnswers = survey_response.survey_answers || [];

                  const processedSurveyData = {
                    parent_id: survey_response.parent_id,
                    customer_id:
                      survey_response.customer_id || visit.customer_id,
                    visit_id: visitId,
                    submitted_by: survey_response.submitted_by,
                    submitted_at: survey_response.submitted_at
                      ? new Date(survey_response.submitted_at)
                      : new Date(),
                    location: survey_response.location,
                    photo_url: survey_response.photo_url,
                    is_active: survey_response.is_active || 'Y',
                  };

                  let surveyResponseRecord: any = undefined;

                  if (survey_response.id) {
                    surveyResponseRecord = await tx.survey_responses.update({
                      where: { id: survey_response.id },
                      data: {
                        ...processedSurveyData,
                        updatedate: new Date(),
                        updatedby:
                          (req as any).user?.id || visit.createdby || 1,
                      },
                    });

                    surveyResponseIds.push(surveyResponseRecord.id);

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
                        createdby:
                          visit.createdby || (req as any).user?.id || 1,
                        log_inst: 1,
                      },
                    });

                    surveyResponseIds.push(surveyResponseRecord.id);

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

                  console.log(`Survey response processed`);
                }

                const visitWithBasicRelations = await tx.visits.findUnique({
                  where: { id: visitId },
                  include: {
                    visit_customers: true,
                    visits_salesperson: true,
                    visit_routes: true,
                    visit_zones: true,
                  },
                });

                const relatedOrders =
                  orderIds.length > 0
                    ? await tx.orders.findMany({
                        where: {
                          id: { in: orderIds },
                        },
                        include: {
                          order_items: true,
                        },
                      })
                    : [];

                const relatedPayments =
                  paymentIds.length > 0
                    ? await tx.payments.findMany({
                        where: {
                          id: { in: paymentIds },
                        },
                      })
                    : [];

                const relatedInspections =
                  inspectionIds.length > 0
                    ? await tx.cooler_inspections.findMany({
                        where: {
                          id: { in: inspectionIds },
                        },
                        include: {
                          coolers: true,
                        },
                      })
                    : [];

                const relatedSurveyResponses =
                  surveyResponseIds.length > 0
                    ? await tx.survey_responses.findMany({
                        where: {
                          id: { in: surveyResponseIds },
                        },
                      })
                    : [];

                const surveyAnswersData =
                  surveyResponseIds.length > 0
                    ? await tx.survey_answers.findMany({
                        where: {
                          parent_id: { in: surveyResponseIds },
                        },
                      })
                    : [];

                const surveyResponsesWithAnswers = relatedSurveyResponses.map(
                  response => ({
                    ...response,
                    survey_answers: surveyAnswersData.filter(
                      answer => answer.parent_id === response.id
                    ),
                  })
                );

                console.log(
                  ` Visit ${isUpdate ? 'updated' : 'created'} successfully (ID: ${visitId})`
                );
                console.log(
                  `Orders: ${orderIds.length}, Payments: ${paymentIds.length}, Inspections: ${inspectionIds.length}, Surveys: ${surveyResponseIds.length}`
                );

                return {
                  ...visitWithBasicRelations,
                  orders: relatedOrders,
                  payments: relatedPayments,
                  cooler_inspections: relatedInspections,
                  survey_responses: surveyResponsesWithAnswers,
                  images: {
                    self: selfImageUrls,
                    customer: customerImageUrls,
                    cooler: coolerImageUrls,
                  },
                };
              },
              {
                maxWait: 15000,
                timeout: 90000,
              }
            );

            if (isUpdate) {
              if (selfImageUrls.length > 0 && oldSelfImages) {
                console.log(`  Deleting old self images`);
                await deleteOldImages(oldSelfImages).catch(err =>
                  console.error('Failed to delete old self images:', err)
                );
              }
              if (customerImageUrls.length > 0 && oldCustomerImages) {
                console.log(`Deleting old customer images`);
                await deleteOldImages(oldCustomerImages).catch(err =>
                  console.error('Failed to delete old customer images:', err)
                );
              }
              if (coolerImageUrls.length > 0 && oldCoolerImages) {
                console.log(`Deleting old cooler images`);
                await deleteOldImages(oldCoolerImages).catch(err =>
                  console.error('Failed to delete old cooler images:', err)
                );
              }
            }

            if (isUpdate) {
              results.updated.push({
                visit: serializeVisit(result),
                visit_id: result?.id,
                message: `Visit ${visitIdToUpdate} updated successfully`,
              });
            } else {
              results.created.push({
                visit: serializeVisit(result),
                visit_id: result?.id,
                message: 'Visit created successfully',
              });
            }
          } catch (transactionError: any) {
            console.error(`Transaction failed, rolling back images...`);
            for (const imagePath of uploadedImagePaths) {
              await deleteOldImages(imagePath).catch(err =>
                console.error('Failed to cleanup uploaded image:', err)
              );
            }

            throw transactionError;
          }
        } catch (error: any) {
          console.error(` Visit ${index + 1} Processing Error:`, error.message);
          results.failed.push({
            visitIndex: index,
            data: data?.visit || data,
            constraint: error.meta?.target,
            meta: error.meta,
            error: error.message || 'Unknown error occurred',
            stack:
              process.env.NODE_ENV === 'development' ? error.stack : undefined,
          });
          continue;
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

      console.log(
        `\n Bulk upsert completed: Created(${results.created.length}) Updated(${results.updated.length}) Failed(${results.failed.length})\n`
      );

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
      console.error(' Bulk Upsert Error:', error);
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

      if (sales_person_id) {
        const salesPersonIdNum = parseInt(sales_person_id as string, 10);
        if (isNaN(salesPersonIdNum)) {
          return res.status(400).json({ message: 'Invalid sales_person_id' });
        }
        filters.sales_person_id = salesPersonIdNum;
        console.log('Filtering by sales_person_id:', salesPersonIdNum);
      } else {
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
          console.log('Admin/Manager role - showing all visits');
        } else {
          console.log('Unknown role, restricting to own data');
          filters.sales_person_id = parseInt(userId as string, 10);
        }
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
          {
            visit_customers: {
              OR: [
                { name: { contains: searchLower } },
                { code: { contains: searchLower } },
                { phone_number: { contains: searchLower } },
              ],
            },
          },
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

      console.log('Final Filters:', JSON.stringify(filters, null, 2));

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
          cooler_inspections: {
            include: {
              coolers: true,
            },
          },
          competitor_activity: true,
          product_facing: true,
          route_exceptions: true,
          visit_attachments: true,
          visit_tasks_visits: true,
        },
      });

      console.log(`Fetched ${data.length} visits`);

      const visitIds = data.map((visit: any) => visit.id);
      const customerIds = data
        .filter((visit: any) => visit.customer_id)
        .map((visit: any) => visit.customer_id);

      console.log(` Visit IDs:`, visitIds);
      console.log(` Customer IDs:`, customerIds);

      const visitPayments =
        customerIds.length > 0
          ? await prisma.payments.findMany({
              where: {
                customer_id: { in: customerIds },
              },
            })
          : [];

      console.log(` Fetched ${visitPayments.length} payments`);

      let visitSurveys: any[] = [];
      try {
        if (visitIds.length > 0) {
          visitSurveys = await prisma.survey_responses.findMany({
            where: {
              parent_id: { in: visitIds },
            },
          });
          console.log(` Fetched ${visitSurveys.length} survey responses`);
        }
      } catch (error: any) {
        console.log(' Survey responses fetch error:', error.message);
      }

      const paymentsByCustomer = new Map();
      visitPayments.forEach(payment => {
        if (!paymentsByCustomer.has(payment.customer_id)) {
          paymentsByCustomer.set(payment.customer_id, []);
        }
        paymentsByCustomer.get(payment.customer_id).push(payment);
      });

      const surveysByVisit = new Map();
      visitSurveys.forEach(survey => {
        if (!surveysByVisit.has(survey.parent_id)) {
          surveysByVisit.set(survey.parent_id, []);
        }
        surveysByVisit.get(survey.parent_id).push(survey);
      });

      const customerCoolers =
        customerIds.length > 0
          ? await prisma.coolers.findMany({
              where: {
                customer_id: { in: customerIds },
                is_active: 'Y',
              },
              select: {
                id: true,
                code: true,
                brand: true,
                model: true,
                serial_number: true,
                status: true,
                capacity: true,
                install_date: true,
                last_service_date: true,
                next_service_due: true,
                temperature: true,
                customer_id: true,
              },
            })
          : [];

      console.log(` Fetched ${customerCoolers.length} customer coolers`);

      const coolersByCustomer = new Map();
      customerCoolers.forEach(cooler => {
        if (!coolersByCustomer.has(cooler.customer_id)) {
          coolersByCustomer.set(cooler.customer_id, []);
        }
        coolersByCustomer.get(cooler.customer_id).push(cooler);
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

      const serializedData = data
        .filter((visit: any) => visit.visit_customers)
        .map((visit: any) => {
          const customerPayments =
            paymentsByCustomer.get(visit.customer_id) || [];
          const visitSurveyResponses = surveysByVisit.get(visit.id) || [];

          console.log(
            ` Visit ${visit.id} (Customer ${visit.customer_id}) has ${customerPayments.length} payments`
          );

          const visitWithRelations = {
            ...visit,
            payments: customerPayments,
            survey_responses: visitSurveyResponses,
          };

          const serialized = serializeVisit(visitWithRelations);

          if (serialized.customer) {
            const customerCoolerList =
              coolersByCustomer.get(visit.customer_id) || [];

            const customerWithCoolers = {
              ...serialized.customer,
              coolers: customerCoolerList,
              total_coolers: customerCoolerList.length,
            };

            return {
              ...serialized,
              customer: customerWithCoolers,
            } as VisitSerialized;
          }

          return serialized;
        });

      console.log(
        ` Serialized ${serializedData.length} visits with all relations`
      );

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
      console.error(' Get All Visits Error:', error);
      res.status(500).json({
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
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
          cooler_inspections: true,
          visit_attachments: true,
          competitor_activity: true,
          product_facing: true,
          route_exceptions: true,
          visit_tasks_visits: true,
        },
      });

      if (!visit) {
        return res.status(404).json({ message: 'Visit not found' });
      }

      const coolers = await prisma.coolers.findMany({
        where: {
          customer_id: visit.customer_id,
          is_active: 'Y',
        },
      });

      const orders = await prisma.orders.findMany({
        where: {
          orders_customers: {
            id: visit.customer_id,
          },
          is_active: 'Y',
        },
        include: {
          order_items: {
            include: {
              products: true,
            },
          },
        },
      });

      const payments = await prisma.payments.findMany({
        where: {
          payments_customers: {
            id: visit.customer_id,
          },
          is_active: 'Y',
        },
      });

      let surveyResponses: any[] = [];
      try {
        surveyResponses = await prisma.survey_responses.findMany({
          where: {},
        });
      } catch (e) {
        console.log('Survey responses table might not exist');
      }

      res.status(200).json({
        message: 'Visit retrieved successfully',
        data: {
          ...visit,
          customer: visit.visit_customers
            ? {
                ...visit.visit_customers,
                coolers: coolers,
                total_coolers: coolers.length,
              }
            : null,
          salesperson: visit.visits_salesperson
            ? {
                id: visit.visits_salesperson.id,
                name: visit.visits_salesperson.name,
                email: visit.visits_salesperson.email,
              }
            : null,
          route: visit.visit_routes || null,
          zone: visit.visit_zones || null,
          orders: orders,
          payments: payments,
          cooler_inspections: visit.cooler_inspections || [],
          survey_responses: surveyResponses,
          visit_customers: undefined,
          visits_salesperson: undefined,
          visit_routes: undefined,
          visit_zones: undefined,
        },
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
        start_latitude:
          req.body.start_latitude && req.body.start_latitude.trim() !== ''
            ? parseFloat(req.body.start_latitude)
            : null,
        start_longitude:
          req.body.start_longitude && req.body.start_longitude.trim() !== ''
            ? parseFloat(req.body.start_longitude)
            : null,
        end_latitude:
          req.body.end_latitude && req.body.end_latitude.trim() !== ''
            ? parseFloat(req.body.end_latitude)
            : null,
        end_longitude:
          req.body.end_longitude && req.body.end_longitude.trim() !== ''
            ? parseFloat(req.body.end_longitude)
            : null,
        amount_collected:
          req.body.amount_collected && req.body.amount_collected.trim() !== ''
            ? parseFloat(req.body.amount_collected)
            : null,
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
      // catch (error: any) {
      //   console.log('Delete Visit Error:', error);
      //   res.status(500).json({ message: error.message });
      // }
      {
        if (error.code === 'P2003') {
          res
            .status(500)
            .json(
              'This record is connected to other data. Please remove that first.'
            );
        } else {
          res.status(500).json({ message: error.message });
        }
      }
    }
  },

  async getCustomerVisitsBySalesperson(req: any, res: any) {
    try {
      console.log('Request Query:', req.query);

      const {
        page,
        limit,
        search,
        sales_person_id,
        customer_name,
        salesperson_name,
        status,
        isActive,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      } = req.query;

      if (!sales_person_id) {
        return res.status(400).json({
          message: 'sales_person_id is required',
        });
      }

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(limit as string, 10) || 10)
      );
      const searchLower = search ? (search as string).toLowerCase().trim() : '';

      const salesPersonIdNum = parseInt(sales_person_id as string, 10);
      if (isNaN(salesPersonIdNum)) {
        return res.status(400).json({
          message: 'Invalid sales_person_id. Must be a number.',
        });
      }

      const allowedStatuses = [
        'pending',
        'completed',
        'cancelled',
        'in_progress',
        'scheduled',
        'planned',
      ];
      if (status && !allowedStatuses.includes(status as string)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      if (isActive && !['Y', 'N'].includes(isActive as string)) {
        return res.status(400).json({ message: 'Invalid isActive value' });
      }

      const allowedSortFields = [
        'visit_date',
        'customer_name',
        'salesperson_name',
        'status',
        'purpose',
        'createdate',
      ];

      const sortByField = (sortBy as string) || 'createdate';
      const sortOrderValue =
        (sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const filters: any = {
        sales_person_id: salesPersonIdNum,
      };

      if (customer_name) {
        const customerNameTrim = (customer_name as string).trim();
        filters.visit_customers = {
          name: {
            contains: customerNameTrim,
          },
        };
      }

      if (salesperson_name) {
        const salespersonNameTrim = (salesperson_name as string).trim();
        if (!filters.visits_salesperson) {
          filters.visits_salesperson = {};
        }
        filters.visits_salesperson.name = {
          contains: salespersonNameTrim,
        };
      }

      if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            message: 'Invalid startDate format. Please use YYYY-MM-DD',
          });
        }
        start.setHours(0, 0, 0, 0);

        if (endDate) {
          const end = new Date(endDate as string);
          if (isNaN(end.getTime())) {
            return res.status(400).json({
              message: 'Invalid endDate format. Please use YYYY-MM-DD',
            });
          }
          end.setHours(23, 59, 59, 999);
          filters.visit_date = { gte: start, lte: end };
        } else {
          const end = new Date(start);
          end.setDate(start.getDate() + 7);
          end.setHours(23, 59, 59, 999);
          filters.visit_date = { gte: start, lte: end };
        }
      }

      if (searchLower) {
        filters.OR = [
          { purpose: { contains: searchLower } },
          { status: { contains: searchLower } },
          { visit_notes: { contains: searchLower } },
          {
            visit_customers: {
              OR: [
                { name: { contains: searchLower } },
                { code: { contains: searchLower } },
                {
                  phone_number: { contains: searchLower },
                },
                {
                  contact_person: {
                    contains: searchLower,
                  },
                },
              ],
            },
          },
        ];
      }

      if (status) {
        filters.status = status as string;
      }

      if (isActive) {
        filters.is_active = isActive as string;
      }

      let orderBy: any = { createdate: 'desc' };

      if (sortByField === 'customer_name') {
        orderBy = {
          visit_customers: {
            name: sortOrderValue,
          },
        };
      } else if (sortByField === 'salesperson_name') {
        orderBy = {
          visits_salesperson: {
            name: sortOrderValue,
          },
        };
      } else {
        orderBy = { [sortByField]: sortOrderValue };
      }

      console.log('Final Filters:', JSON.stringify(filters, null, 2));
      console.log('OrderBy:', JSON.stringify(orderBy, null, 2));

      const { data, pagination } = await paginate({
        model: prisma.visits,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: orderBy,
        include: {
          visit_customers: true,
        },
      });

      if (data.length === 0) {
        return res.success(
          'No visits found for this salesperson',
          [],
          200,
          {
            current_page: pageNum,
            per_page: limitNum,
            total: 0,
            total_pages: 0,
          },
          {
            sales_person_id: salesPersonIdNum,
            customer_name_filter: customer_name || null,
            salesperson_name_filter: salesperson_name || null,
            total_visits: 0,
            active_visits: 0,
            inactive_visits: 0,
            unique_customers: 0,
            sort_by: sortByField,
            sort_order: sortOrderValue,
          }
        );
      }

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

      const [
        totalVisits,
        activeVisits,
        inactiveVisits,
        newVisitsThisMonth,
        completedVisits,
        pendingVisits,
      ] = await Promise.all([
        prisma.visits.count({ where: filters }),
        prisma.visits.count({ where: { ...filters, is_active: 'Y' } }),
        prisma.visits.count({ where: { ...filters, is_active: 'N' } }),
        prisma.visits.count({
          where: {
            ...filters,
            createdate: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        prisma.visits.count({
          where: { ...filters, status: 'completed' },
        }),
        prisma.visits.count({
          where: { ...filters, status: 'pending' },
        }),
      ]);

      const uniqueCustomers = await prisma.visits.findMany({
        where: filters,
        select: {
          customer_id: true,
        },
        distinct: ['customer_id'],
      });

      const serializedData = data
        .filter((visit: any) => visit.visit_customers)
        .map((visit: any) => visit.visit_customers);

      res.success(
        `Customer visits retrieved successfully for salesperson ID: ${salesPersonIdNum}`,
        serializedData,
        200,
        pagination,
        {
          sales_person_id: salesPersonIdNum,
          customer_name_filter: customer_name || null,
          salesperson_name_filter: salesperson_name || null,
          total_visits: totalVisits,
          active_visits: activeVisits,
          inactive_visits: inactiveVisits,
          new_visits_this_month: newVisitsThisMonth,
          completed_visits: completedVisits,
          pending_visits: pendingVisits,
          unique_customers_visited: uniqueCustomers.length,
          sort_by: sortByField,
          sort_order: sortOrderValue,
          date_range: startDate
            ? {
                start: startDate,
                end: endDate || 'Current + 7 days',
              }
            : 'All time',
        }
      );
    } catch (error: any) {
      console.error('Get Customer Visits By Salesperson Error:', error);
      res.status(500).json({
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  },

  async getCoolerInspectionsForVisitedCustomers(req: any, res: any) {
    try {
      console.log('Request Query:', req.query);

      const {
        page,
        limit,
        search,
        sales_person_id,
        customer_id,
        visit_id,
        startDate,
        endDate,
        isActive,
        requires_service,
        sortBy,
        sortOrder,
      } = req.query;

      if (!sales_person_id && !customer_id && !visit_id) {
        return res.status(400).json({
          message:
            'Either sales_person_id, customer_id, or visit_id is required',
        });
      }

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(limit as string, 10) || 10)
      );
      const searchLower = search ? (search as string).toLowerCase().trim() : '';

      let salesPersonIdNum: number | null = null;
      let customerIdNum: number | null = null;
      let visitIdNum: number | null = null;

      if (sales_person_id) {
        salesPersonIdNum = parseInt(sales_person_id as string, 10);
        if (isNaN(salesPersonIdNum)) {
          return res.status(400).json({
            message: 'Invalid sales_person_id. Must be a number.',
          });
        }
      }

      if (customer_id) {
        customerIdNum = parseInt(customer_id as string, 10);
        if (isNaN(customerIdNum)) {
          return res.status(400).json({
            message: 'Invalid customer_id. Must be a number.',
          });
        }
      }

      if (visit_id) {
        visitIdNum = parseInt(visit_id as string, 10);
        if (isNaN(visitIdNum)) {
          return res.status(400).json({
            message: 'Invalid visit_id. Must be a number.',
          });
        }
      }

      if (isActive && !['Y', 'N'].includes(isActive as string)) {
        return res.status(400).json({ message: 'Invalid isActive value' });
      }

      const allowedSortFields = [
        'inspection_date',
        'temperature',
        'createdate',
        'cooler_code',
        'cooler_brand',
        'cooler_type',
      ];

      const sortByField = (sortBy as string) || 'createdate';
      const sortOrderValue =
        (sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      if (sortBy && !allowedSortFields.includes(sortBy as string)) {
        return res.status(400).json({
          message: `Invalid sortBy value. Allowed values: ${allowedSortFields.join(', ')}`,
        });
      }

      const filters: any = {};

      if (visitIdNum) {
        filters.visit_id = visitIdNum;
      }

      const visitFilters: any = {};

      if (salesPersonIdNum) {
        visitFilters.sales_person_id = salesPersonIdNum;
      }

      if (customerIdNum) {
        visitFilters.customer_id = customerIdNum;
      }

      if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            message: 'Invalid startDate format. Please use YYYY-MM-DD',
          });
        }
        start.setHours(0, 0, 0, 0);

        if (endDate) {
          const end = new Date(endDate as string);
          if (isNaN(end.getTime())) {
            return res.status(400).json({
              message: 'Invalid endDate format. Please use YYYY-MM-DD',
            });
          }
          end.setHours(23, 59, 59, 999);
          visitFilters.visit_date = { gte: start, lte: end };
        } else {
          const end = new Date(start);
          end.setDate(start.getDate() + 7);
          end.setHours(23, 59, 59, 999);
          visitFilters.visit_date = { gte: start, lte: end };
        }
      }

      if (Object.keys(visitFilters).length > 0) {
        filters.visits = visitFilters;
      }

      if (isActive) {
        filters.is_active = isActive as string;
      }

      if (requires_service) {
        filters.action_required = requires_service as string;
      }

      if (searchLower) {
        filters.OR = [
          { issues: { contains: searchLower } },
          { action_taken: { contains: searchLower } },
          { action_required: { contains: searchLower } },
          {
            coolers: {
              OR: [
                { code: { contains: searchLower } },
                { brand: { contains: searchLower } },
                { model: { contains: searchLower } },
                {
                  serial_number: { contains: searchLower },
                },
              ],
            },
          },
        ];
      }

      // Build orderBy
      let orderBy: any = { createdate: 'desc' };

      if (sortByField === 'cooler_code') {
        orderBy = {
          coolers: {
            code: sortOrderValue,
          },
        };
      } else if (sortByField === 'cooler_brand') {
        orderBy = {
          coolers: {
            brand: sortOrderValue,
          },
        };
      } else if (sortByField === 'cooler_type') {
        orderBy = {
          coolers: {
            cooler_types: {
              name: sortOrderValue,
            },
          },
        };
      } else {
        orderBy = { [sortByField]: sortOrderValue };
      }

      console.log('Final Filters:', JSON.stringify(filters, null, 2));
      console.log('OrderBy:', JSON.stringify(orderBy, null, 2));

      const { data, pagination } = await paginate({
        model: prisma.cooler_inspections,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: orderBy,
        include: {
          coolers: {
            include: {
              cooler_types: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  description: true,
                  is_active: true,
                },
              },
              cooler_sub_types: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  description: true,
                  cooler_type_id: true,
                  is_active: true,
                },
              },
            },
          },
        },
      });

      if (data.length === 0) {
        return res.success(
          'No cooler inspections found',
          [],
          200,
          {
            current_page: pageNum,
            per_page: limitNum,
            total: 0,
            total_pages: 0,
          },
          {
            sales_person_id: salesPersonIdNum,
            customer_id: customerIdNum,
            visit_id: visitIdNum,
            total_inspections: 0,
            unique_coolers: 0,
            unique_customers: 0,
            sort_by: sortByField,
            sort_order: sortOrderValue,
          }
        );
      }

      const [
        totalInspections,
        activeInspections,
        inactiveInspections,
        inspectionsRequiringService,
        inspectionsWithIssues,
        coolersNotWorking,
      ] = await Promise.all([
        prisma.cooler_inspections.count({ where: filters }),
        prisma.cooler_inspections.count({
          where: { ...filters, is_active: 'Y' },
        }),
        prisma.cooler_inspections.count({
          where: { ...filters, is_active: 'N' },
        }),
        prisma.cooler_inspections.count({
          where: { ...filters, action_required: 'Y' },
        }),
        prisma.cooler_inspections.count({
          where: { ...filters, issues: { not: null } },
        }),
        prisma.cooler_inspections.count({
          where: { ...filters, is_working: 'N' },
        }),
      ]);

      const uniqueCoolers = await prisma.cooler_inspections.findMany({
        where: filters,
        select: {
          cooler_id: true,
        },
        distinct: ['cooler_id'],
      });

      const uniqueCustomers = [
        ...new Set(
          data
            .map((inspection: any) => inspection.visits?.customer_id)
            .filter(Boolean)
        ),
      ];

      const uniqueVisits = [
        ...new Set(data.map((inspection: any) => inspection.visit_id)),
      ];

      const serializedData = data
        .filter((inspection: any) => inspection.coolers)
        .map((inspection: any) => {
          const cooler = inspection.coolers;

          return {
            ...cooler,
            cooler_type: cooler.cooler_types || null,
            cooler_sub_type: cooler.cooler_sub_types || null,
            cooler_types: undefined,
            cooler_sub_types: undefined,
          };
        });

      res.success(
        'Coolers from inspections retrieved successfully',
        serializedData,
        200,
        pagination,
        {
          filter_criteria: {
            sales_person_id: salesPersonIdNum,
            customer_id: customerIdNum,
            visit_id: visitIdNum,
          },
          total_inspections: totalInspections,
          active_inspections: activeInspections,
          inactive_inspections: inactiveInspections,
          inspections_requiring_service: inspectionsRequiringService,
          inspections_with_issues: inspectionsWithIssues,
          coolers_not_working: coolersNotWorking,
          unique_coolers_inspected: uniqueCoolers.length,
          unique_customers: uniqueCustomers.length,
          unique_visits: uniqueVisits.length,
          sort_by: sortByField,
          sort_order: sortOrderValue,
        }
      );
    } catch (error: any) {
      console.error('Get Cooler Inspections Error:', error);
      res.status(500).json({
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  },
};
