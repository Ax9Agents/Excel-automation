import ExcelJS from 'exceljs';
import { InvoiceData } from '../types';
import { convertNumberToWords } from '../utils/number-to-words';

export async function generateIGSTInvoice(data: InvoiceData): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Invoice');
  
  sheet.columns = [
    { width: 8 }, { width: 12 }, { width: 18 }, { width: 10 },
    { width: 8 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 10 }, { width: 12 }, { width: 12 }
  ];
  
  const thinBorder = {
    top: { style: 'thin' as const },
    left: { style: 'thin' as const },
    bottom: { style: 'thin' as const },
    right: { style: 'thin' as const }
  };
  
  // Header
  sheet.mergeCells('A1:K1');
  const headerCell = sheet.getCell('A1');
  headerCell.value = 'COMMERCIAL CUM TAX INVOICE';
  headerCell.font = { size: 16, bold: true };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
  sheet.getRow(1).height = 25;
  
  sheet.mergeCells('A2:K2');
  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = 'Supply Meant for Export Against Payment of Integrated Tax (IGST)';
  subtitleCell.font = { size: 10, italic: true };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  let row = 3;
  
  // Exporter section
  sheet.mergeCells(`A${row}:E${row}`);
  sheet.getCell(`A${row}`).value = 'Exporter';
  sheet.getCell(`A${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`F${row}:H${row}`);
  sheet.getCell(`F${row}`).value = 'Invoice No. and Date';
  sheet.getCell(`F${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:K${row}`);
  sheet.getCell(`I${row}`).value = "Exporter's Ref";
  sheet.getCell(`I${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`A${row}:E${row+5}`);
  const exporterDetails = `${data.exporter.name}\n${data.exporter.address}\n${data.exporter.city}\n${data.exporter.state}\nPH:${data.exporter.phone}${data.exporter.fax ? `\nFAX : ${data.exporter.fax}` : ''}`;
  sheet.getCell(`A${row}`).value = exporterDetails;
  sheet.getCell(`A${row}`).alignment = { wrapText: true, vertical: 'top' };
  sheet.getCell(`A${row}`).border = thinBorder;
  sheet.getCell(`A${row}`).font = { size: 9 };
  
  sheet.mergeCells(`F${row}:H${row}`);
  sheet.getCell(`F${row}`).value = data.invoiceNumber;
  sheet.getCell(`F${row}`).font = { bold: true, size: 11 };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:K${row}`);
  sheet.getCell(`I${row}`).value = `GSTIN NO : ${data.exporter.gstin}`;
  sheet.getCell(`I${row}`).font = { size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`F${row}:H${row}`);
  sheet.getCell(`F${row}`).value = `DATED : ${data.invoiceDate}`;
  sheet.getCell(`F${row}`).font = { size: 9 };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:K${row}`);
  sheet.getCell(`I${row}`).value = `IEC NO: ${data.exporter.iec}`;
  sheet.getCell(`I${row}`).font = { size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`F${row}:H${row}`);
  sheet.getCell(`F${row}`).value = "Buyer's order no. and date:";
  sheet.getCell(`F${row}`).font = { size: 9 };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:K${row}`);
  sheet.getCell(`I${row}`).value = "IGST REFUND BANK A/C";
  sheet.getCell(`I${row}`).font = { size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`F${row}:H${row}`);
  sheet.getCell(`F${row}`).value = `${data.buyerOrderNo} , DT: ${data.buyerOrderDate}`;
  sheet.getCell(`F${row}`).font = { size: 9 };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:K${row}`);
  sheet.getCell(`I${row}`).value = data.exporter.bankName;
  sheet.getCell(`I${row}`).font = { size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  row++;
  row++;
  
  sheet.mergeCells(`I${row}:K${row}`);
  sheet.getCell(`I${row}`).value = `A/C NO: ${data.exporter.accountNo}`;
  sheet.getCell(`I${row}`).font = { size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  row = 10;
  
  // Consignee section
  sheet.mergeCells(`A${row}:E${row}`);
  sheet.getCell(`A${row}`).value = 'Consignee';
  sheet.getCell(`A${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`F${row}:K${row}`);
  sheet.getCell(`F${row}`).value = 'Buyer (if other than the consignee)';
  sheet.getCell(`F${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`A${row}:E${row+4}`);
  const consigneeDetails = `${data.consignee.name}\n${data.consignee.address}\n${data.consignee.city}\n${data.consignee.state}\n${data.consignee.country}\nPh: ${data.consignee.phone}`;
  sheet.getCell(`A${row}`).value = consigneeDetails;
  sheet.getCell(`A${row}`).alignment = { wrapText: true, vertical: 'top' };
  sheet.getCell(`A${row}`).border = thinBorder;
  sheet.getCell(`A${row}`).font = { size: 9 };
  
  sheet.mergeCells(`F${row}:K${row+4}`);
  sheet.getCell(`F${row}`).value = `[ ${data.buyer} ]`;
  sheet.getCell(`F${row}`).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell(`F${row}`).border = thinBorder;
  sheet.getCell(`F${row}`).font = { size: 10, bold: true };
  
  row = 16;
  
  // Country section
  sheet.mergeCells(`A${row}:E${row}`);
  sheet.getCell(`A${row}`).value = 'Country of Origin of Goods';
  sheet.getCell(`A${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`F${row}:K${row}`);
  sheet.getCell(`F${row}`).value = 'Country of Final Destination';
  sheet.getCell(`F${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`A${row}:E${row}`);
  sheet.getCell(`A${row}`).value = data.countryOfOrigin;
  sheet.getCell(`A${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`F${row}:K${row}`);
  sheet.getCell(`F${row}`).value = data.countryOfDestination;
  sheet.getCell(`F${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`F${row}`).alignment = { horizontal: 'center' };
  sheet.getCell(`F${row}`).border = thinBorder;
  
  row = 18;
  
  // Shipping fields
  const shippingFields = [
    ['Pre Carriage by', data.preCarriageBy, 'Place of receipt by Pre-Carrier', data.placeOfReceipt],
    ['Terms of Delivery', data.termsOfDelivery, 'Vessel/ Flight No.', data.vesselFlightNo],
    ['Port of Loading', data.portOfLoading, 'Port of Discharge', data.portOfDischarge],
    ['Final Destination', data.finalDestination, '', ''],
    ['Product Description', data.productDescription, '', '']
  ];
  
  shippingFields.forEach(([label1, value1, label2, value2]) => {
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).value = label1;
    sheet.getCell(`A${row}`).font = { bold: true, size: 9 };
    sheet.getCell(`A${row}`).border = thinBorder;
    
    sheet.mergeCells(`C${row}:E${row}`);
    sheet.getCell(`C${row}`).value = value1;
    sheet.getCell(`C${row}`).font = { size: 9 };
    sheet.getCell(`C${row}`).border = thinBorder;
    
    if (label2) {
      sheet.mergeCells(`F${row}:H${row}`);
      sheet.getCell(`F${row}`).value = label2;
      sheet.getCell(`F${row}`).font = { bold: true, size: 9 };
      sheet.getCell(`F${row}`).border = thinBorder;
      
      sheet.mergeCells(`I${row}:K${row}`);
      sheet.getCell(`I${row}`).value = value2;
      sheet.getCell(`I${row}`).font = { size: 9 };
      sheet.getCell(`I${row}`).border = thinBorder;
    } else {
      sheet.mergeCells(`F${row}:K${row}`);
      sheet.getCell(`F${row}`).value = '';
      sheet.getCell(`F${row}`).border = thinBorder;
    }
    
    row++;
  });
  
  row = 24;
  
  // Table headers
  const headers = [
    'S.No',
    'Description of Goods',
    'QTY\nkgs',
    'Pcs',
    `RATE\n(${data.currency}/PCS)`,
    `Amount\n${data.currency}`,
    'Amount\nINR',
    'IGST\nRate %',
    'IGST\nAmount',
    'TOTAL\nINR'
  ];
  
  sheet.getCell(`A${row}`).value = headers[0];
  sheet.getCell(`A${row}`).font = { bold: true, size: 8 };
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell(`A${row}`).border = thinBorder;
  sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  
  sheet.mergeCells(`B${row}:C${row}`);
  sheet.getCell(`B${row}`).value = headers[1];
  sheet.getCell(`B${row}`).font = { bold: true, size: 8 };
  sheet.getCell(`B${row}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell(`B${row}`).border = thinBorder;
  sheet.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  
  ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].forEach((col, idx) => {
    sheet.getCell(`${col}${row}`).value = headers[idx + 2];
    sheet.getCell(`${col}${row}`).font = { bold: true, size: 8 };
    sheet.getCell(`${col}${row}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    sheet.getCell(`${col}${row}`).border = thinBorder;
    sheet.getCell(`${col}${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  });
  
  sheet.getRow(row).height = 40;
  row++;
  
  let totalFOB = 0;
  let totalINR = 0;
  let totalIGST = 0;
  let totalAmount = 0;
  
  // Items with AI-generated details
  data.items.forEach(item => {
    const amountUSD = item.pcs * item.rateUSD;
    const amountINR = amountUSD * data.exchangeRate;
    const igstAmount = amountINR * item.igstRate;
    const total = amountINR + igstAmount;
    
    totalFOB += amountUSD;
    totalINR += amountINR;
    totalIGST += igstAmount;
    totalAmount += total;
    
    sheet.getCell(`A${row}`).value = item.sno;
    sheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    sheet.getCell(`A${row}`).border = thinBorder;
    sheet.getCell(`A${row}`).font = { size: 9 };
    
    sheet.mergeCells(`B${row}:C${row}`);
    let itemDesc = `${item.description}\nHSN CODE: ${item.hsnCode}`;
    if (item.batchNumber) itemDesc += `\nBatch: ${item.batchNumber}`;
    if (item.mfgDate) itemDesc += `\nMfg: ${item.mfgDate}`;
    if (item.expDate) itemDesc += `\nExp: ${item.expDate}`;
    if (item.botanicalName) itemDesc += `\nBotanical: ${item.botanicalName}`;
    
    sheet.getCell(`B${row}`).value = itemDesc;
    sheet.getCell(`B${row}`).alignment = { wrapText: true };
    sheet.getCell(`B${row}`).border = thinBorder;
    sheet.getCell(`B${row}`).font = { size: 9 };
    
    sheet.getCell(`D${row}`).value = item.qtyKgs;
    sheet.getCell(`D${row}`).numFmt = '0.000';
    sheet.getCell(`D${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`D${row}`).border = thinBorder;
    sheet.getCell(`D${row}`).font = { size: 9 };
    
    sheet.getCell(`E${row}`).value = item.pcs;
    sheet.getCell(`E${row}`).alignment = { horizontal: 'center' };
    sheet.getCell(`E${row}`).border = thinBorder;
    sheet.getCell(`E${row}`).font = { size: 9 };
    
    sheet.getCell(`F${row}`).value = item.rateUSD;
    sheet.getCell(`F${row}`).numFmt = '0.00';
    sheet.getCell(`F${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`F${row}`).border = thinBorder;
    sheet.getCell(`F${row}`).font = { size: 9 };
    
    sheet.getCell(`G${row}`).value = amountUSD;
    sheet.getCell(`G${row}`).numFmt = '0.00';
    sheet.getCell(`G${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`G${row}`).border = thinBorder;
    sheet.getCell(`G${row}`).font = { size: 9 };
    
    sheet.getCell(`H${row}`).value = amountINR;
    sheet.getCell(`H${row}`).numFmt = '0.00';
    sheet.getCell(`H${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`H${row}`).border = thinBorder;
    sheet.getCell(`H${row}`).font = { size: 9 };
    
    sheet.getCell(`I${row}`).value = item.igstRate * 100;
    sheet.getCell(`I${row}`).numFmt = '0';
    sheet.getCell(`I${row}`).alignment = { horizontal: 'center' };
    sheet.getCell(`I${row}`).border = thinBorder;
    sheet.getCell(`I${row}`).font = { size: 9 };
    
    sheet.getCell(`J${row}`).value = igstAmount;
    sheet.getCell(`J${row}`).numFmt = '0.00';
    sheet.getCell(`J${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`J${row}`).border = thinBorder;
    sheet.getCell(`J${row}`).font = { size: 9 };
    
    sheet.getCell(`K${row}`).value = total;
    sheet.getCell(`K${row}`).numFmt = '0.00';
    sheet.getCell(`K${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`K${row}`).border = thinBorder;
    sheet.getCell(`K${row}`).font = { size: 9 };
    
    row++;
  });
  
  // Total row
  sheet.getCell(`A${row}`).value = 'TOTAL';
  sheet.getCell(`A${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
  sheet.getCell(`A${row}`).border = thinBorder;
  sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.mergeCells(`B${row}:C${row}`);
  sheet.getCell(`B${row}`).value = `${data.totalPcs} PCS - Total: ${data.totalKgs} KGS - ${data.totalBoxes} BOX`;
  sheet.getCell(`B${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`B${row}`).border = thinBorder;
  sheet.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`D${row}`).value = data.totalKgs;
  sheet.getCell(`D${row}`).numFmt = '0.000';
  sheet.getCell(`D${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`D${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`D${row}`).border = thinBorder;
  sheet.getCell(`D${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`E${row}`).value = data.totalPcs;
  sheet.getCell(`E${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`E${row}`).alignment = { horizontal: 'center' };
  sheet.getCell(`E${row}`).border = thinBorder;
  sheet.getCell(`E${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`F${row}`).value = '';
  sheet.getCell(`F${row}`).border = thinBorder;
  sheet.getCell(`F${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`G${row}`).value = totalFOB;
  sheet.getCell(`G${row}`).numFmt = '0.00';
  sheet.getCell(`G${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`G${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`G${row}`).border = thinBorder;
  sheet.getCell(`G${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`H${row}`).value = totalINR;
  sheet.getCell(`H${row}`).numFmt = '0.00';
  sheet.getCell(`H${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`H${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`H${row}`).border = thinBorder;
  sheet.getCell(`H${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`I${row}`).value = '';
  sheet.getCell(`I${row}`).border = thinBorder;
  sheet.getCell(`I${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`J${row}`).value = totalIGST;
  sheet.getCell(`J${row}`).numFmt = '0.00';
  sheet.getCell(`J${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`J${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`J${row}`).border = thinBorder;
  sheet.getCell(`J${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`K${row}`).value = totalAmount;
  sheet.getCell(`K${row}`).numFmt = '0.00';
  sheet.getCell(`K${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`K${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`K${row}`).border = thinBorder;
  sheet.getCell(`K${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  row++;
  
  // Amount in words
  const amountInWords = convertNumberToWords(totalFOB);
  sheet.mergeCells(`A${row}:K${row}`);
  sheet.getCell(`A${row}`).value = `Amount Chargeable (in words): ${amountInWords} ($ UNITED STATES DOLLARS)`;
  sheet.getCell(`A${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`A${row}`).border = thinBorder;
  
  row++;
  
  // Tax breakdown
  sheet.mergeCells(`A${row}:H${row}`);
  sheet.getCell(`A${row}`).value = '';
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:J${row}`);
  sheet.getCell(`I${row}`).value = 'Total Amount Before Tax';
  sheet.getCell(`I${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  sheet.getCell(`K${row}`).value = totalINR;
  sheet.getCell(`K${row}`).numFmt = '0.00';
  sheet.getCell(`K${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`K${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`A${row}:H${row}`);
  sheet.getCell(`A${row}`).value = '';
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:J${row}`);
  sheet.getCell(`I${row}`).value = 'Add: IGST';
  sheet.getCell(`I${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  sheet.getCell(`K${row}`).value = totalIGST;
  sheet.getCell(`K${row}`).numFmt = '0.00';
  sheet.getCell(`K${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`K${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`A${row}:H${row}`);
  sheet.getCell(`A${row}`).value = '';
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:J${row}`);
  sheet.getCell(`I${row}`).value = 'Total Amount After Tax';
  sheet.getCell(`I${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`I${row}`).border = thinBorder;
  sheet.getCell(`I${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  sheet.getCell(`K${row}`).value = totalAmount;
  sheet.getCell(`K${row}`).numFmt = '0.00';
  sheet.getCell(`K${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`K${row}`).alignment = { horizontal: 'right' };
  sheet.getCell(`K${row}`).border = thinBorder;
  sheet.getCell(`K${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB3B' } };
  
  row++;
  
  sheet.mergeCells(`A${row}:H${row}`);
  sheet.getCell(`A${row}`).value = '';
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`I${row}:J${row}`);
  sheet.getCell(`I${row}`).value = 'GST on Reverse Charge';
  sheet.getCell(`I${row}`).font = { size: 9 };
  sheet.getCell(`I${row}`).border = thinBorder;
  
  sheet.getCell(`K${row}`).value = '';
  sheet.getCell(`K${row}`).border = thinBorder;
  
  row += 2;
  
  // Exchange rate summary
  sheet.mergeCells(`A${row}:K${row}`);
  sheet.getCell(`A${row}`).value = `Value in ${data.currency}$ ${totalFOB.toFixed(2)} - EX RATE ${data.exchangeRate} = INR ${totalINR.toFixed(2)}`;
  sheet.getCell(`A${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
  sheet.getCell(`A${row}`).border = thinBorder;
  sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } };
  
  row++;
  
  // Declaration
  sheet.mergeCells(`A${row}:K${row + 3}`);
  const declaration = `Export Under Refund Claim of IGST\n\nWe declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.\nThe goods covered in this invoice have been made to order and specified by the buyer and not otherwise sold in the Indian Market`;
  sheet.getCell(`A${row}`).value = declaration;
  sheet.getCell(`A${row}`).font = { size: 9 };
  sheet.getCell(`A${row}`).alignment = { wrapText: true, vertical: 'top' };
  sheet.getCell(`A${row}`).border = thinBorder;
  
  row += 4;
  
  // Signature section
  sheet.mergeCells(`A${row}:F${row}`);
  sheet.getCell(`A${row}`).value = '';
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`G${row}:K${row}`);
  sheet.getCell(`G${row}`).value = 'For ' + data.exporter.name;
  sheet.getCell(`G${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`G${row}`).alignment = { horizontal: 'center' };
  sheet.getCell(`G${row}`).border = thinBorder;
  
  row++;
  
  sheet.mergeCells(`A${row}:F${row + 2}`);
  sheet.getCell(`A${row}`).value = '';
  sheet.getCell(`A${row}`).border = thinBorder;
  
  sheet.mergeCells(`G${row}:K${row + 2}`);
  sheet.getCell(`G${row}`).value = '\n\n\nAUTHORISED SIGNATORY';
  sheet.getCell(`G${row}`).font = { bold: true, size: 9 };
  sheet.getCell(`G${row}`).alignment = { horizontal: 'center', vertical: 'bottom' };
  sheet.getCell(`G${row}`).border = thinBorder;
  
  return await workbook.xlsx.writeBuffer();
}
