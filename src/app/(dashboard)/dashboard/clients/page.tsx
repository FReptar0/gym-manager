'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientFiltersComponent } from '@/components/clients/ClientFilters';
import { useClients } from '@/hooks';
import { ClientFilters } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

export default function ClientsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ClientFilters>({ status: 'all' });
  const [page, setPage] = useState(1);
  
  const { clients, loading, error, pagination, refetch } = useClients({
    filters,
    page,
    limit: 20,
    sort_by: 'full_name',
    sort_order: 'asc',
  });

  const handlePayment = (clientId: string) => {
    router.push(`/dashboard/payments/new?client_id=${clientId}`);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div>
      <TopBar title="Clientes" />

      <div className="p-4 space-y-4">
        {/* Filters */}
        <ClientFiltersComponent 
          filters={filters} 
          onFiltersChange={setFilters}
        />

        {/* Client List */}
        <div className="space-y-3">
          {loading && page === 1 ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-neon-cyan" />
              <p className="text-light-gray mt-2">Cargando clientes...</p>
            </Card>
          ) : error ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <p className="text-hot-orange">Error al cargar clientes</p>
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
          ) : clients.length === 0 ? (
            <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
              <p className="text-light-gray">
                {filters.search || filters.status !== 'all' || filters.plan_id || filters.expiring_soon
                  ? 'No hay clientes que coincidan con tus filtros'
                  : 'Aún no hay clientes'
                }
              </p>
              <p className="text-sm text-light-gray/70 mt-2">
                {filters.search || filters.status !== 'all' || filters.plan_id || filters.expiring_soon
                  ? 'Intenta ajustar tu búsqueda o filtros'
                  : 'Agrega tu primer cliente para comenzar'
                }
              </p>
              {!(filters.search || filters.status !== 'all' || filters.plan_id || filters.expiring_soon) && (
                <Link href="/dashboard/clients/new">
                  <Button className="mt-4 bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Cliente
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <>
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onPayment={handlePayment}
                />
              ))}

              {/* Load More */}
              {pagination.has_next && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    disabled={loading}
                    className="bg-steel-gray border-slate-gray text-light-gray hover:bg-slate-gray/20"
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
              <div className="text-center text-sm text-light-gray pt-2">
                Mostrando {clients.length} de {pagination.total} clientes
              </div>
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <Link href="/dashboard/clients/new">
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
