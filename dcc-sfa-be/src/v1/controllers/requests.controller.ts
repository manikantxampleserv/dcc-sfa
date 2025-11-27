import { Request, Response } from 'express';
import { generateEmailContent } from '../../utils/emailTemplates';
import templateKeyMap from '../../utils/templateKeyMap';
import { sendEmail } from '../../utils/mailer';
import getRequestDetailsByType from '../../utils/getDetails';
import { paginate } from '../../utils/paginate';
import { requestTypes } from '../../mock/requestTypes';
import prisma from '../../configs/prisma.client';

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
          }
        : null,
    })) || [],
});

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

export const createRequest = async (data: {
  requester_id: number;
  request_type: string;
  reference_id?: number | null;
  request_data?: string | null;
  createdby: number;
  log_inst: number;
}) => {
  try {
    console.log('Creating approval request:', data);

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

    console.log(' Request created, ID:', request.id);

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
      console.log(` No approval workflow defined for '${data.request_type}'`);
      return request;
    }

    console.log(` Using ${workflowType} workflow for ${data.request_type}`);

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

    console.log(`Created ${approvalsToInsert.length} approval steps`);

    const request_detail = await getRequestDetailsByType(
      data.request_type,
      data.reference_id || null
    );

    const firstApprover = workflowSteps[0];
    if (firstApprover?.approval_work_flow_approver?.email) {
      const template = await generateEmailContent(
        templateKeyMap.notifyApprover,
        {
          approver_name: firstApprover.approval_work_flow_approver.name,
          requester_name: requester.name,
          request_type: data.request_type.replace(/_/g, ' '),
          company_name: 'SFA System',
          request_detail,
        }
      );

      await sendEmail({
        to: firstApprover.approval_work_flow_approver.email,
        subject: template.subject,
        html: template.body,
        createdby: data.createdby,
        log_inst: data.log_inst,
      });

      console.log(
        `Email Sent ${firstApprover.approval_work_flow_approver.email}`
      );
    }

    return request;
  } catch (error: any) {
    console.error('Error creating approval request:', error);
    throw error;
  }
};
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
                    select: { id: true, name: true, email: true },
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
                  request_detail: JSON.stringify(request_detail),
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
            select: { id: true, sequence: true, status: true },
          },
        },
      });

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
        data: data.map((request: any) => serializeRequest(request)),
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
                select: { id: true, name: true, email: true },
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

  // async takeActionOnRequest(req: Request, res: Response) {
  //   const { request_id, approval_id, action, remarks } = req.body;
  //   const userId = req.user?.id || 1;

  //   try {
  //     if (!['A', 'R'].includes(action)) {
  //       return res.status(400).json({
  //         message: 'Invalid action. Must be A (Approve) or R (Reject)',
  //       });
  //     }

  //     const result = await prisma.$transaction(
  //       async tx => {
  //         const request = await tx.sfa_d_requests.findUnique({
  //           where: { id: Number(request_id) },
  //           include: {
  //             sfa_d_requests_requester: {
  //               select: { id: true, name: true, email: true },
  //             },
  //           },
  //         });

  //         if (!request) {
  //           throw new Error('Request not found');
  //         }

  //         const currentApproval = await tx.sfa_d_request_approvals.findUnique({
  //           where: { id: Number(approval_id) },
  //           include: {
  //             sfa_d_requests_approvals_approver: {
  //               select: { id: true, name: true, email: true },
  //             },
  //           },
  //         });

  //         if (!currentApproval) {
  //           throw new Error('Approval not found');
  //         }

  //         if (currentApproval.status !== 'P') {
  //           throw new Error('This approval has already been processed');
  //         }

  //         await tx.sfa_d_request_approvals.update({
  //           where: { id: Number(approval_id) },
  //           data: {
  //             status: action,
  //             remarks,
  //             action_at: new Date(),
  //             updatedby: userId,
  //             updatedate: new Date(),
  //           },
  //         });

  //         if (action === 'R') {
  //           await tx.sfa_d_requests.update({
  //             where: { id: Number(request_id) },
  //             data: {
  //               status: 'R',
  //               overall_status: 'REJECTED',
  //               updatedby: userId,
  //               updatedate: new Date(),
  //             },
  //           });

  //           if (
  //             request.request_type === 'ORDER_APPROVAL' &&
  //             request.reference_id
  //           ) {
  //             await tx.orders.update({
  //               where: { id: request.reference_id },
  //               data: {
  //                 approval_status: 'rejected',
  //                 status: 'rejected',
  //                 updatedby: userId,
  //                 updatedate: new Date(),
  //               },
  //             });
  //             console.log(
  //               ` Order ${request.reference_id} status updated to REJECTED`
  //             );
  //           }

  //           return { status: 'rejected', request };
  //         }

  //         const nextApprover = await tx.sfa_d_request_approvals.findFirst({
  //           where: {
  //             request_id: Number(request_id),
  //             status: 'P',
  //           },
  //           orderBy: { sequence: 'asc' },
  //           include: {
  //             sfa_d_requests_approvals_approver: {
  //               select: { id: true, name: true, email: true },
  //             },
  //           },
  //         });

  //         if (!nextApprover) {
  //           await tx.sfa_d_requests.update({
  //             where: { id: Number(request_id) },
  //             data: {
  //               status: 'A',
  //               overall_status: 'APPROVED',
  //               updatedby: userId,
  //               updatedate: new Date(),
  //             },
  //           });

  //           if (
  //             request.request_type === 'ORDER_APPROVAL' &&
  //             request.reference_id
  //           ) {
  //             await tx.orders.update({
  //               where: { id: request.reference_id },
  //               data: {
  //                 approval_status: 'approved',
  //                 status: 'approved',
  //                 approved_by: userId,
  //                 approved_at: new Date(),
  //                 updatedby: userId,
  //                 updatedate: new Date(),
  //               },
  //             });
  //             console.log(
  //               `Order ${request.reference_id} status updated to APPROVED`
  //             );
  //           }

  //           return { status: 'fully_approved', request };
  //         }

  //         return { status: 'next_level', request, nextApprover };
  //       },
  //       {
  //         maxWait: 10000,
  //         timeout: 20000,
  //       }
  //     );

  //     // ========================================
  //     // SEND EMAILS
  //     // ========================================

  //     if (result.status === 'rejected') {
  //       const template = await generateEmailContent(
  //         templateKeyMap.requestRejected,
  //         {
  //           employee_name: result.request.sfa_d_requests_requester.name,
  //           request_type: formatRequestType(result.request.request_type),
  //           remarks: remarks || 'No reason provided',
  //           company_name: 'SFA System',
  //         }
  //       );

  //       await sendEmail({
  //         to: result.request.sfa_d_requests_requester.email,
  //         subject: template.subject,
  //         html: template.body,
  //         createdby: userId,
  //         log_inst: 1,
  //       });

  //       return res.status(200).json({
  //         message: 'Request rejected successfully',
  //       });
  //     }

  //     if (result.status === 'fully_approved') {
  //       const template = await generateEmailContent(
  //         templateKeyMap.requestAccepted,
  //         {
  //           employee_name: result.request.sfa_d_requests_requester.name,
  //           request_type: formatRequestType(result.request.request_type),
  //           company_name: 'SFA System',
  //         }
  //       );

  //       await sendEmail({
  //         to: result.request.sfa_d_requests_requester.email,
  //         subject: template.subject,
  //         html: template.body,
  //         createdby: userId,
  //         log_inst: 1,
  //       });

  //       return res.status(200).json({
  //         message: 'Request approved successfully (All approvals complete)',
  //       });
  //     }

  //     if (result.status === 'next_level' && result.nextApprover) {
  //       const template = await generateEmailContent(
  //         templateKeyMap.notifyNextApprover,
  //         {
  //           approver_name:
  //             result.nextApprover.sfa_d_requests_approvals_approver.name,
  //           previous_approver: 'Previous Approver',
  //           request_type: formatRequestType(result.request.request_type),
  //           action: 'approved',
  //           company_name: 'SFA System',
  //         }
  //       );

  //       await sendEmail({
  //         to: result.nextApprover.sfa_d_requests_approvals_approver.email,
  //         subject: template.subject,
  //         html: template.body,
  //         createdby: userId,
  //         log_inst: 1,
  //       });

  //       return res.status(200).json({
  //         message: 'Request approved and escalated to next approver',
  //       });
  //     }

  //     res.status(200).json({
  //       message: 'Action processed successfully',
  //     });
  //   } catch (error: any) {
  //     console.error('Take Action Error:', error);
  //     res.status(500).json({
  //       message: 'Failed to process action',
  //       error: error.message,
  //     });
  //   }
  // },

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
                  approval_status: 'approved',
                  status: 'approved',
                  approved_by: userId,
                  approved_at: new Date(),
                  updatedby: userId,
                  updatedate: new Date(),
                },
              });
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

      // ========================================
      // SEND EMAILS
      // ========================================

      if (result.status === 'rejected') {
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

      if (result.status === 'fully_approved') {
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
          message: 'Request approved successfully.All',
        });
      }

      if (result.status === 'next_level' && result.nextApprover) {
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

  // async getRequestsByUsers(req: Request, res: Response) {
  //   try {
  //     const userId = req.user?.id;
  //     const { page = 1, limit = 10, status = 'P' } = req.query;

  //     if (!userId) {
  //       return res.status(401).json({ message: 'User not authenticated' });
  //     }

  //     const pageNum = parseInt(page as string);
  //     const limitNum = parseInt(limit as string);
  //     const skip = (pageNum - 1) * limitNum;

  //     const myApprovals = await prisma.sfa_d_request_approvals.findMany({
  //       where: {
  //         approver_id: userId,
  //         status: status as string,
  //       },
  //       include: {
  //         sfa_d_requests_approvals_request: {
  //           include: {
  //             sfa_d_requests_requester: {
  //               select: { id: true, name: true, email: true },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     const filteredApprovals = [];

  //     for (const approval of myApprovals) {
  //       const previousPending = await prisma.sfa_d_request_approvals.findFirst({
  //         where: {
  //           request_id: approval.request_id,
  //           sequence: { lt: approval.sequence },
  //           status: 'P',
  //         },
  //       });

  //       if (!previousPending) {
  //         filteredApprovals.push(approval);
  //       }
  //     }

  //     const requests = filteredApprovals.map(approval => ({
  //       id: approval.sfa_d_requests_approvals_request.id,
  //       requester_id: approval.sfa_d_requests_approvals_request.requester_id,
  //       request_type: approval.sfa_d_requests_approvals_request.request_type,
  //       request_data: approval.sfa_d_requests_approvals_request.request_data,
  //       status: approval.sfa_d_requests_approvals_request.status,
  //       reference_id: approval.sfa_d_requests_approvals_request.reference_id,
  //       overall_status:
  //         approval.sfa_d_requests_approvals_request.overall_status,
  //       createdate: approval.sfa_d_requests_approvals_request.createdate,
  //       createdby: approval.sfa_d_requests_approvals_request.createdby,
  //       updatedate: approval.sfa_d_requests_approvals_request.updatedate,
  //       updatedby: approval.sfa_d_requests_approvals_request.updatedby,
  //       log_inst: approval.sfa_d_requests_approvals_request.log_inst,
  //       requester:
  //         approval.sfa_d_requests_approvals_request.sfa_d_requests_requester,
  //       approvals: [
  //         {
  //           id: approval.id,
  //           sequence: approval.sequence,
  //           status: approval.status,
  //           remarks: approval.remarks,
  //           approver: null,
  //         },
  //       ],
  //     }));

  //     const total = requests.length;
  //     const paginatedData = requests.slice(skip, skip + limitNum);

  //     res.json({
  //       message: 'Requests found successfully',
  //       data: paginatedData,
  //       pagination: {
  //         current_page: pageNum,
  //         total_pages: Math.ceil(total / limitNum),
  //         total_count: total,
  //         has_next: skip + limitNum < total,
  //         has_previous: pageNum > 1,
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error('Get Requests By Users Error:', error);
  //     res.status(500).json({
  //       message: 'Failed to retrieve requests',
  //       error: error.message,
  //     });
  //   }
  // },

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

      // Build where clause for approvals
      const approvalWhere: any = {
        approver_id: userId,
      };

      // Only filter by status if it's provided and not 'all'
      if (status && status !== 'all') {
        approvalWhere.status = status as string;
      }

      // Get all approvals for this user with the specified status
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
        },
        orderBy: {
          createdate: 'desc',
        },
      });

      // Get all request IDs to check for previous pending approvals in bulk
      const requestIds = myApprovals.map(approval => approval.request_id);

      // Fetch all previous pending approvals in one query
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

      // Create a map for quick lookup: request_id -> array of pending sequences
      const pendingSequencesMap = new Map<number, number[]>();
      previousPendingApprovals.forEach(approval => {
        if (!pendingSequencesMap.has(approval.request_id)) {
          pendingSequencesMap.set(approval.request_id, []);
        }
        pendingSequencesMap.get(approval.request_id)!.push(approval.sequence);
      });

      // Filter approvals: only show if no previous pending approval exists
      const filteredApprovals = myApprovals.filter(approval => {
        const pendingSequences =
          pendingSequencesMap.get(approval.request_id) || [];
        const hasPreviousPending = pendingSequences.some(
          seq => seq < approval.sequence
        );
        return !hasPreviousPending;
      });

      // Map to request format with reference details
      let requests = await Promise.all(
        filteredApprovals.map(async approval => {
          const request = approval.sfa_d_requests_approvals_request;

          // Fetch reference details using the utility function
          const referenceDetails = await getRequestDetailsByType(
            request.request_type,
            request.reference_id
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
            reference_details: referenceDetails, // Will be null or the formatted data
            approvals: [
              {
                id: approval.id,
                sequence: approval.sequence,
                status: approval.status,
                remarks: approval.remarks,
                approver: null,
              },
            ],
          };
        })
      );

      // Apply additional filters if provided
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

      // Calculate statistics
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
