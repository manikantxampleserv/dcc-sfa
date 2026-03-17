import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerUiOptions } from 'swagger-ui-express';
import { swaggerSchemas } from '../configs/swagger-schemas';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DCC SFA API',
      version: '1.0.0',
      description: 'Sales Force Automation API Documentation',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: swaggerSchemas,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/v1/controllers/*.ts', './src/v1/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiOptions: SwaggerUiOptions = {
  customCss: '.swagger-ui .topbar {display:none}',
  customSiteTitle: 'DCC SFA API Documentation',
};
