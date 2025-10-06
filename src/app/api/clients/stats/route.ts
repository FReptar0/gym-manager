import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GUEST_CLIENT_ID } from '@/lib/constants';

// GET /api/clients/stats - Get client statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Total clients (excluding guest and deleted)
    const { count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    // Active clients
    const { count: activeClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    // Frozen clients
    const { count: frozenClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'frozen')
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    // Inactive clients
    const { count: inactiveClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inactive')
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    // New clients this month
    const { count: newThisMonth } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('registration_date', startOfMonth.toISOString().split('T')[0])
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    // Expiring soon (within next 3 days)
    const { count: expiringSoon } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('expiration_date', now.toISOString().split('T')[0])
      .lte('expiration_date', threeDaysFromNow.toISOString().split('T')[0])
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    const stats = {
      total: totalClients || 0,
      active: activeClients || 0,
      frozen: frozenClients || 0,
      inactive: inactiveClients || 0,
      new_this_month: newThisMonth || 0,
      expiring_soon: expiringSoon || 0,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch client stats' },
      { status: 500 }
    );
  }
}