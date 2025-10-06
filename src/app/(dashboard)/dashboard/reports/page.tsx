export const dynamic = 'force-dynamic';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <TopBar title="Reports" />

      <div className="p-4 space-y-6">
        {/* Month Selector */}
        <select className="w-full h-10 rounded-md border border-stormy-weather bg-midnight-magic px-3 py-2 text-silver-setting">
          <option>October 2025</option>
          <option>September 2025</option>
          <option>August 2025</option>
        </select>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stormy-weather">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-silver-setting">$0</div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stormy-weather">
                Projected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-silver-setting">$0</div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stormy-weather">
                New Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-silver-setting">0</div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stormy-weather">
                Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-silver-setting">0%</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardHeader>
            <CardTitle className="text-silver-setting">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-stormy-weather">
              Chart will appear here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
