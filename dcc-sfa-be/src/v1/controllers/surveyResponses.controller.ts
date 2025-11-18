import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { deleteFile, uploadFile } from '../../utils/blackbaze';

interface SurveyAnswerSerialized {
  id: number;
  parent_id: number;
  field_id: number;
  answer?: string | null;
  field?: {
    id: number;
    label: string;
    field_type: string;
  } | null;
}

interface SurveyResponseSerialized {
  id: number;
  parent_id: number;
  submitted_by: number;
  customer_id?: number | null;
  submitted_at?: Date | null;
  location?: string | null;
  photo_url?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  survey?: {
    id: number;
    title: string;
    name: string;
    description?: string | null;
  } | null;
  submitted_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
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
  answers?: SurveyAnswerSerialized[] | null;
  survey_response_customer?: {
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
}
const serializeSurveyResponse = (item: any): SurveyResponseSerialized => ({
  id: item.id,
  parent_id: item.parent_id,
  submitted_by: item.submitted_by,
  customer_id: item.customer_id,
  submitted_at: item.submitted_at,
  location: item.location,
  photo_url: item.photo_url,
  is_active: item.is_active,
  createdate: item.createdate,
  createdby: item.createdby,
  updatedate: item.updatedate,
  updatedby: item.updatedby,
  log_inst: item.log_inst,
  survey: item.surveys
    ? {
        id: item.surveys.id,
        title: item.surveys.title,
        name: item.surveys.name,
        description: item.surveys.description,
      }
    : null,
  submitted_user: item.survey_responses_submitted_by_users
    ? {
        id: item.survey_responses_submitted_by_users.id,
        name: item.survey_responses_submitted_by_users.name,
        email: item.survey_responses_submitted_by_users.email,
      }
    : null,
  customer: item.survey_response_customer
    ? {
        id: item.survey_response_customer.id,
        name: item.survey_response_customer.name,
        code: item.survey_response_customer.code,
        type: item.survey_response_customer.type,
        contact_person: item.survey_response_customer.contact_person,
        phone_number: item.survey_response_customer.phone_number,
        email: item.survey_response_customer.email,
        address: item.survey_response_customer.address,
        city: item.survey_response_customer.city,
        state: item.survey_response_customer.state,
        zipcode: item.survey_response_customer.zipcode,
        outstanding_amount: item.survey_response_customer.outstanding_amount,
        credit_limit: item.survey_response_customer.credit_limit,
        is_active: item.survey_response_customer.is_active,
      }
    : null,
  answers:
    item.survey_answer_responses?.map((ans: any) => ({
      id: ans.id,
      parent_id: ans.parent_id,
      field_id: ans.field_id,
      answer: ans.answer,
      field: ans.survey_fields
        ? {
            id: ans.survey_fields.id,
            name: ans.survey_fields.label || ans.survey_fields.name,
            type: ans.survey_fields.field_type || ans.survey_fields.type,
          }
        : null,
    })) || [],
  survey_response_customer: item.survey_response_customer
    ? {
        id: item.survey_response_customer.id,
        name: item.survey_response_customer.name,
        code: item.survey_response_customer.code,
        type: item.survey_response_customer.type,
        contact_person: item.survey_response_customer.contact_person,
        phone_number: item.survey_response_customer.phone_number,
        email: item.survey_response_customer.email,
        address: item.survey_response_customer.address,
        city: item.survey_response_customer.city,
        state: item.survey_response_customer.state,
        zipcode: item.survey_response_customer.zipcode,
        outstanding_amount: item.survey_response_customer.outstanding_amount,
        credit_limit: item.survey_response_customer.credit_limit,
        is_active: item.survey_response_customer.is_active,
      }
    : null,
});
export const surveyResponseController = {
  // async createOrUpdateSurveyResponse(req: any, res: any) {
  //   const data = req.body;
  //   const userId = req.user?.id || 1;

  //   let photoPath: string | null = null;

  //   let answerItems = [];
  //   if (typeof data.answers === 'string') {
  //     try {
  //       answerItems = JSON.parse(data.answers);
  //     } catch (e) {
  //       answerItems = [];
  //     }
  //   } else {
  //     answerItems = data.survey_answers || data.answers || [];
  //   }

  //   let responseId = data.id;

  //   try {
  //     let existingPhotoPath: string | null = null;

  //     if (responseId) {
  //       const existingResponse = await prisma.survey_responses.findUnique({
  //         where: { id: Number(responseId) },
  //         select: { photo_url: true },
  //       });
  //       existingPhotoPath = existingResponse?.photo_url || null;
  //     }

  //     if (req.file) {
  //       const fileName = `survey-responses/${Date.now()}-${req.file.originalname}`;
  //       photoPath = await uploadFile(
  //         req.file.buffer,
  //         fileName,
  //         req.file.mimetype
  //       );

  //       if (existingPhotoPath && responseId) {
  //         await deleteFile(existingPhotoPath);
  //       }
  //     } else if (responseId && existingPhotoPath) {
  //       photoPath = existingPhotoPath;
  //     }

  //     const result = await prisma.$transaction(
  //       async tx => {
  //         let surveyResponse;
  //         let isUpdate = false;

  //         if (responseId) {
  //           const existing = await tx.survey_responses.findUnique({
  //             where: { id: Number(responseId) },
  //           });
  //           if (existing) isUpdate = true;
  //         }

  //         if (!data.parent_id) {
  //           throw new Error('Invalid parent_id (survey): missing');
  //         }
  //         const surveyExists = await tx.surveys.findUnique({
  //           where: { id: Number(data.parent_id) },
  //         });
  //         if (!surveyExists)
  //           throw new Error(`Invalid parent_id: ${data.parent_id}`);

  //         if (!data.submitted_by) {
  //           throw new Error('Invalid submitted_by: missing');
  //         }
  //         const userExists = await tx.users.findUnique({
  //           where: { id: Number(data.submitted_by) },
  //         });
  //         if (!userExists)
  //           throw new Error(`Invalid submitted_by: ${data.submitted_by}`);

  //         if (Array.isArray(answerItems) && answerItems.length > 0) {
  //           for (const ans of answerItems) {
  //             if (!ans.field_id) {
  //               throw new Error(
  //                 'Invalid field_id in answers: missing field_id'
  //               );
  //             }
  //             const fieldExists = await tx.survey_fields.findUnique({
  //               where: { id: Number(ans.field_id) },
  //             });
  //             if (!fieldExists)
  //               throw new Error(`Invalid field_id in answers: ${ans.field_id}`);
  //           }
  //         }

  //         const payload = {
  //           parent_id: Number(data.parent_id),
  //           submitted_by: Number(data.submitted_by),
  //           submitted_at:
  //             data.submitted_at && data.submitted_at.trim() !== ''
  //               ? new Date(data.submitted_at)
  //               : new Date(),
  //           location: data.location || null,
  //           photo_url: photoPath,
  //           is_active: data.is_active || 'Y',
  //         };

  //         if (isUpdate && responseId) {
  //           surveyResponse = await tx.survey_responses.update({
  //             where: { id: Number(responseId) },
  //             data: {
  //               ...payload,
  //               updatedby: userId,
  //               updatedate: new Date(),
  //               log_inst: { increment: 1 },
  //             },
  //           });
  //         } else {
  //           surveyResponse = await tx.survey_responses.create({
  //             data: {
  //               ...payload,
  //               createdby: userId,
  //               createdate: new Date(),
  //               log_inst: 1,
  //             },
  //           });
  //           responseId = surveyResponse.id;
  //         }

  //         const processedAnswerIds: number[] = [];

  //         if (Array.isArray(answerItems) && answerItems.length > 0) {
  //           const answersToCreate: any[] = [];
  //           const answersToUpdate: { id: number; data: any }[] = [];

  //           for (const ans of answerItems) {
  //             const answerData = {
  //               parent_id: surveyResponse.id,
  //               field_id: Number(ans.field_id),
  //               answer: ans.answer || null,
  //             };

  //             if (ans.id) {
  //               const existingAnswer = await tx.survey_answers.findFirst({
  //                 where: {
  //                   id: Number(ans.id),
  //                   parent_id: surveyResponse.id,
  //                 },
  //               });

  //               if (existingAnswer) {
  //                 answersToUpdate.push({
  //                   id: Number(ans.id),
  //                   data: answerData,
  //                 });
  //                 processedAnswerIds.push(Number(ans.id));
  //               } else {
  //                 answersToCreate.push(answerData);
  //               }
  //             } else {
  //               answersToCreate.push(answerData);
  //             }
  //           }

  //           if (answersToCreate.length > 0) {
  //             const created = await tx.survey_answers.createMany({
  //               data: answersToCreate,
  //             });

  //             if (created.count > 0) {
  //               const newAnswers = await tx.survey_answers.findMany({
  //                 where: { parent_id: surveyResponse.id },
  //                 orderBy: { id: 'desc' },
  //                 take: created.count,
  //               });
  //               processedAnswerIds.push(...newAnswers.map(a => a.id));
  //             }
  //           }

  //           for (const { id, data } of answersToUpdate) {
  //             await tx.survey_answers.update({
  //               where: { id },
  //               data,
  //             });
  //           }

  //           if (isUpdate) {
  //             await tx.survey_answers.deleteMany({
  //               where: {
  //                 parent_id: surveyResponse.id,
  //                 ...(processedAnswerIds.length > 0
  //                   ? { id: { notIn: processedAnswerIds } }
  //                   : {}),
  //               },
  //             });
  //           }
  //         } else if (isUpdate) {
  //           await tx.survey_answers.deleteMany({
  //             where: { parent_id: surveyResponse.id },
  //           });
  //         }

  //         const finalResponse = await tx.survey_responses.findUnique({
  //           where: { id: surveyResponse.id },
  //           include: {
  //             surveys: true,
  //             survey_responses_submitted_by_users: true,
  //             survey_answer_responses: {
  //               include: {
  //                 survey_fields: true,
  //               },
  //             },
  //           },
  //         });

  //         return { finalResponse, wasUpdate: isUpdate };
  //       },
  //       {
  //         maxWait: 10000,
  //         timeout: 20000,
  //       }
  //     );

  //     const finalResponse = (result as any).finalResponse;
  //     const wasUpdate = (result as any).wasUpdate === true;

  //     res.status(wasUpdate ? 200 : 201).json({
  //       message: wasUpdate
  //         ? 'Survey response updated successfully'
  //         : 'Survey response created successfully',
  //       data: serializeSurveyResponse(finalResponse),
  //     });
  //   } catch (error: any) {
  //     console.error('Create/Update Survey Response Error:', error);

  //     if (req.file && photoPath) {
  //       try {
  //         await deleteFile(photoPath);
  //       } catch (deleteError) {
  //         console.error(
  //           'Error deleting file after failed transaction:',
  //           deleteError
  //         );
  //       }
  //     }

  //     if (error.message && error.message.startsWith('Invalid')) {
  //       return res.status(400).json({ message: error.message });
  //     }
  //     if (error.message && error.message.includes('missing')) {
  //       return res.status(400).json({ message: error.message });
  //     }

  //     return res.status(500).json({
  //       message: 'Failed to process survey response',
  //       error: error.message,
  //     });
  //   }
  // },

  async createOrUpdateSurveyResponse(req: any, res: any) {
    const data = req.body;
    const userId = req.user?.id || 1;

    let photoPath: string | null = null;

    try {
      const isBulk = Array.isArray(data.responses);

      if (isBulk) {
        return await surveyResponseController.createBulkSurveyResponses(
          req,
          res
        );
      }

      let answerItems = [];
      if (typeof data.answers === 'string') {
        try {
          answerItems = JSON.parse(data.answers);
        } catch (e) {
          answerItems = [];
        }
      } else {
        answerItems = data.survey_answers || data.answers || [];
      }

      let responseId = data.id;

      let existingPhotoPath: string | null = null;

      if (responseId) {
        const existingResponse = await prisma.survey_responses.findUnique({
          where: { id: Number(responseId) },
          select: { photo_url: true },
        });
        existingPhotoPath = existingResponse?.photo_url || null;
      }

      if (req.file) {
        const fileName = `survey-responses/${Date.now()}-${req.file.originalname}`;
        photoPath = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );

        if (existingPhotoPath && responseId) {
          await deleteFile(existingPhotoPath);
        }
      } else if (responseId && existingPhotoPath) {
        photoPath = existingPhotoPath;
      }

      const result = await prisma.$transaction(
        async tx => {
          let surveyResponse;
          let isUpdate = false;

          if (responseId) {
            const existing = await tx.survey_responses.findUnique({
              where: { id: Number(responseId) },
            });
            if (existing) isUpdate = true;
          }

          if (!data.parent_id) {
            throw new Error('Invalid parent_id (survey): missing');
          }
          const surveyExists = await tx.surveys.findUnique({
            where: { id: Number(data.parent_id) },
          });
          if (!surveyExists)
            throw new Error(`Invalid parent_id: ${data.parent_id}`);

          if (!data.submitted_by) {
            throw new Error('Invalid submitted_by: missing');
          }
          const userExists = await tx.users.findUnique({
            where: { id: Number(data.submitted_by) },
          });
          if (!userExists)
            throw new Error(`Invalid submitted_by: ${data.submitted_by}`);

          if (Array.isArray(answerItems) && answerItems.length > 0) {
            for (const ans of answerItems) {
              if (!ans.field_id) {
                throw new Error(
                  'Invalid field_id in answers: missing field_id'
                );
              }
              const fieldExists = await tx.survey_fields.findUnique({
                where: { id: Number(ans.field_id) },
              });
              if (!fieldExists)
                throw new Error(`Invalid field_id in answers: ${ans.field_id}`);
            }
          }

          const payload = {
            parent_id: Number(data.parent_id),
            customer_id: data.customer_id ? Number(data.customer_id) : null,
            submitted_by: Number(data.submitted_by),
            submitted_at:
              data.submitted_at && data.submitted_at.trim() !== ''
                ? new Date(data.submitted_at)
                : new Date(),
            location: data.location || null,
            photo_url: photoPath,
            is_active: data.is_active || 'Y',
          };

          if (isUpdate && responseId) {
            surveyResponse = await tx.survey_responses.update({
              where: { id: Number(responseId) },
              data: {
                ...payload,
                updatedby: userId,
                updatedate: new Date(),
                log_inst: { increment: 1 },
              },
            });
          } else {
            surveyResponse = await tx.survey_responses.create({
              data: {
                ...payload,
                createdby: userId,
                createdate: new Date(),
                log_inst: 1,
              },
            });
            responseId = surveyResponse.id;
          }

          const processedAnswerIds: number[] = [];

          if (Array.isArray(answerItems) && answerItems.length > 0) {
            const answersToCreate: any[] = [];
            const answersToUpdate: { id: number; data: any }[] = [];

            for (const ans of answerItems) {
              const answerData = {
                parent_id: surveyResponse.id,
                field_id: Number(ans.field_id),
                answer: ans.answer || null,
              };

              if (ans.id) {
                const existingAnswer = await tx.survey_answers.findFirst({
                  where: {
                    id: Number(ans.id),
                    parent_id: surveyResponse.id,
                  },
                });

                if (existingAnswer) {
                  answersToUpdate.push({
                    id: Number(ans.id),
                    data: answerData,
                  });
                  processedAnswerIds.push(Number(ans.id));
                } else {
                  answersToCreate.push(answerData);
                }
              } else {
                answersToCreate.push(answerData);
              }
            }

            if (answersToCreate.length > 0) {
              const created = await tx.survey_answers.createMany({
                data: answersToCreate,
              });

              if (created.count > 0) {
                const newAnswers = await tx.survey_answers.findMany({
                  where: { parent_id: surveyResponse.id },
                  orderBy: { id: 'desc' },
                  take: created.count,
                });
                processedAnswerIds.push(...newAnswers.map(a => a.id));
              }
            }

            for (const { id, data } of answersToUpdate) {
              await tx.survey_answers.update({
                where: { id },
                data,
              });
            }

            if (isUpdate) {
              await tx.survey_answers.deleteMany({
                where: {
                  parent_id: surveyResponse.id,
                  ...(processedAnswerIds.length > 0
                    ? { id: { notIn: processedAnswerIds } }
                    : {}),
                },
              });
            }
          } else if (isUpdate) {
            await tx.survey_answers.deleteMany({
              where: { parent_id: surveyResponse.id },
            });
          }

          const finalResponse = await tx.survey_responses.findUnique({
            where: { id: surveyResponse.id },
            include: {
              surveys: true,
              survey_response_customer: true,
              survey_responses_submitted_by_users: true,
              survey_answer_responses: {
                include: {
                  survey_fields: true,
                },
              },
            },
          });

          return { finalResponse, wasUpdate: isUpdate };
        },
        {
          maxWait: 10000,
          timeout: 20000,
        }
      );

      const finalResponse = (result as any).finalResponse;
      const wasUpdate = (result as any).wasUpdate === true;

      res.status(wasUpdate ? 200 : 201).json({
        message: wasUpdate
          ? 'Survey response updated successfully'
          : 'Survey response created successfully',
        data: serializeSurveyResponse(finalResponse),
      });
    } catch (error: any) {
      console.error('Create/Update Survey Response Error:', error);

      if (req.file && photoPath) {
        try {
          await deleteFile(photoPath);
        } catch (deleteError) {
          console.error(
            'Error deleting file after failed transaction:',
            deleteError
          );
        }
      }

      if (error.message && error.message.startsWith('Invalid')) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message && error.message.includes('missing')) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: 'Failed to process survey response',
        error: error.message,
      });
    }
  },

  async createBulkSurveyResponses(req: any, res: any) {
    const { responses } = req.body;
    const userId = req.user?.id || 1;

    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        message:
          'Invalid bulk request: responses array is required and must not be empty',
      });
    }

    try {
      const results = await prisma.$transaction(
        async tx => {
          const createdResponses = [];
          const errors = [];

          for (let i = 0; i < responses.length; i++) {
            const responseData = responses[i];

            try {
              if (!responseData.parent_id) {
                throw new Error(
                  `Response ${i + 1}: Invalid parent_id (survey): missing`
                );
              }
              const surveyExists = await tx.surveys.findUnique({
                where: { id: Number(responseData.parent_id) },
              });
              if (!surveyExists) {
                throw new Error(
                  `Response ${i + 1}: Invalid parent_id: ${responseData.parent_id}`
                );
              }

              if (!responseData.submitted_by) {
                throw new Error(
                  `Response ${i + 1}: Invalid submitted_by: missing`
                );
              }
              const userExists = await tx.users.findUnique({
                where: { id: Number(responseData.submitted_by) },
              });
              if (!userExists) {
                throw new Error(
                  `Response ${i + 1}: Invalid submitted_by: ${responseData.submitted_by}`
                );
              }

              if (responseData.customer_id) {
                const customerExists = await tx.customers.findUnique({
                  where: { id: Number(responseData.customer_id) },
                });
                if (!customerExists) {
                  throw new Error(
                    `Response ${i + 1}: Invalid customer_id: ${responseData.customer_id}`
                  );
                }
              }

              let answerItems = [];
              if (typeof responseData.answers === 'string') {
                try {
                  answerItems = JSON.parse(responseData.answers);
                } catch (e) {
                  answerItems = [];
                }
              } else {
                answerItems = responseData.answers || [];
              }

              if (Array.isArray(answerItems) && answerItems.length > 0) {
                for (const ans of answerItems) {
                  if (!ans.field_id) {
                    throw new Error(
                      `Response ${i + 1}: Invalid field_id in answers: missing field_id`
                    );
                  }
                  const fieldExists = await tx.survey_fields.findUnique({
                    where: { id: Number(ans.field_id) },
                  });
                  if (!fieldExists) {
                    throw new Error(
                      `Response ${i + 1}: Invalid field_id in answers: ${ans.field_id}`
                    );
                  }
                }
              }

              const surveyResponse = await tx.survey_responses.create({
                data: {
                  parent_id: Number(responseData.parent_id),
                  submitted_by: Number(responseData.submitted_by),
                  customer_id: responseData.customer_id
                    ? Number(responseData.customer_id)
                    : null, // ADD THIS
                  submitted_at:
                    responseData.submitted_at &&
                    responseData.submitted_at.trim() !== ''
                      ? new Date(responseData.submitted_at)
                      : new Date(),
                  location: responseData.location || null,
                  photo_url: responseData.photo_url || null,
                  is_active: responseData.is_active || 'Y',
                  createdby: userId,
                  createdate: new Date(),
                  log_inst: 1,
                },
              });

              if (Array.isArray(answerItems) && answerItems.length > 0) {
                const answersToCreate = answerItems.map((ans: any) => ({
                  parent_id: surveyResponse.id,
                  field_id: Number(ans.field_id),
                  answer: ans.answer || null,
                }));

                await tx.survey_answers.createMany({
                  data: answersToCreate,
                });
              }

              const finalResponse = await tx.survey_responses.findUnique({
                where: { id: surveyResponse.id },
                include: {
                  surveys: true,
                  survey_responses_submitted_by_users: true,
                  survey_response_customer: true,
                  survey_answer_responses: {
                    include: {
                      survey_fields: true,
                    },
                  },
                },
              });

              createdResponses.push(serializeSurveyResponse(finalResponse));
            } catch (error: any) {
              errors.push({
                index: i,
                data: responseData,
                error: error.message,
              });
            }
          }

          return { createdResponses, errors };
        },
        {
          maxWait: 30000,
          timeout: 60000,
        }
      );

      const { createdResponses, errors } = results;

      if (errors.length > 0 && createdResponses.length === 0) {
        return res.status(400).json({
          message: 'All bulk survey responses failed',
          errors,
        });
      }

      res.status(201).json({
        message: `Bulk survey responses processed: ${createdResponses.length} created, ${errors.length} failed`,
        data: createdResponses,
        ...(errors.length > 0 && { errors }),
        summary: {
          total: responses.length,
          created: createdResponses.length,
          failed: errors.length,
        },
      });
    } catch (error: any) {
      console.error('Create Bulk Survey Responses Error:', error);

      if (error.message && error.message.startsWith('Invalid')) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: 'Failed to process bulk survey responses',
        error: error.message,
      });
    }
  },
  async getAllSurveyResponses(req: any, res: any) {
    try {
      const {
        page,
        limit,
        search,
        status,
        survey_id,
        submitted_by,
        customer_id,
      } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';
      const statusLower = status ? (status as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { surveys: { title: { contains: searchLower } } },
            {
              survey_responses_submitted_by_users: {
                name: { contains: searchLower },
              },
            },
            {
              survey_response_customer: {
                name: { contains: searchLower },
              },
            },
          ],
        }),
        ...(statusLower === 'active' && { is_active: 'Y' }),
        ...(statusLower === 'inactive' && { is_active: 'N' }),
        ...(survey_id && { parent_id: parseInt(survey_id as string, 10) }),
        ...(submitted_by && {
          submitted_by: parseInt(submitted_by as string, 10),
        }),
        ...(customer_id && {
          customer_id: parseInt(customer_id as string, 10),
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.survey_responses,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          surveys: true,
          survey_responses_submitted_by_users: true,
          survey_response_customer: true,
          survey_answer_responses: {
            include: {
              survey_fields: true,
            },
          },
        },
      });

      const [
        totalResponses,
        activeResponses,
        inactiveResponses,
        responsesThisMonth,
      ] = await Promise.all([
        prisma.survey_responses.count(),
        prisma.survey_responses.count({ where: { is_active: 'Y' } }),
        prisma.survey_responses.count({ where: { is_active: 'N' } }),
        prisma.survey_responses.count({
          where: {
            createdate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lt: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                1
              ),
            },
          },
        }),
      ]);

      const serializedData = data.map((r: any) => serializeSurveyResponse(r));

      res.success(
        'Survey responses fetched successfully',
        serializedData,
        200,
        pagination,
        {
          total_records: totalResponses,
          active_records: activeResponses,
          inactive_records: inactiveResponses,
          records_this_month: responsesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Get Survey Responses Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSurveyResponseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await prisma.survey_responses.findUnique({
        where: { id: Number(id) },
        include: {
          surveys: true,
          survey_responses_submitted_by_users: true,
          survey_response_customer: true,
          survey_answer_responses: {
            include: {
              survey_fields: true,
            },
          },
        },
      });

      if (!record)
        return res.status(404).json({ message: 'Survey response not found' });

      res.json({
        message: 'Survey response fetched successfully',
        data: serializeSurveyResponse(record),
      });
    } catch (error: any) {
      console.error('Get Survey Response Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSurveyResponse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.survey_responses.findUnique({
        where: { id: Number(id) },
      });

      if (!existing)
        return res.status(404).json({ message: 'Survey response not found' });

      if (existing.photo_url) {
        try {
          await deleteFile(existing.photo_url);
        } catch (error) {
          console.error('Error deleting photo from Backblaze:', error);
        }
      }

      await prisma.survey_responses.delete({ where: { id: Number(id) } });

      res.json({ message: 'Survey response deleted successfully' });
    } catch (error: any) {
      console.error('Delete Survey Response Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSurveyAnswers(req: Request, res: Response) {
    try {
      const { responseId } = req.params;

      const answers = await prisma.survey_answers.findMany({
        where: { parent_id: Number(responseId) },
        include: {
          survey_fields: true,
        },
        orderBy: { id: 'asc' },
      });

      res.json({
        success: true,
        message: 'Survey answers retrieved successfully',
        data: answers,
      });
    } catch (error: any) {
      console.error('Get Survey Answers Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
