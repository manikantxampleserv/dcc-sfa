"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemEnumsController = void 0;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
exports.systemEnumsController = {
    async getEnumByKey(req, res) {
        try {
            const { key } = req.params;
            const enumData = await prisma_client_1.default.system_enums.findUnique({
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
            }
            catch (e) {
                // Fallback if not valid JSON
                parsedValues = enumData.values.split(',').map((v) => v.trim());
            }
            return res.status(200).json({
                success: true,
                data: {
                    key: enumData.key,
                    name: enumData.name,
                    values: parsedValues,
                },
            });
        }
        catch (error) {
            console.error('Error fetching system enum:', error);
            return res
                .status(500)
                .json({ success: false, message: 'Server Error', error });
        }
    },
};
//# sourceMappingURL=systemEnums.controller.js.map