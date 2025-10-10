import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMonthDateRange, parseMonthString } from '@/lib/utils/date';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // YYYY-MM format
    
    if (!monthParam) {
      return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 });
    }

    const { year, month } = parseMonthString(monthParam);
    const { start: monthStart, end: monthEnd } = getMonthDateRange(year, month);

    // Get daily revenue for the specified month
    const { data: dailyPayments } = await (supabase
      .from('payments') as any)
      .select('payment_date, amount')
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd)
      .order('payment_date', { ascending: true });

    // Group payments by date and sum amounts
    const dailyRevenue: { [key: string]: number } = {};
    
    if (dailyPayments) {
      dailyPayments.forEach((payment: any) => {
        const date = payment.payment_date;
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = 0;
        }
        dailyRevenue[date] += payment.amount;
      });
    }

    // Create array of all days in the month with revenue data
    const chartData = [];
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      chartData.push({
        date: dateString,
        revenue: dailyRevenue[dateString] || 0
      });
    }

    return NextResponse.json({ data: chartData });
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch daily revenue' },
      { status: 500 }
    );
  }
}