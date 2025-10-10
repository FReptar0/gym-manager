'use client';

import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClient, useClientPayments } from '@/hooks';
import { Client } from '@/types';
import { formatCurrency, formatDate, formatDateRelative } from '@/lib/utils';
import { getClientStatus, isClientExpiring } from '@/lib/utils/client-helpers';
import { 
  CreditCard, 
  Edit, 
  Phone, 
  Mail, 
  Calendar, 
  AlertTriangle, 
  User,
  Heart,
  Loader2,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const { client, loading, error, refetch } = useClient(clientId);
  const { payments, loading: paymentsLoading } = useClientPayments(clientId);

  const handleEdit = () => {
    router.push(`/dashboard/clients/${clientId}/edit`);
  };

  const handlePayment = () => {
    router.push(`/dashboard/payments/new?client_id=${clientId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStatusBadge = (client: Client) => {
    const status = getClientStatus(client);
    const isExpiring = isClientExpiring(client);
    
    if (isExpiring && status === 'active') {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
          Próximo a Vencer
        </Badge>
      );
    }

    const statusConfig = {
      active: {
        className: "bg-green-500/10 text-green-400 border-green-500/30",
        dot: "bg-green-500",
        label: "Activo"
      },
      frozen: {
        className: "bg-red-500/10 text-red-400 border-red-500/30",
        dot: "bg-red-500",
        label: "Expirado"
      },
      inactive: {
        className: "bg-slate-gray/10 text-light-gray border-slate-gray/30",
        dot: "bg-slate-gray",
        label: "Inactivo"
      }
    };

    const config = statusConfig[status];
    
    return (
      <Badge className={config.className}>
        <span className={cn("w-2 h-2 rounded-full mr-2", config.dot)} />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black">
        <TopBar title="Detalles del Cliente" showBack />
        <div className="p-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-neon-cyan" />
            <p className="text-light-gray mt-2">Cargando cliente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-deep-black">
        <TopBar title="Detalles del Cliente" showBack />
        <div className="p-4">
          <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
            <p className="text-hot-orange">Error al cargar cliente</p>
            <p className="text-sm text-light-gray/70 mt-2">{error || 'Cliente no encontrado'}</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-3 border-slate-gray text-light-gray hover:bg-slate-gray/10"
            >
              Intentar de Nuevo
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black">
      <TopBar title={client.full_name} showBack />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-slate-gray/30">
                <AvatarImage src={client.photo_url || undefined} />
                <AvatarFallback className="bg-slate-gray/20 text-bright-white text-lg">
                  {getInitials(client.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-bright-white truncate">
                  {client.full_name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {renderStatusBadge(client)}
                </div>
                
                {client.plan && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-light-gray">Plan Actual</p>
                    <p className="text-bright-white font-medium">{client.plan.name}</p>
                    {client.expiration_date && (
                      <p className="text-sm text-light-gray">
                        Vence {formatDateRelative(client.expiration_date)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="border-slate-gray text-light-gray hover:bg-slate-gray/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  onClick={handlePayment}
                  className="bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pago
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto text-neon-cyan mb-2" />
              <p className="text-xs text-light-gray">Miembro Desde</p>
              <p className="text-sm text-bright-white font-medium">
                {formatDate(client.registration_date)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto text-neon-cyan mb-2" />
              <p className="text-xs text-light-gray">Último Pago</p>
              <p className="text-sm text-bright-white font-medium">
                {client.last_payment_date ? formatDateRelative(client.last_payment_date) : 'Ninguno'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardContent className="p-4 text-center">
              <User className="h-6 w-6 mx-auto text-neon-cyan mb-2" />
              <p className="text-xs text-light-gray">Edad</p>
              <p className="text-sm text-bright-white font-medium">
                {client.birth_date 
                  ? new Date().getFullYear() - new Date(client.birth_date).getFullYear()
                  : 'N/A'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="bg-carbon-gray border-slate-gray/30">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto text-neon-cyan mb-2" />
              <p className="text-xs text-light-gray">Tipo de Sangre</p>
              <p className="text-sm text-bright-white font-medium">
                {client.blood_type || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-carbon-gray border border-slate-gray/30">
            <TabsTrigger value="info" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-deep-black">
              Información
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-deep-black">
              Pagos
            </TabsTrigger>
            <TabsTrigger value="measurements" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-deep-black">
              Medidas
            </TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="info" className="space-y-4">
            <Card className="bg-carbon-gray border-slate-gray/30">
              <CardHeader>
                <CardTitle className="text-bright-white">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-neon-cyan" />
                  <div>
                    <p className="text-sm text-light-gray">Teléfono</p>
                    <p className="text-bright-white">{client.phone}</p>
                  </div>
                </div>
                
                {client.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-neon-cyan" />
                    <div>
                      <p className="text-sm text-light-gray">Correo</p>
                      <p className="text-bright-white">{client.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {client.emergency_contact_name && (
              <Card className="bg-carbon-gray border-slate-gray/30">
                <CardHeader>
                  <CardTitle className="text-bright-white">Contacto de Emergencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-light-gray">Nombre</p>
                    <p className="text-bright-white">{client.emergency_contact_name}</p>
                  </div>
                  {client.emergency_contact_phone && (
                    <div>
                      <p className="text-sm text-light-gray">Teléfono</p>
                      <p className="text-bright-white">{client.emergency_contact_phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {client.medical_conditions && (
              <Card className="bg-carbon-gray border-slate-gray/30">
                <CardHeader>
                  <CardTitle className="text-bright-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    Información Médica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-bright-white">{client.medical_conditions}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card className="bg-carbon-gray border-slate-gray/30">
              <CardHeader>
                <CardTitle className="text-bright-white">Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-neon-cyan" />
                    <p className="text-light-gray mt-2">Cargando pagos...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-steel-gray/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-light-gray" />
                      </div>
                      <h3 className="text-lg font-semibold text-bright-white mb-2">
                        Sin Historial de Pagos
                      </h3>
                      <p className="text-light-gray">
                        Este cliente aún no tiene pagos registrados. Comienza registrando su primer pago.
                      </p>
                    </div>
                    
                    <Button
                      onClick={handlePayment}
                      className="bg-gradient-to-r from-neon-cyan to-electric-lime hover:from-neon-cyan/90 hover:to-electric-lime/90 text-deep-black font-medium px-6 py-2"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Registrar Primer Pago
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment, index) => (
                      <div 
                        key={payment.id}
                        className="bg-steel-gray/30 border border-slate-gray/40 rounded-lg p-3 hover:bg-steel-gray/50 transition-all duration-200"
                      >
                        {/* Mobile-First Header */}
                        <div className="space-y-3">
                          {/* Top Row: Icon, Plan & Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="p-1.5 bg-neon-cyan/10 rounded-md flex-shrink-0">
                                <CreditCard className="h-4 w-4 text-neon-cyan" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold text-bright-white truncate">
                                  {payment.plan?.name || 'Plan Desconocido'}
                                </h4>
                                <p className="text-xs text-light-gray">
                                  {formatDate(payment.payment_date)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Amount Row */}
                          <div className="text-center py-2 bg-deep-black/30 rounded-md">
                            <p className="text-xl font-bold text-electric-lime">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-light-gray">Total Pagado</p>
                          </div>

                          {/* Details Grid - Stacked on Mobile */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full"></div>
                                <span className="text-xs text-light-gray">Método</span>
                              </div>
                              <span className="text-sm text-bright-white capitalize">
                                {payment.payment_method}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-electric-lime rounded-full"></div>
                                <span className="text-xs text-light-gray">Período</span>
                              </div>
                              <span className="text-sm text-bright-white text-right">
                                {formatDate(payment.period_start, 'MMM d')} - {formatDate(payment.period_end, 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Payment Button */}
                    <div className="mt-6 pt-4 border-t border-slate-gray/30">
                      <Button
                        onClick={handlePayment}
                        className="w-full bg-gradient-to-r from-neon-cyan to-electric-lime hover:from-neon-cyan/90 hover:to-electric-lime/90 text-deep-black font-medium"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Registrar Nuevo Pago
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Measurements Tab */}
          <TabsContent value="measurements" className="space-y-4">
            <Card className="bg-carbon-gray border-slate-gray/30">
              <CardHeader>
                <CardTitle className="text-bright-white">Medidas Corporales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-light-gray">Función de medidas próximamente</p>
                  <p className="text-sm text-light-gray/70 mt-2">
                    Registra peso, IMC y medidas corporales
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}