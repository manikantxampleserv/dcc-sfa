// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export const companyController = {
//   // Create
//   async createCompany(req: Request, res: Response) {
//     try {
//       const {
//         name,
//         code,
//         address,
//         city,
//         state,
//         country,
//         zipcode,
//         phone_number,
//         email,
//         website,
//         logo,
//         created_by,
//       } = req.body;

//       const company = await prisma.companies.create({
//         data: {
//           name,
//           code,
//           address,
//           city,
//           state,
//           country,
//           zipcode,
//           phone_number,
//           email,
//           website,
//           logo,
//           created_by,
//         },
//       });

//       res.status(201).json({ success: true, data: company });
//     } catch (error: any) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // Read all
//   async getCompanies(req: Request, res: Response) {
//     try {
//       const companies = await prisma.companies.findMany({
//         include: { depots: true, users: true },
//       });
//       res.json({ success: true, data: companies });
//     } catch (error: any) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // Read one
//   async getCompanyById(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const company = await prisma.companies.findUnique({
//         where: { id: Number(id) },
//         include: { depots: true, users: true },
//       });

//       if (!company) {
//         return res
//           .status(404)
//           .json({ success: false, message: 'Company not found' });
//       }

//       res.json({ success: true, data: company });
//     } catch (error: any) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // Update
//   async updateCompany(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const data = { ...req.body, updated_date: new Date() };

//       const company = await prisma.companies.update({
//         where: { id: Number(id) },
//         data,
//       });

//       res.json({ success: true, data: company });
//     } catch (error: any) {
//       if (error.code === 'P2025') {
//         return res
//           .status(404)
//           .json({ success: false, message: 'Company not found' });
//       }
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // Delete
//   async deleteCompany(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       await prisma.companies.delete({ where: { id: Number(id) } });
//       res.json({ success: true, message: 'Company deleted successfully' });
//     } catch (error: any) {
//       if (error.code === 'P2025') {
//         return res
//           .status(404)
//           .json({ success: false, message: 'Company not found' });
//       }
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },
// };

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { deleteFile, uploadFile } from '../../utils/blackbaze';

const prisma = new PrismaClient();

export const companyController = {
  async createCompany(req: Request, res: Response) {
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

      // Handle logo upload to B2
      let logoUrl = null;
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
          created_by,
        },
      });

      res.status(201).json({ success: true, data: company });
    } catch (error: any) {
      // If there's an error and a file was uploaded to B2, attempt to delete it
      if (req.file && error.logoUrl) {
        try {
          await deleteFile(error.logoUrl);
        } catch (deleteError) {
          console.error('Error deleting uploaded file from B2:', deleteError);
        }
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getCompanies(req: Request, res: Response) {
    try {
      const companies = await prisma.companies.findMany({
        include: { depots: true, users: true },
      });
      res.json({ success: true, data: companies });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await prisma.companies.findUnique({
        where: { id: Number(id) },
        include: { depots: true, users: true },
      });

      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: 'Company not found' });
      }

      res.json({ success: true, data: company });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateCompany(req: Request, res: Response) {
    let newLogoUrl: string | null = null;

    try {
      const { id } = req.params;

      // First, get the existing company to check for existing logo
      const existingCompany = await prisma.companies.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCompany) {
        return res
          .status(404)
          .json({ success: false, message: 'Company not found' });
      }

      const data = { ...req.body, updated_date: new Date() };

      // Handle logo update
      if (req.file) {
        // Upload new logo to B2
        const fileName = `logos/${Date.now()}-${req.file.originalname}`;
        newLogoUrl = await uploadFile(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        data.logo = newLogoUrl;
      }

      // Update company in database
      const company = await prisma.companies.update({
        where: { id: Number(id) },
        data,
      });

      // Delete old logo from B2 after successful database update
      if (req.file && existingCompany.logo) {
        try {
          await deleteFile(existingCompany.logo);
        } catch (deleteError) {
          console.error('Error deleting old logo from B2:', deleteError);
          // Don't fail the request if old file deletion fails
        }
      }

      res.json({ success: true, data: company });
    } catch (error: any) {
      // If there's an error and a new file was uploaded to B2, delete it
      if (newLogoUrl) {
        try {
          await deleteFile(newLogoUrl);
        } catch (deleteError) {
          console.error('Error deleting uploaded file from B2:', deleteError);
        }
      }

      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ success: false, message: 'Company not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const company = await prisma.companies.findUnique({
        where: { id: Number(id) },
      });

      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: 'Company not found' });
      }

      // Delete company from database first
      await prisma.companies.delete({ where: { id: Number(id) } });

      // Delete logo from B2 after successful database deletion
      if (company.logo) {
        try {
          await deleteFile(company.logo);
        } catch (deleteError) {
          console.error('Error deleting logo file from B2:', deleteError);
          // Don't fail the request if file deletion fails
        }
      }

      res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ success: false, message: 'Company not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
