const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/lenovo/Desktop/Projects/DCC-SFA/SAP_Integration_Compliance_v1_5.xlsx');
console.log('Sheet Names:');
console.log(workbook.SheetNames);

// Assuming the settlement sheet is one of them, let's print the name of the sheets and the content of the first few
workbook.SheetNames.forEach(sheetName => {
  if (sheetName.toLowerCase().includes('settlement') || sheetName.toLowerCase().includes('r_')) {
    console.log('\n--- Sheet: ' + sheetName + ' ---');
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ''});
    json.slice(0, 30).forEach(row => console.log(row.join('|')));
  }
});
