import { supabaseAdmin } from '../supabase/server';

export interface UploadResult {
  fileId: string;
  viewLink: string;
  downloadLink: string;
}

export async function uploadToDrive(
  fileBuffer: unknown,
  filename: string,
  mimeType: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Create folder structure: userId/invoices/filename
    const filePath = `${userId}/invoices/${filename}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('invoices')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upload(filePath, fileBuffer as any, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('invoices')
      .getPublicUrl(filePath);

    const downloadLink = publicUrlData.publicUrl;
    
    return {
      fileId: data.path,
      viewLink: downloadLink,
      downloadLink: downloadLink,
    };
  } catch (error) {
    const err = error as Error;
    console.error('Supabase upload error:', err);
    throw new Error(`Failed to upload to storage: ${err.message}`);
  }
}

export async function checkDriveConnection(): Promise<boolean> {
  return true; // Always connected
}
