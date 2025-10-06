'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayments, usePlans } from '@/hooks';
import { PaymentFilters } from '@/types';
import { formatCurrency, formatDate, formatDateRelative } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Loader2,
  User,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [page, setPage] = useState(1);
  
  const { payments, loading, error, pagination, refetch } = usePayments({
    filters,
    page,
    limit: 20,
    sort_by: 'payment_date',
    sort_order: 'desc',
  });
  
  const { plans } = usePlans();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPaymentMethodBadge = (method: string) => {
    const config = {
      cash: {
        className: "bg-green-500/10 text-green-400 border-green-500/30",
        label: "Cash"
      },
      transfer: {
        className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        label: "Transfer"
      }
    };

    const methodConfig = config[method as keyof typeof config] || {
      className: "bg-stormy-weather/10 text-stormy-weather border-stormy-weather/30",
      label: method
    };

    return (
      <Badge className={methodConfig.className}>
        {methodConfig.label}
      </Badge>
    );
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleClientClick = (clientId: string) => {
    if (clientId !== '00000000-0000-0000-0000-000000000001') {
      router.push(`/dashboard/clients/${clientId}`);
    }
  };

  return (
    <div>
      <TopBar title="Payments" />

      <div className="p-4 space-y-4">
        {/* Filters */}
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardContent className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stormy-weather" />
              <Input
                placeholder="Search by client name..."
                value={filters.client_search || ''}
                onChange={(e) => setFilters({ ...filters, client_search: e.target.value })}
                className="pl-10 bg-black-beauty border-stormy-weather text-silver-setting"
              />
            </div>

            {/* Filter Row */}
            <div className="flex gap-2 overflow-x-auto">
              <Select
                value={filters.plan_id || 'all'}
                onValueChange={(value) => 
                  setFilters({ ...filters, plan_id: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-48 bg-black-beauty border-stormy-weather text-silver-setting">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    <SelectValue placeholder="Filter by plan" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-midnight-magic border-stormy-weather">
                  <SelectItem value="all" className="text-silver-setting">All Plans</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem 
                      key={plan.id} 
                      value={plan.id}
                      className="text-silver-setting hover:bg-stormy-weather/20"
                    >
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.payment_method || 'all'}
                onValueChange={(value) => 
                  setFilters({ ...filters, payment_method: value === 'all' ? undefined : value as any })
                }
              >
                <SelectTrigger className="w-40 bg-black-beauty border-stormy-weather text-silver-setting">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent className="bg-midnight-magic border-stormy-weather">
                  <SelectItem value="all" className="text-silver-setting">All Methods</SelectItem>
                  <SelectItem value="cash" className="text-silver-setting">Cash</SelectItem>
                  <SelectItem value="transfer" className="text-silver-setting">Transfer</SelectItem>
                </SelectContent>
              </Select>

              {(filters.client_search || filters.plan_id || filters.payment_method) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({})}
                  className="text-stormy-weather hover:text-silver-setting"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-3">
          {loading && page === 1 ? (
            <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-coastal-vista" />
              <p className="text-stormy-weather mt-2">Loading payments...</p>
            </Card>
          ) : error ? (
            <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
              <p className="text-red-400">Error loading payments</p>
              <p className="text-sm text-stormy-weather/70 mt-2">{error}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-3 border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
              >
                Try Again
              </Button>
            </Card>
          ) : payments.length === 0 ? (
            <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-stormy-weather/50 mb-4" />
              <p className="text-stormy-weather">
                {filters.client_search || filters.plan_id || filters.payment_method
                  ? 'No payments match your filters'
                  : 'No payments yet'
                }
              </p>
              <p className="text-sm text-stormy-weather/70 mt-2">
                {filters.client_search || filters.plan_id || filters.payment_method
                  ? 'Try adjusting your search or filters'
                  : 'Register your first payment to get started'
                }
              </p>
              {!(filters.client_search || filters.plan_id || filters.payment_method) && (
                <Link href="/dashboard/payments/new">
                  <Button className="mt-4 bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty">
                    <Plus className="h-4 w-4 mr-2" />
                    Register First Payment
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <>
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  className="bg-midnight-magic border-stormy-weather/30 hover:border-coastal-vista/30 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Client Avatar */}
                      <button
                        onClick={() => handleClientClick(payment.client.id)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                        disabled={payment.client.id === '00000000-0000-0000-0000-000000000001'}
                      >
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={payment.client.photo_url || undefined} />
                          <AvatarFallback className="bg-stormy-weather/20 text-silver-setting">
                            {payment.client.full_name === 'Guest / Daily' ? '👤' : getInitials(payment.client.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-silver-setting font-medium truncate">
                            {payment.client.full_name}
                          </p>
                          <p className="text-sm text-stormy-weather">
                            {payment.plan?.name || 'Unknown Plan'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-stormy-weather" />
                            <span className="text-xs text-stormy-weather">
                              {formatDateRelative(payment.payment_date)}
                            </span>
                            {getPaymentMethodBadge(payment.payment_method)}
                          </div>
                        </div>
                      </button>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="text-lg font-semibold text-silver-setting">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-stormy-weather">
                          {formatDate(payment.period_start)} - {formatDate(payment.period_end)}
                        </p>
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="mt-3 pt-3 border-t border-stormy-weather/30">
                        <p className="text-sm text-stormy-weather">{payment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Load More */}
              {pagination.has_next && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    disabled={loading}
                    className="border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center text-sm text-stormy-weather pt-2">
                Showing {payments.length} of {pagination.total} payments
              </div>
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <Link href="/dashboard/payments/new">
          <Button
            size="icon"
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty shadow-lg md:bottom-4 z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
