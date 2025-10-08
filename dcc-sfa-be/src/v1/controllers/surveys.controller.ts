import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

interface SurveySerialized {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  target_roles?: string | null;
  is_published?: boolean | null;
  published_at?: Date | null;
  expires_at?: Date | null;
  response_count?: number | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  fields?: any[];
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
  createdate: survey.createdate,
  createdby: survey.createdby,
  updatedate: survey.updatedate,
  updatedby: survey.updatedby,
  log_inst: survey.log_inst,
  fields: survey.survey_fields || [],
});

export const surveysController = {
  async createSurvey(req: Request, res: Response) {
    try {
      const { fields, ...surveyData } = req.body;

      const survey = await prisma.surveys.create({
        data: {
          ...surveyData,
          is_active: surveyData.is_active || 'Y',
          is_published: surveyData.is_published || false,
          response_count: 0,
          createdate: new Date(),
          createdby: req.user?.id || 1,
          log_inst: surveyData.log_inst || 1,
          survey_fields: fields
            ? {
                create: fields.map((field: any, index: number) => ({
                  label: field.label,
                  field_type: field.field_type,
                  options: field.options || null,
                  is_required: field.is_required || false,
                  sort_order: field.sort_order || index + 1,
                })),
              }
            : undefined,
        },
        include: {
          survey_fields: true,
        },
      });

      res.status(201).json({
        message: 'Survey created successfully',
        data: serializeSurvey(survey),
      });
    } catch (error: any) {
      console.error('Create Survey Error:', error);
      res.status(500).json({ message: error.message });
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
          survey_fields: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });

      // Statistics
      const totalSurveys = await prisma.surveys.count();
      const publishedSurveys = await prisma.surveys.count({
        where: { is_published: true },
      });
      const draftSurveys = await prisma.surveys.count({
        where: { is_published: false },
      });
      const activeSurveys = await prisma.surveys.count({
        where: { is_active: 'Y' },
      });

      const totalResponses = await prisma.survey_responses.count();
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

  async updateSurvey(req: any, res: any) {
    try {
      const { id } = req.params;
      const { fields, ...surveyData } = req.body;

      const existingSurvey = await prisma.surveys.findUnique({
        where: { id: Number(id) },
      });

      if (!existingSurvey)
        return res.status(404).json({ message: 'Survey not found' });

      // If fields are provided, update them
      if (fields) {
        // Delete existing fields
        await prisma.survey_fields.deleteMany({
          where: { parent_id: Number(id) },
        });

        // Create new fields
        if (fields.length > 0) {
          await prisma.survey_fields.createMany({
            data: fields.map((field: any, index: number) => ({
              parent_id: Number(id),
              label: field.label,
              field_type: field.field_type,
              options: field.options || null,
              is_required: field.is_required || false,
              sort_order: field.sort_order || index + 1,
            })),
          });
        }
      }

      const data = {
        ...surveyData,
        updatedate: new Date(),
        updatedby: req.user?.id,
      };

      const survey = await prisma.surveys.update({
        where: { id: Number(id) },
        data,
        include: {
          survey_fields: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });

      res.json({
        message: 'Survey updated successfully',
        data: serializeSurvey(survey),
      });
    } catch (error: any) {
      console.error('Update Survey Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteSurvey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingSurvey = await prisma.surveys.findUnique({
        where: { id: Number(id) },
      });

      if (!existingSurvey)
        return res.status(404).json({ message: 'Survey not found' });

      // Delete related fields first
      await prisma.survey_fields.deleteMany({
        where: { parent_id: Number(id) },
      });

      await prisma.surveys.delete({ where: { id: Number(id) } });

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
      });

      if (!existingSurvey)
        return res.status(404).json({ message: 'Survey not found' });

      const survey = await prisma.surveys.update({
        where: { id: Number(id) },
        data: {
          is_published: !existingSurvey.is_published,
          published_at: !existingSurvey.is_published ? new Date() : null,
          updatedate: new Date(),
          updatedby: req.user?.id,
        },
        include: {
          survey_fields: true,
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
};
