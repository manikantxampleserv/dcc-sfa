// import 'express';

// declare module 'express' {
//   interface Request {
//     user?: {
//       id: number;
//       username?: string;
//       email: string;
//       name: string;
//       role: string;
//       permissions: string[];
//       parent_id?: number | null;
//       depot_id?: number | null;
//       zone_id?: number | null;
//     };
//     token?: string;

//     file?: Express.Multer.File;
//     files?:
//       | Express.Multer.File[]
//       | { [fieldname: string]: Express.Multer.File[] };
//   }

//   interface Response {
//     success: (
//       message: string,
//       data?: any,
//       statusCode?: number,
//       pagination?: {
//         current_page: number;
//         total_pages: number;
//         total_count: number;
//         has_next: boolean;
//         has_previous: boolean;
//       }
//     ) => Response;
//     error: (error: string, statusCode?: number) => Response;
//     validationError: (errors: any[], statusCode?: number) => Response;
//   }
// }

import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username?: string;
        email: string;
        name: string;
        role: string;
        permissions: string[];
        parent_id?: number | null;
        depot_id?: number | null;
        zone_id?: number | null;
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
        }
      ) => this;
      error: (error: string, statusCode?: number) => this;
      validationError: (errors: any[], statusCode?: number) => this;
    }
  }
}
