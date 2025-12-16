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

        // ✅ FIXED: Properly handle optional fields
        const processedVisitData = {
          customer_id: visit.customer_id,
          sales_person_id: visit.sales_person_id,
          ...(visit.route_id !== undefined && visit.route_id !== null && { route_id: visit.route_id }),
          ...(visit.zones_id !== undefined && visit.zones_id !== null && { zones_id: visit.zones_id }),
          ...(visit.visit_date && { visit_date: new Date(visit.visit_date) }),
          ...(visit.visit_time && { visit_time: visit.visit_time }),
          ...(visit.purpose && { purpose: visit.purpose }),
          ...(visit.status && { status: visit.status }),
          ...(visit.start_time && { start_time: new Date(visit.start_time) }),
          ...(visit.end_time && { end_time: new Date(visit.end_time) }),
          ...(visit.duration !== undefined && { duration: visit.duration }),
          ...(visit.start_latitude && { start_latitude: visit.start_latitude }),
          ...(visit.start_longitude && { start_longitude: visit.start_longitude }),
          ...(visit.end_latitude && { end_latitude: visit.end_latitude }),
          ...(visit.end_longitude && { end_longitude: visit.end_longitude }),
          ...(visit.check_in_time && { check_in_time: new Date(visit.check_in_time) }),
          ...(visit.check_out_time && { check_out_time: new Date(visit.check_out_time) }),
          ...(visit.orders_created !== undefined && { orders_created: visit.orders_created }),
          ...(visit.amount_collected && { amount_collected: visit.amount_collected }),
          ...(visit.visit_notes && { visit_notes: visit.visit_notes }),
          ...(visit.customer_feedback && { customer_feedback: visit.customer_feedback }),
          ...(visit.next_visit_date && { next_visit_date: new Date(visit.next_visit_date) }),
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

          // ... rest of your code for orders, payments, etc. remains the same ...

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