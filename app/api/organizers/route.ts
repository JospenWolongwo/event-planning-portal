import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// API endpoint for fetching organizers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const search = searchParams.get('search') || '';
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        created_at,
        events:events(count)
      `, { count: 'exact' })
      .eq('role', 'admin')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add search filter if provided
    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching organizers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizers' },
        { status: 500 }
      );
    }
    
    // Format the response
    return NextResponse.json({
      organizers: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error in organizers endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
