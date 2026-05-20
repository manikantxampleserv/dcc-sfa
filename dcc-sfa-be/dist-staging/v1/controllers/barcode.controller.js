"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.barcodeController = void 0;
const bwip_js_1 = __importDefault(require("bwip-js"));
exports.barcodeController = {
    async generateBarcode(req, res) {
        const { text, type = 'code128', format = 'svg', scale = '3', height = '12', } = req.query;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Barcode value (text) is required as a query parameter.',
            });
        }
        const valueStr = String(text).trim();
        const barcodeType = String(type).toLowerCase();
        const imageFormat = String(format).toLowerCase();
        const scaleNum = parseInt(String(scale), 10) || 3;
        const heightNum = parseInt(String(height), 10) || 12;
        try {
            if (imageFormat === 'png') {
                const pngBuffer = await bwip_js_1.default.toBuffer({
                    bcid: barcodeType,
                    text: valueStr,
                    scale: scaleNum,
                    height: heightNum,
                    includetext: true,
                    textxalign: 'center',
                    textsize: 10,
                    textyoffset: 10,
                    paddingwidth: 20,
                    paddingheight: 20,
                    textfont: 'monospace',
                });
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                return res.send(pngBuffer);
            }
            else {
                let svgString = bwip_js_1.default.toSVG({
                    bcid: barcodeType,
                    text: valueStr,
                    scale: scaleNum,
                    height: heightNum,
                    includetext: true,
                    textxalign: 'center',
                    textsize: 10,
                    paddingwidth: 20,
                    paddingheight: 20,
                    textfont: 'monospace',
                });
                svgString = svgString.replace(/(<text[^>]*y=")(\d+)(")/, (_, start, y, end) => `${start}${Number(y) + 15}${end}`);
                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                return res.send(svgString);
            }
        }
        catch (error) {
            console.error('Barcode Generation Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate barcode image.',
                details: error.message,
            });
        }
    },
};
//# sourceMappingURL=barcode.controller.js.map