import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { planSchema } from '@/lib/utils/validation';

// GET /api/plans/[id] - Get plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[id] - Update plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = planSchema.parse(body);
    
    const { data, error } = await supabase
      .from('plans')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id] - Deactivate plan (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if plan is used by any clients
    const { count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('current_plan_id', id)
      .eq('is_deleted', false);

    if (count && count > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete plan. It is currently used by ${count} client(s). Deactivate instead.` 
        },
        { status: 400 }
      );
    }

    // Deactivate plan instead of deleting
    const { data, error } = await supabase
      .from('plans')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ 
      data, 
      message: 'Plan deactivated successfully' 
    });
  } catch (error) {
    console.error('Error deactivating plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to deactivate plan' },
      { status: 500 }
    );
  }
}