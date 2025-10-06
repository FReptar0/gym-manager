'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useClient, useClientPayments } from '@/hooks';
import { Client, Payment } from '@/types';
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
          Expiring Soon
        </Badge>
      );
    }

    const statusConfig = {
      active: {
        className: "bg-green-500/10 text-green-400 border-green-500/30",
        dot: "bg-green-500",
        label: "Active"
      },
      frozen: {
        className: "bg-red-500/10 text-red-400 border-red-500/30",
        dot: "bg-red-500",
        label: "Expired"
      },
      inactive: {
        className: "bg-stormy-weather/10 text-stormy-weather border-stormy-weather/30",
        dot: "bg-stormy-weather",
        label: "Inactive"
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
      <div className="min-h-screen bg-black-beauty">
        <TopBar title="Client Details" showBack />
        <div className="p-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-coastal-vista" />
            <p className="text-stormy-weather mt-2">Loading client...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-black-beauty">
        <TopBar title="Client Details" showBack />
        <div className="p-4">
          <Card className="bg-midnight-magic border-stormy-weather/30 p-8 text-center">
            <p className="text-red-400">Failed to load client</p>
            <p className="text-sm text-stormy-weather/70 mt-2">{error || 'Client not found'}</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-3 border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
            >
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-beauty">
      <TopBar title={client.full_name} showBack />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="bg-midnight-magic border-stormy-weather/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-stormy-weather/30">
                <AvatarImage src={client.photo_url || undefined} />
                <AvatarFallback className="bg-stormy-weather/20 text-silver-setting text-lg">
                  {getInitials(client.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-silver-setting truncate">
                  {client.full_name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {renderStatusBadge(client)}
                </div>
                
                {client.plan && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-stormy-weather">Current Plan</p>
                    <p className="text-silver-setting font-medium">{client.plan.name}</p>
                    {client.expiration_date && (
                      <p className="text-sm text-stormy-weather">
                        Expires {formatDateRelative(client.expiration_date)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={handlePayment}
                  className="bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto text-coastal-vista mb-2" />
              <p className="text-xs text-stormy-weather">Member Since</p>
              <p className="text-sm text-silver-setting font-medium">
                {formatDate(client.registration_date)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto text-coastal-vista mb-2" />
              <p className="text-xs text-stormy-weather">Last Payment</p>
              <p className="text-sm text-silver-setting font-medium">
                {client.last_payment_date ? formatDateRelative(client.last_payment_date) : 'None'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardContent className="p-4 text-center">
              <User className="h-6 w-6 mx-auto text-coastal-vista mb-2" />
              <p className="text-xs text-stormy-weather">Age</p>
              <p className="text-sm text-silver-setting font-medium">
                {client.birth_date 
                  ? new Date().getFullYear() - new Date(client.birth_date).getFullYear()
                  : 'N/A'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="bg-midnight-magic border-stormy-weather/30">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto text-coastal-vista mb-2" />
              <p className="text-xs text-stormy-weather">Blood Type</p>
              <p className="text-sm text-silver-setting font-medium">
                {client.blood_type || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-midnight-magic border border-stormy-weather/30">
            <TabsTrigger value="info" className="data-[state=active]:bg-coastal-vista data-[state=active]:text-black-beauty">
              Information
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-coastal-vista data-[state=active]:text-black-beauty">
              Payments
            </TabsTrigger>
            <TabsTrigger value="measurements" className="data-[state=active]:bg-coastal-vista data-[state=active]:text-black-beauty">
              Measurements
            </TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="info" className="space-y-4">
            <Card className="bg-midnight-magic border-stormy-weather/30">
              <CardHeader>
                <CardTitle className="text-silver-setting">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-coastal-vista" />
                  <div>
                    <p className="text-sm text-stormy-weather">Phone</p>
                    <p className="text-silver-setting">{client.phone}</p>
                  </div>
                </div>
                
                {client.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-coastal-vista" />
                    <div>
                      <p className="text-sm text-stormy-weather">Email</p>
                      <p className="text-silver-setting">{client.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {client.emergency_contact_name && (
              <Card className="bg-midnight-magic border-stormy-weather/30">
                <CardHeader>
                  <CardTitle className="text-silver-setting">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-stormy-weather">Name</p>
                    <p className="text-silver-setting">{client.emergency_contact_name}</p>
                  </div>
                  {client.emergency_contact_phone && (
                    <div>
                      <p className="text-sm text-stormy-weather">Phone</p>
                      <p className="text-silver-setting">{client.emergency_contact_phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {client.medical_conditions && (
              <Card className="bg-midnight-magic border-stormy-weather/30">
                <CardHeader>
                  <CardTitle className="text-silver-setting flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-silver-setting">{client.medical_conditions}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card className="bg-midnight-magic border-stormy-weather/30">
              <CardHeader>
                <CardTitle className="text-silver-setting">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-coastal-vista" />
                    <p className="text-stormy-weather mt-2">Loading payments...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-stormy-weather">No payments recorded</p>
                    <Button
                      onClick={handlePayment}
                      size="sm"
                      className="mt-3 bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty"
                    >
                      Register First Payment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment, index) => (
                      <div key={payment.id}>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-silver-setting font-medium">
                              {payment.plan?.name || 'Unknown Plan'}
                            </p>
                            <p className="text-sm text-stormy-weather">
                              {formatDate(payment.payment_date)} • {payment.payment_method}
                            </p>
                            <p className="text-xs text-stormy-weather">
                              Period: {formatDate(payment.period_start)} - {formatDate(payment.period_end)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-silver-setting font-medium">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        </div>
                        {index < payments.length - 1 && (
                          <Separator className="bg-stormy-weather/30" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Measurements Tab */}
          <TabsContent value="measurements" className="space-y-4">
            <Card className="bg-midnight-magic border-stormy-weather/30">
              <CardHeader>
                <CardTitle className="text-silver-setting">Body Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-stormy-weather">Measurements feature coming soon</p>
                  <p className="text-sm text-stormy-weather/70 mt-2">
                    Track weight, BMI, and body measurements
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