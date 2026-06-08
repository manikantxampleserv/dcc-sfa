import Sanscript from '@indic-transliteration/sanscript';

let itrans = Sanscript.t('कितने एसेट्स हैं जो इंस्टॉल्ड है', 'devanagari', 'itrans');
console.log("Original ITRANS:", itrans);

let cleaned = itrans
  .replace(/M/g, 'n')
  .replace(/T/g, 't')
  .replace(/D/g, 'd')
  .replace(/N/g, 'n')
  .replace(/S/g, 'sh')
  .replace(/R/g, 'ri')
  .replace(/L/g, 'l')
  .replace(/aa/g, 'a')
  .replace(/ee/g, 'i')
  .replace(/oo/g, 'u')
  .replace(/ii/g, 'i')
  .toLowerCase();

console.log("Cleaned:", cleaned);
