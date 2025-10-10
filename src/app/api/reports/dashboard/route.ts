import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMonthDateRange, parseMonthString } from '@/lib/utils/date';
import { calculateMonthlyEquivalent } from '@/lib/utils/currency';
import { GUEST_CLIENT_ID } from '@/lib/constants';

// GET /api/reports/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // YYYY-MM format
    
    const now = new Date();
    const currentMonth = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { year, month } = parseMonthString(currentMonth);
    const { start: monthStart, end: monthEnd } = getMonthDateRange(year, month);
    
    // Previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const { start: prevMonthStart, end: prevMonthEnd } = getMonthDateRange(prevYear, prevMonth);

    // Current month revenue
    const { data: currentRevenue } = await (supabase
      .from('payments') as any)
      .select('amount')
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd);

    const totalRevenue = currentRevenue?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;

    // Previous month revenue for comparison
    const { data: previousRevenue } = await (supabase
      .from('payments') as any)
      .select('amount')
      .gte('payment_date', prevMonthStart)
      .lte('payment_date', prevMonthEnd);

    const previousMonthRevenue = previousRevenue?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;

    // Active clients with their plans for projection calculation
    const { data: activeClients } = await (supabase
      .from('clients') as any)
      .select(`
        id,
        current_plan_id,
        plan:current_plan_id(duration_days, price)
      `)
      .eq('status', 'active')
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID)
      .not('current_plan_id', 'is', null);

    // Calculate projected revenue
    let projectedRevenue = 0;
    if (activeClients) {
      projectedRevenue = activeClients.reduce((sum: number, client: any) => {
        // Handle both null plans and array edge cases
        const plan = Array.isArray(client.plan) ? client.plan[0] : client.plan;
        if (plan && plan.price && plan.duration_days) {
          const monthlyEquivalent = calculateMonthlyEquivalent(
            plan.price, 
            plan.duration_days
          );
          return sum + monthlyEquivalent;
        }
        return sum;
      }, 0);
    }

    // Client counts
    const { count: activeClientsCount } = await (supabase
      .from('clients') as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    // New clients this month
    const { count: newClientsCount } = await (supabase
      .from('clients') as any)
      .select('*', { count: 'exact', head: true })
      .gte('registration_date', monthStart)
      .lte('registration_date', monthEnd)
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    // Churned clients (were active at start of month, now frozen/inactive, no payment this month)
    const { data: churnedClientsData } = await (supabase
      .from('clients') as any)
      .select('id')
      .in('status', ['frozen', 'inactive'])
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID)
      .lt('expiration_date', monthStart);

    // Filter out clients who made payments this month
    let churnedCount = 0;
    if (churnedClientsData) {
      const clientsWithPayments = await (supabase
        .from('payments') as any)
        .select('client_id')
        .in('client_id', churnedClientsData.map((c: any) => c.id))
        .gte('payment_date', monthStart)
        .lte('payment_date', monthEnd);

      const clientsWithPaymentsIds = new Set(
        clientsWithPayments.data?.map((p: any) => p.client_id) || []
      );

      churnedCount = churnedClientsData.filter(
        (client: any) => !clientsWithPaymentsIds.has(client.id)
      ).length;
    }

    // Calculate growth percentages
    let revenueGrowth = 0;
    if (previousMonthRevenue > 0) {
      // Normal case: calculate percentage change
      revenueGrowth = ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    } else if (totalRevenue > 0) {
      // First month with data: show as 100% growth from zero
      revenueGrowth = 100;
    }
    // If both are 0, growth remains 0

    // Previous month new clients for comparison
    const { count: prevMonthNewClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('registration_date', prevMonthStart)
      .lte('registration_date', prevMonthEnd)
      .eq('is_deleted', false)
      .neq('id', GUEST_CLIENT_ID);

    let clientGrowth = 0;
    if ((prevMonthNewClients || 0) > 0) {
      // Normal case: calculate percentage change
      clientGrowth = (((newClientsCount || 0) - (prevMonthNewClients || 0)) / (prevMonthNewClients || 0)) * 100;
    } else if ((newClientsCount || 0) > 0) {
      // First month with data: show as 100% growth from zero
      clientGrowth = 100;
    }
    // If both are 0, growth remains 0

    const stats = {
      total_revenue: totalRevenue,
      projected_revenue: projectedRevenue,
      active_clients: activeClientsCount || 0,
      new_clients_this_month: newClientsCount || 0,
      churned_clients: churnedCount,
      revenue_growth_percentage: revenueGrowth,
      client_growth_percentage: clientGrowth,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}