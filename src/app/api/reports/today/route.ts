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
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const tomorrow = format(new Date(now.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    console.log('Today date for API:', today, 'Tomorrow:', tomorrow);
    
    // Today's revenue from payments
    const { data: todaysPayments, error: paymentsError } = await (supabase
      .from('payments') as any)
      .select('amount')
      .gte('payment_date', today)
      .lt('payment_date', tomorrow);
    
    if (paymentsError) {
      console.error('Error fetching today payments:', paymentsError);
    }
    console.log('Todays payments data:', todaysPayments);

    const todaysRevenue = todaysPayments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
    const paymentsCount = todaysPayments?.length || 0;

    // Today's new client registrations
    const { count: newRegistrations, error: clientsError } = await (supabase
      .from('clients') as any)
      .select('*', { count: 'exact', head: true })
      .gte('registration_date', today)
      .lt('registration_date', tomorrow)
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);
      
    if (clientsError) {
      console.error('Error fetching today clients:', clientsError);
    }
    console.log('New registrations count:', newRegistrations);

    const todaysStats = {
      todays_revenue: todaysRevenue,
      todays_payments: paymentsCount,
      todays_registrations: newRegistrations || 0,
    };
    
    console.log('Final today stats:', todaysStats);
    return NextResponse.json({ data: todaysStats });
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch today stats' },
      { status: 500 }
    );
  }
}