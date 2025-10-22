import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const fieldName = searchParams.get('fieldName');
    const query = searchParams.get('query') || '';
    
    if (!userId || !fieldName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    let dbQuery = supabaseAdmin
      .from('autofill_data')
      .select('field_value, usage_count, metadata')
      .eq('user_id', userId)
      .eq('field_name', fieldName)
      .order('usage_count', { ascending: false })
      .order('last_used', { ascending: false })
      .limit(10);
    
    if (query) {
      dbQuery = dbQuery.ilike('field_value', `%${query}%`);
    }
    
    const { data, error } = await dbQuery;
    
    if (error) {
      throw error;
    }
    
    const suggestions = data?.map(item => ({
      value: item.field_value,
      usageCount: item.usage_count,
      relatedData: item.metadata || null
    })) || [];
    
    return NextResponse.json({
      success: true,
      suggestions
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('Autofill error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch autofill data' },
      { status: 500 }
    );
  }
}
