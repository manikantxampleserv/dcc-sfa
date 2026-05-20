"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bwip_js_1 = __importDefault(require("bwip-js"));
try {
    const svg = bwip_js_1.default.toSVG({
        bcid: 'code128',
        text: 'TSTCERA',
        includetext: true,
        textxalign: 'center',
        textsize: 10,
        textyoffset: 10,
    });
    console.log('--- DEFAULT SVG STRING ---');
    console.log(svg.substring(0, 2000));
    console.log('--- LENGTH OF SVG ---');
    console.log(svg.length);
}
catch (e) {
    console.error(e);
}
//# sourceMappingURL=test-bwip.js.map