import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMonthDateRange, parseMonthString } from '@/lib/utils/date';

// GET /api/reports/revenue - Get revenue breakdown and trends
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

    // Daily revenue trend
    const { data: dailyRevenue } = await (supabase
      .from('payments') as any)
      .select('payment_date, amount')
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd)
      .order('payment_date');

    // Group by date
    const dailyRevenueMap = new Map<string, { revenue: number; count: number }>();
    dailyRevenue?.forEach((payment: any) => {
      const date = payment.payment_date;
      const existing = dailyRevenueMap.get(date) || { revenue: 0, count: 0 };
      dailyRevenueMap.set(date, {
        revenue: existing.revenue + payment.amount,
        count: existing.count + 1
      });
    });

    const dailyTrend = Array.from(dailyRevenueMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      payment_count: data.count
    }));

    // Revenue by plan type
    const { data: revenueByPlan } = await (supabase
      .from('payments') as any)
      .select(`
        amount,
        plan:plan_id(name)
      `)
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd);

    const planRevenueMap = new Map<string, { revenue: number; count: number }>();
    revenueByPlan?.forEach((payment: any) => {
      // Handle both null plans and array edge cases
      const plan = Array.isArray(payment.plan) ? payment.plan[0] : payment.plan;
      const planName = plan?.name || 'Unknown';
      const existing = planRevenueMap.get(planName) || { revenue: 0, count: 0 };
      planRevenueMap.set(planName, {
        revenue: existing.revenue + payment.amount,
        count: existing.count + 1
      });
    });

    const revenueByPlanType = Array.from(planRevenueMap.entries()).map(([planName, data]) => ({
      plan_name: planName,
      total_revenue: data.revenue,
      payment_count: data.count
    })).sort((a, b) => b.total_revenue - a.total_revenue);

    // Revenue by payment method
    const { data: revenueByMethod } = await (supabase
      .from('payments') as any)
      .select('payment_method, amount')
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd);

    const methodRevenueMap = new Map<string, { revenue: number; count: number }>();
    revenueByMethod?.forEach((payment: any) => {
      const method = payment.payment_method;
      const existing = methodRevenueMap.get(method) || { revenue: 0, count: 0 };
      methodRevenueMap.set(method, {
        revenue: existing.revenue + payment.amount,
        count: existing.count + 1
      });
    });

    const revenueByPaymentMethod = Array.from(methodRevenueMap.entries()).map(([method, data]) => ({
      payment_method: method,
      total_revenue: data.revenue,
      payment_count: data.count
    }));

    // Total summary
    const totalRevenue = dailyRevenue?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
    const totalPayments = dailyRevenue?.length || 0;

    const data = {
      total_revenue: totalRevenue,
      total_payments: totalPayments,
      revenue_by_method: {
        cash: revenueByPaymentMethod.find(r => r.payment_method === 'cash')?.total_revenue || 0,
        transfer: revenueByPaymentMethod.find(r => r.payment_method === 'transfer')?.total_revenue || 0,
      },
      revenue_by_plan: revenueByPlanType,
      daily_revenue: dailyTrend,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching revenue reports:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch revenue reports' },
      { status: 500 }
    );
  }
}