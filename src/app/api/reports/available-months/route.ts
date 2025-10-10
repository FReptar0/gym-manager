import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all months that have payments
    const { data: paymentMonths } = await (supabase
      .from('payments') as any)
      .select('payment_date')
      .order('payment_date', { ascending: false });

    // Get all months that have client registrations
    const { data: registrationMonths } = await (supabase
      .from('clients') as any)
      .select('registration_date')
      .neq('id', '00000000-0000-0000-0000-000000000001') // Exclude guest client
      .eq('is_deleted', false)
      .order('registration_date', { ascending: false });

    // Extract unique months from payments and registrations
    const monthsSet = new Set<string>();

    // Add months from payments
    if (paymentMonths) {
      paymentMonths.forEach((payment: any) => {
        if (payment.payment_date) {
          const date = new Date(payment.payment_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthsSet.add(monthKey);
        }
      });
    }

    // Add months from client registrations
    if (registrationMonths) {
      registrationMonths.forEach((client: any) => {
        if (client.registration_date) {
          const date = new Date(client.registration_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthsSet.add(monthKey);
        }
      });
    }

    // Convert to sorted array (most recent first)
    const availableMonths = Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a)) // Sort descending
      .slice(0, 24); // Limit to last 24 months

    // Format for frontend
    const formattedMonths = availableMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      
      return {
        value: monthKey,
        label: label.charAt(0).toUpperCase() + label.slice(1)
      };
    });

    return NextResponse.json({ data: formattedMonths });
  } catch (error) {
    console.error('Error fetching available months:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch available months' },
      { status: 500 }
    );
  }
}