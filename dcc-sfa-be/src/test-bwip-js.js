const bwipjs = require('bwip-js');

try {
  const svg = bwipjs.toSVG({
    bcid: 'code128',
    text: 'TSTCERA',
    includetext: true,
    textxalign: 'center',
    textsize: 10,
    textyoffset: 10,
  });
  console.log('--- SVG STRING WITH textyoffset: 10 ---');
  console.log(svg.substring(0, 2000));
} catch (e) {
  console.error(e);
}
