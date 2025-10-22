import { GoogleGenerativeAI } from '@google/generative-ai';
import ExcelJS from 'exceljs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ExtractedData {
  invoiceNumber?: string;
  invoiceDate?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  exporterName?: string;
  exporterAddress?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  countryDestination?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  currency?: string;
  exchangeRate?: number;
  totalBoxes?: number;
  termsOfDelivery?: string;
  items?: Array<{
    description: string;
    hsnCode: string;
    qtyKgs: number;
    pcs: number;
    rateUSD: number;
  }>;
}

async function generateWithGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function cleanJSONResponse(text: string): string {
  // Remove markdown code blocks
  text = text.replace(/``````\n?/g, '');
  
  // Remove any text before first { and after last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1);
  }
  
  // Remove comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  text = text.replace(/\/\/.*/g, '');
  
  return text.trim();
}

export async function extractDataFromExcel(buffer: ArrayBuffer | ArrayBufferView | Uint8Array | unknown): Promise<ExtractedData | null> {
  try {
    console.log('Reading Excel file...');
    // Ensure we have a Node Buffer before passing to exceljs. Some callers
    // (for example Next.js request bodies) may provide ArrayBuffer/Uint8Array
    // or Buffer-like types which aren't assignable to Node's Buffer in TS.
    // Normalize to Uint8Array before constructing a Node Buffer at runtime.
    let uint8: Uint8Array;
    if (buffer instanceof Uint8Array) {
      uint8 = buffer;
    } else if (ArrayBuffer.isView(buffer as ArrayBufferView)) {
      const view = buffer as ArrayBufferView;
      uint8 = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    } else {
      // Assume ArrayBuffer-like
      uint8 = new Uint8Array(buffer as ArrayBuffer);
    }

    const workbook = new ExcelJS.Workbook();
    // Pass the Uint8Array directly. ExcelJS supports Buffer/Uint8Array inputs
    // at runtime; casting to `unknown` then `Buffer` prevents TypeScript from complaining about
    // mismatched Buffer typings in this environment.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(uint8 as any);
    
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    // Extract all text from the worksheet
    let excelText = '';
    worksheet.eachRow((row, rowNumber) => {
      const rowText = row.values as unknown[];
      const cleanRow = rowText
        .filter(cell => cell !== null && cell !== undefined && cell !== '')
        .map(cell => String(cell))
        .join(' | ');
      
      if (cleanRow.trim()) {
        excelText += `Row ${rowNumber}: ${cleanRow}\n`;
      }
    });

    if (!excelText.trim()) {
      throw new Error('Excel file appears to be empty');
    }

    console.log('Extracted text length:', excelText.length);

    // Create prompt for AI
    const prompt = `You are an AI that extracts invoice data from Excel text. 
Extract the following information and return ONLY a valid JSON object (no markdown, no explanations):

Excel Content:
${excelText}

Extract these fields if present:
- invoiceNumber: Invoice number (look for "Invoice", "Invoice No", etc.)
- invoiceDate: Invoice date in YYYY-MM-DD format
- buyerOrderNo: Buyer's order number
- buyerOrderDate: Buyer's order date in YYYY-MM-DD format
- exporterName: Exporter/Seller company name
- exporterAddress: Exporter's address
- consigneeName: Consignee/Buyer company name
- consigneeAddress: Consignee's address
- countryDestination: Destination country
- portOfLoading: Port of loading
- portOfDischarge: Port of discharge
- currency: Currency (USD, EUR, etc.)
- exchangeRate: Exchange rate to INR (number)
- totalBoxes: Total number of boxes (number)
- termsOfDelivery: Terms of delivery (CNF, FOB, etc.)
- items: Array of items with:
  - description: Product description
  - hsnCode: HSN code (default "3302" if not found)
  - qtyKgs: Quantity in kilograms (number)
  - pcs: Number of pieces (number)
  - rateUSD: Rate per piece in USD (number)

Return ONLY valid JSON. Example format:
{
  "invoiceNumber": "123",
  "invoiceDate": "2025-10-21",
  "exporterName": "SHIVA EXPORTS",
  "consigneeName": "ABC Company",
  "countryDestination": "USA",
  "currency": "USD",
  "exchangeRate": 82.55,
  "totalBoxes": 1,
  "items": [
    {
      "description": "PEPPERMINT OIL",
      "hsnCode": "3302",
      "qtyKgs": 10.5,
      "pcs": 100,
      "rateUSD": 25.50
    }
  ]
}

If a field is not found, omit it from the JSON. Return ONLY the JSON object, nothing else.`;

    console.log('Sending to Gemini AI...');
    const response = await generateWithGemini(prompt);
    console.log('Raw AI response:', response.substring(0, 500));

    const cleanedResponse = cleanJSONResponse(response);
    console.log('Cleaned response:', cleanedResponse.substring(0, 500));

    let extractedData: ExtractedData;
    
    try {
      extractedData = JSON.parse(cleanedResponse);
    } catch {
      console.error('JSON parse error. Response was:', cleanedResponse);
      
      // Try to extract JSON from anywhere in the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Could not parse AI response as JSON. Please try again.');
        }
      } else {
        throw new Error('AI did not return valid JSON. Please try again.');
      }
    }

    // Validate essential fields
    if (!extractedData.invoiceNumber && !extractedData.items?.length) {
      console.warn('No meaningful data extracted');
      return null;
    }

    // Ensure items have proper numeric types
    if (extractedData.items) {
      extractedData.items = extractedData.items.map(item => ({
        ...item,
        qtyKgs: Number(item.qtyKgs) || 0,
        pcs: Number(item.pcs) || 0,
        rateUSD: Number(item.rateUSD) || 0,
        hsnCode: item.hsnCode || '3302'
      }));
    }

    console.log('Successfully extracted data');
    return extractedData;

  } catch (error) {
    const err = error as Error;
    console.error('Excel extraction error:', err);
    throw error;
  }
}
