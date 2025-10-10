'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types';
import { formatDateRelative } from '@/lib/utils';
import { 
  AlertTriangle, 
  Calendar, 
  CreditCard,
  ChevronRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientAlertsProps {
  expiringClients: Client[];
  expiredClients: Client[];
}

export function ClientAlerts({ expiringClients, expiredClients }: ClientAlertsProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClientClick = (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`);
  };

  const handlePayment = (clientId: string) => {
    router.push(`/dashboard/payments/new?client_id=${clientId}`);
  };

  if (expiringClients.length === 0 && expiredClients.length === 0) {
    return (
      <Card className="bg-carbon-gray border-slate-gray/30">
        <CardHeader>
          <CardTitle className="text-bright-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Alertas de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto text-light-gray/50 mb-3" />
            <p className="text-light-gray">Todas las membresías están al día</p>
            <p className="text-sm text-light-gray/70 mt-1">
              No hay membresías por expirar o vencidas para revisar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-carbon-gray border-slate-gray/30">
      <CardHeader>
        <CardTitle className="text-bright-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Alertas de Clientes
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 ml-auto">
            {expiringClients.length + expiredClients.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expired Clients */}
        {expiredClients.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h4 className="text-sm font-medium text-red-400">
                Vencidas ({expiredClients.length})
              </h4>
            </div>
            <div className="space-y-2">
              {expiredClients.slice(0, 3).map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.photo_url || undefined} />
                    <AvatarFallback className="bg-slate-gray/20 text-bright-white text-sm">
                      {getInitials(client.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-bright-white font-medium truncate">
                      {client.full_name}
                    </p>
                    <p className="text-xs text-red-400">
                      Venció {client.expiration_date ? formatDateRelative(client.expiration_date) : 'Desconocido'}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handlePayment(client.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs px-2 h-7"
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      Renovar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClientClick(client.id)}
                      className="text-light-gray hover:text-bright-white h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {expiredClients.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/clients?status=frozen')}
                  className="w-full text-light-gray hover:text-bright-white"
                >
                  Ver {expiredClients.length - 3} membresías vencidas más
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Expiring Soon */}
        {expiringClients.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-yellow-400" />
              <h4 className="text-sm font-medium text-yellow-400">
                Por Vencer ({expiringClients.length})
              </h4>
            </div>
            <div className="space-y-2">
              {expiringClients.slice(0, 3).map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.photo_url || undefined} />
                    <AvatarFallback className="bg-slate-gray/20 text-bright-white text-sm">
                      {getInitials(client.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-bright-white font-medium truncate">
                      {client.full_name}
                    </p>
                    <p className="text-xs text-yellow-400">
                      Vence {client.expiration_date ? formatDateRelative(client.expiration_date) : 'Desconocido'}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handlePayment(client.id)}
                      className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs px-2 h-7"
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      Extender
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClientClick(client.id)}
                      className="text-light-gray hover:text-bright-white h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {expiringClients.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/clients?expiring_soon=true')}
                  className="w-full text-light-gray hover:text-bright-white"
                >
                  Ver {expiringClients.length - 3} membresías por vencer más
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}