import { PrismaClient } from '@prisma/client';
import { deleteFile, uploadFile } from '../../utils/blackbaze';
import { paginate } from '../../utils/paginate';

const prisma = new PrismaClient();

const serializeCompany = (
  company: any,
  includeCreatedAt = false,
  includeUpdatedAt = false
) => ({
  id: company.id,
  name: company.name,
  code: company.code,
  address: company.address,
  city: company.city,
  state: company.state,
  country: company.country,
  zipcode: company.zipcode,
  phone_number: company.phone_number,
  email: company.email,
  website: company.website,
  logo: company.logo,
  created_by: company.created_by,
  ...(includeCreatedAt && { created_at: company.created_date }),
  ...(includeUpdatedAt && { updated_at: company.updated_date }),

  users: company.users
    ? company.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }))
    : [],
  depot_companies: company.depot_companies
    ? company.depot_companies.map((d: any) => ({
        id: d.id,
        parent_id: d.parent_id,
        name: d.name,
      }))
    : [],
});

export const companyController = {
  async createCompany(req: any, res: any) {
    try {
      const {
        name,
        code,
        address,
        city,
        state,
        country,
        zipcode,
        phone_number,
        email,
        website,
        created_by,
      } = req.body;

      let logoUrl: string | null = null;
      if (req.file) {
        const fileName = `logos/${Date.now()}-${req.file.originalname}`;
        logoUrl = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
      }

      const company = await prisma.companies.create({
        data: {
          name,
          code,
          address,
          city,
          state,
          country,
          zipcode,
          phone_number,
          email,
          website,
          logo: logoUrl,
          created_by: Number(created_by) || 0,
          created_date: new Date(),
        },
        include: { users: true, depot_companies: true },
      });

      res.success(
        'Company created successfully',
        serializeCompany(company, true),
        201
      );
    } catch (error: any) {
      res.error(error.message, 500);
    }
  },

  async getCompanies(req: any, res: any) {
    try {
      const { page = '1', limit = '10', search = '' } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { email: { contains: searchLower } },
          ],
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.companies,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { created_date: 'desc' },
        include: { depot_companies: true },
      });

      const totalCompanies = await prisma.companies.count();
      const activeCompanies = await prisma.companies.count({
        where: { is_active: 'Y' },
      });
      const inactiveCompanies = await prisma.companies.count({
        where: { is_active: 'N' },
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const newCompaniesThisMonth = await prisma.companies.count({
        where: {
          created_date: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
      });

      res.success(
        'Companies retrieved successfully',
        data.map((c: any) => serializeCompany(c, true, true)),
        200,
        {
          ...pagination,
          total_companies: totalCompanies,
          active_companies: activeCompanies,
          inactive_companies: inactiveCompanies,
          new_companies: newCompaniesThisMonth,
        }
      );
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      res.error(error.message, 500);
    }
  },

  async getCompanyById(req: any, res: any) {
    try {
      const { id } = req.params;
      const company = await prisma.companies.findUnique({
        where: { id: Number(id) },
        include: { depot_companies: true, users: true },
      });

      if (!company) {
        res.error('Company not found', 404);
        return;
      }

      res.success(
        'Company fetched successfully',
        serializeCompany(company, true, true),
        200
      );
    } catch (error: any) {
      console.error('Error fetching company:', error);
      res.error(error.message, 500);
    }
  },

  async updateCompany(req: any, res: any) {
    let newLogoUrl: string | null = null;

    try {
      const { id } = req.params;

      const existingCompany = await prisma.companies.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCompany) {
        res.error('Company not found', 404);
        return;
      }

      const data: any = { ...req.body, updated_date: new Date() };

      if (req.file) {
        const fileName = `logos/${Date.now()}-${req.file.originalname}`;
        newLogoUrl = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        data.logo = newLogoUrl;
      }

      const company = await prisma.companies.update({
        where: { id: Number(id) },
        data,
        include: { depot_companies: true, users: true },
      });

      if (req.file && existingCompany.logo) {
        try {
          await deleteFile(existingCompany.logo);
        } catch (deleteError) {
          console.error('Error deleting old logo:', deleteError);
        }
      }

      res.success(
        'Company updated successfully',
        serializeCompany(company, true, true),
        200
      );
    } catch (error: any) {
      if (newLogoUrl) {
        try {
          await deleteFile(newLogoUrl);
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError);
        }
      }
      res.error(error.message, 500);
    }
  },

  async deleteCompany(req: any, res: any) {
    try {
      const { id } = req.params;

      const company = await prisma.companies.findUnique({
        where: { id: Number(id) },
      });

      if (!company) {
        res.error('Company not found', 404);
        return;
      }

      await prisma.companies.delete({ where: { id: Number(id) } });

      if (company.logo) {
        try {
          await deleteFile(company.logo);
        } catch (deleteError) {
          console.error('Error deleting logo:', deleteError);
        }
      }

      res.success('Company deleted successfully', null, 200);
    } catch (error: any) {
      res.error(error.message, 500);
    }
  },
};
