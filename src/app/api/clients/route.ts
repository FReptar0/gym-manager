import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { clientFiltersSchema, paginationSchema } from '@/lib/utils/validation';
import { ClientFilters, PaginationParams } from '@/types';

// GET /api/clients - List clients with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters: ClientFilters = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as any) || 'all',
      plan_id: searchParams.get('plan_id') || undefined,
      expiring_soon: searchParams.get('expiring_soon') === 'true',
    };

    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sort_by: searchParams.get('sort_by') || 'full_name',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    };

    // Validate parameters
    const validatedFilters = clientFiltersSchema.parse(filters);
    const validatedPagination = paginationSchema.parse(pagination);

    // Build query
    let query = supabase
      .from('clients')
      .select(`
        *,
        plan:current_plan_id(id, name, duration_days, price, description)
      `, { count: 'exact' })
      .eq('is_deleted', false);

    // Apply filters
    if (validatedFilters.search) {
      query = query.ilike('full_name', `%${validatedFilters.search}%`);
    }

    if (validatedFilters.status && validatedFilters.status !== 'all') {
      query = query.eq('status', validatedFilters.status);
    }

    if (validatedFilters.plan_id) {
      query = query.eq('current_plan_id', validatedFilters.plan_id);
    }

    if (validatedFilters.expiring_soon) {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      query = query
        .gte('expiration_date', new Date().toISOString().split('T')[0])
        .lte('expiration_date', threeDaysFromNow.toISOString().split('T')[0]);
    }

    // Apply pagination
    const offset = (validatedPagination.page - 1) * validatedPagination.limit;
    query = query
      .order(validatedPagination.sort_by || 'full_name', { ascending: validatedPagination.sort_order === 'asc' })
      .range(offset, offset + validatedPagination.limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / validatedPagination.limit);

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: validatedPagination.page,
        limit: validatedPagination.limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: validatedPagination.page < totalPages,
        has_prev: validatedPagination.page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const { data, error } = await (supabase
      .from('clients') as any)
      .insert([{
        full_name: body.full_name,
        phone: body.phone,
        email: body.email || null,
        current_plan_id: body.current_plan_id, // Required plan selection
        birth_date: body.birth_date || null,
        blood_type: body.blood_type || null,
        gender: body.gender || null,
        medical_conditions: body.medical_conditions || null,
        emergency_contact_name: body.emergency_contact_name || null,
        emergency_contact_phone: body.emergency_contact_phone || null,
        status: 'inactive', // Default to inactive until first payment
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create client' },
      { status: 500 }
    );
  }
}