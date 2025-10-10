'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { DollarSign, Users, TrendingUp, Loader2, BarChart3 } from 'lucide-react';
import { useDashboardStats, useAvailableMonths, useDailyRevenue } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const { months: availableMonths, loading: monthsLoading } = useAvailableMonths();
  const { stats, loading: statsLoading, error, refetch } = useDashboardStats(selectedMonth);
  const { data: chartData, loading: chartLoading } = useDailyRevenue(selectedMonth);

  // Set default month to the first available month with data
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0].value);
    }
  }, [availableMonths, selectedMonth]);

  const loading = statsLoading || monthsLoading;

  if (loading) {
    return (
      <div>
        <TopBar title="Reportes" />
        <div className="p-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-neon-cyan" />
            <p className="text-light-gray mt-2">Cargando reportes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TopBar title="Reportes" />
        <div className="p-4">
          <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
            <p className="text-hot-orange">Error al cargar los reportes</p>
            <p className="text-sm text-light-gray/70 mt-2">{error}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-4 px-4 py-2 bg-neon-cyan text-deep-black rounded-md hover:bg-neon-cyan/90"
            >
              Reintentar
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Reportes" />

      <div className="p-4 space-y-6">
        {/* Month Selector */}
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full bg-steel-gray border-slate-gray text-bright-white">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent className="bg-carbon-gray border-slate-gray">
            {availableMonths.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-bright-white hover:bg-slate-gray/20"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ingresos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">
                {formatCurrency(stats?.total_revenue || 0)}
              </div>
              {stats?.revenue_growth_percentage !== undefined && (
                <p className={`text-sm mt-1 ${stats.revenue_growth_percentage >= 0 ? 'text-electric-lime' : 'text-hot-orange'}`}>
                  {stats.revenue_growth_percentage >= 0 ? '+' : ''}{stats.revenue_growth_percentage.toFixed(1)}% vs mes anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Proyectado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">
                {formatCurrency(stats?.projected_revenue || 0)}
              </div>
              {stats?.total_revenue && stats?.projected_revenue && (
                <p className={`text-sm mt-1 ${stats.total_revenue >= stats.projected_revenue ? 'text-electric-lime' : 'text-hot-orange'}`}>
                  {((stats.total_revenue / stats.projected_revenue) * 100).toFixed(1)}% de la meta
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray flex items-center gap-2">
                <Users className="h-4 w-4" />
                Nuevos Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">
                {stats?.new_clients_this_month || 0}
              </div>
              {stats?.client_growth_percentage !== undefined && (
                <p className={`text-sm mt-1 ${stats.client_growth_percentage >= 0 ? 'text-electric-lime' : 'text-hot-orange'}`}>
                  {stats.client_growth_percentage >= 0 ? '+' : ''}{stats.client_growth_percentage.toFixed(1)}% vs mes anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray">
                Clientes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">
                {stats?.active_clients || 0}
              </div>
              <p className="text-sm text-light-gray mt-1">
                Total actualmente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardHeader>
            <CardTitle className="text-bright-white flex items-center gap-2">
              <BarChart3 className="h-7 w-5" />
              Tendencia de Ingresos Diarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
              </div>
            ) : chartData.length > 0 ? (
              <RevenueChart data={chartData} className="h-72" />
            ) : (
              <div className="h-72 flex items-center justify-center text-light-gray">
                No hay datos de ingresos para este período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardHeader>
            <CardTitle className="text-bright-white">Resumen del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-light-gray">Ingresos</p>
                <p className="text-lg font-semibold text-bright-white">
                  {formatCurrency(stats?.total_revenue || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-gray">Meta</p>
                <p className="text-lg font-semibold text-bright-white">
                  {formatCurrency(stats?.projected_revenue || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-gray">Nuevos</p>
                <p className="text-lg font-semibold text-bright-white">
                  {stats?.new_clients_this_month || 0} clientes
                </p>
              </div>
              <div>
                <p className="text-sm text-light-gray">Activos</p>
                <p className="text-lg font-semibold text-bright-white">
                  {stats?.active_clients || 0} clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
