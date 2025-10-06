'use client';

import { ClientWithPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getDaysUntilExpiration, isExpiringSoon, isExpired } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { STATUS_BADGE_CONFIG } from '@/lib/constants';
import { Phone, Mail, Calendar, CreditCard, Eye, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: ClientWithPlan;
  onPayment?: (clientId: string) => void;
}

export function ClientCard({ client, onPayment }: ClientCardProps) {
  const getStatusForDisplay = () => {
    if (client.status === 'active' && client.expiration_date) {
      const daysUntil = getDaysUntilExpiration(client.expiration_date);
      if (isExpired(client.expiration_date)) {
        return 'frozen';
      }
      if (isExpiringSoon(client.expiration_date)) {
        return 'expiring_soon';
      }
    }
    return client.status as keyof typeof STATUS_BADGE_CONFIG;
  };

  const statusKey = getStatusForDisplay();
  const statusConfig = STATUS_BADGE_CONFIG[statusKey];
  const daysUntilExpiration = client.expiration_date ? getDaysUntilExpiration(client.expiration_date) : null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="bg-midnight-magic border-stormy-weather/30 hover:border-coastal-vista/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-stormy-weather/30">
            <AvatarImage src={client.photo_url || undefined} alt={client.full_name} />
            <AvatarFallback className="bg-stormy-weather/20 text-silver-setting font-medium">
              {getInitials(client.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-silver-setting truncate">
                  {client.full_name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-stormy-weather mt-1">
                  <Phone className="h-3 w-3" />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-1 text-sm text-stormy-weather">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <Badge
                className={cn(
                  "shrink-0 border",
                  statusConfig.bgClass,
                  statusConfig.textClass,
                  statusConfig.borderClass
                )}
              >
                <span className={cn("w-2 h-2 rounded-full mr-2", statusConfig.dotClass)} />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Plan Info */}
            {client.plan && (
              <div className="mt-3 p-2 rounded bg-black-beauty/50 border border-stormy-weather/20">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-coastal-vista" />
                    <span className="text-silver-setting">{client.plan.name}</span>
                  </div>
                  <span className="text-coastal-vista font-medium">
                    {formatCurrency(client.plan.price)}
                  </span>
                </div>
                
                {client.expiration_date && (
                  <div className="flex items-center gap-1 text-xs text-stormy-weather mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Expires {formatDate(client.expiration_date, 'MMM d, yyyy')}
                      {daysUntilExpiration !== null && (
                        <span className={cn(
                          "ml-1",
                          daysUntilExpiration < 0 
                            ? "text-red-400" 
                            : daysUntilExpiration <= 3 
                            ? "text-yellow-400" 
                            : "text-stormy-weather"
                        )}>
                          ({daysUntilExpiration >= 0 ? `${daysUntilExpiration}d left` : `${Math.abs(daysUntilExpiration)}d overdue`})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </Link>
              
              <Button 
                size="sm" 
                onClick={() => onPayment?.(client.id)}
                className="bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Pay
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}