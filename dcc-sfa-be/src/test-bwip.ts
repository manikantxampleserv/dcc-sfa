import bwipjs from 'bwip-js';

try {
  const svg = bwipjs.toSVG({
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
} catch (e) {
  console.error(e);
}
