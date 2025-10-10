export const dynamic = 'force-dynamic';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <TopBar title="Reportes" />

      <div className="p-4 space-y-6">
        {/* Month Selector */}
        <select className="w-full h-10 rounded-md border border-slate-gray bg-steel-gray px-3 py-2 text-bright-white">
          <option>Octubre 2025</option>
          <option>Septiembre 2025</option>
          <option>Agosto 2025</option>
        </select>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray">
                Ingresos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">$0</div>
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray">
                Proyectado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">$0</div>
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray">
                Nuevos Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">0</div>
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-light-gray">
                Crecimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bright-white">0%</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardHeader>
            <CardTitle className="text-bright-white">Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-light-gray">
              El gráfico aparecerá aquí
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
