import { NextRequest, NextResponse } from 'next/server';
import { generateIGSTInvoice } from '@/lib/generators/excel-generator';
import { generateInvoicePDF } from '@/lib/generators/pdf-generator';
import { enrichItemWithAI } from '@/lib/ai/item-enrichment';
import { generateAllDocuments } from '@/lib/ai/document-generator';
import { uploadToDrive } from '@/lib/utils/drive-uploader';
import { supabaseAdmin } from '@/lib/supabase/server';
import { InvoiceData } from '@/lib/types';

// Extended item type with description and enrichment fields
interface ExtendedInvoiceItem {
  description: string;
  hsnCode?: string;
  qtyKgs?: number;
  pcs?: number;
  rateUSD?: number;
  batchNumber?: string;
  mfgDate?: string;
  expDate?: string;
  botanicalName?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, invoiceData } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Starting invoice generation for user:', userId);
    
    // Step 1: Enrich items with AI (batch, mfg, exp, botanical)
    console.log('Enriching items with AI...');
    const enrichedItems = await Promise.all(
      invoiceData.items.map(async (item: ExtendedInvoiceItem) => {
        try {
          const enrichment = await enrichItemWithAI(item.description, 'essential oil');
          return {
            ...item,
            batchNumber: enrichment.batchNumber,
            mfgDate: enrichment.mfgDate,
            expDate: enrichment.expDate,
            botanicalName: enrichment.botanicalName
          };
        } catch (error) {
          console.error('Item enrichment failed for', item.description, error);
          return item;
        }
      })
    );
    
    const fullData: InvoiceData = {
      ...invoiceData,
      items: enrichedItems
    };
    
    // Step 2: Generate COA and MSDS for each item (parallel)
    console.log('Generating COA and MSDS documents...');
    const documents = await generateAllDocuments(enrichedItems, fullData.exporter.name);
    
    // Step 3: Generate Excel
    console.log('Generating Excel invoice...');
    const excelBuffer = await generateIGSTInvoice(fullData);
    
    // Step 4: Generate PDF
    console.log('Generating PDF invoice...');
    const pdfBuffer = await generateInvoicePDF(fullData);
    
    // Step 5: Upload to Supabase Storage
    console.log('Uploading files to cloud storage...');
    const timestamp = Date.now();
    const excelFilename = `Invoice_${fullData.invoiceNumber}_${timestamp}.xlsx`;
    const pdfFilename = `Invoice_${fullData.invoiceNumber}_${timestamp}.pdf`;
    
    const [excelLinks, pdfLinks] = await Promise.all([
      uploadToDrive(
        excelBuffer,
        excelFilename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        userId
      ),
      uploadToDrive(
        pdfBuffer,
        pdfFilename,
        'application/pdf',
        userId
      )
    ]);
    
    // Step 6: Save to database
    console.log('Saving to database...');
    const { data: invoiceRecord, error: dbError } = await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: userId,
        invoice_number: fullData.invoiceNumber,
        invoice_date: fullData.invoiceDate,
        buyer_order_no: fullData.buyerOrderNo,
        buyer_order_date: fullData.buyerOrderDate,
        exporter_name: fullData.exporter.name,
        exporter_address: `${fullData.exporter.address}, ${fullData.exporter.city}`,
        consignee_name: fullData.consignee.name,
        consignee_address: `${fullData.consignee.address}, ${fullData.consignee.city}`,
        items: enrichedItems,
        documents: documents,
        exchange_rate: fullData.exchangeRate,
        currency: fullData.currency,
        total_pcs: fullData.totalPcs,
        total_kgs: fullData.totalKgs,
        total_boxes: fullData.totalBoxes,
        port_of_loading: fullData.portOfLoading,
        port_of_discharge: fullData.portOfDischarge,
        country_origin: fullData.countryOfOrigin,
        country_destination: fullData.countryOfDestination,
        terms_of_delivery: fullData.termsOfDelivery,
        product_description: fullData.productDescription,
        excel_link: excelLinks.downloadLink,
        pdf_link: pdfLinks.downloadLink
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save to database');
    }
    
    // Step 7: Update autofill data with ALL fields and metadata
    console.log('Updating autofill data...');
    
    const fieldsToSave = [
      // Invoice fields
      { 
        field_name: 'invoice_number', 
        field_value: fullData.invoiceNumber,
        metadata: {
          date: fullData.invoiceDate,
          buyerOrderNo: fullData.buyerOrderNo,
          buyerOrderDate: fullData.buyerOrderDate
        }
      },
      { 
        field_name: 'buyer_order_no', 
        field_value: fullData.buyerOrderNo,
        metadata: {}
      },

      // Exporter fields with full metadata
      { 
        field_name: 'exporter_name', 
        field_value: fullData.exporter.name,
        metadata: {
          address: fullData.exporter.address,
          city: fullData.exporter.city,
          state: fullData.exporter.state,
          phone: fullData.exporter.phone,
          fax: fullData.exporter.fax,
          gstin: fullData.exporter.gstin,
          iec: fullData.exporter.iec,
          bank: fullData.exporter.bankName,
          account: fullData.exporter.accountNo
        }
      },
      { 
        field_name: 'exporter_address', 
        field_value: fullData.exporter.address,
        metadata: {
          name: fullData.exporter.name,
          city: fullData.exporter.city,
          state: fullData.exporter.state,
          phone: fullData.exporter.phone
        }
      },
      { 
        field_name: 'exporter_city', 
        field_value: fullData.exporter.city,
        metadata: {
          name: fullData.exporter.name,
          address: fullData.exporter.address,
          state: fullData.exporter.state
        }
      },
      { 
        field_name: 'exporter_state', 
        field_value: fullData.exporter.state,
        metadata: {
          name: fullData.exporter.name,
          city: fullData.exporter.city
        }
      },
      { 
        field_name: 'exporter_phone', 
        field_value: fullData.exporter.phone,
        metadata: {
          name: fullData.exporter.name
        }
      },
      { 
        field_name: 'exporter_fax', 
        field_value: fullData.exporter.fax,
        metadata: {
          name: fullData.exporter.name
        }
      },
      { 
        field_name: 'exporter_gstin', 
        field_value: fullData.exporter.gstin,
        metadata: {
          name: fullData.exporter.name,
          iec: fullData.exporter.iec
        }
      },
      { 
        field_name: 'exporter_iec', 
        field_value: fullData.exporter.iec,
        metadata: {
          name: fullData.exporter.name,
          gstin: fullData.exporter.gstin
        }
      },
      { 
        field_name: 'exporter_bank', 
        field_value: fullData.exporter.bankName,
        metadata: {
          name: fullData.exporter.name,
          account: fullData.exporter.accountNo
        }
      },
      { 
        field_name: 'exporter_account', 
        field_value: fullData.exporter.accountNo,
        metadata: {
          name: fullData.exporter.name,
          bank: fullData.exporter.bankName
        }
      },

      // Consignee fields with full metadata
      { 
        field_name: 'consignee_name', 
        field_value: fullData.consignee.name,
        metadata: {
          address: fullData.consignee.address,
          city: fullData.consignee.city,
          state: fullData.consignee.state,
          country: fullData.consignee.country,
          phone: fullData.consignee.phone
        }
      },
      { 
        field_name: 'consignee_address', 
        field_value: fullData.consignee.address,
        metadata: {
          name: fullData.consignee.name,
          city: fullData.consignee.city,
          state: fullData.consignee.state,
          country: fullData.consignee.country
        }
      },
      { 
        field_name: 'consignee_city', 
        field_value: fullData.consignee.city,
        metadata: {
          name: fullData.consignee.name,
          state: fullData.consignee.state,
          country: fullData.consignee.country
        }
      },
      { 
        field_name: 'consignee_state', 
        field_value: fullData.consignee.state,
        metadata: {
          name: fullData.consignee.name,
          city: fullData.consignee.city,
          country: fullData.consignee.country
        }
      },
      { 
        field_name: 'consignee_country', 
        field_value: fullData.consignee.country,
        metadata: {
          name: fullData.consignee.name
        }
      },
      { 
        field_name: 'consignee_phone', 
        field_value: fullData.consignee.phone,
        metadata: {
          name: fullData.consignee.name
        }
      },

      // Shipping & destination fields
      { 
        field_name: 'country_destination', 
        field_value: fullData.countryOfDestination,
        metadata: {
          consignee: fullData.consignee.name
        }
      },
      { 
        field_name: 'port_loading', 
        field_value: fullData.portOfLoading,
        metadata: {
          portDischarge: fullData.portOfDischarge,
          country: fullData.countryOfDestination
        }
      },
      { 
        field_name: 'port_discharge', 
        field_value: fullData.portOfDischarge,
        metadata: {
          portLoading: fullData.portOfLoading,
          country: fullData.countryOfDestination
        }
      },
      { 
        field_name: 'terms_delivery', 
        field_value: fullData.termsOfDelivery,
        metadata: {}
      },

      // Item descriptions with metadata
          ...(fullData.items as unknown as ExtendedInvoiceItem[]).map((item) => ({
      field_name: 'item_description',
      field_value: item.description,
      metadata: {
        hsnCode: item.hsnCode,
        botanicalName: item.botanicalName
      }
      }))
    ].filter(field => field.field_value); // Only save non-empty values
    
    await Promise.all(
      fieldsToSave.map(async (field) => {
        try {
          const { data: existing } = await supabaseAdmin
            .from('autofill_data')
            .select()
            .eq('user_id', userId)
            .eq('field_name', field.field_name)
            .eq('field_value', field.field_value)
            .single();
          
          if (existing) {
            await supabaseAdmin
              .from('autofill_data')
              .update({
                usage_count: existing.usage_count + 1,
                last_used: new Date().toISOString(),
                metadata: field.metadata || existing.metadata || {}
              })
              .eq('id', existing.id);
          } else {
            await supabaseAdmin
              .from('autofill_data')
              .insert({
                user_id: userId,
                field_name: field.field_name,
                field_value: field.field_value,
                metadata: field.metadata || {},
                usage_count: 1,
                last_used: new Date().toISOString()
              });
          }
        } catch (autofillError) {
          console.error(`Failed to save autofill for ${field.field_name}:`, autofillError);
          // Don't fail the whole request if autofill fails
        }
      })
    );
    
    console.log('Invoice generation complete!');
    
    return NextResponse.json({
      success: true,
      message: `Invoice ${fullData.invoiceNumber} saved to cloud!`,
      data: {
        invoiceNumber: fullData.invoiceNumber,
        excelLink: excelLinks.downloadLink,
        pdfLink: pdfLinks.downloadLink,
        invoiceId: invoiceRecord.id,
        documents: documents
      }
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('Generate invoice error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
