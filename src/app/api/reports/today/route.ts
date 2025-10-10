import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { GUEST_CLIENT_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date in YYYY-MM-DD format
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Today's revenue from payments
    const { data: todaysPayments } = await (supabase
      .from('payments') as any)
      .select('amount')
      .eq('payment_date', today);

    const todaysRevenue = todaysPayments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
    const paymentsCount = todaysPayments?.length || 0;

    // Today's new client registrations
    const { count: newRegistrations } = await (supabase
      .from('clients') as any)
      .select('*', { count: 'exact', head: true })
      .eq('registration_date', today)
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    const todaysStats = {
      todays_revenue: todaysRevenue,
      todays_payments: paymentsCount,
      todays_registrations: newRegistrations || 0,
    };

    return NextResponse.json({ data: todaysStats });
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch today stats' },
      { status: 500 }
    );
  }
}