import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

export const systemEnumsController = {
  async getEnumByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const enumData = await prisma.system_enums.findUnique({
        where: { key },
      });

      if (!enumData) {
        return res
          .status(404)
          .json({ success: false, message: 'Enum not found' });
      }

      let parsedValues = [];
      try {
        parsedValues = JSON.parse(enumData.values);
      } catch (e) {
        // Fallback if not valid JSON
        parsedValues = enumData.values.split(',').map((v: string) => v.trim());
      }

      return res.status(200).json({
        success: true,
        data: {
          key: enumData.key,
          name: enumData.name,
          values: parsedValues,
        },
      });
    } catch (error) {
      console.error('Error fetching system enum:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Server Error', error });
    }
  },
};
