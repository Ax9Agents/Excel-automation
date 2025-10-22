import { InvoiceData } from '../types';
import { convertNumberToWords } from '../utils/number-to-words';

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const html = generateInvoiceHTML(data);
  
  const isDev = process.env.NODE_ENV === 'development';
  let browser;

  if (isDev) {
    // Development: Use regular puppeteer
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } else {
    // Production: Use @sparticuz/chromium
    const chromium = await import('@sparticuz/chromium');
    const puppeteerCore = await import('puppeteer-core');
    
    browser = await puppeteerCore.default.launch({
      args: [...chromium.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1280,
        height: 720,
        deviceScaleFactor: 1,
      },
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '8mm',
        right: '8mm',
        bottom: '8mm',
        left: '8mm'
      }
    });

    return Buffer.from(pdfData);
  } finally {
    await browser.close();
  }
}

function generateInvoiceHTML(data: InvoiceData): string {
  let totalFOB = 0;
  let totalINR = 0;
  let totalIGST = 0;
  let totalAmount = 0;
  
  const itemsHTML = data.items.map(item => {
    const amountUSD = item.pcs * item.rateUSD;
    const amountINR = amountUSD * data.exchangeRate;
    const igstAmount = amountINR * item.igstRate;
    const total = amountINR + igstAmount;
    
    totalFOB += amountUSD;
    totalINR += amountINR;
    totalIGST += igstAmount;
    totalAmount += total;
    
    let itemDesc = `${item.description}<br><small>HSN CODE: ${item.hsnCode}</small>`;
    if (item.batchNumber) itemDesc += `<br><small>Batch: ${item.batchNumber}</small>`;
    if (item.mfgDate) itemDesc += `<br><small>Mfg: ${item.mfgDate}</small>`;
    if (item.expDate) itemDesc += `<br><small>Exp: ${item.expDate}</small>`;
    if (item.botanicalName) itemDesc += `<br><small>Botanical: ${item.botanicalName}</small>`;
    
    return `
      <tr>
        <td style="text-align: center;">${item.sno}</td>
        <td>${itemDesc}</td>
        <td style="text-align: right;">${item.qtyKgs.toFixed(3)}</td>
        <td style="text-align: center;">${item.pcs}</td>
        <td style="text-align: right;">${item.rateUSD.toFixed(2)}</td>
        <td style="text-align: right;">${amountUSD.toFixed(2)}</td>
        <td style="text-align: right;">${amountINR.toFixed(2)}</td>
        <td style="text-align: center;">${(item.igstRate * 100).toFixed(0)}%</td>
        <td style="text-align: right;">${igstAmount.toFixed(2)}</td>
        <td style="text-align: right;"><strong>${total.toFixed(2)}</strong></td>
      </tr>
    `;
  }).join('');
  
  const amountInWords = convertNumberToWords(totalFOB);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 10px;
      margin: 0;
      padding: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 3px;
    }
    th, td {
      border: 1px solid #000;
      padding: 4px;
    }
    th {
      background-color: #d9d9d9;
      font-weight: bold;
      text-align: center;
      font-size: 9px;
    }
    .header {
      background-color: #e0e0e0;
      text-align: center;
      padding: 12px;
      font-size: 16px;
      font-weight: bold;
      border: 1px solid #000;
    }
    .subtitle {
      text-align: center;
      font-style: italic;
      padding: 5px;
      border: 1px solid #000;
      border-top: none;
      font-size: 9px;
    }
    .total-row {
      background-color: #ffeb3b;
      font-weight: bold;
    }
    .info-section {
      font-size: 9px;
    }
    .green-bg {
      background-color: #ccffcc;
      text-align: center;
      font-weight: bold;
      padding: 6px;
      border: 1px solid #000;
      margin: 3px 0;
    }
  </style>
</head>
<body>
  <div class="header">COMMERCIAL CUM TAX INVOICE</div>
  <div class="subtitle">Supply Meant for Export Against Payment of Integrated Tax (IGST)</div>
  
  <table class="info-section">
    <tr>
      <td rowspan="6" style="width: 40%;">
        <strong>Exporter</strong><br>
        ${data.exporter.name}<br>
        ${data.exporter.address}<br>
        ${data.exporter.city}<br>
        ${data.exporter.state}<br>
        PH: ${data.exporter.phone}${data.exporter.fax ? `<br>FAX: ${data.exporter.fax}` : ''}
      </td>
      <td style="width: 30%;"><strong>Invoice No. and Date</strong></td>
      <td style="width: 30%;"><strong>Exporter's Ref</strong></td>
    </tr>
    <tr>
      <td><strong style="font-size: 12px;">${data.invoiceNumber}</strong></td>
      <td>GSTIN NO: ${data.exporter.gstin}</td>
    </tr>
    <tr>
      <td>DATED: ${data.invoiceDate}</td>
      <td>IEC NO: ${data.exporter.iec}</td>
    </tr>
    <tr>
      <td>Buyer's order no. and date:</td>
      <td>IGST REFUND BANK A/C</td>
    </tr>
    <tr>
      <td>${data.buyerOrderNo}, DT: ${data.buyerOrderDate}</td>
      <td>${data.exporter.bankName}</td>
    </tr>
    <tr>
      <td></td>
      <td>A/C NO: ${data.exporter.accountNo}</td>
    </tr>
  </table>
  
  <table class="info-section">
    <tr>
      <td style="width: 40%;"><strong>Consignee</strong></td>
      <td style="width: 60%;"><strong>Buyer (if other than the consignee)</strong></td>
    </tr>
    <tr>
      <td>
        ${data.consignee.name}<br>
        ${data.consignee.address}<br>
        ${data.consignee.city}<br>
        ${data.consignee.state}<br>
        ${data.consignee.country}<br>
        Ph: ${data.consignee.phone}
      </td>
      <td style="text-align: center; vertical-align: middle;">
        <strong>[ ${data.buyer} ]</strong>
      </td>
    </tr>
  </table>
  
  <table class="info-section">
    <tr>
      <td style="text-align: center;"><strong>Country of Origin of Goods</strong></td>
      <td style="text-align: center;"><strong>Country of Final Destination</strong></td>
    </tr>
    <tr>
      <td style="text-align: center; font-weight: bold;">${data.countryOfOrigin}</td>
      <td style="text-align: center; font-weight: bold;">${data.countryOfDestination}</td>
    </tr>
  </table>
  
  <table class="info-section">
    <tr>
      <td style="width: 20%;"><strong>Terms of Delivery</strong></td>
      <td style="width: 30%;">${data.termsOfDelivery}</td>
      <td style="width: 20%;"><strong>Port of Loading</strong></td>
      <td style="width: 30%;">${data.portOfLoading}</td>
    </tr>
    <tr>
      <td colspan="4"><strong>Product Description:</strong> ${data.productDescription}</td>
    </tr>
  </table>
  
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">S.No</th>
        <th style="width: 20%;">Description</th>
        <th style="width: 8%;">QTY<br>(kgs)</th>
        <th style="width: 5%;">Pcs</th>
        <th style="width: 10%;">RATE<br>(${data.currency}/PCS)</th>
        <th style="width: 10%;">Amount<br>(${data.currency})</th>
        <th style="width: 10%;">Amount<br>(INR)</th>
        <th style="width: 8%;">IGST<br>Rate</th>
        <th style="width: 12%;">IGST<br>Amount</th>
        <th style="width: 12%;">TOTAL<br>(INR)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
      <tr class="total-row">
        <td style="text-align: center;">TOTAL</td>
        <td>${data.totalPcs} PCS - ${data.totalKgs} KGS - ${data.totalBoxes} BOX</td>
        <td style="text-align: right;">${data.totalKgs.toFixed(3)}</td>
        <td style="text-align: center;">${data.totalPcs}</td>
        <td></td>
        <td style="text-align: right;">${totalFOB.toFixed(2)}</td>
        <td style="text-align: right;">${totalINR.toFixed(2)}</td>
        <td></td>
        <td style="text-align: right;">${totalIGST.toFixed(2)}</td>
        <td style="text-align: right; font-size: 11px;"><strong>${totalAmount.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>
  
  <table>
    <tr>
      <td colspan="10" style="font-weight: bold; font-size: 9px;">
        Amount Chargeable (in words): ${amountInWords} ($ UNITED STATES DOLLARS)
      </td>
    </tr>
  </table>
  
  <table style="font-size: 9px;">
    <tr>
      <td style="width: 70%;" rowspan="4"></td>
      <td style="width: 20%;"><strong>Total Before Tax</strong></td>
      <td style="width: 10%; text-align: right;">${totalINR.toFixed(2)}</td>
    </tr>
    <tr>
      <td><strong>Add: IGST</strong></td>
      <td style="text-align: right;">${totalIGST.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="total-row"><strong>Total After Tax</strong></td>
      <td class="total-row" style="text-align: right; font-size: 11px;"><strong>${totalAmount.toFixed(2)}</strong></td>
    </tr>
    <tr>
      <td>GST on Reverse Charge</td>
      <td></td>
    </tr>
  </table>
  
  <div class="green-bg">
    Value in ${data.currency}$ ${totalFOB.toFixed(2)} - EX RATE ${data.exchangeRate} = INR ${totalINR.toFixed(2)}
  </div>
  
  <table>
    <tr>
      <td style="padding: 8px; font-size: 9px;">
        <strong>Export Under Refund Claim of IGST</strong><br><br>
        We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.<br>
        The goods covered in this invoice have been made to order and specified by the buyer and not otherwise sold in the Indian Market.
      </td>
    </tr>
  </table>
  
  <table>
    <tr>
      <td style="width: 60%;"></td>
      <td style="width: 40%; text-align: center; padding: 10px;">
        <strong>For ${data.exporter.name}</strong><br><br><br><br>
        <strong>AUTHORISED SIGNATORY</strong>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
