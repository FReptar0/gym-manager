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
        label: "Efectivo"
      },
      transfer: {
        className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        label: "Transferencia"
      }
    };

    const methodConfig = config[method as keyof typeof config] || {
      className: "bg-slate-gray/10 text-light-gray border-slate-gray/30",
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
      <TopBar title="Pagos" />

      <div className="p-4 space-y-4">
        {/* Filters */}
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardContent className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-gray" />
              <Input
                placeholder="Buscar por nombre del cliente..."
                value={filters.client_search || ''}
                onChange={(e) => setFilters({ ...filters, client_search: e.target.value })}
                className="pl-10 bg-steel-gray border-slate-gray text-bright-white"
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
                <SelectTrigger className="w-48 bg-steel-gray border-slate-gray text-bright-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    <SelectValue placeholder="Filtrar por plan" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-carbon-gray border-slate-gray">
                  <SelectItem value="all" className="text-bright-white">Todos los Planes</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem 
                      key={plan.id} 
                      value={plan.id}
                      className="text-bright-white hover:bg-slate-gray/20"
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
                <SelectTrigger className="w-40 bg-steel-gray border-slate-gray text-bright-white">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent className="bg-carbon-gray border-slate-gray">
                  <SelectItem value="all" className="text-bright-white">Todos los Métodos</SelectItem>
                  <SelectItem value="cash" className="text-bright-white">Efectivo</SelectItem>
                  <SelectItem value="transfer" className="text-bright-white">Transferencia</SelectItem>
                </SelectContent>
              </Select>

              {(filters.client_search || filters.plan_id || filters.payment_method) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({})}
                  className="text-light-gray hover:text-bright-white"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-3">
          {loading && page === 1 ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-neon-cyan" />
              <p className="text-light-gray mt-2">Cargando pagos...</p>
            </Card>
          ) : error ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <p className="text-hot-orange">Error al cargar pagos</p>
              <p className="text-sm text-light-gray/70 mt-2">{error}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-3 border-slate-gray text-light-gray hover:bg-slate-gray/10"
              >
                Intentar de Nuevo
              </Button>
            </Card>
          ) : payments.length === 0 ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-light-gray/50 mb-4" />
              <p className="text-light-gray">
                {filters.client_search || filters.plan_id || filters.payment_method
                  ? 'No hay pagos que coincidan con tus filtros'
                  : 'Aún no hay pagos'
                }
              </p>
              <p className="text-sm text-light-gray/70 mt-2">
                {filters.client_search || filters.plan_id || filters.payment_method
                  ? 'Intenta ajustar tu búsqueda o filtros'
                  : 'Registra tu primer pago para comenzar'
                }
              </p>
              {!(filters.client_search || filters.plan_id || filters.payment_method) && (
                <Link href="/dashboard/payments/new">
                  <Button className="mt-4 bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primer Pago
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <>
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  className="bg-carbon-gray border-slate-gray/30 hover:border-neon-cyan/30 transition-colors"
                >
                  <CardContent className="p-3">
                    {/* Mobile-First Layout */}
                    <div className="space-y-3">
                      {/* Top Row: Client Info */}
                      <button
                        onClick={() => handleClientClick(payment.client.id)}
                        className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
                        disabled={payment.client.id === '00000000-0000-0000-0000-000000000001'}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={payment.client.photo_url || undefined} />
                          <AvatarFallback className="bg-slate-gray/20 text-bright-white">
                            {payment.client.full_name === 'Guest / Daily' ? '👤' : getInitials(payment.client.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-bright-white truncate">
                            {payment.client.full_name}
                          </p>
                          <p className="text-xs text-light-gray">
                            {payment.plan?.name || 'Plan Desconocido'}
                          </p>
                        </div>
                      </button>

                      {/* Amount Section */}
                      <div className="text-center py-2 bg-deep-black/30 rounded-md">
                        <p className="text-lg font-bold text-electric-lime">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-light-gray">Total Pagado</p>
                      </div>

                      {/* Payment Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-neon-cyan flex-shrink-0" />
                          <span className="text-xs text-light-gray truncate">
                            {formatDateRelative(payment.payment_date)}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          {getPaymentMethodBadge(payment.payment_method)}
                        </div>
                      </div>

                      {/* Period Info */}
                      <div className="text-center">
                        <p className="text-xs text-light-gray">
                          Período: {formatDate(payment.period_start, 'MMM d')} - {formatDate(payment.period_end, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-gray/30">
                        <p className="text-sm text-slate-gray">{payment.notes}</p>
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
                    className="border-slate-gray text-light-gray hover:bg-slate-gray/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      'Cargar Más'
                    )}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center text-sm text-slate-gray pt-2">
                Mostrando {payments.length} de {pagination.total} pagos
              </div>
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <Link href="/dashboard/payments/new">
          <Button
            size="icon"
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black shadow-lg md:bottom-4 z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
