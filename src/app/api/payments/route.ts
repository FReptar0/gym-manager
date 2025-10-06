import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentFiltersSchema, paginationSchema } from '@/lib/utils/validation';
import { calculatePaymentPeriod, calculateExpirationDate } from '@/lib/utils/date';
import { PaymentFilters, PaginationParams } from '@/types';

// GET /api/payments - List payments with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters: PaymentFilters = {
      client_id: searchParams.get('client_id') || undefined,
      plan_id: searchParams.get('plan_id') || undefined,
      payment_method: (searchParams.get('payment_method') as any) || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      amount_min: searchParams.get('amount_min') ? parseFloat(searchParams.get('amount_min')!) : undefined,
      amount_max: searchParams.get('amount_max') ? parseFloat(searchParams.get('amount_max')!) : undefined,
    };

    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sort_by: searchParams.get('sort_by') || 'payment_date',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    // Build query
    let query = supabase
      .from('payments')
      .select(`
        *,
        client:client_id(id, full_name, phone),
        plan:plan_id(id, name, duration_days, price)
      `, { count: 'exact' });

    // Apply filters
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id);
    }

    if (filters.plan_id) {
      query = query.eq('plan_id', filters.plan_id);
    }

    if (filters.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }

    if (filters.date_from) {
      query = query.gte('payment_date', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('payment_date', filters.date_to);
    }

    if (filters.amount_min) {
      query = query.gte('amount', filters.amount_min);
    }

    if (filters.amount_max) {
      query = query.lte('amount', filters.amount_max);
    }

    // Apply pagination
    const offset = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    query = query
      .order(pagination.sort_by || 'payment_date', { ascending: pagination.sort_order === 'asc' })
      .range(offset, offset + (pagination.limit || 20) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / (pagination.limit || 20));

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        total: count || 0,
        total_pages: totalPages,
        has_next: (pagination.page || 1) < totalPages,
        has_prev: (pagination.page || 1) > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Register new payment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Get client and plan information
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, last_payment_date, expiration_date, status')
      .eq('id', body.client_id)
      .single();

    if (clientError) throw clientError;

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, duration_days, name')
      .eq('id', body.plan_id)
      .single();

    if (planError) throw planError;

    // Calculate payment period
    const { period_start, period_end } = calculatePaymentPeriod(
      body.payment_date,
      plan.duration_days,
      client.expiration_date
    );

    // Start transaction
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        client_id: body.client_id,
        plan_id: body.plan_id,
        amount: body.amount,
        payment_method: body.payment_method,
        payment_date: body.payment_date,
        period_start,
        period_end,
        notes: body.notes || null,
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update client record (only if not guest client)
    if (body.client_id !== '00000000-0000-0000-0000-000000000001') {
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          last_payment_date: body.payment_date,
          expiration_date: period_end,
          current_plan_id: body.plan_id,
          status: 'active', // Reactivate client on payment
        })
        .eq('id', body.client_id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ 
      data: payment,
      message: 'Payment registered successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register payment' },
      { status: 500 }
    );
  }
}