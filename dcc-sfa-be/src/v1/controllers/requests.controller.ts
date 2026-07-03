import { Request, Response } from 'express';
import { generateEmailContent } from '../../utils/emailTemplates';
import templateKeyMap from '../../utils/templateKeyMap';
import { sendEmail } from '../../utils/mailer';
import getRequestDetailsByType from '../../utils/getDetails';
import { paginate } from '../../utils/paginate';
import { requestTypes } from '../../mock/requestTypes';
import prisma from '../../configs/prisma.client';
import { generateContractOnApproval } from '../../helpers/approvalWorkflow.helper';

interface RequestSerialized {
  id: number;
  requester_id: number;
  request_type: string;
  request_data: string | null;
  status: string;
  reference_id: number | null;
  overall_status: string | null;
  createdate: Date | null;
  createdby: number;
  updatedate: Date | null;
  updatedby: number | null;
  log_inst: number | null;
  requester?: {
    id: number;
    name: string;
    email: string;
  } | null;
  approvals?: {
    id: number;
    approver_id: number;
    sequence: number;
    status: string;
    remarks: string | null;
    action_at: Date | null;
    reference_details?: any;
    approver: {
      id: number;
      name: string;
      email: string;
    } | null;
  }[];
}

const serializeRequest = (request: any): RequestSerialized => ({
  id: request.id,
  requester_id: request.requester_id,
  request_type: request.request_type,
  request_data: request.request_data,
  status: request.status,
  reference_id: request.reference_id,
  overall_status: request.overall_status,
  createdate: request.createdate,
  createdby: request.createdby,
  updatedate: request.updatedate,
  updatedby: request.updatedby,
  log_inst: request.log_inst,
  requester: request.sfa_d_requests_requester
    ? {
        id: request.sfa_d_requests_requester.id,
        name: request.sfa_d_requests_requester.name,
        email: request.sfa_d_requests_requester.email,
      }
    : null,
  approvals:
    request.sfa_d_requests_approvals_request?.map((approval: any) => ({
      id: approval.id,
      approver_id: approval.approver_id,
      sequence: approval.sequence,
      status: approval.status,
      remarks: approval.remarks,
      action_at: approval.action_at,
      approver: approval.sfa_d_requests_approvals_approver
        ? {
            id: approval.sfa_d_requests_approvals_approver.id,
            name: approval.sfa_d_requests_approvals_approver.name,
            email: approval.sfa_d_requests_approvals_approver.email,
            profile_image:
              approval.sfa_d_requests_approvals_approver.profile_image || null,
            employee_id:
              approval.sfa_d_requests_approvals_approver.employee_id || null,
          }
        : null,
      reference_details: request.reference_details || null,
    })) || [],
});

const isDisposalMovementOutletToDepot = (movement: {
  movement_type?: string | null;
  from_direction?: string | null;
  to_direction?: string | null;
}): boolean => {
  return (
    (movement.movement_type?.toLowerCase() === 'return' ||
      movement.movement_type?.toLowerCase() === 'disposal') &&
    movement.from_direction?.toLowerCase() === 'outlet' &&
    movement.to_direction?.toLowerCase() === 'depot'
  );
};

const formatRequestType = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
};

async function getWorkflowForRequest(
  request_type: string,
  requester_zone_id: number | null,
  requester_depot_id: number | null
) {
  try {
    let workflowSteps;
    let workflowType = 'NONE';

    if (requester_zone_id && requester_depot_id) {
      workflowSteps = await prisma.approval_work_flow.findMany({
        where: {
          request_type,
          zone_id: requester_zone_id,
          depot_id: requester_depot_id,
          is_active: 'Y',
        },
        orderBy: { sequence: 'asc' },
        include: {
          approval_work_flow_approver: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = 'ZONE_DEPOT_SPECIFIC';
        return {
          workflow: workflowSteps,
          isGlobalWorkflow: false,
          workflowType,
        };
      }
    }

    if (requester_zone_id) {
      workflowSteps = await prisma.approval_work_flow.findMany({
        where: {
          request_type,
          zone_id: requester_zone_id,
          depot_id: null,
          is_active: 'Y',
        },
        orderBy: { sequence: 'asc' },
        include: {
          approval_work_flow_approver: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = 'ZONE_SPECIFIC';
        return {
          workflow: workflowSteps,
          isGlobalWorkflow: false,
          workflowType,
        };
      }
    }

    if (requester_depot_id) {
      workflowSteps = await prisma.approval_work_flow.findMany({
        where: {
          request_type,
          depot_id: requester_depot_id,
          zone_id: null,
          is_active: 'Y',
        },
        orderBy: { sequence: 'asc' },
        include: {
          approval_work_flow_approver: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = 'DEPOT_SPECIFIC';
        return {
          workflow: workflowSteps,
          isGlobalWorkflow: false,
          workflowType,
        };
      }
    }

    workflowSteps = await prisma.approval_work_flow.findMany({
      where: {
        request_type,
        zone_id: null,
        depot_id: null,
        is_active: 'Y',
      },
      orderBy: { sequence: 'asc' },
      include: {
        approval_work_flow_approver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    workflowType = 'GLOBAL';
    return {
      workflow: workflowSteps,
      isGlobalWorkflow: workflowType === 'GLOBAL',
      workflowType,
    };
  } catch (error: any) {
    throw new Error(`Error resolving workflow: ${error.message}`);
  }
}

function replaceVariables(template: string, data: Record<string, any>): string {
  if (!template) {
    console.log(' Empty template provided');
    return '';
  }

  let result = template;

  console.log(' Starting variable replacement...');
  console.log(' Template length:', template.length);
  console.log(' Variables to replace:', Object.keys(data).join(', '));

  Object.keys(data).forEach(key => {
    const value =
      data[key] !== undefined && data[key] !== null ? String(data[key]) : '';

    const pattern = `\${${key}}`;
    const count = (result.match(new RegExp(`\\$\\{${key}\\}`, 'g')) || [])
      .length;

    if (count > 0) {
      console.log(
        `   Replacing ${count} occurrence(s) of \${${key}} with: "${value}"`
      );
    }

    const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  });

  const unreplaced = result.match(/\$\{[^}]+\}/g);
  if (unreplaced) {
    console.log(' Unreplaced variables found:', unreplaced);
  } else {
    console.log('All variables replaced successfully');
  }

  return result;
}

export const createRequest = async (data: {
  requester_id: number;
  request_type: string;
  reference_id?: number | null;
  request_data?: string | null;
  createdby: number;
  log_inst: number;
}) => {
  try {
    console.log(' Creating request:', data.request_type);

    const requester = await prisma.users.findUnique({
      where: { id: data.requester_id },
      select: {
        id: true,
        name: true,
        email: true,
        zone_id: true,
        depot_id: true,
      },
    });

    if (!requester) {
      throw new Error('Requester not found');
    }

    const request = await prisma.sfa_d_requests.create({
      data: {
        requester_id: data.requester_id,
        request_type: data.request_type,
        reference_id: data.reference_id || null,
        request_data: data.request_data || null,
        status: 'P',
        createdby: data.createdby,
        createdate: new Date(),
        log_inst: data.log_inst,
      },
    });

    console.log('Request created:', request.id);

    let workflowSteps;
    let workflowType = 'NONE';

    if (requester.zone_id && requester.depot_id) {
      workflowSteps = await prisma.approval_work_flow.findMany({
        where: {
          request_type: data.request_type,
          zone_id: requester.zone_id,
          depot_id: requester.depot_id,
          is_active: 'Y',
        },
        orderBy: { sequence: 'asc' },
        include: {
          approval_work_flow_approver: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = 'ZONE_DEPOT_SPECIFIC';
      }
    }

    if ((!workflowSteps || workflowSteps.length === 0) && requester.zone_id) {
      workflowSteps = await prisma.approval_work_flow.findMany({
        where: {
          request_type: data.request_type,
          zone_id: requester.zone_id,
          depot_id: null,
          is_active: 'Y',
        },
        orderBy: { sequence: 'asc' },
        include: {
          approval_work_flow_approver: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = 'ZONE_SPECIFIC';
      }
    }

    if ((!workflowSteps || workflowSteps.length === 0) && requester.depot_id) {
      workflowSteps = await prisma.approval_work_flow.findMany({
        where: {
          request_type: data.request_type,
          depot_id: requester.depot_id,
          zone_id: null,
          is_active: 'Y',
        },
        orderBy: { sequence: 'asc' },
        include: {
          approval_work_flow_approver: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = 'DEPOT_SPECIFIC';
      }
    }

    if (!workflowSteps || workflowSteps.length === 0) {
      workflowSteps = await prisma.approval_work_flow.findMany({
        where: {
          request_type: data.request_type,
          zone_id: null,
          depot_id: null,
          is_active: 'Y',
        },
        orderBy: { sequence: 'asc' },
        include: {
          approval_work_flow_approver: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = 'GLOBAL';
      }
    }

    if (!workflowSteps || workflowSteps.length === 0) {
      console.log('No workflow found, auto-approving request:', request.id);

      const approvedRequest = await prisma.sfa_d_requests.update({
        where: { id: request.id },
        data: {
          status: 'A',
          overall_status: 'APPROVED',
          updatedate: new Date(),
          updatedby: data.createdby,
        },
      });

      if (
        data.request_type === 'RECONCILIATION_APPROVAL' &&
        data.reference_id
      ) {
        await prisma.reconciliation.update({
          where: { id: data.reference_id },
          data: {
            status: 'A',
            updatedate: new Date(),
            updatedby: data.createdby,
          },
        });

        // If this reconciliation approval is linked to a van inventory unload,
        // auto-approve the van_inventory and trigger stock deduction
        if (data.request_data) {
          try {
            const reqData = JSON.parse(data.request_data);
            if (reqData && reqData.van_inventory_id) {
              await prisma.van_inventory.update({
                where: { id: Number(reqData.van_inventory_id) },
                data: {
                  approval_status: 'A',
                  updatedby: data.createdby,
                  updatedate: new Date(),
                },
              });

              console.log(
                `Van Inventory ${reqData.van_inventory_id} auto-approved via RECONCILIATION_APPROVAL (no workflow)`
              );

              // Trigger stock deduction asynchronously after returning
              setImmediate(async () => {
                try {
                  const { vanInventoryController } = await import(
                    './vanInventory.controller'
                  );
                  await vanInventoryController.processApprovedVanInventoryStock(
                    Number(reqData.van_inventory_id),
                    data.createdby,
                    reqData
                  );
                  console.log(
                    `Stock processing completed for auto-approved van inventory ${reqData.van_inventory_id}`
                  );
                } catch (stockErr) {
                  console.error(
                    'Error processing stock on RECONCILIATION_APPROVAL auto-approve:',
                    stockErr
                  );
                }
              });
            }
          } catch (parseErr) {
            console.error(
              'Error parsing request_data on RECONCILIATION_APPROVAL auto-approve:',
              parseErr
            );
          }
        }
      }

      if (
        data.request_type === 'ASSET_MOVEMENT_APPROVAL' &&
        data.reference_id
      ) {
        const assetMovement = await prisma.asset_movements.findUnique({
          where: { id: data.reference_id },
          include: {
            asset_movement_assets: {
              select: { asset_id: true },
            },
          },
        });

        if (assetMovement) {
          await prisma.asset_movements.update({
            where: { id: data.reference_id },
            data: {
              approval_status: 'A',
              approved_by: data.createdby,
              approved_at: new Date(),
              updatedby: data.createdby,
              updatedate: new Date(),
            },
          });

          const toDirection = assetMovement.to_direction || '';
          const toDepotId = assetMovement.to_depot_id;
          const toCustomerId = assetMovement.to_customer_id;
          const isDisposal = isDisposalMovementOutletToDepot(assetMovement);

          await prisma.asset_master.updateMany({
            where: {
              id: {
                in: assetMovement.asset_movement_assets.map(
                  (aa: any) => aa.asset_id
                ),
              },
            },
            data: {
              depot_id: toDepotId || null,
              outlet_id: toCustomerId || null,
              current_location: `${toDirection} (${toDepotId || toCustomerId})`,
              current_status: isDisposal
                ? 'Damaged'
                : toCustomerId
                  ? 'Installed'
                  : 'Available',
              updatedate: new Date(),
              updatedby: data.createdby,
            },
          });

          // const existingCooler = await prisma.coolers.findUnique({
          //   where: { id: data.reference_id },
          // });

          // if (existingCooler) {
          //   await prisma.coolers.update({
          //     where: { id: data.reference_id },
          //     data: {
          //       approval_status: 'A',
          //     },
          //   });
          // }

          await prisma.coolers.updateMany({
            where: {
              asset_master_id: {
                in: assetMovement.asset_movement_assets.map(
                  (aa: any) => aa.asset_id
                ),
              },
            },
            data: {
              status: isDisposal ? 'Removed' : 'Installed',
              approval_status: 'A',
              ...(!isDisposal && { install_date: new Date() }),
              asset_movement_id: data.reference_id,
              updatedate: new Date(),
              updatedby: data.createdby,
            },
          });

          console.log(
            `Cooler installations updated for auto-approved movement ${data.reference_id}`
          );

          if (
            assetMovement.movement_type?.toLowerCase() === 'maintenance' ||
            assetMovement.movement_type?.toLowerCase() === 'repair'
          ) {
            try {
              await prisma.asset_maintenance.createMany({
                data: assetMovement.asset_movement_assets.map((aa: any) => ({
                  asset_id: aa.asset_id,
                  maintenance_date: assetMovement.movement_date || new Date(),
                  issue_reported:
                    assetMovement.notes ||
                    `${assetMovement.movement_type} movement`,
                  action_taken: `Asset moved from ${assetMovement.from_direction} to ${toDirection}`,
                  remarks: `Movement type: ${assetMovement.movement_type}`,
                  createdby: data.createdby,
                  createdate: new Date(),
                  technician_id: assetMovement.performed_by,
                  log_inst: 1,
                })),
              });
              console.log(
                `Maintenance records created for auto-approved asset movement: ${data.reference_id}`
              );
            } catch (maintenanceError) {
              console.error(
                'Error creating maintenance records on auto-approval:',
                maintenanceError
              );
            }
          }

          try {
            await generateContractOnApproval(data.reference_id);
          } catch (contractError) {
            console.error(
              'Error generating contract after auto-approval:',
              contractError
            );
          }
        }
      }

      // 2. ORDER_APPROVAL
      if (data.request_type === 'ORDER_APPROVAL' && data.reference_id) {
        await prisma.orders.update({
          where: { id: data.reference_id },
          data: {
            approval_status: 'A',
            status: 'confirmed',
            approved_by: data.createdby,
            approved_at: new Date(),
            updatedby: data.createdby,
            updatedate: new Date(),
          },
        });
      }

      // 3. LOCATION_RESET
      if (data.request_type === 'LOCATION_RESET' && data.reference_id) {
        const requestData = JSON.parse(data.request_data || '{}');
        const updateData: any = { updatedate: new Date() };

        if (requestData.latitude !== undefined) {
          updateData.latitude = requestData.latitude;
        }

        if (requestData.longitude !== undefined) {
          updateData.longitude = requestData.longitude;
        }

        await prisma.customers.update({
          where: { id: data.reference_id },
          data: updateData,
        });

        console.log(
          `Customer ${data.reference_id} location updated successfully`
        );
      }

      // 4. CUSTOMER_CREATION
      if (data.request_type === 'CUSTOMER_CREATION') {
        const requestData = JSON.parse(data.request_data || '{}');
        const customerData = requestData.customer_data;
        const customerImages = requestData.customer_images || [];

        const { platform_type, ...customerDataWithoutPlatform } = customerData;

        const createdCustomer = await prisma.customers.create({
          data: customerDataWithoutPlatform,
        });

        if (customerImages.length > 0) {
          await prisma.customer_image.createMany({
            data: customerImages.map((img: any) => ({
              ...img,
              customer_id: createdCustomer.id,
            })),
          });
        }
      }

      // 5. VAN_INVENTORY
      if (data.request_type === 'VAN_INVENTORY' && data.reference_id) {
        await prisma.van_inventory.update({
          where: { id: data.reference_id },
          data: {
            approval_status: 'A',
            updatedby: data.createdby,
            updatedate: new Date(),
          },
        });
      }

      return approvedRequest;
    }

    console.log(
      ` Using ${workflowType} workflow with ${workflowSteps.length} steps`
    );

    const approvalsToInsert = workflowSteps.map((step, index) => ({
      request_id: Number(request.id),
      approver_id: Number(step.approver_id),
      sequence: Number(step.sequence) || index + 1,
      status: 'P',
      createdby: data.createdby,
      createdate: new Date(),
      log_inst: data.log_inst,
    }));

    await prisma.sfa_d_request_approvals.createMany({
      data: approvalsToInsert,
    });

    console.log(` Created ${approvalsToInsert.length} approvals`);

    const firstApprover = workflowSteps[0];
    if (firstApprover?.approval_work_flow_approver?.email) {
      try {
        let orderData: any = {};
        if (data.request_type === 'ORDER_APPROVAL' && data.reference_id) {
          const order = await prisma.orders.findUnique({
            where: { id: data.reference_id },
            include: {
              orders_customers: true,
              orders_salesperson_users: true,
            },
          });

          if (order) {
            orderData = {
              order_number: order.order_number || 'N/A',
              customer_name: order.orders_customers?.name || 'N/A',
              salesperson_name: order.orders_salesperson_users?.name || 'N/A',
              total_amount: order.total_amount
                ? `$${Number(order.total_amount).toFixed(2)}`
                : '$0.00',
              request_date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            };
          }
        }

        if (data.request_type === 'LOCATION_RESET') {
          const customer = await getCustomerDetails(data.reference_id!);
          const requestData = JSON.parse(data.request_data || '{}');

          const variables = {
            approver_name: firstApprover.approval_work_flow_approver.name,
            requester_name: requester.name,
            customer_name: customer?.name || 'N/A',
            customer_code: customer?.code || 'N/A',
            current_latitude: customer?.latitude,
            current_longitude: customer?.longitude,
            new_latitude: requestData.latitude,
            new_longitude: requestData.longitude,
            reset_reason: requestData.reason,
            request_id: request.id,
            request_date: new Date().toLocaleDateString(),
            company_name: process.env.COMPANY_NAME || 'SFA System',
          };

          const template = await generateEmailContent(
            templateKeyMap.locationResetNotifyApprover,
            variables
          );

          await sendEmail({
            to: firstApprover.approval_work_flow_approver.email,
            subject: template.subject,
            html: template.body,
            createdby: data.createdby,
            log_inst: data.log_inst,
          });
        }

        if (data.request_type === 'CUSTOMER_CREATION') {
          const requestData = JSON.parse(data.request_data || '{}');
          const customerData = requestData.customer_data;

          const variables = {
            approver_name: firstApprover.approval_work_flow_approver.name,
            requester_name: requester.name,
            customer_name: customerData.name,
            customer_code: customerData.code,
            customer_email: customerData.email,
            customer_phone: customerData.phone_number,
            platform_type: requestData.platform_type,
            requested_by: requestData.requested_by,
            requested_date: requestData.requested_date,
            request_id: request.id,
            company_name: process.env.COMPANY_NAME || 'SFA System',
          };

          const template = await generateEmailContent(
            templateKeyMap.customerCreationNotifyApprover,
            variables
          );

          await sendEmail({
            to: firstApprover.approval_work_flow_approver.email,
            subject: template.subject,
            html: template.body,
            createdby: data.createdby,
            log_inst: data.log_inst,
          });
        }

        const template = await prisma.sfa_d_templates.findUnique({
          where: { key: 'notify_approver' },
        });

        if (!template) {
          throw new Error('Email template "notify_approver" not found');
        }

        const variables = {
          approver_name: firstApprover.approval_work_flow_approver.name,
          requester_name: requester.name,
          company_name: process.env.COMPANY_NAME || 'SFA System',
          ...orderData,
        };

        console.log('Email variables:', Object.keys(variables));

        const subject = replaceVariables(template.subject, variables);
        const body = replaceVariables(template.body, variables);

        console.log(' Subject:', subject);

        await sendEmail({
          to: firstApprover.approval_work_flow_approver.email,
          subject: subject,
          html: body,
          createdby: data.createdby,
          log_inst: data.log_inst,
        });

        console.log(
          `Email sent to ${firstApprover.approval_work_flow_approver.email}`
        );
      } catch (emailError) {
        console.error(' Email error:', emailError);
      }
    }

    return request;
  } catch (error: any) {
    console.error(' Error:', error);
    throw error;
  }
};

async function getCustomerDetails(customerId: number) {
  return await prisma.customers.findUnique({
    where: { id: customerId },
    select: {
      code: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  });
}

export const requestsController = {
  async getRequestTypes(_req: Request, res: Response) {
    return res.json({
      message: 'Request types retrieved successfully',
      data: requestTypes,
    });
  },

  async createRequest(req: Request, res: Response) {
    const data = req.body;
    const userId = req.user?.id || 1;
    const { request_type, ...requestData } = data;

    try {
      if (!request_type) {
        return res.status(400).json({ message: 'request_type is required' });
      }

      console.log(' Processing request:', {
        request_type,
        requester_id: requestData.requester_id,
      });

      const result = await prisma.$transaction(
        async tx => {
          const requester = await tx.users.findUnique({
            where: { id: requestData.requester_id },
            select: {
              id: true,
              name: true,
              email: true,
              zone_id: true,
              depot_id: true,
            },
          });

          if (!requester) {
            throw new Error('Requester not found');
          }

          const request = await tx.sfa_d_requests.create({
            data: {
              requester_id: Number(requestData.requester_id),
              request_type,
              request_data: requestData.request_data || null,
              status: requestData.status || 'P',
              reference_id: requestData.reference_id
                ? Number(requestData.reference_id)
                : null,
              createdby: userId,
              createdate: new Date(),
              log_inst: 1,
            },
          });

          console.log(' Request created, ID:', request.id);

          const { workflow: workflowSteps, workflowType } =
            await getWorkflowForRequest(
              request_type,
              requester.zone_id,
              requester.depot_id
            );

          if (!workflowSteps || workflowSteps.length === 0) {
            throw new Error(
              `No approval workflow defined for '${request_type}'`
            );
          }

          console.log(` Using ${workflowType} workflow for ${request_type}`);

          const approvalsToInsert = workflowSteps.map((step, index) => ({
            request_id: Number(request.id),
            approver_id: Number(step.approver_id),
            sequence: Number(step.sequence) || index + 1,
            status: 'P',
            createdby: userId,
            createdate: new Date(),
            log_inst: 1,
          }));

          await tx.sfa_d_request_approvals.createMany({
            data: approvalsToInsert,
          });

          console.log(`Created ${approvalsToInsert.length} approval steps`);

          const finalRequest = await tx.sfa_d_requests.findUnique({
            where: { id: request.id },
            include: {
              sfa_d_requests_requester: {
                select: { id: true, name: true, email: true },
              },
              sfa_d_requests_approvals_request: {
                select: {
                  id: true,
                  request_id: true,
                  approver_id: true,
                  sequence: true,
                  status: true,
                  sfa_d_requests_approvals_approver: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      profile_image: true,
                      employee_id: true,
                    },
                  },
                },
                orderBy: { sequence: 'asc' },
              },
            },
          });

          return finalRequest;
        },
        {
          maxWait: 10000,
          timeout: 20000,
        }
      );

      if (result) {
        try {
          const firstApproval = result.sfa_d_requests_approvals_request[0];
          if (firstApproval) {
            const firstApprover = await prisma.users.findUnique({
              where: { id: firstApproval.approver_id },
              select: { email: true, name: true },
            });

            if (firstApprover?.email) {
              const request_detail = await getRequestDetailsByType(
                request_type,
                result.reference_id
              );

              const template = await generateEmailContent(
                templateKeyMap.notifyApprover,
                {
                  approver_name: firstApprover.name,
                  requester_name: result.sfa_d_requests_requester.name,
                  request_type: formatRequestType(request_type),
                  action: 'created',
                  company_name: 'SFA System',
                  ...request_detail,
                }
              );

              await sendEmail({
                to: firstApprover.email,
                subject: template.subject,
                html: template.body,
                createdby: userId,
                log_inst: 1,
              });

              console.log(`Email Sent ${firstApprover.email}`);
            }
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }

      res.status(201).json({
        message: 'Request created successfully',
        data: serializeRequest(result),
      });
    } catch (error: any) {
      console.error(' Error creating request:', error);
      res.status(500).json({
        message: 'Failed to create request',
        error: error.message,
      });
    }
  },
  async getAllRequests(req: any, res: any) {
    try {
      const {
        page,
        limit,
        search,
        request_type,
        status,
        requester_id,
        startDate,
        endDate,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {};

      if (search) {
        filters.OR = [
          { request_type: { contains: searchLower } },
          { status: { contains: searchLower } },
          { overall_status: { contains: searchLower } },
        ];
      }

      if (request_type) {
        filters.request_type = request_type as string;
      }

      if (status) {
        filters.status = status as string;
      }

      if (requester_id) {
        filters.requester_id = parseInt(requester_id as string, 10);
      }

      if (startDate && endDate) {
        filters.createdate = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const customerCreationRequests = await prisma.sfa_d_requests.count({
        where: { request_type: 'CUSTOMER_CREATION' },
      });

      const { data, pagination } = await paginate({
        model: prisma.sfa_d_requests,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          sfa_d_requests_requester: {
            select: { id: true, name: true, email: true },
          },
          sfa_d_requests_approvals_request: {
            select: {
              id: true,
              approver_id: true,
              sequence: true,
              status: true,
              remarks: true,
              action_at: true,
              sfa_d_requests_approvals_approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile_image: true,
                  employee_id: true,
                },
              },
            },
            orderBy: { sequence: 'asc' },
          },
        },
      });
      const requestsWithDetails = await Promise.all(
        data.map(async (request: any) => {
          const referenceDetails = await getRequestDetailsByType(
            request.request_type,
            request.reference_id,
            request.request_data
          );
          return {
            ...request,
            reference_details: referenceDetails,
          };
        })
      );

      const totalRequests = await prisma.sfa_d_requests.count({
        where: filters,
      });

      const pendingRequests = await prisma.sfa_d_requests.count({
        where: { ...filters, status: 'P' },
      });

      const approvedRequests = await prisma.sfa_d_requests.count({
        where: { ...filters, status: 'A' },
      });

      const rejectedRequests = await prisma.sfa_d_requests.count({
        where: { ...filters, status: 'R' },
      });

      res.json({
        message: 'Requests retrieved successfully',
        data: requestsWithDetails.map((request: any) =>
          serializeRequest(request)
        ),
        pagination,
        stats: {
          total_requests: totalRequests,
          pending_requests: pendingRequests,
          approved_requests: approvedRequests,
          rejected_requests: rejectedRequests,
        },
      });
    } catch (error: any) {
      console.error('Get Requests Error:', error);
      res.status(500).json({
        message: 'Failed to retrieve requests',
        error: error.message,
      });
    }
  },
  async getRequestsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const request = await prisma.sfa_d_requests.findUnique({
        where: { id: Number(id) },
        include: {
          sfa_d_requests_requester: {
            select: { id: true, name: true, email: true },
          },
          sfa_d_requests_approvals_request: {
            select: {
              id: true,
              approver_id: true,
              sequence: true,
              status: true,
              remarks: true,
              action_at: true,
              sfa_d_requests_approvals_approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile_image: true,
                  employee_id: true,
                },
              },
            },
            orderBy: { sequence: 'asc' },
          },
        },
      });

      if (!request)
        return res.status(404).json({ message: 'Request not found' });

      res.json({
        message: 'Request fetched successfully',
        data: serializeRequest(request),
      });
    } catch (error: any) {
      console.error('Get Request Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateRequests(req: any, res: any) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;
      const data = req.body;

      const existingRequest = await prisma.sfa_d_requests.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRequest)
        return res.status(404).json({ message: 'Request not found' });

      const updated = await prisma.sfa_d_requests.update({
        where: { id: Number(id) },
        data: {
          request_type: data.request_type,
          request_data: data.request_data,
          status: data.status,
          reference_id: data.reference_id ? Number(data.reference_id) : null,
          overall_status: data.overall_status,
          updatedate: new Date(),
          updatedby: userId,
          log_inst: { increment: 1 },
        },
        include: {
          sfa_d_requests_requester: {
            select: { id: true, name: true, email: true },
          },
          sfa_d_requests_approvals_request: true,
        },
      });

      res.json({
        message: 'Request updated successfully',
        data: serializeRequest(updated),
      });
    } catch (error: any) {
      console.error('Update Request Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteRequests(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingRequest = await prisma.sfa_d_requests.findUnique({
        where: { id: Number(id) },
      });

      if (!existingRequest)
        return res.status(404).json({ message: 'Request not found' });

      await prisma.sfa_d_requests.delete({ where: { id: Number(id) } });

      res.json({ message: 'Request deleted successfully' });
    } catch (error: any) {
      console.error('Delete Request Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async takeActionOnRequest(req: Request, res: Response) {
    const { request_id, approval_id, action, remarks } = req.body;
    const userId = req.user?.id || 1;

    try {
      if (!['A', 'R'].includes(action)) {
        return res.status(400).json({
          message: 'Invalid action. Must be A (Approve) or R (Reject)',
        });
      }

      const result = await prisma.$transaction(
        async tx => {
          const request = await tx.sfa_d_requests.findUnique({
            where: { id: Number(request_id) },
            include: {
              sfa_d_requests_requester: {
                select: { id: true, name: true, email: true },
              },
            },
          });

          if (!request) {
            throw new Error('Request not found');
          }

          const currentApproval = await tx.sfa_d_request_approvals.findUnique({
            where: { id: Number(approval_id) },
            include: {
              sfa_d_requests_approvals_approver: {
                select: { id: true, name: true, email: true },
              },
            },
          });

          if (!currentApproval) {
            throw new Error('Approval not found');
          }

          if (currentApproval.status !== 'P') {
            throw new Error('This approval has already been processed');
          }

          if (action === 'A' && currentApproval.sequence > 1) {
            const previousApprovals = await tx.sfa_d_request_approvals.findMany(
              {
                where: {
                  request_id: Number(request_id),
                  sequence: {
                    lt: currentApproval.sequence,
                  },
                },
                orderBy: { sequence: 'asc' },
              }
            );

            const notApproved = previousApprovals.find(
              approval => approval.status !== 'A'
            );

            if (notApproved) {
              throw new Error(
                `Cannot approve. Sequence ${notApproved.sequence} must be approved first`
              );
            }
          }

          await tx.sfa_d_request_approvals.update({
            where: { id: Number(approval_id) },
            data: {
              status: action,
              remarks,
              action_at: new Date(),
              updatedby: userId,
              updatedate: new Date(),
            },
          });

          if (action === 'R') {
            await tx.sfa_d_requests.update({
              where: { id: Number(request_id) },
              data: {
                status: 'R',
                overall_status: 'REJECTED',
                updatedby: userId,
                updatedate: new Date(),
              },
            });

            if (
              request.request_type === 'RECONCILIATION_APPROVAL' &&
              request.reference_id
            ) {
              await tx.reconciliation.update({
                where: { id: request.reference_id },
                data: {
                  status: 'R',
                  updatedate: new Date(),
                  updatedby: userId,
                },
              });

              if (request.request_data) {
                try {
                  const reqData = JSON.parse(request.request_data);
                  if (reqData && reqData.van_inventory_id) {
                    await tx.van_inventory.update({
                      where: { id: Number(reqData.van_inventory_id) },
                      data: {
                        approval_status: 'R',
                        updatedby: userId,
                        updatedate: new Date(),
                      },
                    });
                    console.log(
                      `Van Inventory ${reqData.van_inventory_id} status updated to REJECTED via RECONCILIATION_APPROVAL rejection`
                    );
                  }
                } catch (e) {
                  console.error(
                    'Error updating van_inventory status on reconciliation rejection:',
                    e
                  );
                }
              }

              // Delete duplicate pending RECONCILIATION_APPROVAL requests
              // sharing the same reconciliation (reference_id) or van_inventory_id
              try {
                const dupRequests = await tx.sfa_d_requests.findMany({
                  where: {
                    id: { not: Number(request_id) },
                    request_type: 'RECONCILIATION_APPROVAL',
                    status: 'P',
                    reference_id: request.reference_id,
                  },
                  select: { id: true },
                });

                if (dupRequests.length > 0) {
                  const dupIds = dupRequests.map(r => r.id);
                  await tx.sfa_d_request_approvals.deleteMany({
                    where: { request_id: { in: dupIds } },
                  });
                  await tx.sfa_d_requests.deleteMany({
                    where: { id: { in: dupIds } },
                  });
                  console.log(
                    `Deleted ${dupIds.length} duplicate RECONCILIATION_APPROVAL request(s) after rejection: [${dupIds.join(', ')}]`
                  );
                }
              } catch (dupErr) {
                console.error(
                  'Error deleting duplicate RECONCILIATION_APPROVAL requests on rejection:',
                  dupErr
                );
              }
            }

            if (
              request.request_type === 'ORDER_APPROVAL' &&
              request.reference_id
            ) {
              await tx.orders.update({
                where: { id: request.reference_id },
                data: {
                  approval_status: 'rejected',
                  status: 'rejected',
                  updatedby: userId,
                  updatedate: new Date(),
                },
              });
              console.log(
                `Order ${request.reference_id} status updated to REJECTED`
              );
            }

            if (
              request.request_type === 'ASSET_MOVEMENT_APPROVAL' &&
              request.reference_id
            ) {
              await tx.asset_movements.update({
                where: { id: request.reference_id },
                data: {
                  approval_status: 'R',
                  updatedby: userId,
                  updatedate: new Date(),
                },
              });
              console.log(
                `Asset Movement ${request.reference_id} status updated to REJECTED`
              );
            }

            //   if (
            //     request.request_type === 'VAN_INVENTORY' &&
            //     request.reference_id
            //   ) {
            //     await tx.van_inventory.update({
            //       where: { id: request.reference_id },
            //       data: {
            //         approval_status: 'R',
            //         updatedby: userId,
            //         updatedate: new Date(),
            //       },
            //     });
            //     console.log(
            //       `Van Inventory ${request.reference_id} status updated to REJECTED`
            //     );
            //   }

            //   return { status: 'rejected', request };
            // }

            if (
              request.request_type === 'VAN_INVENTORY' &&
              request.reference_id
            ) {
              await tx.van_inventory.update({
                where: { id: request.reference_id },
                data: {
                  approval_status: 'R',
                  updatedby: userId,
                  updatedate: new Date(),
                },
              });

              console.log(
                `Van Inventory ${request.reference_id} status updated to REJECTED`
              );
            }
            return { status: 'rejected', request };
          }

          const nextApprover = await tx.sfa_d_request_approvals.findFirst({
            where: {
              request_id: Number(request_id),
              status: 'P',
            },
            orderBy: { sequence: 'asc' },
            include: {
              sfa_d_requests_approvals_approver: {
                select: { id: true, name: true, email: true },
              },
            },
          });

          if (
            request.request_type === 'LOCATION_RESET' &&
            request.reference_id &&
            action === 'A'
          ) {
            const requestData = JSON.parse(request.request_data || '{}');
            const updateData: any = { updatedate: new Date() };

            if (requestData.latitude !== undefined) {
              updateData.latitude = requestData.latitude;
            }

            if (requestData.longitude !== undefined) {
              updateData.longitude = requestData.longitude;
            }

            await tx.customers.update({
              where: { id: request.reference_id },
              data: updateData,
            });

            console.log(
              `Customer ${request.reference_id} location updated successfully`
            );
          }

          if (!nextApprover) {
            await tx.sfa_d_requests.update({
              where: { id: Number(request_id) },
              data: {
                status: 'A',
                overall_status: 'APPROVED',
                updatedby: userId,
                updatedate: new Date(),
              },
            });

            if (
              request.request_type === 'ORDER_APPROVAL' &&
              request.reference_id
            ) {
              await tx.orders.update({
                where: { id: request.reference_id },
                data: {
                  approval_status: 'A',
                  status: 'confirmed',
                  approved_by: userId,
                  approved_at: new Date(),
                  updatedby: userId,
                  updatedate: new Date(),
                },
              });
            }

            if (
              request.request_type === 'RECONCILIATION_APPROVAL' &&
              request.reference_id
            ) {
              await tx.reconciliation.update({
                where: { id: request.reference_id },
                data: {
                  status: 'A',
                  updatedate: new Date(),
                  updatedby: userId,
                },
              });

              if (request.request_data) {
                try {
                  const reqData = JSON.parse(request.request_data);
                  if (reqData && reqData.van_inventory_id) {
                    const approvedInventory = await tx.van_inventory.update({
                      where: {
                        id: Number(reqData.van_inventory_id),
                      },
                      data: {
                        approval_status: 'A',
                        updatedby: userId,
                        updatedate: new Date(),
                      },
                    });

                    // Reject older requests/inventories for this salesman
                    const olderInventories = await tx.van_inventory.findMany({
                      where: {
                        user_id: approvedInventory.user_id,
                        loading_type: approvedInventory.loading_type,
                        approval_status: 'P',
                        id: {
                          not: approvedInventory.id,
                        },
                      },
                      select: {
                        id: true,
                      },
                    });

                    if (olderInventories.length > 0) {
                      const inventoryIds = olderInventories.map(x => x.id);

                      // Reject older inventories
                      await tx.van_inventory.updateMany({
                        where: {
                          id: {
                            in: inventoryIds,
                          },
                        },
                        data: {
                          approval_status: 'R',
                          is_cancelled: 'Y',
                          updatedby: userId,
                          updatedate: new Date(),
                        },
                      });

                      // Find all pending workflow requests (both VAN_INVENTORY and RECONCILIATION_APPROVAL)
                      const pendingRequests = await tx.sfa_d_requests.findMany({
                        where: {
                          status: 'P',
                          OR: [
                            {
                              request_type: 'VAN_INVENTORY',
                              reference_id: { in: inventoryIds },
                            },
                            {
                              request_type: 'RECONCILIATION_APPROVAL',
                              request_data: {
                                contains: `"van_inventory_id":`,
                              },
                            },
                          ],
                        },
                      });

                      const requestsToReject = pendingRequests.filter(r => {
                        if (r.request_type === 'VAN_INVENTORY') return true;
                        try {
                          const data = JSON.parse(r.request_data || '{}');
                          return (
                            data.van_inventory_id &&
                            inventoryIds.includes(Number(data.van_inventory_id))
                          );
                        } catch {
                          return false;
                        }
                      });

                      if (requestsToReject.length > 0) {
                        const requestIdsToReject = requestsToReject.map(
                          r => r.id
                        );
                        await tx.sfa_d_requests.updateMany({
                          where: {
                            id: { in: requestIdsToReject },
                          },
                          data: {
                            status: 'R',
                            overall_status: 'REJECTED',
                            updatedby: userId,
                            updatedate: new Date(),
                          },
                        });

                        await tx.sfa_d_request_approvals.updateMany({
                          where: {
                            request_id: { in: requestIdsToReject },
                            status: 'P',
                          },
                          data: {
                            status: 'R',
                            remarks:
                              'Automatically rejected because a newer request was approved.',
                            action_at: new Date(),
                            updatedby: userId,
                            updatedate: new Date(),
                          },
                        });
                      }
                    }
                  }
                } catch (e) {
                  console.error(
                    'Error in takeActionOnRequest for RECONCILIATION_APPROVAL approval side-effects:',
                    e
                  );
                }
              }

              // Delete duplicate pending RECONCILIATION_APPROVAL requests
              // sharing the same reconciliation (reference_id)
              try {
                const dupRequests = await tx.sfa_d_requests.findMany({
                  where: {
                    id: { not: Number(request_id) },
                    request_type: 'RECONCILIATION_APPROVAL',
                    status: 'P',
                    reference_id: request.reference_id,
                  },
                  select: { id: true },
                });

                if (dupRequests.length > 0) {
                  const dupIds = dupRequests.map(r => r.id);
                  await tx.sfa_d_request_approvals.deleteMany({
                    where: { request_id: { in: dupIds } },
                  });
                  await tx.sfa_d_requests.deleteMany({
                    where: { id: { in: dupIds } },
                  });
                  console.log(
                    `Deleted ${dupIds.length} duplicate RECONCILIATION_APPROVAL request(s) after approval: [${dupIds.join(', ')}]`
                  );
                }
              } catch (dupErr) {
                console.error(
                  'Error deleting duplicate RECONCILIATION_APPROVAL requests on approval:',
                  dupErr
                );
              }
            }

            if (
              request.request_type === 'ASSET_MOVEMENT_APPROVAL' &&
              request.reference_id
            ) {
              const assetMovement = await tx.asset_movements.findUnique({
                where: { id: request.reference_id },
                include: {
                  asset_movement_assets: {
                    select: { asset_id: true },
                  },
                },
              });

              if (assetMovement) {
                await tx.asset_movements.update({
                  where: { id: request.reference_id },
                  data: {
                    approval_status: 'A',
                    approved_by: userId,
                    approved_at: new Date(),
                    updatedby: userId,
                    updatedate: new Date(),
                  },
                });

                const toDirection = assetMovement.to_direction || '';
                const toDepotId = assetMovement.to_depot_id;
                const toCustomerId = assetMovement.to_customer_id;
                const isDisposal =
                  isDisposalMovementOutletToDepot(assetMovement);

                await tx.asset_master.updateMany({
                  where: {
                    id: {
                      in: assetMovement.asset_movement_assets.map(
                        (aa: any) => aa.asset_id
                      ),
                    },
                  },
                  data: {
                    depot_id: toDepotId || null,
                    outlet_id: toCustomerId || null,
                    current_location: `${toDirection} (${toDepotId || toCustomerId})`,
                    current_status: isDisposal
                      ? 'Damaged'
                      : toCustomerId
                        ? 'Installed'
                        : 'Available',
                    updatedate: new Date(),
                    updatedby: userId,
                  },
                });

                await tx.coolers.updateMany({
                  where: {
                    asset_master_id: {
                      in: assetMovement.asset_movement_assets.map(
                        (aa: any) => aa.asset_id
                      ),
                    },
                  },
                  data: {
                    status: isDisposal ? 'Removed' : 'Installed',
                    approval_status: 'A',
                    ...(!isDisposal && { install_date: new Date() }),
                    asset_movement_id: request.reference_id,
                    updatedate: new Date(),
                    updatedby: userId,
                  },
                });

                console.log(
                  `Cooler installations updated for asset movement ${request.reference_id}`
                );

                if (
                  assetMovement.movement_type?.toLowerCase() ===
                    'maintenance' ||
                  assetMovement.movement_type?.toLowerCase() === 'repair'
                ) {
                  try {
                    await tx.asset_maintenance.createMany({
                      data: assetMovement.asset_movement_assets.map(
                        (aa: any) => ({
                          asset_id: aa.asset_id,
                          maintenance_date:
                            assetMovement.movement_date || new Date(),
                          issue_reported:
                            assetMovement.notes ||
                            `${assetMovement.movement_type} movement`,
                          action_taken: `Asset moved from ${assetMovement.from_direction} to ${toDirection}`,
                          remarks: `Movement type: ${assetMovement.movement_type}`,
                          createdby: userId,
                          createdate: new Date(),
                          technician_id: assetMovement.performed_by,
                          log_inst: 1,
                        })
                      ),
                    });
                    console.log(
                      `Maintenance records created for approved asset movement: ${request.reference_id}`
                    );
                  } catch (maintenanceError) {
                    console.error(
                      'Error creating maintenance records on approval:',
                      maintenanceError
                    );
                  }
                }
              }
            }

            // if (
            //   request.request_type === 'VAN_INVENTORY' &&
            //   request.reference_id
            // ) {
            //   const approvedInventory = await tx.van_inventory.update({
            //     where: {
            //       id: request.reference_id,
            //     },
            //     data: {
            //       approval_status: 'A',
            //       updatedby: userId,
            //       updatedate: new Date(),
            //     },
            //   });

            //   const olderInventories = await tx.van_inventory.findMany({
            //     where: {
            //       user_id: approvedInventory.user_id,
            //       loading_type: approvedInventory.loading_type,
            //       approval_status: 'P',
            //       id: {
            //         not: approvedInventory.id,
            //       },
            //     },
            //     select: {
            //       id: true,
            //     },
            //   });

            //   if (olderInventories.length > 0) {
            //     const inventoryIds = olderInventories.map(x => x.id);

            //     // Reject older inventories
            //     await tx.van_inventory.updateMany({
            //       where: {
            //         id: {
            //           in: inventoryIds,
            //         },
            //       },
            //       data: {
            //         approval_status: 'R',
            //         is_cancelled: 'Y',
            //         updatedby: userId,
            //         updatedate: new Date(),
            //       },
            //     });

            //     // Reject workflow requests
            //     await tx.sfa_d_requests.updateMany({
            //       where: {
            //         request_type: 'VAN_INVENTORY',
            //         reference_id: {
            //           in: inventoryIds,
            //         },
            //         status: 'P',
            //       },
            //       data: {
            //         status: 'R',
            //         overall_status: 'REJECTED',
            //         updatedby: userId,
            //         updatedate: new Date(),
            //       },
            //     });

            //     // Reject pending approval rows
            //     const requestIds = (
            //       await tx.sfa_d_requests.findMany({
            //         where: {
            //           request_type: 'VAN_INVENTORY',
            //           reference_id: {
            //             in: inventoryIds,
            //           },
            //         },
            //         select: {
            //           id: true,
            //         },
            //       })
            //     ).map(r => r.id);

            //     if (requestIds.length > 0) {
            //       await tx.sfa_d_request_approvals.updateMany({
            //         where: {
            //           request_id: {
            //             in: requestIds,
            //           },
            //           status: 'P',
            //         },
            //         data: {
            //           status: 'R',
            //           remarks:
            //             'Automatically rejected because a newer request was approved.',
            //           action_at: new Date(),
            //           updatedby: userId,
            //           updatedate: new Date(),
            //         },
            //       });
            //     }

            //     console.log(
            //       `Rejected ${inventoryIds.length} older pending ${approvedInventory.loading_type} request(s)`
            //     );
            //   }
            // }

            if (
              request.request_type === 'VAN_INVENTORY' &&
              request.reference_id
            ) {
              const approvedInventory = await tx.van_inventory.update({
                where: {
                  id: request.reference_id,
                },
                data: {
                  approval_status: 'A',
                  updatedby: userId,
                  updatedate: new Date(),
                },
              });

              // -----------------------------------------
              // Run rejection logic ONLY for SAP AR Invoice
              // -----------------------------------------
              let shouldRejectPendingRequests = false;

              if (request.request_data) {
                try {
                  const requestData = JSON.parse(request.request_data);

                  const items =
                    requestData.items || requestData.van_inventory_items || [];

                  shouldRejectPendingRequests = items.some(
                    (item: any) =>
                      String(item.source_system || '').toLowerCase() ===
                      'sap_arinvoice'
                  );
                } catch (err) {
                  console.error('Error parsing request_data:', err);
                }
              }

              if (shouldRejectPendingRequests) {
                const olderInventories = await tx.van_inventory.findMany({
                  where: {
                    user_id: approvedInventory.user_id,
                    loading_type: approvedInventory.loading_type,
                    approval_status: 'P',
                    id: {
                      not: approvedInventory.id,
                    },
                  },
                  select: {
                    id: true,
                  },
                });

                if (olderInventories.length > 0) {
                  const inventoryIds = olderInventories.map(x => x.id);

                  // Reject pending inventories
                  await tx.van_inventory.updateMany({
                    where: {
                      id: {
                        in: inventoryIds,
                      },
                    },
                    data: {
                      approval_status: 'R',
                      is_cancelled: 'Y',
                      updatedby: userId,
                      updatedate: new Date(),
                    },
                  });

                  // Reject workflow requests
                  await tx.sfa_d_requests.updateMany({
                    where: {
                      request_type: 'VAN_INVENTORY',
                      reference_id: {
                        in: inventoryIds,
                      },
                      status: 'P',
                    },
                    data: {
                      status: 'R',
                      overall_status: 'REJECTED',
                      updatedby: userId,
                      updatedate: new Date(),
                    },
                  });

                  // Reject pending approval rows
                  const requestIds = (
                    await tx.sfa_d_requests.findMany({
                      where: {
                        request_type: 'VAN_INVENTORY',
                        reference_id: {
                          in: inventoryIds,
                        },
                      },
                      select: {
                        id: true,
                      },
                    })
                  ).map(r => r.id);

                  if (requestIds.length > 0) {
                    await tx.sfa_d_request_approvals.updateMany({
                      where: {
                        request_id: {
                          in: requestIds,
                        },
                        status: 'P',
                      },
                      data: {
                        status: 'R',
                        remarks:
                          'Automatically rejected because a newer SAP AR Invoice request was approved.',
                        action_at: new Date(),
                        updatedby: userId,
                        updatedate: new Date(),
                      },
                    });
                  }

                  console.log(
                    `Rejected ${inventoryIds.length} pending VAN_INVENTORY request(s) for SAP AR Invoice`
                  );
                }
              }
            }

            if (
              request.request_type === 'CUSTOMER_CREATION' &&
              action === 'A'
            ) {
              const requestData = JSON.parse(request.request_data || '{}');
              const customerData = requestData.customer_data;
              const customerImages = requestData.customer_images || [];

              const { platform_type, ...customerDataWithoutPlatform } =
                customerData;

              const createdCustomer = await tx.customers.create({
                data: customerDataWithoutPlatform,
              });

              if (customerImages.length > 0) {
                await tx.customer_image.createMany({
                  data: customerImages.map((img: any) => ({
                    ...img,
                    customer_id: createdCustomer.id,
                  })),
                });
              }

              console.log(
                `Customer created successfully: ${createdCustomer.code} (ID: ${createdCustomer.id})`
              );
            }

            return { status: 'fully_approved', request };
          }

          return { status: 'next_level', request, nextApprover };
        },

        {
          maxWait: 10000,
          timeout: 20000,
        }
      );
      if (result.status === 'fully_approved' && 'request' in result) {
        if (
          result.request.request_type === 'VAN_INVENTORY' &&
          result.request.reference_id
        ) {
          console.log(
            `Approved VAN_INVENTORY request detected: requestId=${result.request.id}, referenceId=${result.request.reference_id}`
          );
          try {
            const { vanInventoryController } = await import(
              '../controllers/vanInventory.controller'
            );
            await vanInventoryController.processApprovedVanInventoryStock(
              result.request.reference_id,
              userId,
              result.request.request_data
                ? JSON.parse(result.request.request_data)
                : null
            );
            console.log(
              `Completed stock processing for approved VAN_INVENTORY request ${result.request.reference_id}`
            );
          } catch (err) {
            console.error(
              'Error processing approved van inventory stock:',
              err
            );
          }
        }
        if (
          result.request.request_type === 'RECONCILIATION_APPROVAL' &&
          result.request.request_data
        ) {
          try {
            const reqData = JSON.parse(result.request.request_data);
            if (reqData && reqData.van_inventory_id) {
              console.log(
                `Approved RECONCILIATION_APPROVAL request with van_inventory_id detected: requestId=${result.request.id}, vanInventoryId=${reqData.van_inventory_id}`
              );
              const { vanInventoryController } = await import(
                '../controllers/vanInventory.controller'
              );
              await vanInventoryController.processApprovedVanInventoryStock(
                Number(reqData.van_inventory_id),
                userId,
                reqData
              );
              console.log(
                `Completed stock processing for approved RECONCILIATION_APPROVAL request ${reqData.van_inventory_id}`
              );
            }
          } catch (err) {
            console.error(
              'Error processing approved van inventory stock from reconciliation approval:',
              err
            );
          }
        }
        if (result.request.request_type === 'LOCATION_RESET') {
          try {
            const requesterEmail =
              result.request.sfa_d_requests_requester?.email;

            if (requesterEmail) {
              const customer = await getCustomerDetails(
                result.request.reference_id!
              );
              const requestData = JSON.parse(
                result.request.request_data || '{}'
              );

              const template = await generateEmailContent(
                templateKeyMap.locationResetApproved,
                {
                  requester_name:
                    result.request.sfa_d_requests_requester?.name || 'Employee',
                  customer_name: customer?.name || 'N/A',
                  customer_code: customer?.code || 'N/A',
                  new_latitude: requestData.latitude,
                  new_longitude: requestData.longitude,
                  approver_name: req.user?.name || 'System',
                  approval_date: new Date().toLocaleDateString(),
                  company_name: process.env.COMPANY_NAME || 'SFA System',
                }
              );

              await sendEmail({
                to: requesterEmail,
                subject: template.subject,
                html: template.body,
                createdby: userId,
                log_inst: 1,
              });
            } else {
              console.warn(
                'Requester email is missing, skipping location reset approval email'
              );
            }
          } catch (emailError) {
            console.error(
              'Error sending location reset approval email:',
              emailError
            );
          }
        }

        if (
          result.request.request_type === 'ASSET_MOVEMENT_APPROVAL' &&
          result.request.reference_id
        ) {
          try {
            await generateContractOnApproval(result.request.reference_id);
          } catch (contractError) {
            console.error(
              'Error generating contract after approval:',
              contractError
            );
          }
        }

        try {
          const requesterEmail = result.request.sfa_d_requests_requester?.email;

          if (requesterEmail) {
            const template = await generateEmailContent(
              templateKeyMap.requestAccepted,
              {
                employee_name:
                  result.request.sfa_d_requests_requester?.name || 'Employee',
                request_type: formatRequestType(result.request.request_type),
                company_name: 'SFA System',
              }
            );

            console.log('Sending approval email to:', requesterEmail);

            await sendEmail({
              to: requesterEmail,
              subject: template.subject,
              html: template.body,
              createdby: userId,
              log_inst: 1,
            });
          } else {
            console.warn('Requester email is missing, skipping approval email');
          }
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
        }

        return res.status(200).json({
          message: 'Request approved successfully.',
        });
      }
      if (result.status === 'rejected' && 'request' in result) {
        if (result.request.request_type === 'LOCATION_RESET') {
          const customer = await getCustomerDetails(
            result.request.reference_id!
          );
          const requestData = JSON.parse(result.request.request_data || '{}');

          const template = await generateEmailContent(
            templateKeyMap.locationResetRejected,
            {
              requester_name: result.request.sfa_d_requests_requester.name,
              customer_name: customer?.name || 'N/A',
              customer_code: customer?.code || 'N/A',
              new_latitude: requestData.latitude,
              new_longitude: requestData.longitude,
              approver_name: req.user?.name || 'System',
              rejection_date: new Date().toLocaleDateString(),
              rejection_reason: remarks || 'No reason provided',
              company_name: process.env.COMPANY_NAME || 'SFA System',
            }
          );

          await sendEmail({
            to: result.request.sfa_d_requests_requester.email,
            subject: template.subject,
            html: template.body,
            createdby: userId,
            log_inst: 1,
          });
        }
      }

      if (result.request.request_type === 'CUSTOMER_CREATION') {
        const requestData = JSON.parse(result.request.request_data || '{}');
        const customerData = requestData.customer_data;

        if (action === 'A') {
          const createdCustomer = await prisma.customers.findFirst({
            where: { code: customerData.code },
            select: {
              id: true,
              name: true,
              code: true,
              email: true,
              phone_number: true,
            },
          });

          const template = await generateEmailContent(
            templateKeyMap.customerCreationApproved,
            {
              requester_name: result.request.sfa_d_requests_requester.name,
              customer_name: createdCustomer?.name || customerData.name,
              customer_code: createdCustomer?.code || customerData.code,
              customer_email: createdCustomer?.email || customerData.email,
              customer_phone:
                createdCustomer?.phone_number || customerData.phone_number,
              platform_type: requestData.platform_type,
              approver_name: req.user?.name || 'System',
              approval_date: new Date().toLocaleDateString(),
              company_name: process.env.COMPANY_NAME || 'SFA System',
              request_id: result.request.id,
            }
          );

          await sendEmail({
            to: result.request.sfa_d_requests_requester.email,
            subject: template.subject,
            html: template.body,
            createdby: userId,
            log_inst: 1,
          });
        } else if (action === 'R') {
          const template = await generateEmailContent(
            templateKeyMap.customerCreationRejected,
            {
              requester_name: result.request.sfa_d_requests_requester.name,
              customer_name: customerData.name,
              customer_code: customerData.code,
              customer_email: customerData.email,
              customer_phone: customerData.phone_number,
              platform_type: requestData.platform_type,
              approver_name: req.user?.name || 'System',
              rejection_date: new Date().toLocaleDateString(),
              rejection_reason: remarks || 'Customer creation request rejected',
              company_name: process.env.COMPANY_NAME || 'SFA System',
              request_id: result.request.id,
            }
          );

          await sendEmail({
            to: result.request.sfa_d_requests_requester.email,
            subject: template.subject,
            html: template.body,
            createdby: userId,
            log_inst: 1,
          });
        }
      }

      if (result.status === 'rejected' && 'request' in result) {
        const template = await generateEmailContent(
          templateKeyMap.requestRejected,
          {
            employee_name: result.request.sfa_d_requests_requester.name,
            request_type: formatRequestType(result.request.request_type),
            remarks: remarks || 'No reason provided',
            company_name: 'SFA System',
          }
        );

        await sendEmail({
          to: result.request.sfa_d_requests_requester.email,
          subject: template.subject,
          html: template.body,
          createdby: userId,
          log_inst: 1,
        });

        return res.status(200).json({
          message: 'Request rejected successfully',
        });
      }

      if (result.status === 'fully_approved' && 'request' in result) {
        const template = await generateEmailContent(
          templateKeyMap.requestAccepted,
          {
            employee_name: result.request.sfa_d_requests_requester.name,
            request_type: formatRequestType(result.request.request_type),
            company_name: 'SFA System',
          }
        );

        await sendEmail({
          to: result.request.sfa_d_requests_requester.email,
          subject: template.subject,
          html: template.body,
          createdby: userId,
          log_inst: 1,
        });

        return res.status(200).json({
          message: 'Request approved successfully.',
        });
      }

      if (
        result.status === 'next_level' &&
        'request' in result &&
        result.nextApprover
      ) {
        const template = await generateEmailContent(
          templateKeyMap.notifyNextApprover,
          {
            approver_name:
              result.nextApprover.sfa_d_requests_approvals_approver.name,
            previous_approver: 'Previous Approver',
            request_type: formatRequestType(result.request.request_type),
            action: 'approved',
            company_name: 'SFA System',
          }
        );

        await sendEmail({
          to: result.nextApprover.sfa_d_requests_approvals_approver.email,
          subject: template.subject,
          html: template.body,
          createdby: userId,
          log_inst: 1,
        });

        return res.status(200).json({
          message: 'Request approved and escalated to next approver',
        });
      }

      res.status(200).json({
        message: 'Action processed successfully',
      });
    } catch (error: any) {
      console.error('Take Action Error:', error);
      if (error.message.includes('Cannot approve')) {
        return res.status(400).json({
          message: error.message,
        });
      }

      res.status(500).json({
        message: 'Failed to process action',
        error: error.message,
      });
    }
  },

  async getRequestsByUsers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10, status, search, request_type } = req.query;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const approvalWhere: any = {
        approver_id: userId,
      };

      if (status && status !== 'all') {
        approvalWhere.status = status as string;
      }

      const myApprovals = await prisma.sfa_d_request_approvals.findMany({
        where: approvalWhere,
        include: {
          sfa_d_requests_approvals_request: {
            include: {
              sfa_d_requests_requester: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          sfa_d_requests_approvals_approver: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          createdate: 'desc',
        },
      });

      const requestIds = myApprovals.map(approval => approval.request_id);

      const previousPendingApprovals =
        await prisma.sfa_d_request_approvals.findMany({
          where: {
            request_id: { in: requestIds },
            status: 'P',
          },
          select: {
            request_id: true,
            sequence: true,
          },
        });

      const pendingSequencesMap = new Map<number, number[]>();
      previousPendingApprovals.forEach(approval => {
        if (!pendingSequencesMap.has(approval.request_id)) {
          pendingSequencesMap.set(approval.request_id, []);
        }
        pendingSequencesMap.get(approval.request_id)!.push(approval.sequence);
      });

      const filteredApprovals = myApprovals.filter(approval => {
        const pendingSequences =
          pendingSequencesMap.get(approval.request_id) || [];
        const hasPreviousPending = pendingSequences.some(
          seq => seq < approval.sequence
        );
        return !hasPreviousPending;
      });

      let requests = await Promise.all(
        filteredApprovals.map(async approval => {
          const request = approval.sfa_d_requests_approvals_request;

          const referenceDetails = await getRequestDetailsByType(
            request.request_type,
            request.reference_id,
            request.request_data
          );

          return {
            id: request.id,
            requester_id: request.requester_id,
            request_type: request.request_type,
            request_data: request.request_data,
            status: request.status,
            reference_id: request.reference_id,
            overall_status: request.overall_status,
            createdate: request.createdate,
            createdby: request.createdby,
            updatedate: request.updatedate,
            updatedby: request.updatedby,
            log_inst: request.log_inst,
            requester: request.sfa_d_requests_requester,
            reference_details: referenceDetails,
            approvals: [
              {
                id: approval.id,
                sequence: approval.sequence,
                status: approval.status,
                remarks: approval.remarks,
                approver: approval.sfa_d_requests_approvals_approver,
              },
            ],
          };
        })
      );

      if (request_type && request_type !== 'all') {
        requests = requests.filter(
          req => req.request_type === (request_type as string)
        );
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        requests = requests.filter(
          req =>
            req.request_type?.toLowerCase().includes(searchLower) ||
            req.requester?.name?.toLowerCase().includes(searchLower) ||
            req.reference_details?.order_number
              ?.toLowerCase()
              .includes(searchLower) ||
            req.reference_details?.customer_name
              ?.toLowerCase()
              .includes(searchLower)
        );
      }

      const total = requests.length;
      const paginatedData = requests.slice(skip, skip + limitNum);

      const pendingCount = requests.filter(
        req => (req.approvals?.[0]?.status || req.status)?.toUpperCase() === 'P'
      ).length;
      const approvedCount = requests.filter(
        req => (req.approvals?.[0]?.status || req.status)?.toUpperCase() === 'A'
      ).length;
      const rejectedCount = requests.filter(
        req => (req.approvals?.[0]?.status || req.status)?.toUpperCase() === 'R'
      ).length;

      res.json({
        message: 'Requests found successfully',
        data: paginatedData,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(total / limitNum),
          total_count: total,
          has_next: skip + limitNum < total,
          has_previous: pageNum > 1,
        },
        stats: {
          total_requests: total,
          pending_requests: pendingCount,
          approved_requests: approvedCount,
          rejected_requests: rejectedCount,
        },
      });
    } catch (error: any) {
      console.error('Get Requests By Users Error:', error);
      res.status(500).json({
        message: 'Failed to retrieve requests',
        error: error.message,
      });
    }
  },
  async getRequestByTypeAndReference(req: Request, res: Response) {
    try {
      const { request_type, reference_id } = req.query;

      const request = await prisma.sfa_d_requests.findFirst({
        where: {
          request_type: request_type as string,
          reference_id: Number(reference_id),
        },
        include: {
          sfa_d_requests_requester: {
            select: { id: true, name: true, email: true },
          },
          sfa_d_requests_approvals_request: {
            select: {
              id: true,
              sequence: true,
              status: true,
              remarks: true,
              sfa_d_requests_approvals_approver: {
                select: { id: true, name: true },
              },
            },
            orderBy: { sequence: 'asc' },
          },
        },
      });

      res.json({
        message: 'Request found successfully',
        data: request ? serializeRequest(request) : null,
      });
    } catch (error: any) {
      console.error('Get Request By Type Error:', error);
      res.status(500).json({
        message: 'Failed to retrieve request',
        error: error.message,
      });
    }
  },
};
