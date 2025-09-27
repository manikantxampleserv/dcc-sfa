declare module 'multer' {
  import { RequestHandler } from 'express';

  function multer(options?: any): {
    single(fieldname: string): RequestHandler;
    array(fieldname: string, maxCount?: number): RequestHandler;
    fields(fields: { name: string; maxCount?: number }[]): RequestHandler;
    none(): RequestHandler;
  };

  export = multer;
}
