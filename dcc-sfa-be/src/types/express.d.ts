/// <reference types="@types/multer" />

// Extend Express interfaces to include custom properties
declare namespace Express {
  interface Request {
    // User authentication properties (from auth middleware)
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
    
    // Multer file upload properties
    file?: Multer.File;
    files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
  }

  interface Response {
    // Custom response methods (from response middleware)
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
    ) => Response;
    error: (error: string, statusCode?: number) => Response;
    validationError: (errors: any[], statusCode?: number) => Response;
  }
}
