// async createOrUpdateSurveyResponse(req: any, res: any) {
//   const data = req.body;
//   const userId = req.user?.id || 1;

//   try {
//     // Check if this is a bulk request
//     const isBulk = Array.isArray(data.responses);

//     if (isBulk) {
//       // Handle bulk responses
//       return await surveyResponseController.createBulkSurveyResponses(req, res);
//     }

//     // Single response logic (existing functionality)
//     let photoPath: string | null = null;

//     let answerItems = [];
//     if (typeof data.answers === 'string') {
//       try {
//         answerItems = JSON.parse(data.answers);
//       } catch (e) {
//         answerItems = [];
//       }
//     } else {
//       answerItems = data.survey_answers || data.answers || [];
//     }

//     let responseId = data.id;

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

// async createBulkSurveyResponses(req: any, res: any) {
//   const { responses } = req.body;
//   const userId = req.user?.id || 1;

//   if (!Array.isArray(responses) || responses.length === 0) {
//     return res.status(400).json({
//       message: 'Invalid bulk request: responses array is required and must not be empty',
//     });
//   }

//   try {
//     const results = await prisma.$transaction(
//       async tx => {
//         const createdResponses = [];
//         const errors = [];

//         for (let i = 0; i < responses.length; i++) {
//           const responseData = responses[i];

//           try {
//             // Validate parent_id (survey)
//             if (!responseData.parent_id) {
//               throw new Error(`Response ${i + 1}: Invalid parent_id (survey): missing`);
//             }
//             const surveyExists = await tx.surveys.findUnique({
//               where: { id: Number(responseData.parent_id) },
//             });
//             if (!surveyExists) {
//               throw new Error(`Response ${i + 1}: Invalid parent_id: ${responseData.parent_id}`);
//             }

//             // Validate submitted_by
//             if (!responseData.submitted_by) {
//               throw new Error(`Response ${i + 1}: Invalid submitted_by: missing`);
//             }
//             const userExists = await tx.users.findUnique({
//               where: { id: Number(responseData.submitted_by) },
//             });
//             if (!userExists) {
//               throw new Error(`Response ${i + 1}: Invalid submitted_by: ${responseData.submitted_by}`);
//             }

//             // Parse answers
//             let answerItems = [];
//             if (typeof responseData.answers === 'string') {
//               try {
//                 answerItems = JSON.parse(responseData.answers);
//               } catch (e) {
//                 answerItems = [];
//               }
//             } else {
//               answerItems = responseData.answers || [];
//             }

//             // Validate field_ids in answers
//             if (Array.isArray(answerItems) && answerItems.length > 0) {
//               for (const ans of answerItems) {
//                 if (!ans.field_id) {
//                   throw new Error(`Response ${i + 1}: Invalid field_id in answers: missing field_id`);
//                 }
//                 const fieldExists = await tx.survey_fields.findUnique({
//                   where: { id: Number(ans.field_id) },
//                 });
//                 if (!fieldExists) {
//                   throw new Error(`Response ${i + 1}: Invalid field_id in answers: ${ans.field_id}`);
//                 }
//               }
//             }

//             // Create survey response
//             const surveyResponse = await tx.survey_responses.create({
//               data: {
//                 parent_id: Number(responseData.parent_id),
//                 submitted_by: Number(responseData.submitted_by),
//                 submitted_at:
//                   responseData.submitted_at && responseData.submitted_at.trim() !== ''
//                     ? new Date(responseData.submitted_at)
//                     : new Date(),
//                 location: responseData.location || null,
//                 photo_url: responseData.photo_url || null,
//                 is_active: responseData.is_active || 'Y',
//                 createdby: userId,
//                 createdate: new Date(),
//                 log_inst: 1,
//               },
//             });

//             // Create answers if provided
//             if (Array.isArray(answerItems) && answerItems.length > 0) {
//               const answersToCreate = answerItems.map((ans: any) => ({
//                 parent_id: surveyResponse.id,
//                 field_id: Number(ans.field_id),
//                 answer: ans.answer || null,
//               }));

//               await tx.survey_answers.createMany({
//                 data: answersToCreate,
//               });
//             }

//             // Fetch the complete response with relations
//             const finalResponse = await tx.survey_responses.findUnique({
//               where: { id: surveyResponse.id },
//               include: {
//                 surveys: true,
//                 survey_responses_submitted_by_users: true,
//                 survey_answer_responses: {
//                   include: {
//                     survey_fields: true,
//                   },
//                 },
//               },
//             });

//             createdResponses.push(serializeSurveyResponse(finalResponse));
//           } catch (error: any) {
//             errors.push({
//               index: i,
//               data: responseData,
//               error: error.message,
//             });
//           }
//         }

//         return { createdResponses, errors };
//       },
//       {
//         maxWait: 30000,
//         timeout: 60000,
//       }
//     );

//     const { createdResponses, errors } = results;

//     if (errors.length > 0 && createdResponses.length === 0) {
//       return res.status(400).json({
//         message: 'All bulk survey responses failed',
//         errors,
//       });
//     }

//     res.status(201).json({
//       message: `Bulk survey responses processed: ${createdResponses.length} created, ${errors.length} failed`,
//       data: createdResponses,
//       ...(errors.length > 0 && { errors }),
//       summary: {
//         total: responses.length,
//         created: createdResponses.length,
//         failed: errors.length,
//       },
//     });
//   } catch (error: any) {
//     console.error('Create Bulk Survey Responses Error:', error);

//     if (error.message && error.message.startsWith('Invalid')) {
//       return res.status(400).json({ message: error.message });
//     }

//     return res.status(500).json({
//       message: 'Failed to process bulk survey responses',
//       error: error.message,
//     });
//   }
// },
