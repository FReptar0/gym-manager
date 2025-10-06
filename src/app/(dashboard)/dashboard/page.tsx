'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ClientAlerts } from '@/components/dashboard/ClientAlerts';
import { useDashboardStats } from '@/hooks';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  UserPlus, 
  Calendar,
  BarChart3,
  Loader2,
  Target
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    stats, 
    loading, 
    error 
  } = useDashboardStats();
  
  // Mock data for now - will be implemented with actual hooks later
  const revenueData: { date: string; revenue: number }[] = [];
  const expiringClients: any[] = [];
  const expiredClients: any[] = [];

  if (loading) {
    return (
      <div>
        <TopBar title="Dashboard" />
        <div className="p-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-coastal-vista" />
            <p className="text-stormy-weather mt-2">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TopBar title="Dashboard" />
        <div className="p-4">
          <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
            <p className="text-red-400">Failed to load dashboard</p>
            <p className="text-sm text-stormy-weather/70 mt-2">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Dashboard" />

      <div className="p-4 space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-coastal-vista/10 to-frontier-fort/10 border border-coastal-vista/20 rounded-lg p-4">
          <h1 className="text-xl font-semibold text-silver-setting">
            Welcome back! 👋
          </h1>
          <p className="text-stormy-weather mt-1">
            Here&apos;s what&apos;s happening at your gym today
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Monthly Revenue"
            value={stats?.total_revenue || 0}
            format="currency"
            icon={DollarSign}
            change={stats?.revenue_growth_percentage ? {
              value: stats.revenue_growth_percentage,
              period: 'last month'
            } : undefined}
            trend={stats?.revenue_growth_percentage ? (stats.revenue_growth_percentage > 0 ? 'up' : stats.revenue_growth_percentage < 0 ? 'down' : 'neutral') : 'neutral'}
          />
          
          <KPICard
            title="Active Clients"
            value={stats?.active_clients || 0}
            format="number"
            icon={Users}
            change={stats?.client_growth_percentage ? {
              value: stats.client_growth_percentage,
              period: 'last month'
            } : undefined}
            trend={stats?.client_growth_percentage ? (stats.client_growth_percentage > 0 ? 'up' : stats.client_growth_percentage < 0 ? 'down' : 'neutral') : 'neutral'}
          />
          
          <KPICard
            title="New Clients"
            value={stats?.new_clients_this_month || 0}
            format="number"
            icon={UserPlus}
          />
          
          <KPICard
            title="Revenue vs Goal"
            value={stats?.projected_revenue && stats?.total_revenue ? 
              (stats.total_revenue / stats.projected_revenue) * 100 : 0}
            format="percentage"
            icon={Target}
            change={stats?.projected_revenue && stats?.total_revenue ? {
              value: ((stats.total_revenue - stats.projected_revenue) / stats.projected_revenue) * 100,
              period: 'projection'
            } : undefined}
            trend={stats?.projected_revenue && stats?.total_revenue ? 
              (stats.total_revenue >= stats.projected_revenue ? 'up' : 'down') : 'neutral'}
          />
        </div>

        {/* Revenue Chart */}
        {revenueData && revenueData.length > 0 && (
          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardHeader>
              <CardTitle className="text-silver-setting flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>
        )}

        {/* Client Alerts */}
        <ClientAlerts 
          expiringClients={expiringClients || []}
          expiredClients={expiredClients || []}
        />

        {/* Quick Actions */}
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardHeader>
            <CardTitle className="text-silver-setting">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/dashboard/payments/new">
                <Button className="w-full bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty">
                  <DollarSign className="h-4 w-4 mr-2" />
                  New Payment
                </Button>
              </Link>
              <Link href="/dashboard/clients/new">
                <Button className="w-full bg-frontier-fort hover:bg-frontier-fort/90 text-black-beauty">
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </Link>
              <Link href="/dashboard/clients">
                <Button variant="outline" className="w-full border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10">
                  <Users className="h-4 w-4 mr-2" />
                  View Clients
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardHeader>
            <CardTitle className="text-silver-setting flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-silver-setting">
                  $0
                </p>
                <p className="text-xs text-stormy-weather">Today&apos;s Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-silver-setting">
                  0
                </p>
                <p className="text-xs text-stormy-weather">Payments</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-2xl font-bold text-silver-setting">
                  0
                </p>
                <p className="text-xs text-stormy-weather">New Sign-ups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
