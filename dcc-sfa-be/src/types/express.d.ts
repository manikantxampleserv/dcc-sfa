// import 'express';

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: number;
//         username?: string;
//         email: string;
//         name: string;
//         role: string;
//         permissions: string[];
//         parent_id?: number | null;
//         depot_id?: number | null;
//         zone_id?: number | null;
//       };
//       token?: string;
//       file?: Multer.File;
//       files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
//     }

//     interface Response {
//       success: (
//         message: string,
//         data?: any,
//         statusCode?: number,
//         pagination?: {
//           current_page: number;
//           total_pages: number;
//           total_count: number;
//           has_next: boolean;
//           has_previous: boolean;
//         }
//       ) => this;
//       error: (error: string, statusCode?: number) => this;
//       validationError: (errors: any[], statusCode?: number) => this;
//     }
//   }
// }

// src/types/express.d.ts
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username?: string;
        email: string;
        name: string;
        role_id: number; // Add role_id
        role?: string; // Keep role as optional string (role name)
        roleLevel?: number; // Add role level
        permissions?: string[]; // Make permissions optional
        parent_id?: number | null;
        depot_id?: number | null;
        zone_id?: number | null;
        region_id?: number | null; // Add if you have regions
        team_id?: number | null; // Add if you have teams
        supervisor_id?: number | null; // Add if needed
        dataScope?: {
          // Add data scope
          scope: string;
          level: number;
        };
      };
      token?: string;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }

    interface Response {
      success: (
        message: string,
        data?: any,
        statusCode?: number,
        pagination?: {
          current_page: number;
          total_pages: number;
          total_count: number;
          has_next: boolean;
          has_previous: boolean;
        },
        metadata?: any // Add metadata for additional info
      ) => this;
      error: (error: string, statusCode?: number, details?: any) => this;
      validationError: (errors: any[], statusCode?: number) => this;
    }
  }
}
