import { deleteFile, uploadFile } from '../../utils/blackbaze';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';

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
  is_active: company.is_active,
  created_by: company.created_by,
  updated_by: company.updated_by,
  log_inst: company.log_inst,
  smtp_host: company.smtp_host,
  smtp_port: company.smtp_port,
  smtp_username: company.smtp_username,
  smtp_password: company.smtp_password,
  ...(includeCreatedAt && { created_date: company.created_date }),
  ...(includeUpdatedAt && { updated_date: company.updated_date }),

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
        address,
        city,
        state,
        country,
        zipcode,
        phone_number,
        email,
        website,
        created_by,
        is_active,
        log_inst,
        smtp_host,
        smtp_port,
        smtp_username,
        smtp_password,
      } = req.body;

      const prefix = name.slice(0, 3).toUpperCase();

      const lastCompany = await prisma.companies.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
      });

      let newSequence = 1;
      if (lastCompany && lastCompany.code) {
        const match = lastCompany.code.match(/(\d+)$/);
        if (match) {
          newSequence = parseInt(match[1], 10) + 1;
        }
      }

      const code = `${prefix}${newSequence.toString().padStart(3, '0')}`;

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
          is_active,
          logo: logoUrl,
          created_by: req.user?.id,
          created_date: new Date(),
          ...(log_inst && { log_inst: Number(log_inst) }),
          ...(smtp_host && { smtp_host }),
          ...(smtp_port && { smtp_port: Number(smtp_port) }),
          ...(smtp_username && { smtp_username }),
          ...(smtp_password && { smtp_password }),
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
      const { page, limit, search = '' } = req.query;

      const page_num = page ? parseInt(page as string, 10) : 1;
      const limit_num = limit ? parseInt(limit as string, 10) : 10;

      if (isNaN(page_num) || isNaN(limit_num)) {
        res.error('Invalid page or limit parameter', 400);
        return;
      }

      const searchLower = (search as string).toLowerCase();

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { email: { contains: searchLower } },
            { city: { contains: searchLower } },
            { state: { contains: searchLower } },
            { country: { contains: searchLower } },
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
        pagination,
        {
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

      const {
        name,
        address,
        city,
        state,
        country,
        zipcode,
        phone_number,
        email,
        website,
        is_active,
        log_inst,
        smtp_host,
        smtp_port,
        smtp_username,
        smtp_password,
      } = req.body;

      const data: any = {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(zipcode !== undefined && { zipcode }),
        ...(phone_number !== undefined && { phone_number }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(is_active && { is_active }),
        ...(log_inst !== undefined && {
          log_inst: log_inst ? Number(log_inst) : null,
        }),
        ...(smtp_host !== undefined && { smtp_host }),
        ...(smtp_port !== undefined && {
          smtp_port: smtp_port ? Number(smtp_port) : null,
        }),
        ...(smtp_username !== undefined && { smtp_username }),
        ...(smtp_password !== undefined && { smtp_password }),
        updated_date: new Date(),
        updated_by: req.user?.id,
      };

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
