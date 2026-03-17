"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiOptions = exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_schemas_1 = require("../configs/swagger-schemas");
const options = {
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
            schemas: swagger_schemas_1.swaggerSchemas,
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.swaggerUiOptions = {
    customCss: '.swagger-ui .topbar {display:none}',
    customSiteTitle: 'DCC SFA API Documentation',
};
//# sourceMappingURL=swagger.js.map