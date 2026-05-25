"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const blackbaze_1 = require("../../utils/blackbaze");
function serializeVisit(visit) {
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
        invoices: visit.invoices || [],
        visit_attachments: visit.visit_attachments || [],
        images: {
            self: visit.visit_attachments
                ? visit.visit_attachments
                    .filter((att) => att.file_type === 'self_image')
                    .map((att) => att.file_url)
                : visit.self_image
                    ? visit.self_image.split(',').filter(Boolean)
                    : [],
            customer: visit.visit_attachments
                ? visit.visit_attachments
                    .filter((att) => att.file_type === 'customer_image')
                    .map((att) => att.file_url)
                : visit.customer_image
                    ? visit.customer_image.split(',').filter(Boolean)
                    : [],
            cooler: visit.visit_attachments
                ? visit.visit_attachments
                    .filter((att) => att.file_type === 'cooler_image')
                    .map((att) => att.file_url)
                : visit.cooler_image
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
        payments: visit.payments?.map((payment) => ({
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
        cooler_installations: visit.cooler_installations?.map((cooler) => ({
            id: cooler.id,
            customer_id: cooler.customer_id,
            code: cooler.code,
            asset_master_id: cooler.asset_master_id,
            brand: cooler.brand,
            model: cooler.model,
            serial_number: cooler.serial_number,
            capacity: cooler.capacity,
            install_date: cooler.install_date,
            status: cooler.status,
            approval_status: cooler.approval_status,
            is_active: cooler.is_active,
            createdate: cooler.createdate,
            updatedate: cooler.updatedate,
        })) || [],
        cooler_inspections: visit.cooler_inspections?.map((inspection) => ({
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
const generatePaymentNumberInTransaction = async (tx) => {
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
const uploadMultipleImages = async (files, folder, visitId) => {
    try {
        if (!files || files.length === 0)
            return null;
        const uploadedUrls = [];
        for (const file of files) {
            const timestamp = Date.now();
            const fileName = `${folder}/${visitId || 'temp'}-${timestamp}-${file.originalname}`;
            const uploadedUrl = await (0, blackbaze_1.uploadFile)(file.buffer, fileName, file.mimetype);
            uploadedUrls.push(uploadedUrl);
        }
        return uploadedUrls.join(',');
    }
    catch (error) {
        console.error(`Error uploading images to ${folder}:`, error);
        throw error;
    }
};
const deleteOldImages = async (imageUrls) => {
    if (!imageUrls)
        return;
    try {
        const urls = imageUrls.split(',').map(url => url.trim());
        for (const url of urls) {
            if (url) {
                await (0, blackbaze_1.deleteFile)(url);
            }
        }
    }
    catch (error) {
        console.error('Error deleting old images:', error);
    }
};
async function generateInvoiceNumberInTransaction(tx) {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `INV-${today}`;
    const existingCount = await tx.invoices.count({
        where: {
            invoice_number: {
                startsWith: prefix,
            },
        },
    });
    const sequence = (existingCount + 1).toString().padStart(4, '0');
    return `${prefix}-${sequence}`;
}
const validateAndGetLocationId = async (tx, locationId) => {
    if (!locationId) {
        return null;
    }
    try {
        const locationExists = await tx.warehouses.findUnique({
            where: { id: locationId },
            select: { id: true },
        });
        if (!locationExists) {
            console.warn(`Location ID ${locationId} not found in warehouses, using null`);
            return null;
        }
        return locationId;
    }
    catch (error) {
        console.warn(`Error validating location ${locationId}, using null:`, error);
        return null;
    }
};
function getOrderedQuantities(item) {
    const conversionFactor = Number(item.conversion_factor) || 1;
    const rawUnit = (item.uom || 'CASE').toUpperCase().trim();
    const PCS_VARIANTS = [
        'UNIT',
        'PC',
        'PIECE',
        'PIECES',
        'PSC',
        'PEC',
        'PCE',
        'PICS',
    ];
    const CASE_VARIANTS = [
        'CASE',
        'CASES',
        'CS',
        'CTN',
        'CARTON',
        'BOX',
        'BOXES',
    ];
    let normalizedUnit;
    if (PCS_VARIANTS.includes(rawUnit)) {
        normalizedUnit = 'UNIT';
    }
    else if (CASE_VARIANTS.includes(rawUnit)) {
        normalizedUnit = 'CASE';
    }
    else {
        console.warn(` Unknown unit "${rawUnit}" — defaulting to CASE`);
        normalizedUnit = 'CASE';
    }
    const quantityInCases = Number(item.quantity) || 0;
    const baseQuantityInPcs = Number(item.base_quantity) || 0;
    const isPcsUnit = normalizedUnit === 'UNIT';
    console.log(`Unit normalize: "${rawUnit}" → "${normalizedUnit}" | ` +
        `Cases: ${quantityInCases}, Pcs: ${baseQuantityInPcs}, CF: ${conversionFactor}`);
    if (isPcsUnit) {
        return {
            orderedQty: 0,
            orderedPieces: baseQuantityInPcs,
            conversionFactor,
            uom: normalizedUnit,
        };
    }
    else {
        return {
            orderedQty: quantityInCases,
            orderedPieces: quantityInCases * conversionFactor,
            conversionFactor,
            uom: normalizedUnit,
        };
    }
}
function calculateStockDeduction(currentCases, currentPcs, piecesToDeduct, conversionFactor, unit, orderedCases) {
    const cf = conversionFactor || 1;
    const unitUpper = (unit || 'CASE').toUpperCase();
    const isPcsUnit = ['UNIT', 'PC', 'PIECE', 'PIECES'].includes(unitUpper);
    const totalAvailablePieces = currentCases * cf + currentPcs;
    if (isPcsUnit) {
        if (piecesToDeduct > totalAvailablePieces) {
            return {
                newQuantity: -1,
                newBaseQuantity: 0,
                totalAvailablePieces,
                deductedPieces: piecesToDeduct,
            };
        }
        const remainingPieces = totalAvailablePieces - piecesToDeduct;
        const newCases = Math.floor(remainingPieces / cf);
        const newPcs = remainingPieces % cf;
        return {
            newQuantity: newCases,
            newBaseQuantity: newPcs,
            totalAvailablePieces,
            deductedPieces: piecesToDeduct,
        };
    }
    else {
        const casesToDeduct = orderedCases ?? Math.floor(piecesToDeduct / cf);
        if (casesToDeduct > currentCases) {
            return {
                newQuantity: -1,
                newBaseQuantity: currentPcs,
                totalAvailablePieces,
                deductedPieces: piecesToDeduct,
            };
        }
        return {
            newQuantity: currentCases - casesToDeduct,
            newBaseQuantity: currentPcs,
            totalAvailablePieces,
            deductedPieces: piecesToDeduct,
        };
    }
}
exports.visitsController = {
    async createVisits(req, res) {
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
                start_latitude: data.start_latitude && data.start_latitude.trim() !== ''
                    ? parseFloat(data.start_latitude)
                    : null,
                start_longitude: data.start_longitude && data.start_longitude.trim() !== ''
                    ? parseFloat(data.start_longitude)
                    : null,
                end_latitude: data.end_latitude && data.end_latitude.trim() !== ''
                    ? parseFloat(data.end_latitude)
                    : null,
                end_longitude: data.end_longitude && data.end_longitude.trim() !== ''
                    ? parseFloat(data.end_longitude)
                    : null,
                amount_collected: data.amount_collected && data.amount_collected.trim() !== ''
                    ? parseFloat(data.amount_collected)
                    : null,
            };
            const visit = await prisma_client_1.default.visits.create({
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
        }
        catch (error) {
            console.error('Create Visit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async bulkUpsertVisits(req, res) {
        try {
            const inputData = req.body;
            console.log('Received inputData:', JSON.stringify(inputData, null, 2));
            let dataArray = [];
            if (typeof inputData.visits === 'string') {
                try {
                    const cleanVisitsData = inputData.visits.trim();
                    const parsed = JSON.parse(cleanVisitsData);
                    dataArray = Array.isArray(parsed) ? parsed : [parsed];
                }
                catch (e) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid visits JSON string',
                        error: 'Please provide valid JSON in visits field',
                    });
                }
            }
            else if (typeof inputData.visit === 'string') {
                try {
                    let rawVisit = inputData.visit.trim();
                    if (rawVisit.startsWith('{') &&
                        !rawVisit.includes('"visit":') &&
                        rawVisit.includes('},"')) {
                        rawVisit = `{ "visit": ${rawVisit} }`;
                    }
                    const parsed = JSON.parse(rawVisit);
                    dataArray = Array.isArray(parsed) ? parsed : [parsed];
                }
                catch (e) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid visit JSON string',
                        error: e instanceof Error ? e.message : String(e),
                    });
                }
            }
            else if (inputData.visits && Array.isArray(inputData.visits)) {
                dataArray = inputData.visits;
            }
            else if (inputData.visit && Array.isArray(inputData.visit)) {
                dataArray = inputData.visit.map((item) => ({
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
                    invoices: item.invoices || [],
                    payments: item.payments || [],
                    cooler_inspections: item.cooler_inspections || [],
                    cooler_installations: item.cooler_installations || [],
                    survey: item.survey,
                }));
            }
            else if (Array.isArray(inputData)) {
                dataArray = inputData;
            }
            else if (inputData.visit) {
                dataArray = [inputData];
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input format',
                });
            }
            if (!dataArray || dataArray.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No visit data provided',
                });
            }
            const organizedFiles = req.organizedFiles || {};
            console.log(`\nStarting bulk upsert for ${dataArray.length} visit(s)`);
            const results = {
                created: [],
                updated: [],
                failed: [],
            };
            dataArray = dataArray.map((item, idx) => {
                if (typeof item === 'string') {
                    try {
                        return JSON.parse(item);
                    }
                    catch (e) {
                        throw new Error(`Invalid JSON at visits[${idx}]`);
                    }
                }
                return item;
            });
            for (let index = 0; index < dataArray.length; index++) {
                const data = dataArray[index];
                try {
                    const { visit, invoices, orders, payments, cooler_inspections, cooler_installations, survey, } = data;
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
                    console.log(`\nProcessing visit ${index + 1}/${dataArray.length} (Customer: ${visit.customer_id}${isUpdate ? `, Visit ID: ${visitIdToUpdate}` : ''})`);
                    const selfImagesFiles = organizedFiles[`visit_${index}_self_images`] || [];
                    const customerImagesFiles = organizedFiles[`visit_${index}_customer_images`] || [];
                    const coolerImagesFiles = organizedFiles[`visit_${index}_cooler_images`] || [];
                    let selfImageUrls = [];
                    let customerImageUrls = [];
                    let coolerImageUrls = [];
                    let uploadedImagePaths = [];
                    try {
                        if (selfImagesFiles.length > 0) {
                            const uploadedPath = await uploadMultipleImages(selfImagesFiles, 'visits/self', visitIdToUpdate || Date.now() + index);
                            selfImageUrls = uploadedPath ? uploadedPath.split(',') : [];
                            uploadedImagePaths.push(...selfImageUrls);
                        }
                        if (customerImagesFiles.length > 0) {
                            const uploadedPath = await uploadMultipleImages(customerImagesFiles, 'visits/customer', visitIdToUpdate || Date.now() + index);
                            customerImageUrls = uploadedPath ? uploadedPath.split(',') : [];
                            uploadedImagePaths.push(...customerImageUrls);
                        }
                        if (coolerImagesFiles.length > 0) {
                            const uploadedPath = await uploadMultipleImages(coolerImagesFiles, 'visits/cooler', visitIdToUpdate || Date.now() + index);
                            coolerImageUrls = uploadedPath ? uploadedPath.split(',') : [];
                            uploadedImagePaths.push(...coolerImageUrls);
                        }
                    }
                    catch (uploadError) {
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
                            visit.route_id !== null && { route_id: visit.route_id }),
                        ...(visit.zones_id !== undefined &&
                            visit.zones_id !== null && { zones_id: visit.zones_id }),
                        ...(visit.visit_date && { visit_date: new Date(visit.visit_date) }),
                        ...(visit.visit_time && { visit_time: visit.visit_time }),
                        ...(visit.purpose && { purpose: visit.purpose }),
                        ...(visit.status && { status: visit.status }),
                        ...(visit.start_time && { start_time: new Date(visit.start_time) }),
                        ...(visit.end_time && { end_time: new Date(visit.end_time) }),
                        ...(visit.duration !== undefined && { duration: visit.duration }),
                        ...(visit.start_latitude &&
                            String(visit.start_latitude).trim() !== '' && {
                            start_latitude: parseFloat(visit.start_latitude),
                        }),
                        ...(visit.start_longitude &&
                            String(visit.start_longitude).trim() !== '' && {
                            start_longitude: parseFloat(visit.start_longitude),
                        }),
                        ...(visit.end_latitude &&
                            String(visit.end_latitude).trim() !== '' && {
                            end_latitude: parseFloat(visit.end_latitude),
                        }),
                        ...(visit.end_longitude &&
                            String(visit.end_longitude).trim() !== '' && {
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
                            String(visit.amount_collected).trim() !== '' && {
                            amount_collected: parseFloat(visit.amount_collected),
                        }),
                        ...(visit.visit_notes && { visit_notes: visit.visit_notes }),
                        ...(visit.customer_feedback && {
                            customer_feedback: visit.customer_feedback,
                        }),
                        ...(visit.next_visit_date && {
                            next_visit_date: new Date(visit.next_visit_date),
                        }),
                        is_active: visit.is_active || 'Y',
                    };
                    let oldSelfImages = [];
                    let oldCustomerImages = [];
                    let oldCoolerImages = [];
                    if (isUpdate) {
                        const existingVisit = await prisma_client_1.default.visits.findUnique({
                            where: { id: visitIdToUpdate },
                            select: { id: true },
                        });
                        if (!existingVisit) {
                            results.failed.push({
                                visitIndex: index,
                                data,
                                error: `Visit with id ${visitIdToUpdate} not found`,
                            });
                            continue;
                        }
                        const existingAttachments = await prisma_client_1.default.visit_attachments.findMany({
                            where: { visit_id: visitIdToUpdate },
                            select: { id: true, file_url: true, file_type: true },
                        });
                        oldSelfImages = existingAttachments
                            .filter(att => att.file_type === 'self_image' && att.file_url)
                            .map(att => att.file_url);
                        oldCustomerImages = existingAttachments
                            .filter(att => att.file_type === 'customer_image' && att.file_url)
                            .map(att => att.file_url);
                        oldCoolerImages = existingAttachments
                            .filter(att => att.file_type === 'cooler_image' && att.file_url)
                            .map(att => att.file_url);
                    }
                    try {
                        const result = await prisma_client_1.default.$transaction(async (tx) => {
                            const invoiceIds = [];
                            const paymentIds = [];
                            const inspectionIds = [];
                            const surveyResponseIds = [];
                            const coolerInstallationIds = [];
                            let visitRecord;
                            if (isUpdate) {
                                visitRecord = await tx.visits.update({
                                    where: { id: visitIdToUpdate },
                                    data: {
                                        ...processedVisitData,
                                        updatedate: new Date(),
                                        updatedby: req.user?.id || visit.createdby || 1,
                                    },
                                });
                            }
                            else {
                                visitRecord = await tx.visits.create({
                                    data: {
                                        ...processedVisitData,
                                        createdate: new Date(),
                                        createdby: visit.createdby || req.user?.id || 1,
                                        log_inst: 1,
                                    },
                                });
                            }
                            const visitId = visitRecord.id;
                            if (isUpdate) {
                                if (selfImageUrls.length > 0) {
                                    await tx.visit_attachments.deleteMany({
                                        where: { visit_id: visitId, file_type: 'self_image' },
                                    });
                                }
                                if (customerImageUrls.length > 0) {
                                    await tx.visit_attachments.deleteMany({
                                        where: { visit_id: visitId, file_type: 'customer_image' },
                                    });
                                }
                                if (coolerImageUrls.length > 0) {
                                    await tx.visit_attachments.deleteMany({
                                        where: { visit_id: visitId, file_type: 'cooler_image' },
                                    });
                                }
                            }
                            const attachmentData = [];
                            const userId = visit.createdby || req.user?.id || 1;
                            selfImageUrls.forEach((url, idx) => {
                                attachmentData.push({
                                    visit_id: visitId,
                                    file_name: `self_image_${idx + 1}`,
                                    file_url: url,
                                    file_type: 'self_image',
                                    description: 'Self image captured during visit',
                                    createdby: userId,
                                });
                            });
                            customerImageUrls.forEach((url, idx) => {
                                attachmentData.push({
                                    visit_id: visitId,
                                    file_name: `customer_image_${idx + 1}`,
                                    file_url: url,
                                    file_type: 'customer_image',
                                    description: 'Customer image captured during visit',
                                    createdby: userId,
                                });
                            });
                            coolerImageUrls.forEach((url, idx) => {
                                attachmentData.push({
                                    visit_id: visitId,
                                    file_name: `cooler_image_${idx + 1}`,
                                    file_url: url,
                                    file_type: 'cooler_image',
                                    description: 'Cooler image captured during visit',
                                    createdby: userId,
                                });
                            });
                            if (attachmentData.length > 0) {
                                await tx.visit_attachments.createMany({
                                    data: attachmentData,
                                });
                            }
                            if (invoices && invoices.length > 0) {
                                console.log(`Processing ${invoices.length} invoice(s)`);
                                for (const invoiceData of invoices) {
                                    const invoiceItems = invoiceData.items || [];
                                    let invoiceNumber = invoiceData.invoice_number;
                                    if (!invoiceNumber) {
                                        invoiceNumber =
                                            await generateInvoiceNumberInTransaction(tx);
                                    }
                                    const processedInvoiceData = {
                                        customer_id: visit.customer_id,
                                        invoice_number: invoiceNumber,
                                        invoice_date: invoiceData.invoice_date
                                            ? new Date(invoiceData.invoice_date)
                                            : invoiceData.created_at
                                                ? new Date(invoiceData.created_at)
                                                : new Date(),
                                        due_date: invoiceData.due_date
                                            ? new Date(invoiceData.due_date)
                                            : undefined,
                                        status: invoiceData.status || 'draft',
                                        salesperson_id: invoiceData.salesperson_id || null,
                                        payment_method: invoiceData.payment_method || 'credit',
                                        subtotal: invoiceData.subtotal || 0,
                                        discount_amount: invoiceData.discount_amount ??
                                            invoiceData.total_discount ??
                                            0,
                                        tax_amount: invoiceData.tax_amount || 0,
                                        shipping_amount: invoiceData.shipping_amount || 0,
                                        total_amount: invoiceData.total_amount || 0,
                                        amount_paid: invoiceData.amount_paid || 0,
                                        balance_due: invoiceData.balance_due,
                                        notes: invoiceData.notes,
                                        billing_address: invoiceData.billing_address,
                                        is_active: invoiceData.is_active || 'Y',
                                        currency_id: invoiceData.currency_id,
                                        ...(invoiceData.slip_type && {
                                            slip_type: invoiceData.slip_type,
                                        }),
                                        ...(invoiceData.total_discount !== undefined && {
                                            total_discount: invoiceData.total_discount,
                                        }),
                                        ...(invoiceData.total_quantity !== undefined && {
                                            total_quantity: invoiceData.total_quantity,
                                        }),
                                        ...(invoiceData.total_volume !== undefined && {
                                            total_volume: invoiceData.total_volume,
                                        }),
                                        ...(invoiceData.total_weight !== undefined && {
                                            total_weight: invoiceData.total_weight,
                                        }),
                                        ...(invoiceData.item_count !== undefined && {
                                            item_count: invoiceData.item_count,
                                        }),
                                        ...(invoiceData.is_synced !== undefined && {
                                            is_synced: !!invoiceData.is_synced,
                                        }),
                                    };
                                    let createdInvoice;
                                    if (invoiceData.invoice_id || invoiceData.id) {
                                        const invoiceIdToUpdate = invoiceData.id || invoiceData.invoice_id;
                                        createdInvoice = await tx.invoices.update({
                                            where: { id: invoiceIdToUpdate },
                                            data: {
                                                ...processedInvoiceData,
                                                updatedate: new Date(),
                                                updatedby: req.user?.id || visit.createdby || 1,
                                            },
                                        });
                                    }
                                    else {
                                        createdInvoice = await tx.invoices.create({
                                            data: {
                                                ...processedInvoiceData,
                                                createdate: new Date(),
                                                createdby: invoiceData.createdby ||
                                                    visit.createdby ||
                                                    req.user?.id ||
                                                    1,
                                                log_inst: 1,
                                            },
                                        });
                                    }
                                    invoiceIds.push(createdInvoice.id);
                                    if (invoiceItems.length > 0) {
                                        const referenceType = 'INVOICE';
                                        const referenceId = createdInvoice.id;
                                        const referenceLabel = `invoice ${createdInvoice.invoice_number}`;
                                        for (const item of invoiceItems) {
                                            const product = await tx.products.findUnique({
                                                where: { id: Number(item.product_id) },
                                                include: { product_unit_of_measurement: true },
                                            });
                                            if (!product) {
                                                throw new Error(`Product ${item.product_id} not found`);
                                            }
                                            const trackingType = product.tracking_type?.toUpperCase() ||
                                                'NONE';
                                            const { orderedQty, orderedPieces, conversionFactor, uom: itemUnit, } = getOrderedQuantities(item);
                                            const isUnitPcs = itemUnit === 'UNIT';
                                            console.log(`Processing ${trackingType} - Product: ${product.name}, ` +
                                                `Unit: ${itemUnit}, ` +
                                                `Ordered Cases: ${orderedQty}, ` +
                                                `Ordered Pcs: ${orderedPieces}, ` +
                                                `ConversionFactor: ${conversionFactor}`);
                                            if (trackingType === 'BATCH') {
                                                const hasBatchNumber = !!item.batch_number;
                                                const hasProductBatches = item.product_batches &&
                                                    Array.isArray(item.product_batches);
                                                let batchDeductions = [];
                                                if (hasBatchNumber) {
                                                    const batchLot = await tx.batch_lots.findFirst({
                                                        where: {
                                                            batch_number: item.batch_number,
                                                            productsId: product.id,
                                                        },
                                                    });
                                                    if (!batchLot) {
                                                        throw new Error(`Batch "${item.batch_number}" not found for product "${product.name}"`);
                                                    }
                                                    batchDeductions = [
                                                        {
                                                            batch_lot_id: batchLot.id,
                                                            pieces: orderedPieces,
                                                            uomQty: isUnitPcs ? orderedPieces : orderedQty,
                                                        },
                                                    ];
                                                }
                                                else if (hasProductBatches) {
                                                    const batchData = item.product_batches ||
                                                        item.batches;
                                                    batchDeductions = batchData.map((b) => {
                                                        const bUomQty = parseInt(b.quantity, 10);
                                                        const bPieces = b.base_quantity
                                                            ? parseInt(b.base_quantity, 10)
                                                            : bUomQty * conversionFactor;
                                                        return {
                                                            batch_lot_id: b.batch_lot_id,
                                                            pieces: bPieces,
                                                            uomQty: bUomQty,
                                                        };
                                                    });
                                                }
                                                else {
                                                    throw new Error(`No batch information for BATCH-tracked product "${product.name}"`);
                                                }
                                                let totalPiecesDeducted = 0;
                                                let totalUomDeducted = 0;
                                                for (const batchOrder of batchDeductions) {
                                                    const piecesToDeduct = batchOrder.pieces;
                                                    totalPiecesDeducted += piecesToDeduct;
                                                    totalUomDeducted += batchOrder.uomQty;
                                                    const batchLot = await tx.batch_lots.findUnique({
                                                        where: { id: batchOrder.batch_lot_id },
                                                    });
                                                    if (!batchLot) {
                                                        throw new Error(`Batch lot ${batchOrder.batch_lot_id} not found`);
                                                    }
                                                    const vanInventory = await tx.van_inventory.findFirst({
                                                        where: {
                                                            user_id: visit.sales_person_id,
                                                            status: 'A',
                                                            is_active: 'Y',
                                                            van_inventory_items_inventory: {
                                                                some: {
                                                                    product_id: product.id,
                                                                    batch_lot_id: batchOrder.batch_lot_id,
                                                                },
                                                            },
                                                        },
                                                        include: {
                                                            van_inventory_items_inventory: true,
                                                        },
                                                        orderBy: { document_date: 'desc' },
                                                    });
                                                    const vanItem = await tx.van_inventory_items.findFirst({
                                                        where: {
                                                            product_id: product.id,
                                                            batch_lot_id: batchOrder.batch_lot_id,
                                                            parent_id: vanInventory?.id,
                                                        },
                                                    });
                                                    if (!vanItem) {
                                                        throw new Error(`Batch ${batchOrder.batch_lot_id} not found in van for product "${product.name}"`);
                                                    }
                                                    const vanDeduction = calculateStockDeduction(vanItem.quantity || 0, vanItem.base_quantity || 0, piecesToDeduct, conversionFactor, itemUnit, orderedQty);
                                                    if (vanDeduction.newQuantity < 0) {
                                                        const availableMsg = isUnitPcs
                                                            ? `${vanDeduction.totalAvailablePieces} pcs`
                                                            : `${vanItem.quantity} cases`;
                                                        const requestedMsg = isUnitPcs
                                                            ? `${piecesToDeduct} pcs`
                                                            : `${orderedQty} cases`;
                                                        throw new Error(`Insufficient van quantity for batch "${batchLot.batch_number}". ` +
                                                            `Available: ${availableMsg}, Requested: ${requestedMsg}`);
                                                    }
                                                    console.log(`BATCH VAN [${itemUnit}]: ` +
                                                        `${vanItem.quantity}cs + ${vanItem.base_quantity || 0}pc → ` +
                                                        `${vanDeduction.newQuantity}cs + ${vanDeduction.newBaseQuantity}pc`);
                                                    // if (
                                                    //   vanDeduction.newQuantity > 0 ||
                                                    //   vanDeduction.newBaseQuantity > 0
                                                    // ) {
                                                    //   await tx.van_inventory_items.update({
                                                    //     where: { id: vanItem.id },
                                                    //     data: {
                                                    //       quantity: vanDeduction.newQuantity,
                                                    //       base_quantity: vanDeduction.newBaseQuantity,
                                                    //     },
                                                    //   });
                                                    // } else {
                                                    //   await tx.van_inventory_items.delete({
                                                    //     where: { id: vanItem.id },
                                                    //   });
                                                    // }
                                                    const inventoryStock = await tx.inventory_stock.findFirst({
                                                        where: {
                                                            product_id: product.id,
                                                            batch_id: batchOrder.batch_lot_id,
                                                        },
                                                    });
                                                    if (inventoryStock) {
                                                        const stockDeduction = calculateStockDeduction(inventoryStock.current_stock || 0, inventoryStock.base_quantity || 0, piecesToDeduct, conversionFactor, itemUnit, orderedQty);
                                                        if (stockDeduction.newQuantity < 0) {
                                                            const availableMsg = isUnitPcs
                                                                ? `${stockDeduction.totalAvailablePieces} pcs`
                                                                : `${inventoryStock.current_stock} cases`;
                                                            const requestedMsg = isUnitPcs
                                                                ? `${piecesToDeduct} pcs`
                                                                : `${orderedQty} cases`;
                                                            throw new Error(`Insufficient inventory stock for batch "${batchLot.batch_number}". ` +
                                                                `Available: ${availableMsg}, Requested: ${requestedMsg}`);
                                                        }
                                                        let newAvailableQty;
                                                        if (isUnitPcs) {
                                                            const availableTotalPieces = (inventoryStock.available_stock || 0) *
                                                                conversionFactor +
                                                                (inventoryStock.base_quantity || 0);
                                                            const newAvailablePieces = Math.max(0, availableTotalPieces - piecesToDeduct);
                                                            newAvailableQty = Math.floor(newAvailablePieces / conversionFactor);
                                                        }
                                                        else {
                                                            newAvailableQty = Math.max(0, (inventoryStock.available_stock || 0) -
                                                                orderedQty);
                                                        }
                                                        await tx.inventory_stock.update({
                                                            where: { id: inventoryStock.id },
                                                            data: {
                                                                current_stock: stockDeduction.newQuantity,
                                                                available_stock: newAvailableQty,
                                                                base_quantity: stockDeduction.newBaseQuantity,
                                                                updatedate: new Date(),
                                                                updatedby: req.user?.id ||
                                                                    visit.createdby ||
                                                                    1,
                                                            },
                                                        });
                                                        console.log(`BATCH STOCK [${itemUnit}]: ` +
                                                            `${inventoryStock.current_stock}cs + ${inventoryStock.base_quantity || 0}pc → ` +
                                                            `${stockDeduction.newQuantity}cs + ${stockDeduction.newBaseQuantity}pc`);
                                                    }
                                                    else {
                                                        throw new Error(`Inventory stock not found for product ${product.name} batch ${batchOrder.batch_lot_id}`);
                                                    }
                                                    const validatedFromLocationId = await validateAndGetLocationId(tx, vanInventory?.location_id);
                                                    await tx.stock_movements.create({
                                                        data: {
                                                            product_id: product.id,
                                                            batch_id: batchOrder.batch_lot_id,
                                                            serial_id: null,
                                                            movement_type: 'SALE',
                                                            reference_type: referenceType,
                                                            reference_id: referenceId,
                                                            from_location_id: validatedFromLocationId,
                                                            to_location_id: null,
                                                            quantity: piecesToDeduct,
                                                            movement_date: new Date(),
                                                            remarks: isUnitPcs
                                                                ? `Sold via ${referenceLabel} - Batch: ${batchLot.batch_number} - ${piecesToDeduct} PCS`
                                                                : `Sold via ${referenceLabel} - Batch: ${batchLot.batch_number} - ${batchOrder.uomQty} CASE(S) (${piecesToDeduct} pieces)`,
                                                            is_active: 'Y',
                                                            createdate: new Date(),
                                                            createdby: req.user?.id || visit.createdby || 1,
                                                            log_inst: 1,
                                                            van_inventory_id: vanInventory?.id || null,
                                                        },
                                                    });
                                                }
                                                if (totalPiecesDeducted !== orderedPieces) {
                                                    throw new Error(`Total batch pieces (${totalPiecesDeducted}) does not match ordered pieces (${orderedPieces})`);
                                                }
                                                await tx.invoice_items.create({
                                                    data: {
                                                        parent_id: createdInvoice.id,
                                                        product_id: product.id,
                                                        product_name: item.product_name || product.name,
                                                        unit: item.unit || 'CASE',
                                                        quantity: isUnitPcs ? 0 : totalUomDeducted,
                                                        unit_price: Number(item.unit_price) || 0,
                                                        discount_amount: Number(item.discount_amount) || 0,
                                                        tax_amount: Number(item.tax_amount) || 0,
                                                        total_amount: isUnitPcs
                                                            ? totalPiecesDeducted *
                                                                (Number(item.unit_price) || 0)
                                                            : totalUomDeducted *
                                                                (Number(item.unit_price) || 0),
                                                        notes: hasBatchNumber
                                                            ? `Batch: ${item.batch_number}`
                                                            : `Batches: ${batchDeductions.map(b => b.batch_lot_id).join(', ')}`,
                                                        ...(item.tax_code && { tax_code: item.tax_code }),
                                                        ...(item.tax_rate !== undefined && {
                                                            tax_rate: item.tax_rate,
                                                        }),
                                                        conversion_factor: conversionFactor,
                                                        base_quantity: isUnitPcs
                                                            ? totalPiecesDeducted
                                                            : 0,
                                                        ...(item.expiry_date && {
                                                            expiry_date: new Date(item.expiry_date),
                                                        }),
                                                    },
                                                });
                                            }
                                            else if (trackingType === 'SERIAL') {
                                                const serialData = item.product_serials ||
                                                    item.serials;
                                                if (!serialData ||
                                                    !Array.isArray(serialData) ||
                                                    serialData.length === 0) {
                                                    throw new Error(`Serial numbers required for "${product.name}"`);
                                                }
                                                for (const serialInput of serialData) {
                                                    const serialNumber = typeof serialInput === 'string'
                                                        ? serialInput
                                                        : serialInput.serial_number;
                                                    if (!serialNumber) {
                                                        throw new Error('Serial number is required');
                                                    }
                                                    const serial = await tx.serial_numbers.findUnique({
                                                        where: { serial_number: serialNumber },
                                                    });
                                                    if (!serial) {
                                                        throw new Error(`Serial number ${serialNumber} not found`);
                                                    }
                                                    if (serial.product_id !== product.id) {
                                                        throw new Error(`Serial ${serialNumber} belongs to product_id=${serial.product_id}, not product_id=${product.id}`);
                                                    }
                                                    if (serial.status !== 'in_van') {
                                                        throw new Error(`Serial ${serialNumber} status is "${serial.status}", expected "in_van"`);
                                                    }
                                                    const vanItemWithSerial = await tx.van_inventory_items.findFirst({
                                                        where: {
                                                            product_id: product.id,
                                                            serial_id: serial.id,
                                                            van_inventory_items_inventory: {
                                                                user_id: visit.sales_person_id,
                                                                is_active: 'Y',
                                                                status: 'A',
                                                            },
                                                        },
                                                        include: {
                                                            van_inventory_items_inventory: true,
                                                        },
                                                    });
                                                    if (!vanItemWithSerial) {
                                                        throw new Error(`Serial ${serialNumber} not found in van inventory for sales person ${visit.sales_person_id}`);
                                                    }
                                                    const vanInventory = vanItemWithSerial.van_inventory_items_inventory;
                                                    console.log(`Van found for serial ${serialNumber}: van_id=${vanInventory.id}, van_item_id=${vanItemWithSerial.id}`);
                                                    // if ((vanItemWithSerial.quantity || 0) > 1) {
                                                    //   await tx.van_inventory_items.update({
                                                    //     where: { id: vanItemWithSerial.id },
                                                    //     data: {
                                                    //       quantity:
                                                    //         (vanItemWithSerial.quantity || 0) - 1,
                                                    //     },
                                                    //   });
                                                    //   console.log(
                                                    //     `VAN SERIAL [${serialNumber}]: qty ${vanItemWithSerial.quantity} → ${(vanItemWithSerial.quantity || 0) - 1}`
                                                    //   );
                                                    // } else {
                                                    //   await tx.van_inventory_items.delete({
                                                    //     where: { id: vanItemWithSerial.id },
                                                    //   });
                                                    //   console.log(
                                                    //     `VAN SERIAL [${serialNumber}]: van_inventory_items row deleted (id=${vanItemWithSerial.id})`
                                                    //   );
                                                    // }
                                                    // await tx.serial_numbers.update({
                                                    //   where: { id: serial.id },
                                                    //   data: {
                                                    //     status: 'sold',
                                                    //     customer_id: visit.customer_id,
                                                    //     sold_date: new Date(),
                                                    //     updatedate: new Date(),
                                                    //     updatedby:
                                                    //       (req as any).user?.id || visit.createdby || 1,
                                                    //   },
                                                    // });
                                                    console.log(` Serial ${serialNumber} marked as sold to customer ${visit.customer_id}`);
                                                    let inventoryStock = await tx.inventory_stock.findFirst({
                                                        where: {
                                                            product_id: product.id,
                                                            serial_number_id: serial.id,
                                                        },
                                                    });
                                                    if (!inventoryStock) {
                                                        inventoryStock =
                                                            await tx.inventory_stock.findFirst({
                                                                where: {
                                                                    product_id: product.id,
                                                                    serial_number_id: null,
                                                                    batch_id: null,
                                                                    ...(vanInventory?.location_id && {
                                                                        location_id: vanInventory.location_id,
                                                                    }),
                                                                },
                                                            });
                                                    }
                                                    if (!inventoryStock) {
                                                        console.warn(`Inventory stock not found for serial ${serialNumber}`);
                                                    }
                                                    else {
                                                        const newCurrent = Math.max(0, (inventoryStock.current_stock || 0) - 1);
                                                        const newAvailable = Math.max(0, (inventoryStock.available_stock || 0) - 1);
                                                        console.log(`STOCK SERIAL [${serialNumber}]: current ${inventoryStock.current_stock} → ${newCurrent}, available ${inventoryStock.available_stock} → ${newAvailable}`);
                                                        await tx.inventory_stock.update({
                                                            where: { id: inventoryStock.id },
                                                            data: {
                                                                current_stock: newCurrent,
                                                                available_stock: newAvailable,
                                                                updatedate: new Date(),
                                                                updatedby: req.user?.id ||
                                                                    visit.createdby ||
                                                                    1,
                                                            },
                                                        });
                                                    }
                                                    const validatedFromLocationId = await validateAndGetLocationId(tx, vanInventory?.location_id);
                                                    await tx.stock_movements.create({
                                                        data: {
                                                            product_id: product.id,
                                                            batch_id: null,
                                                            serial_id: serial.id,
                                                            movement_type: 'SALE',
                                                            reference_type: referenceType,
                                                            reference_id: referenceId,
                                                            from_location_id: validatedFromLocationId,
                                                            to_location_id: null,
                                                            quantity: 1,
                                                            movement_date: new Date(),
                                                            remarks: `Sold via ${referenceLabel} - Serial ${serialNumber}`,
                                                            is_active: 'Y',
                                                            createdate: new Date(),
                                                            createdby: req.user?.id || visit.createdby || 1,
                                                            log_inst: 1,
                                                            van_inventory_id: vanInventory.id,
                                                        },
                                                    });
                                                    console.log(`Stock movement created for serial ${serialNumber}`);
                                                }
                                                await tx.invoice_items.create({
                                                    data: {
                                                        parent_id: createdInvoice.id,
                                                        product_id: product.id,
                                                        product_name: item.product_name || product.name,
                                                        unit: item.unit || 'pcs',
                                                        quantity: serialData.length,
                                                        unit_price: Number(item.unit_price) || 0,
                                                        discount_amount: Number(item.discount_amount) || 0,
                                                        tax_amount: Number(item.tax_amount) || 0,
                                                        total_amount: serialData.length *
                                                            (Number(item.unit_price) || 0),
                                                        notes: `Serials: ${serialData
                                                            .map((s) => typeof s === 'string' ? s : s.serial_number)
                                                            .join(', ')}`,
                                                        ...(item.tax_code && { tax_code: item.tax_code }),
                                                        ...(item.tax_rate !== undefined && {
                                                            tax_rate: item.tax_rate,
                                                        }),
                                                        conversion_factor: 1,
                                                        base_quantity: serialData.length,
                                                        ...(item.expiry_date && {
                                                            expiry_date: new Date(item.expiry_date),
                                                        }),
                                                    },
                                                });
                                            }
                                            else {
                                                const vanInventory = await tx.van_inventory.findFirst({
                                                    where: {
                                                        user_id: visit.sales_person_id,
                                                        status: 'A',
                                                        is_active: 'Y',
                                                        van_inventory_items_inventory: {
                                                            some: {
                                                                product_id: product.id,
                                                                batch_lot_id: null,
                                                                serial_id: null,
                                                            },
                                                        },
                                                    },
                                                    include: { van_inventory_items_inventory: true },
                                                    orderBy: { document_date: 'desc' },
                                                });
                                                const vanItem = await tx.van_inventory_items.findFirst({
                                                    where: {
                                                        product_id: product.id,
                                                        parent_id: vanInventory?.id,
                                                        batch_lot_id: null,
                                                        serial_id: null,
                                                    },
                                                });
                                                if (!vanItem) {
                                                    throw new Error(`Product "${product.name}" not found in van inventory`);
                                                }
                                                const vanDeduction = calculateStockDeduction(vanItem.quantity || 0, vanItem.base_quantity || 0, orderedPieces, conversionFactor, itemUnit, orderedQty);
                                                if (vanDeduction.newQuantity < 0) {
                                                    const availableMsg = isUnitPcs
                                                        ? `${vanDeduction.totalAvailablePieces} pcs`
                                                        : `${vanItem.quantity} cases`;
                                                    const requestedMsg = isUnitPcs
                                                        ? `${orderedPieces} pcs`
                                                        : `${orderedQty} cases`;
                                                    throw new Error(`Insufficient van quantity for "${product.name}". ` +
                                                        `Available: ${availableMsg}, Requested: ${requestedMsg}`);
                                                }
                                                console.log(`NONE VAN [${itemUnit}]: ${vanItem.quantity}cs + ${vanItem.base_quantity || 0}pc → ` +
                                                    `${vanDeduction.newQuantity}cs + ${vanDeduction.newBaseQuantity}pc`);
                                                // if (
                                                //   vanDeduction.newQuantity > 0 ||
                                                //   vanDeduction.newBaseQuantity > 0
                                                // ) {
                                                //   await tx.van_inventory_items.update({
                                                //     where: { id: vanItem.id },
                                                //     data: {
                                                //       quantity: vanDeduction.newQuantity,
                                                //       base_quantity: vanDeduction.newBaseQuantity,
                                                //     },
                                                //   });
                                                // } else {
                                                //   await tx.van_inventory_items.delete({
                                                //     where: { id: vanItem.id },
                                                //   });
                                                // }
                                                const inventoryStock = await tx.inventory_stock.findFirst({
                                                    where: {
                                                        product_id: product.id,
                                                        batch_id: null,
                                                        serial_number_id: null,
                                                        ...(vanInventory?.location_id && {
                                                            location_id: vanInventory.location_id,
                                                        }),
                                                    },
                                                });
                                                if (inventoryStock) {
                                                    const stockDeduction = calculateStockDeduction(inventoryStock.current_stock || 0, inventoryStock.base_quantity || 0, orderedPieces, conversionFactor, itemUnit, orderedQty);
                                                    if (stockDeduction.newQuantity < 0) {
                                                        const availableMsg = isUnitPcs
                                                            ? `${stockDeduction.totalAvailablePieces} pcs`
                                                            : `${inventoryStock.current_stock} cases`;
                                                        const requestedMsg = isUnitPcs
                                                            ? `${orderedPieces} pcs`
                                                            : `${orderedQty} cases`;
                                                        throw new Error(`Insufficient inventory stock for "${product.name}". ` +
                                                            `Available: ${availableMsg}, Requested: ${requestedMsg}`);
                                                    }
                                                    let newAvailableQty;
                                                    if (isUnitPcs) {
                                                        const availableTotalPieces = (inventoryStock.available_stock || 0) *
                                                            conversionFactor +
                                                            (inventoryStock.base_quantity || 0);
                                                        const newAvailablePieces = Math.max(0, availableTotalPieces - orderedPieces);
                                                        newAvailableQty = Math.floor(newAvailablePieces / conversionFactor);
                                                    }
                                                    else {
                                                        newAvailableQty = Math.max(0, (inventoryStock.available_stock || 0) -
                                                            orderedQty);
                                                    }
                                                    await tx.inventory_stock.update({
                                                        where: { id: inventoryStock.id },
                                                        data: {
                                                            current_stock: stockDeduction.newQuantity,
                                                            available_stock: newAvailableQty,
                                                            base_quantity: stockDeduction.newBaseQuantity,
                                                            updatedate: new Date(),
                                                            updatedby: req.user?.id || visit.createdby || 1,
                                                        },
                                                    });
                                                    console.log(`NONE STOCK [${itemUnit}]: ${inventoryStock.current_stock}cs + ` +
                                                        `${inventoryStock.base_quantity || 0}pc → ` +
                                                        `${stockDeduction.newQuantity}cs + ${stockDeduction.newBaseQuantity}pc`);
                                                }
                                                else {
                                                    throw new Error(`Inventory stock not found for product ${product.name}`);
                                                }
                                                const validatedFromLocationId = await validateAndGetLocationId(tx, vanInventory?.location_id);
                                                await tx.stock_movements.create({
                                                    data: {
                                                        product_id: product.id,
                                                        batch_id: null,
                                                        serial_id: null,
                                                        movement_type: 'SALE',
                                                        reference_type: referenceType,
                                                        reference_id: referenceId,
                                                        from_location_id: validatedFromLocationId,
                                                        to_location_id: null,
                                                        quantity: orderedPieces,
                                                        movement_date: new Date(),
                                                        remarks: isUnitPcs
                                                            ? `Sold via ${referenceLabel} - ${orderedPieces} PCS`
                                                            : `Sold via ${referenceLabel} - ${orderedQty} CASE(S) (${orderedPieces} pieces)`,
                                                        is_active: 'Y',
                                                        createdate: new Date(),
                                                        createdby: req.user?.id || visit.createdby || 1,
                                                        log_inst: 1,
                                                        van_inventory_id: vanInventory?.id || null,
                                                    },
                                                });
                                                await tx.invoice_items.create({
                                                    data: {
                                                        parent_id: createdInvoice.id,
                                                        product_id: product.id,
                                                        product_name: item.product_name || product.name,
                                                        unit: item.unit || 'CASE',
                                                        quantity: isUnitPcs ? 0 : orderedQty,
                                                        unit_price: Number(item.unit_price) || 0,
                                                        discount_amount: Number(item.discount_amount) || 0,
                                                        tax_amount: Number(item.tax_amount) || 0,
                                                        total_amount: isUnitPcs
                                                            ? orderedPieces * (Number(item.unit_price) || 0)
                                                            : orderedQty * (Number(item.unit_price) || 0),
                                                        notes: item.notes || null,
                                                        ...(item.tax_code && { tax_code: item.tax_code }),
                                                        ...(item.tax_rate !== undefined && {
                                                            tax_rate: item.tax_rate,
                                                        }),
                                                        conversion_factor: conversionFactor,
                                                        base_quantity: isUnitPcs ? orderedPieces : 0,
                                                        ...(item.expiry_date && {
                                                            expiry_date: new Date(item.expiry_date),
                                                        }),
                                                    },
                                                });
                                            }
                                        }
                                        const subtotal = (await tx.invoice_items.aggregate({
                                            where: { parent_id: createdInvoice.id },
                                            _sum: { total_amount: true },
                                        }))._sum.total_amount || 0;
                                        await tx.invoices.update({
                                            where: { id: createdInvoice.id },
                                            data: {
                                                subtotal: subtotal,
                                                total_amount: subtotal,
                                                updatedate: new Date(),
                                                updatedby: req.user?.id || visit.createdby || 1,
                                            },
                                        });
                                    }
                                    console.log(`Invoice ${createdInvoice.invoice_number} processed`);
                                }
                            }
                            if (payments && payments.length > 0) {
                                for (const paymentData of payments) {
                                    let paymentNumber = paymentData.payment_number;
                                    if (!paymentNumber) {
                                        paymentNumber =
                                            await generatePaymentNumberInTransaction(tx);
                                    }
                                    else {
                                        const existingPayment = await tx.payments.findFirst({
                                            where: { payment_number: paymentNumber },
                                        });
                                        if (existingPayment) {
                                            throw new Error(`Payment number ${paymentNumber} already exists`);
                                        }
                                    }
                                    const processedPaymentData = {
                                        customer_id: paymentData.customer_id || visit.customer_id,
                                        payment_number: paymentNumber,
                                        payment_date: paymentData.payment_date
                                            ? new Date(paymentData.payment_date)
                                            : new Date(),
                                        collected_by: paymentData.collected_by || visit.sales_person_id,
                                        method: paymentData.method || 'cash',
                                        reference_number: paymentData.reference_number || null,
                                        total_amount: paymentData.total_amount || 0,
                                        notes: paymentData.notes || null,
                                        is_active: paymentData.is_active || 'Y',
                                        currency_id: paymentData.currency_id,
                                        ...(paymentData.slip_number && {
                                            slip_number: paymentData.slip_number,
                                        }),
                                        ...(paymentData.customer_name && {
                                            customer_name: paymentData.customer_name,
                                        }),
                                        ...(paymentData.is_auto !== undefined && {
                                            is_auto: !!paymentData.is_auto,
                                        }),
                                        ...(paymentData.is_synced !== undefined && {
                                            is_synced: !!paymentData.is_synced,
                                        }),
                                    };
                                    let createdPayment;
                                    if (paymentData.payment_id || paymentData.id) {
                                        const paymentIdToUpdate = paymentData.id || paymentData.payment_id;
                                        createdPayment = await tx.payments.update({
                                            where: { id: paymentIdToUpdate },
                                            data: {
                                                ...processedPaymentData,
                                                updatedate: new Date(),
                                                updatedby: req.user?.id || visit.createdby || 1,
                                            },
                                        });
                                    }
                                    else {
                                        createdPayment = await tx.payments.create({
                                            data: {
                                                ...processedPaymentData,
                                                createdate: new Date(),
                                                createdby: paymentData.createdby ||
                                                    req.user?.id ||
                                                    visit.createdby ||
                                                    1,
                                                log_inst: 1,
                                            },
                                        });
                                    }
                                    paymentIds.push(createdPayment.id);
                                }
                            }
                            if (cooler_installations && cooler_installations.length > 0) {
                                for (const installation of cooler_installations) {
                                    const assetSerialNumber = installation.asset_serial_number ||
                                        installation.serial_number;
                                    if (!assetSerialNumber) {
                                        throw new Error('asset_serial_number is required');
                                    }
                                    const asset = await tx.asset_master.findFirst({
                                        where: {
                                            serial_number: assetSerialNumber,
                                        },
                                    });
                                    if (!asset) {
                                        throw new Error(`Asset with serial number ${assetSerialNumber} not found`);
                                    }
                                    const cooler = await tx.coolers.findFirst({
                                        where: {
                                            asset_master_id: asset.id,
                                        },
                                    });
                                    if (!cooler) {
                                        throw new Error(`Cooler linked with asset serial number ${assetSerialNumber} not found`);
                                    }
                                    const updatedCooler = await tx.coolers.update({
                                        where: {
                                            id: cooler.id,
                                        },
                                        data: {
                                            status: installation.status || 'installed',
                                            updatedate: new Date(),
                                            updatedby: req.user?.id || visit.createdby || 1,
                                        },
                                    });
                                    coolerInstallationIds.push(updatedCooler.id);
                                    coolerInstallationIds.push(updatedCooler.id);
                                    await tx.asset_master.update({
                                        where: {
                                            id: asset.id,
                                        },
                                        data: {
                                            current_status: (installation.status || 'installed').toLowerCase() ===
                                                'installed'
                                                ? 'Installed'
                                                : installation.status || 'installed',
                                            updatedate: new Date(),
                                            updatedby: req.user?.id || visit.createdby || 1,
                                        },
                                    });
                                    console.log(`Cooler ${updatedCooler.id} status updated to ${installation.status || 'installed'} using asset serial ${assetSerialNumber}`);
                                }
                            }
                            // if (cooler_inspections && cooler_inspections.length > 0) {
                            //   for (const inspection of cooler_inspections) {
                            //     const coolerData = inspection.cooler || {};
                            //     let coolerId: number | undefined;
                            //     if (coolerData.id) {
                            //       const {
                            //         id,
                            //         customer_id,
                            //         technician_id,
                            //         capacity,
                            //         ...coolerUpdateData
                            //       } = coolerData;
                            //       const updatedCooler = await tx.coolers.update({
                            //         where: { id: coolerData.id },
                            //         data: {
                            //           ...coolerUpdateData,
                            //           ...(capacity !== undefined && {
                            //             capacity:
                            //               typeof capacity === 'string'
                            //                 ? parseFloat(capacity) || 0
                            //                 : capacity,
                            //           }),
                            //           updatedate: new Date(),
                            //           updatedby:
                            //             (req as any).user?.id || visit.createdby || 1,
                            //         },
                            //       });
                            //       coolerId = updatedCooler.id;
                            //       if (
                            //         updatedCooler.status?.toLowerCase() === 'installed' &&
                            //         updatedCooler.asset_master_id
                            //       ) {
                            //         await tx.asset_master.update({
                            //           where: { id: updatedCooler.asset_master_id },
                            //           data: {
                            //             current_status: 'Installed',
                            //             updatedate: new Date(),
                            //             updatedby:
                            //               (req as any).user?.id || visit.createdby || 1,
                            //           },
                            //         });
                            //       }
                            //     } else {
                            //       const {
                            //         id,
                            //         customer_id,
                            //         technician_id,
                            //         capacity,
                            //         code,
                            //         ...coolerCreateData
                            //       } = coolerData;
                            //       const newCooler = await tx.coolers.create({
                            //         data: {
                            //           ...coolerCreateData,
                            //           ...(capacity !== undefined && {
                            //             capacity:
                            //               typeof capacity === 'string'
                            //                 ? parseFloat(capacity) || 0
                            //                 : capacity,
                            //           }),
                            //           code:
                            //             code ||
                            //             `COOLER-${Date.now()}-${Math.random()
                            //               .toString(36)
                            //               .substr(2, 6)
                            //               .toUpperCase()}`,
                            //           createdate: new Date(),
                            //           createdby:
                            //             visit.createdby || (req as any).user?.id || 1,
                            //           log_inst: 1,
                            //           coolers_customers: {
                            //             connect: { id: visit.customer_id },
                            //           },
                            //         },
                            //       });
                            //       coolerId = newCooler.id;
                            //       if (
                            //         newCooler.status?.toLowerCase() === 'installed' &&
                            //         newCooler.asset_master_id
                            //       ) {
                            //         await tx.asset_master.update({
                            //           where: { id: newCooler.asset_master_id },
                            //           data: {
                            //             current_status: 'Installed',
                            //             updatedate: new Date(),
                            //             updatedby:
                            //               (req as any).user?.id || visit.createdby || 1,
                            //           },
                            //         });
                            //       }
                            //     }
                            //     const processedInspectionData = {
                            //       cooler_id: coolerId,
                            //       visit_id: visitId,
                            //       inspected_by: inspection.inspected_by,
                            //       inspection_date: inspection.inspection_date
                            //         ? new Date(inspection.inspection_date)
                            //         : new Date(),
                            //       temperature: inspection.temperature || undefined,
                            //       is_working: inspection.is_working || 'Y',
                            //       issues: inspection.issues,
                            //       images: inspection.images,
                            //       latitude: inspection.latitude || undefined,
                            //       longitude: inspection.longitude || undefined,
                            //       action_required: inspection.action_required || 'N',
                            //       action_taken: inspection.action_taken,
                            //       next_inspection_due: inspection.next_inspection_due
                            //         ? new Date(inspection.next_inspection_due)
                            //         : undefined,
                            //     };
                            //     if (inspection.id) {
                            //       const updatedInspection =
                            //         await tx.cooler_inspections.update({
                            //           where: { id: inspection.id },
                            //           data: {
                            //             ...processedInspectionData,
                            //             updatedate: new Date(),
                            //             updatedby:
                            //               (req as any).user?.id || visit.createdby || 1,
                            //           },
                            //         });
                            //       inspectionIds.push(updatedInspection.id);
                            //     } else {
                            //       const newInspection = await tx.cooler_inspections.create({
                            //         data: {
                            //           ...processedInspectionData,
                            //           createdate: new Date(),
                            //           createdby:
                            //             visit.createdby || (req as any).user?.id || 1,
                            //           log_inst: 1,
                            //         },
                            //       });
                            //       inspectionIds.push(newInspection.id);
                            //     }
                            //   }
                            // }
                            if (cooler_inspections && cooler_inspections.length > 0) {
                                for (const inspection of cooler_inspections) {
                                    if (!inspection.serial_number) {
                                        throw new Error('serial_number is required for cooler inspection');
                                    }
                                    const asset = await tx.asset_master.findFirst({
                                        where: {
                                            serial_number: inspection.serial_number,
                                        },
                                    });
                                    if (!asset) {
                                        throw new Error(`Asset with serial number ${inspection.serial_number} not found`);
                                    }
                                    const cooler = await tx.coolers.findFirst({
                                        where: {
                                            asset_master_id: asset.id,
                                        },
                                    });
                                    if (!cooler) {
                                        throw new Error(`Cooler linked with serial number ${inspection.serial_number} not found`);
                                    }
                                    const inspectionDate = inspection.inspection_date
                                        ? new Date(inspection.inspection_date)
                                        : new Date();
                                    await tx.coolers.update({
                                        where: {
                                            id: cooler.id,
                                        },
                                        data: {
                                            last_scanned_date: inspectionDate,
                                            updatedate: new Date(),
                                            updatedby: req.user?.id || visit.createdby || 1,
                                        },
                                    });
                                    const processedInspectionData = {
                                        cooler_id: cooler.id,
                                        visit_id: visitId,
                                        inspected_by: inspection.inspected_by,
                                        inspection_date: inspectionDate,
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
                                        const updatedInspection = await tx.cooler_inspections.update({
                                            where: { id: inspection.id },
                                            data: {
                                                ...processedInspectionData,
                                                updatedate: new Date(),
                                                updatedby: req.user?.id || visit.createdby || 1,
                                            },
                                        });
                                        inspectionIds.push(updatedInspection.id);
                                    }
                                    else {
                                        const newInspection = await tx.cooler_inspections.create({
                                            data: {
                                                ...processedInspectionData,
                                                createdate: new Date(),
                                                createdby: visit.createdby || req.user?.id || 1,
                                                log_inst: 1,
                                            },
                                        });
                                        inspectionIds.push(newInspection.id);
                                    }
                                }
                            }
                            if (survey && survey.survey_response) {
                                const { survey_response } = survey;
                                const surveyAnswers = survey_response.survey_answers || [];
                                const processedSurveyData = {
                                    parent_id: survey_response.parent_id,
                                    customer_id: survey_response.customer_id || visit.customer_id,
                                    visit_id: visitId,
                                    submitted_by: survey_response.submitted_by,
                                    submitted_at: survey_response.submitted_at
                                        ? new Date(survey_response.submitted_at)
                                        : new Date(),
                                    location: survey_response.location,
                                    photo_url: survey_response.photo_url,
                                    is_active: survey_response.is_active || 'Y',
                                };
                                let surveyResponseRecord;
                                if (survey_response.id) {
                                    surveyResponseRecord = await tx.survey_responses.update({
                                        where: { id: survey_response.id },
                                        data: {
                                            ...processedSurveyData,
                                            updatedate: new Date(),
                                            updatedby: req.user?.id || visit.createdby || 1,
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
                                            }
                                            else {
                                                await tx.survey_answers.create({ data: answerData });
                                            }
                                        }
                                    }
                                }
                                else {
                                    surveyResponseRecord = await tx.survey_responses.create({
                                        data: {
                                            ...processedSurveyData,
                                            createdate: new Date(),
                                            createdby: visit.createdby || req.user?.id || 1,
                                            log_inst: 1,
                                        },
                                    });
                                    surveyResponseIds.push(surveyResponseRecord.id);
                                    if (surveyAnswers.length > 0) {
                                        await tx.survey_answers.createMany({
                                            data: surveyAnswers.map((answer) => ({
                                                parent_id: surveyResponseRecord.id,
                                                field_id: answer.field_id,
                                                answer: answer.answer,
                                            })),
                                        });
                                    }
                                }
                            }
                            const visitWithBasicRelations = await tx.visits.findUnique({
                                where: { id: visitId },
                                include: {
                                    visit_customers: true,
                                    visits_salesperson: true,
                                    visit_routes: true,
                                    visit_zones: true,
                                    visit_attachments: true,
                                },
                            });
                            const relatedInvoices = invoiceIds.length > 0
                                ? await tx.invoices.findMany({
                                    where: { id: { in: invoiceIds } },
                                    include: {
                                        invoice_items: {
                                            include: { invoice_items_products: true },
                                        },
                                    },
                                })
                                : [];
                            const relatedPayments = paymentIds.length > 0
                                ? await tx.payments.findMany({
                                    where: { id: { in: paymentIds } },
                                })
                                : [];
                            const relatedInspections = inspectionIds.length > 0
                                ? await tx.cooler_inspections.findMany({
                                    where: { id: { in: inspectionIds } },
                                    include: { coolers: true },
                                })
                                : [];
                            const relatedCoolerInstallations = coolerInstallationIds.length > 0
                                ? await tx.coolers.findMany({
                                    where: {
                                        id: {
                                            in: coolerInstallationIds,
                                        },
                                    },
                                })
                                : [];
                            const relatedSurveyResponses = surveyResponseIds.length > 0
                                ? await tx.survey_responses.findMany({
                                    where: { id: { in: surveyResponseIds } },
                                })
                                : [];
                            const surveyAnswersData = surveyResponseIds.length > 0
                                ? await tx.survey_answers.findMany({
                                    where: { parent_id: { in: surveyResponseIds } },
                                })
                                : [];
                            const surveyResponsesWithAnswers = relatedSurveyResponses.map(response => ({
                                ...response,
                                survey_answers: surveyAnswersData.filter(answer => answer.parent_id === response.id),
                            }));
                            const relatedAttachments = await tx.visit_attachments.findMany({
                                where: { visit_id: visitId },
                            });
                            return {
                                ...visitWithBasicRelations,
                                invoices: relatedInvoices,
                                payments: relatedPayments,
                                cooler_installations: relatedCoolerInstallations,
                                cooler_inspections: relatedInspections,
                                survey_responses: surveyResponsesWithAnswers,
                                visit_attachments: relatedAttachments,
                            };
                        }, { maxWait: 15000, timeout: 90000 });
                        if (isUpdate) {
                            if (selfImageUrls.length > 0 && oldSelfImages.length > 0) {
                                for (const oldImage of oldSelfImages) {
                                    await deleteOldImages(oldImage).catch(err => console.error('Failed to delete old self image:', err));
                                }
                            }
                            if (customerImageUrls.length > 0 &&
                                oldCustomerImages.length > 0) {
                                for (const oldImage of oldCustomerImages) {
                                    await deleteOldImages(oldImage).catch(err => console.error('Failed to delete old customer image:', err));
                                }
                            }
                            if (coolerImageUrls.length > 0 && oldCoolerImages.length > 0) {
                                for (const oldImage of oldCoolerImages) {
                                    await deleteOldImages(oldImage).catch(err => console.error('Failed to delete old cooler image:', err));
                                }
                            }
                        }
                        if (isUpdate) {
                            results.updated.push({
                                visit: serializeVisit(result),
                                visit_id: result?.id,
                                message: `Visit ${visitIdToUpdate} updated successfully`,
                            });
                        }
                        else {
                            results.created.push({
                                visit: serializeVisit(result),
                                visit_id: result?.id,
                                message: 'Visit created successfully',
                            });
                        }
                    }
                    catch (transactionError) {
                        console.error(`Transaction failed for visit ${index + 1}, rolling back images...`);
                        for (const imagePath of uploadedImagePaths) {
                            await deleteOldImages(imagePath).catch(err => console.error('Failed to cleanup uploaded image:', err));
                        }
                        results.failed.push({
                            visitIndex: index,
                            data: data?.visit || data,
                            constraint: transactionError.meta?.target,
                            meta: transactionError.meta,
                            error: transactionError.message || 'Transaction failed',
                            stack: process.env.NODE_ENV === 'development'
                                ? transactionError.stack
                                : undefined,
                        });
                        continue;
                    }
                }
                catch (error) {
                    console.error(`Visit ${index + 1} Processing Error:`, error.message);
                    results.failed.push({
                        visitIndex: index,
                        data: data?.visit || data,
                        constraint: error.meta?.target,
                        meta: error.meta,
                        error: error.message || 'Unknown error occurred',
                        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                    });
                    continue;
                }
            }
            const statusCode = results.failed.length === dataArray.length
                ? 400
                : results.failed.length > 0
                    ? 207
                    : results.created.length > 0
                        ? 201
                        : 200;
            console.log(`\nBulk upsert completed: Created(${results.created.length}) Updated(${results.updated.length}) Failed(${results.failed.length})\n`);
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
        }
        catch (error) {
            console.error('Bulk Upsert Error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    },
    async getAllVisits(req, res) {
        try {
            const { page, limit, search, sales_person_id, status, isActive, startDate, } = req.query;
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
            const searchLower = search ? search.toLowerCase().trim() : '';
            if (isActive && !['Y', 'N'].includes(isActive)) {
                console.log('Invalid isActive:', isActive);
                return res.status(400).json({ message: 'Invalid isActive value' });
            }
            const filters = {};
            if (sales_person_id) {
                const salesPersonIdNum = parseInt(sales_person_id, 10);
                if (isNaN(salesPersonIdNum)) {
                    return res.status(400).json({ message: 'Invalid sales_person_id' });
                }
                filters.sales_person_id = salesPersonIdNum;
                console.log('Filtering by sales_person_id:', salesPersonIdNum);
            }
            if (startDate) {
                console.log('Processing startDate:', startDate);
                const start = new Date(startDate);
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
                    filters.AND = [{ OR: filters.OR }, { OR: searchOr }];
                    delete filters.OR;
                    console.log('Combined AND filters:', filters.AND);
                }
                else {
                    filters.OR = searchOr;
                    console.log('Applied search OR filters');
                }
            }
            if (status) {
                console.log('Applying status filter:', status);
                filters.status = status;
            }
            if (isActive) {
                console.log('Applying isActive filter:', isActive);
                filters.is_active = isActive;
            }
            console.log('Final Filters:', JSON.stringify(filters, null, 2));
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.visits,
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
            const visitIds = data.map((visit) => visit.id);
            const customerIds = data
                .filter((visit) => visit.customer_id)
                .map((visit) => visit.customer_id);
            console.log(` Visit IDs:`, visitIds);
            console.log(` Customer IDs:`, customerIds);
            const visitPayments = customerIds.length > 0
                ? await prisma_client_1.default.payments.findMany({
                    where: {
                        customer_id: { in: customerIds },
                    },
                })
                : [];
            console.log(` Fetched ${visitPayments.length} payments`);
            const visitOrders = customerIds.length > 0
                ? await prisma_client_1.default.orders.findMany({
                    where: {
                        parent_id: { in: customerIds },
                        is_active: 'Y',
                    },
                })
                : [];
            console.log(` Fetched ${visitOrders.length} orders`);
            let visitSurveys = [];
            try {
                if (visitIds.length > 0) {
                    visitSurveys = await prisma_client_1.default.survey_responses.findMany({
                        where: {
                            parent_id: { in: visitIds },
                        },
                    });
                    console.log(` Fetched ${visitSurveys.length} survey responses`);
                }
            }
            catch (error) {
                console.log(' Survey responses fetch error:', error.message);
            }
            const paymentsByCustomer = new Map();
            visitPayments.forEach(payment => {
                if (!paymentsByCustomer.has(payment.customer_id)) {
                    paymentsByCustomer.set(payment.customer_id, []);
                }
                paymentsByCustomer.get(payment.customer_id).push(payment);
            });
            const ordersByCustomer = new Map();
            visitOrders.forEach(order => {
                if (!ordersByCustomer.has(order.parent_id)) {
                    ordersByCustomer.set(order.parent_id, []);
                }
                ordersByCustomer.get(order.parent_id).push(order);
            });
            const surveysByVisit = new Map();
            visitSurveys.forEach(survey => {
                if (!surveysByVisit.has(survey.parent_id)) {
                    surveysByVisit.set(survey.parent_id, []);
                }
                surveysByVisit.get(survey.parent_id).push(survey);
            });
            const customerCoolers = customerIds.length > 0
                ? await prisma_client_1.default.coolers.findMany({
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
            const coolersByCustomer = new Map();
            customerCoolers.forEach(cooler => {
                if (!coolersByCustomer.has(cooler.customer_id)) {
                    coolersByCustomer.set(cooler.customer_id, []);
                }
                coolersByCustomer.get(cooler.customer_id).push(cooler);
            });
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const [totalVisits, activeVisits, inactiveVisits, newVisitsThisMonth] = await Promise.all([
                prisma_client_1.default.visits.count({ where: filters }),
                prisma_client_1.default.visits.count({ where: { ...filters, is_active: 'Y' } }),
                prisma_client_1.default.visits.count({ where: { ...filters, is_active: 'N' } }),
                prisma_client_1.default.visits.count({
                    where: {
                        ...filters,
                        createdate: { gte: startOfMonth, lte: endOfMonth },
                    },
                }),
            ]);
            const serializedData = data.map((visit) => {
                const visitTime = visit.createdate
                    ? new Date(visit.createdate).getTime()
                    : 0;
                const visitUpdateTime = visit.updatedate
                    ? new Date(visit.updatedate).getTime()
                    : 0;
                const customerPayments = (paymentsByCustomer.get(visit.customer_id) || []).filter((payment) => {
                    if (payment.collected_by !== visit.sales_person_id)
                        return false;
                    if (!payment.createdate)
                        return false;
                    const paymentTime = new Date(payment.createdate).getTime();
                    const diffCreated = Math.abs(paymentTime - visitTime);
                    const diffUpdated = Math.abs(paymentTime - visitUpdateTime);
                    return diffCreated <= 300000 || diffUpdated <= 300000;
                });
                const customerOrders = (ordersByCustomer.get(visit.customer_id) || []).filter((order) => {
                    if (order.salesperson_id !== visit.sales_person_id)
                        return false;
                    if (!order.createdate)
                        return false;
                    const orderTime = new Date(order.createdate).getTime();
                    const diffCreated = Math.abs(orderTime - visitTime);
                    const diffUpdated = Math.abs(orderTime - visitUpdateTime);
                    return diffCreated <= 300000 || diffUpdated <= 300000;
                });
                const visitSurveyResponses = surveysByVisit.get(visit.id) || [];
                console.log(` Visit ${visit.id} (Customer ${visit.customer_id}) has ${customerPayments.length} payments and ${customerOrders.length} orders`);
                const totalAmountCollected = customerPayments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
                const visitWithRelations = {
                    ...visit,
                    amount_collected: String(totalAmountCollected),
                    orders_created: customerOrders.length,
                    payments: customerPayments,
                    survey_responses: visitSurveyResponses,
                };
                const serialized = serializeVisit(visitWithRelations);
                if (serialized.customer) {
                    const customerCoolerList = coolersByCustomer.get(visit.customer_id) || [];
                    const customerWithCoolers = {
                        ...serialized.customer,
                        coolers: customerCoolerList,
                        total_coolers: customerCoolerList.length,
                    };
                    return {
                        ...serialized,
                        customer: customerWithCoolers,
                    };
                }
                return serialized;
            });
            console.log(` Serialized ${serializedData.length} visits with all relations`);
            res.success('Visits retrieved successfully', serializedData, 200, pagination, {
                total_visits: totalVisits,
                active_visits: activeVisits,
                inactive_visits: inactiveVisits,
                new_visits: newVisitsThisMonth,
            });
        }
        catch (error) {
            console.error(' Get All Visits Error:', error);
            res.status(500).json({
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    },
    async getVisitsById(req, res) {
        try {
            const { id } = req.params;
            const visit = await prisma_client_1.default.visits.findUnique({
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
            const coolers = await prisma_client_1.default.coolers.findMany({
                where: {
                    customer_id: visit.customer_id,
                    is_active: 'Y',
                },
            });
            const allOrders = await prisma_client_1.default.orders.findMany({
                where: {
                    parent_id: visit.customer_id,
                    salesperson_id: visit.sales_person_id,
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
            const allPayments = await prisma_client_1.default.payments.findMany({
                where: {
                    customer_id: visit.customer_id,
                    collected_by: visit.sales_person_id,
                    is_active: 'Y',
                },
            });
            const visitTime = visit.createdate
                ? new Date(visit.createdate).getTime()
                : 0;
            const visitUpdateTime = visit.updatedate
                ? new Date(visit.updatedate).getTime()
                : 0;
            const orders = allOrders.filter(order => {
                if (!order.createdate)
                    return false;
                const orderTime = new Date(order.createdate).getTime();
                const diffCreated = Math.abs(orderTime - visitTime);
                const diffUpdated = Math.abs(orderTime - visitUpdateTime);
                return diffCreated <= 300000 || diffUpdated <= 300000;
            });
            const payments = allPayments.filter(payment => {
                if (!payment.createdate)
                    return false;
                const paymentTime = new Date(payment.createdate).getTime();
                const diffCreated = Math.abs(paymentTime - visitTime);
                const diffUpdated = Math.abs(paymentTime - visitUpdateTime);
                return diffCreated <= 300000 || diffUpdated <= 300000;
            });
            const totalAmountCollected = payments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
            let surveyResponses = [];
            try {
                surveyResponses = await prisma_client_1.default.survey_responses.findMany({
                    where: {},
                });
            }
            catch (e) {
                console.log('Survey responses table might not exist');
            }
            res.status(200).json({
                message: 'Visit retrieved successfully',
                data: {
                    ...visit,
                    amount_collected: String(totalAmountCollected),
                    orders_created: orders.length,
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
        }
        catch (error) {
            console.error('Get Visit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async updateVisits(req, res) {
        try {
            const { id } = req.params;
            const existingVisit = await prisma_client_1.default.visits.findUnique({
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
                start_latitude: req.body.start_latitude && req.body.start_latitude.trim() !== ''
                    ? parseFloat(req.body.start_latitude)
                    : null,
                start_longitude: req.body.start_longitude && req.body.start_longitude.trim() !== ''
                    ? parseFloat(req.body.start_longitude)
                    : null,
                end_latitude: req.body.end_latitude && req.body.end_latitude.trim() !== ''
                    ? parseFloat(req.body.end_latitude)
                    : null,
                end_longitude: req.body.end_longitude && req.body.end_longitude.trim() !== ''
                    ? parseFloat(req.body.end_longitude)
                    : null,
                amount_collected: req.body.amount_collected && req.body.amount_collected.trim() !== ''
                    ? parseFloat(req.body.amount_collected)
                    : null,
            };
            const data = {
                ...processedData,
                updatedate: new Date(),
                updatedby: req.user?.id || 1,
            };
            const visit = await prisma_client_1.default.visits.update({
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
        }
        catch (error) {
            console.log('Update Visit Error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    async deleteVisits(req, res) {
        try {
            const { id } = req.params;
            const existingVisit = await prisma_client_1.default.visits.findUnique({
                where: { id: Number(id) },
            });
            if (!existingVisit) {
                return res.status(404).json({ message: 'Visit not found' });
            }
            await prisma_client_1.default.visits.delete({ where: { id: Number(id) } });
        }
        catch (error) {
            console.error('Delete Zone Error:', error);
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Cannot delete Visits. It is referenced by other records.',
                    suggestion: 'Please update or delete the dependent records first, or consider setting the visits as inactive instead.',
                });
            }
            res.status(500).json({ message: error.message });
        }
    },
    async getCustomerVisitsBySalesperson(req, res) {
        try {
            console.log('Request Query:', req.query);
            const { page, limit, search, sales_person_id, customer_name, salesperson_name, status, isActive, startDate, endDate, sortBy, sortOrder, } = req.query;
            if (!sales_person_id) {
                return res.status(400).json({
                    message: 'sales_person_id is required',
                });
            }
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
            const searchLower = search ? search.toLowerCase().trim() : '';
            const salesPersonIdNum = parseInt(sales_person_id, 10);
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
            if (status && !allowedStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }
            if (isActive && !['Y', 'N'].includes(isActive)) {
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
            const sortByField = sortBy || 'createdate';
            const sortOrderValue = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
            const filters = {
                sales_person_id: salesPersonIdNum,
            };
            if (customer_name) {
                const customerNameTrim = customer_name.trim();
                filters.visit_customers = {
                    name: {
                        contains: customerNameTrim,
                    },
                };
            }
            if (salesperson_name) {
                const salespersonNameTrim = salesperson_name.trim();
                if (!filters.visits_salesperson) {
                    filters.visits_salesperson = {};
                }
                filters.visits_salesperson.name = {
                    contains: salespersonNameTrim,
                };
            }
            if (startDate) {
                const start = new Date(startDate);
                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid startDate format. Please use YYYY-MM-DD',
                    });
                }
                start.setHours(0, 0, 0, 0);
                if (endDate) {
                    const end = new Date(endDate);
                    if (isNaN(end.getTime())) {
                        return res.status(400).json({
                            message: 'Invalid endDate format. Please use YYYY-MM-DD',
                        });
                    }
                    end.setHours(23, 59, 59, 999);
                    filters.visit_date = { gte: start, lte: end };
                }
                else {
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
                filters.status = status;
            }
            if (isActive) {
                filters.is_active = isActive;
            }
            let orderBy = { createdate: 'desc' };
            if (sortByField === 'customer_name') {
                orderBy = {
                    visit_customers: {
                        name: sortOrderValue,
                    },
                };
            }
            else if (sortByField === 'salesperson_name') {
                orderBy = {
                    visits_salesperson: {
                        name: sortOrderValue,
                    },
                };
            }
            else {
                orderBy = { [sortByField]: sortOrderValue };
            }
            console.log('Final Filters:', JSON.stringify(filters, null, 2));
            console.log('OrderBy:', JSON.stringify(orderBy, null, 2));
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.visits,
                filters,
                page: pageNum,
                limit: limitNum,
                orderBy: orderBy,
                include: {
                    visit_customers: true,
                },
            });
            if (data.length === 0) {
                return res.success('No visits found for this salesperson', [], 200, {
                    current_page: pageNum,
                    per_page: limitNum,
                    total: 0,
                    total_pages: 0,
                }, {
                    sales_person_id: salesPersonIdNum,
                    customer_name_filter: customer_name || null,
                    salesperson_name_filter: salesperson_name || null,
                    total_visits: 0,
                    active_visits: 0,
                    inactive_visits: 0,
                    unique_customers: 0,
                    sort_by: sortByField,
                    sort_order: sortOrderValue,
                });
            }
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const [totalVisits, activeVisits, inactiveVisits, newVisitsThisMonth, completedVisits, pendingVisits,] = await Promise.all([
                prisma_client_1.default.visits.count({ where: filters }),
                prisma_client_1.default.visits.count({ where: { ...filters, is_active: 'Y' } }),
                prisma_client_1.default.visits.count({ where: { ...filters, is_active: 'N' } }),
                prisma_client_1.default.visits.count({
                    where: {
                        ...filters,
                        createdate: { gte: startOfMonth, lte: endOfMonth },
                    },
                }),
                prisma_client_1.default.visits.count({
                    where: { ...filters, status: 'completed' },
                }),
                prisma_client_1.default.visits.count({
                    where: { ...filters, status: 'pending' },
                }),
            ]);
            const uniqueCustomers = await prisma_client_1.default.visits.findMany({
                where: filters,
                select: {
                    customer_id: true,
                },
                distinct: ['customer_id'],
            });
            const serializedData = data
                .filter((visit) => visit.visit_customers)
                .map((visit) => visit.visit_customers);
            res.success(`Customer visits retrieved successfully for salesperson ID: ${salesPersonIdNum}`, serializedData, 200, pagination, {
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
            });
        }
        catch (error) {
            console.error('Get Customer Visits By Salesperson Error:', error);
            res.status(500).json({
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    },
    async getCoolerInspectionsForVisitedCustomers(req, res) {
        try {
            console.log('Request Query:', req.query);
            const { page, limit, search, sales_person_id, customer_id, visit_id, startDate, endDate, isActive, requires_service, sortBy, sortOrder, } = req.query;
            if (!sales_person_id && !customer_id && !visit_id) {
                return res.status(400).json({
                    message: 'Either sales_person_id, customer_id, or visit_id is required',
                });
            }
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
            const searchLower = search ? search.toLowerCase().trim() : '';
            let salesPersonIdNum = null;
            let customerIdNum = null;
            let visitIdNum = null;
            if (sales_person_id) {
                salesPersonIdNum = parseInt(sales_person_id, 10);
                if (isNaN(salesPersonIdNum)) {
                    return res.status(400).json({
                        message: 'Invalid sales_person_id. Must be a number.',
                    });
                }
            }
            if (customer_id) {
                customerIdNum = parseInt(customer_id, 10);
                if (isNaN(customerIdNum)) {
                    return res.status(400).json({
                        message: 'Invalid customer_id. Must be a number.',
                    });
                }
            }
            if (visit_id) {
                visitIdNum = parseInt(visit_id, 10);
                if (isNaN(visitIdNum)) {
                    return res.status(400).json({
                        message: 'Invalid visit_id. Must be a number.',
                    });
                }
            }
            if (isActive && !['Y', 'N'].includes(isActive)) {
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
            const sortByField = sortBy || 'createdate';
            const sortOrderValue = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
            if (sortBy && !allowedSortFields.includes(sortBy)) {
                return res.status(400).json({
                    message: `Invalid sortBy value. Allowed values: ${allowedSortFields.join(', ')}`,
                });
            }
            const filters = {};
            if (visitIdNum) {
                filters.visit_id = visitIdNum;
            }
            const visitFilters = {};
            if (salesPersonIdNum) {
                visitFilters.sales_person_id = salesPersonIdNum;
            }
            if (customerIdNum) {
                visitFilters.customer_id = customerIdNum;
            }
            if (startDate) {
                const start = new Date(startDate);
                if (isNaN(start.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid startDate format. Please use YYYY-MM-DD',
                    });
                }
                start.setHours(0, 0, 0, 0);
                if (endDate) {
                    const end = new Date(endDate);
                    if (isNaN(end.getTime())) {
                        return res.status(400).json({
                            message: 'Invalid endDate format. Please use YYYY-MM-DD',
                        });
                    }
                    end.setHours(23, 59, 59, 999);
                    visitFilters.visit_date = { gte: start, lte: end };
                }
                else {
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
                filters.is_active = isActive;
            }
            if (requires_service) {
                filters.action_required = requires_service;
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
            let orderBy = { createdate: 'desc' };
            if (sortByField === 'cooler_code') {
                orderBy = {
                    coolers: {
                        code: sortOrderValue,
                    },
                };
            }
            else if (sortByField === 'cooler_brand') {
                orderBy = {
                    coolers: {
                        brand: sortOrderValue,
                    },
                };
            }
            else if (sortByField === 'cooler_type') {
                orderBy = {
                    coolers: {
                        cooler_types: {
                            name: sortOrderValue,
                        },
                    },
                };
            }
            else {
                orderBy = { [sortByField]: sortOrderValue };
            }
            console.log('Final Filters:', JSON.stringify(filters, null, 2));
            console.log('OrderBy:', JSON.stringify(orderBy, null, 2));
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.cooler_inspections,
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
                return res.success('No cooler inspections found', [], 200, {
                    current_page: pageNum,
                    per_page: limitNum,
                    total: 0,
                    total_pages: 0,
                }, {
                    sales_person_id: salesPersonIdNum,
                    customer_id: customerIdNum,
                    visit_id: visitIdNum,
                    total_inspections: 0,
                    unique_coolers: 0,
                    unique_customers: 0,
                    sort_by: sortByField,
                    sort_order: sortOrderValue,
                });
            }
            const [totalInspections, activeInspections, inactiveInspections, inspectionsRequiringService, inspectionsWithIssues, coolersNotWorking,] = await Promise.all([
                prisma_client_1.default.cooler_inspections.count({ where: filters }),
                prisma_client_1.default.cooler_inspections.count({
                    where: { ...filters, is_active: 'Y' },
                }),
                prisma_client_1.default.cooler_inspections.count({
                    where: { ...filters, is_active: 'N' },
                }),
                prisma_client_1.default.cooler_inspections.count({
                    where: { ...filters, action_required: 'Y' },
                }),
                prisma_client_1.default.cooler_inspections.count({
                    where: { ...filters, issues: { not: null } },
                }),
                prisma_client_1.default.cooler_inspections.count({
                    where: { ...filters, is_working: 'N' },
                }),
            ]);
            const uniqueCoolers = await prisma_client_1.default.cooler_inspections.findMany({
                where: filters,
                select: {
                    cooler_id: true,
                },
                distinct: ['cooler_id'],
            });
            const uniqueCustomers = [
                ...new Set(data
                    .map((inspection) => inspection.visits?.customer_id)
                    .filter(Boolean)),
            ];
            const uniqueVisits = [
                ...new Set(data.map((inspection) => inspection.visit_id)),
            ];
            const serializedData = data
                .filter((inspection) => inspection.coolers)
                .map((inspection) => {
                const cooler = inspection.coolers;
                return {
                    ...cooler,
                    cooler_type: cooler.cooler_types || null,
                    cooler_sub_type: cooler.cooler_sub_types || null,
                    cooler_types: undefined,
                    cooler_sub_types: undefined,
                };
            });
            res.success('Coolers from inspections retrieved successfully', serializedData, 200, pagination, {
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
            });
        }
        catch (error) {
            console.error('Get Cooler Inspections Error:', error);
            res.status(500).json({
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    },
};
//# sourceMappingURL=visits.controller.js.map