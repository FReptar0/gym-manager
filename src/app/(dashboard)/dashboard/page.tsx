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
        <TopBar title="Panel de Control" />
        <div className="p-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-neon-cyan" />
            <p className="text-light-gray mt-2">Cargando panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TopBar title="Panel de Control" />
        <div className="p-4">
          <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
            <p className="text-hot-orange">Error al cargar el panel</p>
            <p className="text-sm text-light-gray/70 mt-2">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Panel de Control" />

      <div className="p-4 space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-neon-cyan/10 to-electric-lime/10 border border-neon-cyan/20 rounded-lg p-4">
          <h1 className="text-xl font-semibold text-bright-white">
            ¡Bienvenido de vuelta! 👋
          </h1>
          <p className="text-light-gray mt-1">
            Esto es lo que está pasando en tu gimnasio hoy
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Ingresos Mensuales"
            value={stats?.total_revenue || 0}
            format="currency"
            icon={DollarSign}
            change={stats?.revenue_growth_percentage ? {
              value: stats.revenue_growth_percentage,
              period: 'mes pasado'
            } : undefined}
            trend={stats?.revenue_growth_percentage ? (stats.revenue_growth_percentage > 0 ? 'up' : stats.revenue_growth_percentage < 0 ? 'down' : 'neutral') : 'neutral'}
          />
          
          <KPICard
            title="Clientes Activos"
            value={stats?.active_clients || 0}
            format="number"
            icon={Users}
            change={stats?.client_growth_percentage ? {
              value: stats.client_growth_percentage,
              period: 'mes pasado'
            } : undefined}
            trend={stats?.client_growth_percentage ? (stats.client_growth_percentage > 0 ? 'up' : stats.client_growth_percentage < 0 ? 'down' : 'neutral') : 'neutral'}
          />
          
          <KPICard
            title="Nuevos Clientes"
            value={stats?.new_clients_this_month || 0}
            format="number"
            icon={UserPlus}
          />
          
          <KPICard
            title="Ingresos vs Meta"
            value={stats?.projected_revenue && stats?.total_revenue ? 
              (stats.total_revenue / stats.projected_revenue) * 100 : 0}
            format="percentage"
            icon={Target}
            change={stats?.projected_revenue && stats?.total_revenue ? {
              value: ((stats.total_revenue - stats.projected_revenue) / stats.projected_revenue) * 100,
              period: 'proyección'
            } : undefined}
            trend={stats?.projected_revenue && stats?.total_revenue ? 
              (stats.total_revenue >= stats.projected_revenue ? 'up' : 'down') : 'neutral'}
          />
        </div>

        {/* Revenue Chart */}
        {revenueData && revenueData.length > 0 && (
          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader>
              <CardTitle className="text-bright-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendencia de Ingresos (Últimos 30 Días)
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
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardHeader>
            <CardTitle className="text-bright-white">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/dashboard/payments/new">
                <Button className="w-full bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </Link>
              <Link href="/dashboard/clients/new">
                <Button className="w-full bg-electric-lime hover:bg-electric-lime/90 text-deep-black">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </Link>
              <Link href="/dashboard/plans">
                <Button className="w-full bg-hot-orange hover:bg-hot-orange/90 text-bright-white">
                  <Target className="h-4 w-4 mr-2" />
                  Gestionar Planes
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full border-slate-gray text-light-gray hover:bg-slate-gray/10">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reportes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardHeader>
            <CardTitle className="text-bright-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-bright-white">
                  $0
                </p>
                <p className="text-xs text-light-gray">Ingresos de Hoy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-bright-white">
                  0
                </p>
                <p className="text-xs text-light-gray">Pagos</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-2xl font-bold text-bright-white">
                  0
                </p>
                <p className="text-xs text-light-gray">Nuevos Registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
