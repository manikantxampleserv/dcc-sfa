import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

interface SurveyFieldSerialized {
  id: number;
  parent_id: number;
  label: string;
  field_type?: string | null;
  options?: string | null;
  is_required?: boolean | null;
  sort_order?: number | null;
  parent_field_id?: number | null;
  parent_option_value?: string | null;
}

interface SurveySerialized {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  target_roles?: number;
  is_published?: boolean | null;
  published_at?: Date | null;
  expires_at?: Date | null;
  response_count?: number;
  is_active: string;
  is_matrix: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  roles?: { id: number; name: string; description: string } | null;
  target_products?: number[];
  fields?: SurveyFieldSerialized[];
}

const serializeSurvey = (survey: any): SurveySerialized => ({
  id: survey.id,
  title: survey.title,
  description: survey.description,
  category: survey.category,
  target_roles: survey.target_roles,
  is_published: survey.is_published,
  published_at: survey.published_at,
  expires_at: survey.expires_at,
  response_count: survey.response_count,
  is_active: survey.is_active,
  is_matrix: survey.is_matrix,
  createdate: survey.createdate,
  createdby: survey.createdby,
  updatedate: survey.updatedate,
  updatedby: survey.updatedby,
  log_inst: survey.log_inst,
  roles: survey.surveys_roles
    ? {
        id: survey.surveys_roles.id,
        name: survey.surveys_roles.name,
        description: survey.surveys_roles.description,
      }
    : null,
  target_products:
    survey.survey_products?.map((sp: any) => sp.product_id) || [],
  fields:
    survey.survey_fields?.map((field: any) => ({
      id: field.id,
      parent_id: field.parent_id,
      label: field.label,
      field_type: field.field_type,
      options: field.options,
      is_required: field.is_required,
      sort_order: field.sort_order,
      parent_field_id: field.parent_field_id,
      parent_option_value: field.parent_option_value,
    })) || [],
});

export const surveysController = {
  async createOrUpdateSurvey(req: Request, res: Response) {
    const data = req.body;
    const userId = (req as any).user?.id || 1;
    const { survey_fields, fields, ...surveyData } = data;
    const fieldItems = survey_fields || fields || [];
    let surveyId = surveyData.id;

    try {
      const result = await prisma.$transaction(
        async tx => {
          let survey;
          let isUpdate = false;

          if (surveyId) {
            const existing = await tx.surveys.findUnique({
              where: { id: Number(surveyId) },
            });
            if (existing) isUpdate = true;
          }

          if (!surveyData.title || surveyData.title.trim() === '') {
            throw new Error('Invalid title: missing or empty');
          }

          if (!surveyData.category || surveyData.category.trim() === '') {
            throw new Error('Invalid category: missing or empty');
          }

          if (Array.isArray(fieldItems) && fieldItems.length > 0) {
            for (const field of fieldItems) {
              if (!field.label || field.label.trim() === '') {
                throw new Error('Invalid field: missing or empty label');
              }
            }
          }

          const payload = {
            title: surveyData.title.trim(),
            description: surveyData.description || null,
            category: surveyData.category.trim(),
            target_roles: surveyData.target_roles || null,
            is_published: surveyData.is_published ?? false,
            published_at:
              surveyData.published_at && surveyData.published_at.trim() !== ''
                ? new Date(surveyData.published_at)
                : null,
            expires_at:
              surveyData.expires_at && surveyData.expires_at.trim() !== ''
                ? new Date(surveyData.expires_at)
                : null,
            is_active: surveyData.is_active || 'Y',
            is_matrix: surveyData.is_matrix || 'N',
          };

          if (isUpdate && surveyId) {
            survey = await tx.surveys.update({
              where: { id: Number(surveyId) },
              data: {
                ...payload,
                updatedby: userId,
                updatedate: new Date(),
                log_inst: { increment: 1 },
              },
            });
          } else {
            survey = await tx.surveys.create({
              data: {
                ...payload,
                response_count: 0,
                createdby: userId,
                createdate: new Date(),
                log_inst: 1,
              },
            });
            surveyId = survey.id;
          }

          const processFields = async (
            items: any[],
            surveyId: number,
            tx: any,
            parentFieldId: number | null = null
          ): Promise<number[]> => {
            const processedIds: number[] = [];
            for (let index = 0; index < items.length; index++) {
              const field = items[index];
              const fieldData = {
                parent_id: surveyId,
                label: field.label?.trim() || 'Untitled',
                field_type: field.field_type || 'text',
                options: field.options || null,
                is_required: field.is_required ?? false,
                sort_order: field.sort_order ?? index + 1,
                parent_field_id: parentFieldId,
                parent_option_value: field.parent_option_value || null,
              };

              let savedFieldId: number;
              const isNumericId = field.id && !isNaN(Number(field.id)) && typeof field.id !== 'string';
              
              if (isNumericId) {
                const existingField = await tx.survey_fields.findFirst({
                  where: {
                    id: Number(field.id),
                    parent_id: surveyId,
                  },
                });

                if (existingField) {
                  await tx.survey_fields.update({
                    where: { id: Number(field.id) },
                    data: fieldData,
                  });
                  savedFieldId = Number(field.id);
                } else {
                  const created = await tx.survey_fields.create({ data: fieldData });
                  savedFieldId = created.id;
                }
              } else {
                const created = await tx.survey_fields.create({ data: fieldData });
                savedFieldId = created.id;
              }
              processedIds.push(savedFieldId);

              if (Array.isArray(field.child_fields) && field.child_fields.length > 0) {
                const childIds = await processFields(
                  field.child_fields,
                  surveyId,
                  tx,
                  savedFieldId
                );
                processedIds.push(...childIds);
              }
            }
            return processedIds;
          };

          const processedFieldIds: number[] = [];

          if (Array.isArray(fieldItems) && fieldItems.length > 0) {
            const ids = await processFields(fieldItems, survey.id, tx);
            processedFieldIds.push(...ids);

            if (isUpdate) {
              await tx.survey_fields.deleteMany({
                where: {
                  parent_id: survey.id,
                  ...(processedFieldIds.length > 0
                    ? { id: { notIn: processedFieldIds } }
                    : {}),
                },
              });
            }
          } else if (isUpdate) {
            await tx.survey_fields.deleteMany({
              where: { parent_id: survey.id },
            });
          }

          if (Array.isArray(surveyData.target_products)) {
            await tx.survey_products.deleteMany({
              where: { survey_id: survey.id },
            });
            if (surveyData.target_products.length > 0) {
              await tx.survey_products.createMany({
                data: surveyData.target_products.map((pid: number) => ({
                  survey_id: survey.id,
                  product_id: pid,
                })),
              });
            }
          }

          const finalSurvey = await tx.surveys.findUnique({
            where: { id: survey.id },
            include: {
              surveys_roles: true,
              survey_products: true,
              survey_fields: {
                orderBy: { sort_order: 'asc' },
              },
            },
          });

          return { finalSurvey, wasUpdate: isUpdate };
        },
        {
          maxWait: 10000,
          timeout: 20000,
        }
      );

      const finalSurvey = (result as any).finalSurvey;
      const wasUpdate = (result as any).wasUpdate === true;

      res.status(wasUpdate ? 200 : 201).json({
        message: wasUpdate
          ? 'Survey updated successfully'
          : 'Survey created successfully',
        data: serializeSurvey(finalSurvey),
      });
    } catch (error: any) {
      console.error('Create/Update Survey Error:', error);

      if (error.message && error.message.startsWith('Invalid')) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message && error.message.includes('missing')) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: 'Failed to process survey',
        error: error.message,
      });
    }
  },

  async getAllSurveys(req: any, res: any) {
    try {
      const { page, limit, search, status, category, isPublished } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { title: { contains: searchLower } },
            { description: { contains: searchLower } },
            { category: { contains: searchLower } },
          ],
        }),
        ...(status === 'active' && { is_active: 'Y' }),
        ...(status === 'inactive' && { is_active: 'N' }),
        ...(category && { category }),
        ...(isPublished === 'true' && { is_published: true }),
        ...(isPublished === 'false' && { is_published: false }),
      };

      const { data, pagination } = await paginate({
        model: prisma.surveys,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          surveys_roles: true,
          survey_products: true,
          survey_fields: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });

      const [
        totalSurveys,
        publishedSurveys,
        draftSurveys,
        activeSurveys,
        totalResponses,
      ] = await Promise.all([
        prisma.surveys.count(),
        prisma.surveys.count({ where: { is_published: true } }),
        prisma.surveys.count({ where: { is_published: false } }),
        prisma.surveys.count({ where: { is_active: 'Y' } }),
        prisma.survey_responses.count(),
      ]);

      const categories = await prisma.surveys.groupBy({
        by: ['category'],
      });

      res.success(
        'Surveys retrieved successfully',
        data.map((s: any) => serializeSurvey(s)),
        200,
        pagination,
        {
          total_surveys: totalSurveys,
          published_surveys: publishedSurveys,
          draft_surveys: draftSurveys,
          active_surveys: activeSurveys,
          total_responses: totalResponses,
          total_categories: categories.length,
        }
      );
    } catch (error: any) {
      console.error('Get Surveys Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSurveyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const survey = await prisma.surveys.findUnique({
        where: { id: Number(id) },
        include: {
          surveys_roles: true,
          survey_products: true,
          survey_fields: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });

      if (!survey) return res.status(404).json({ message: 'Survey not found' });

      res.json({
        message: 'Survey fetched successfully',
        data: serializeSurvey(survey),
      });
    } catch (error: any) {
      console.error('Get Survey Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSurvey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingSurvey = await prisma.surveys.findUnique({
        where: { id: Number(id) },
        include: {
          survey_fields: {
            include: {
              survey_answers: true,
            },
          },
        },
      });

      if (!existingSurvey)
        return res.status(404).json({ message: 'Survey not found' });

      const responseCount = await prisma.survey_responses.count({
        where: { parent_id: Number(id) },
      });

      if (responseCount > 0) {
        return res.status(400).json({
          message: `Cannot delete survey with ${responseCount} existing responses`,
        });
      }

      const answerCount = await prisma.survey_answers.count({
        where: {
          survey_fields: {
            parent_id: Number(id),
          },
        },
      });

      if (answerCount > 0) {
        console.log(`Found ${answerCount} survey answers to delete`);
      }

      await prisma.$transaction(async tx => {
        // First, delete ALL survey answers for this survey using a more comprehensive approach
        console.log('Attempting to delete survey answers for survey:', id);

        // Try multiple approaches to ensure we get all answers

        // Approach 1: Delete by field IDs
        const fieldIds = existingSurvey.survey_fields.map(field => field.id);
        console.log('Field IDs:', fieldIds);

        if (fieldIds.length > 0) {
          const deletedByFields = await tx.survey_answers.deleteMany({
            where: {
              field_id: {
                in: fieldIds,
              },
            },
          });
          console.log(`Deleted ${deletedByFields.count} answers by field IDs`);
        }

        // Approach 2: Also try to delete any orphaned answers that might exist
        // Get all answer IDs that reference fields belonging to this survey
        const allSurveyAnswers = await tx.survey_answers.findMany({
          where: {
            survey_fields: {
              parent_id: Number(id),
            },
          },
        });

        console.log(
          `Found ${allSurveyAnswers.length} total answers for survey`
        );

        // Delete any remaining answers individually
        for (const answer of allSurveyAnswers) {
          try {
            await tx.survey_answers.delete({
              where: { id: answer.id },
            });
            console.log(`Deleted answer ${answer.id}`);
          } catch (err) {
            console.error(`Failed to delete answer ${answer.id}:`, err);
          }
        }

        // Now try to delete fields
        try {
          const deletedFields = await tx.survey_fields.deleteMany({
            where: { parent_id: Number(id) },
          });
          console.log(`Deleted ${deletedFields.count} survey fields`);
        } catch (fieldError) {
          console.error('Failed to delete fields:', fieldError);

          // Try deleting fields one by one
          const fields = await tx.survey_fields.findMany({
            where: { parent_id: Number(id) },
          });

          for (const field of fields) {
            try {
              await tx.survey_fields.delete({
                where: { id: field.id },
              });
              console.log(`Deleted field ${field.id}`);
            } catch (singleFieldError) {
              console.error(
                `Failed to delete field ${field.id}:`,
                singleFieldError
              );
              throw singleFieldError;
            }
          }
        }

        await tx.surveys.delete({
          where: { id: Number(id) },
        });
      });

      res.json({ message: 'Survey deleted successfully' });
    } catch (error: any) {
      console.error('Delete Survey Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async publishSurvey(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingSurvey = await prisma.surveys.findUnique({
        where: { id: Number(id) },
        include: {
          survey_fields: true,
        },
      });

      if (!existingSurvey)
        return res.status(404).json({ message: 'Survey not found' });

      if (
        !existingSurvey.is_published &&
        existingSurvey.survey_fields.length === 0
      ) {
        return res.status(400).json({
          message: 'Cannot publish survey without fields',
        });
      }

      const survey = await prisma.surveys.update({
        where: { id: Number(id) },
        data: {
          is_published: !existingSurvey.is_published,
          published_at: !existingSurvey.is_published ? new Date() : null,
          updatedate: new Date(),
          updatedby: req.user?.id,
          log_inst: { increment: 1 },
        },
        include: {
          survey_fields: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });

      res.json({
        message: `Survey ${survey.is_published ? 'published' : 'unpublished'} successfully`,
        data: serializeSurvey(survey),
      });
    } catch (error: any) {
      console.error('Publish Survey Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getSurveyFields(req: Request, res: Response) {
    try {
      const { surveyId } = req.params;

      const fields = await prisma.survey_fields.findMany({
        where: { parent_id: Number(surveyId) },
        orderBy: { sort_order: 'asc' },
      });

      res.json({
        success: true,
        message: 'Survey fields retrieved successfully',
        data: fields,
      });
    } catch (error: any) {
      console.error('Get Survey Fields Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async duplicateSurvey(req: any, res: any) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 1;

      const originalSurvey = await prisma.surveys.findUnique({
        where: { id: Number(id) },
        include: {
          survey_fields: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });

      if (!originalSurvey)
        return res.status(404).json({ message: 'Survey not found' });

      const newSurvey = await prisma.surveys.create({
        data: {
          title: `${originalSurvey.title} (Copy)`,
          description: originalSurvey.description,
          category: originalSurvey.category,
          target_roles: originalSurvey.target_roles,
          is_published: false,
          is_active: 'Y',
          response_count: 0,
          createdby: userId,
          createdate: new Date(),
          log_inst: 1,
          survey_fields: {
            create: originalSurvey.survey_fields.map(field => ({
              label: field.label,
              field_type: field.field_type,
              options: field.options,
              is_required: field.is_required,
              sort_order: field.sort_order,
            })),
          },
        },
        include: {
          survey_fields: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });

      res.status(201).json({
        message: 'Survey duplicated successfully',
        data: serializeSurvey(newSurvey),
      });
    } catch (error: any) {
      console.error('Duplicate Survey Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
