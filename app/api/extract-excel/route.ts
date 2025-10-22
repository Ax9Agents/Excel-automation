import { NextRequest, NextResponse } from 'next/server';
import { extractDataFromExcel } from '@/lib/ai/excel-extractor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('Extracting data from Excel file:', file.name);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const extractedData = await extractDataFromExcel(buffer);
    
    if (!extractedData) {
      return NextResponse.json(
        { error: 'Could not extract meaningful data from Excel. Please check the file format or try manual entry.' },
        { status: 400 }
      );
    }
    
    console.log('Successfully extracted data from Excel');
    
    return NextResponse.json({
      success: true,
      data: extractedData
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('Extract excel error:', err);
    
    // User-friendly error messages
    let errorMessage = 'Failed to extract data from Excel.';
    
    if (err.message.includes('JSON')) {
      errorMessage = 'AI could not understand the Excel format. Please try manual entry or check your file.';
    } else if (err.message.includes('empty')) {
      errorMessage = 'Excel file appears to be empty. Please check the file.';
    } else if (err.message.includes('worksheet')) {
      errorMessage = 'Could not read Excel worksheets. Please ensure it\'s a valid .xlsx file.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
