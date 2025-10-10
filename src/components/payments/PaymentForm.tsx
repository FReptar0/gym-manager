'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { paymentSchema, PaymentFormData } from '@/lib/utils/validation';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { Client, Plan, Payment } from '@/types';
import { usePaymentMutations, useClients, usePlans } from '@/hooks';
import { formatCurrency, formatDate, addDays } from '@/lib/utils';
import { Search, User, CreditCard, DollarSign, Calculator } from 'lucide-react';

interface PaymentFormProps {
  selectedClientId?: string;
  onSuccess: (payment: Payment) => void;
  onCancel: () => void;
}

export function PaymentForm({ selectedClientId, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(!selectedClientId);
  const [calculatedPeriod, setCalculatedPeriod] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const { createPayment } = usePaymentMutations();
  const { clients } = useClients({ 
    filters: { 
      search: clientSearch,
      status: 'all' 
    },
    limit: 20 
  });
  const { plans } = usePlans();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: 'cash',
    },
  });

  // Set payment date on client side to avoid hydration issues
  useEffect(() => {
    setValue('payment_date', new Date().toISOString().split('T')[0]);
  }, [setValue]);

  const watchedAmount = watch('amount');
  const watchedPaymentDate = watch('payment_date');

  // Load selected client if provided
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setSelectedClient(client);
        setShowClientSearch(false);
        
        // Set default plan to client's current plan
        if (client.current_plan_id) {
          const plan = plans.find(p => p.id === client.current_plan_id);
          if (plan) {
            setSelectedPlan(plan);
            setValue('plan_id', plan.id);
            setValue('amount', plan.price);
          }
        }
      }
    }
  }, [selectedClientId, clients, plans, setValue]);

  // Calculate period when plan or payment date changes
  useEffect(() => {
    if (selectedPlan && watchedPaymentDate) {
      const paymentDate = new Date(watchedPaymentDate);
      const periodStart = paymentDate;
      
      // If client has an active membership that hasn't expired, extend from expiration date
      let actualStart = periodStart;
      if (selectedClient && selectedClient.expiration_date) {
        const expirationDate = new Date(selectedClient.expiration_date);
        const today = new Date();
        
        // If expiration is in the future, start from expiration + 1 day
        if (expirationDate >= today) {
          actualStart = addDays(expirationDate, 1);
        }
      }
      
      const periodEnd = addDays(actualStart, selectedPlan.duration_days - 1);
      
      setCalculatedPeriod({
        start: actualStart.toISOString().split('T')[0],
        end: periodEnd.toISOString().split('T')[0],
      });
    } else {
      setCalculatedPeriod(null);
    }
  }, [selectedPlan, watchedPaymentDate, selectedClient]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setValue('client_id', client.id);
    setShowClientSearch(false);
    setClientSearch('');
    
    // Auto-select current plan if available
    if (client.current_plan_id) {
      const plan = plans.find(p => p.id === client.current_plan_id);
      if (plan) {
        setSelectedPlan(plan);
        setValue('plan_id', plan.id);
        setValue('amount', plan.price);
      }
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setValue('plan_id', planId);
      setValue('amount', plan.price);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedClient || !selectedPlan || !calculatedPeriod) {
      alert('Por favor selecciona un cliente y un plan');
      return;
    }

    try {
      setLoading(true);
      
      const paymentData = {
        ...data,
        amount: data.amount,
        period_start: calculatedPeriod.start,
        period_end: calculatedPeriod.end,
      };

      const payment = await createPayment(paymentData);
      if (payment) {
        onSuccess(payment);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(error instanceof Error ? error.message : 'Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
      {/* Client Selection */}
      <Card className="bg-carbon-gray border-slate-gray/30">
        <CardHeader>
          <CardTitle className="text-bright-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Selección de Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedClient ? (
            <div className="flex items-center gap-3 p-3 bg-steel-gray rounded-lg border border-slate-gray/30">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedClient.photo_url || undefined} />
                <AvatarFallback className="bg-slate-gray/20 text-bright-white">
                  {getInitials(selectedClient.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-bright-white font-medium">{selectedClient.full_name}</p>
                <p className="text-sm text-light-gray">{selectedClient.phone}</p>
                {selectedClient.current_plan_id && (
                  <Badge className="mt-1 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                    {plans.find(p => p.id === selectedClient.current_plan_id)?.name || 'Plan Desconocido'}
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedClient(null);
                  setShowClientSearch(true);
                  setSelectedPlan(null);
                  reset();
                }}
                className="border-slate-gray text-light-gray hover:bg-slate-gray/20"
              >
                Cambiar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-gray" />
                <Input
                  placeholder="Buscar clientes por nombre..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-10 bg-steel-gray border-slate-gray text-bright-white"
                />
              </div>
              
              {/* Guest Option */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const guestClient: Client = {
                    id: '00000000-0000-0000-0000-000000000001',
                    full_name: 'Guest / Daily',
                    phone: '0000000000',
                    email: null,
                    photo_url: null,
                    birth_date: null,
                    blood_type: null,
                    gender: null,
                    medical_conditions: null,
                    emergency_contact_name: null,
                    emergency_contact_phone: null,
                    registration_date: new Date().toISOString().split('T')[0],
                    current_plan_id: null,
                    last_payment_date: null,
                    expiration_date: null,
                    status: 'active',
                    is_deleted: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  handleClientSelect(guestClient);
                }}
                className="w-full justify-start border-dashed border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
              >
                <User className="h-4 w-4 mr-2" />
                Invitado / Pago Diario
              </Button>

              {/* Client Results */}
              {clientSearch && clients.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full flex items-center gap-3 p-3 bg-steel-gray rounded-lg border border-slate-gray/30 hover:border-neon-cyan/30 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.photo_url || undefined} />
                        <AvatarFallback className="bg-slate-gray/20 text-bright-white text-sm">
                          {getInitials(client.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-bright-white font-medium truncate">{client.full_name}</p>
                        <p className="text-sm text-light-gray">{client.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan & Amount */}
      {selectedClient && (
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardHeader>
            <CardTitle className="text-bright-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detalles del Plan y Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-bright-white">
                Plan <span className="text-red-400">*</span>
              </Label>
              <Select onValueChange={handlePlanSelect} value={selectedPlan?.id || ''}>
                <SelectTrigger className="bg-steel-gray border-slate-gray text-bright-white">
                  <SelectValue placeholder="Seleccionar un plan" />
                </SelectTrigger>
                <SelectContent className="bg-carbon-gray border-slate-gray">
                  {plans.map((plan) => (
                    <SelectItem
                      key={plan.id}
                      value={plan.id}
                      className="text-bright-white hover:bg-slate-gray/20"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        <span className="text-neon-cyan ml-2">
                          {formatCurrency(plan.price)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.plan_id && (
                <p className="text-red-400 text-sm mt-1">{errors.plan_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-bright-white">
                  Monto <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-gray" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('amount', { valueAsNumber: true })}
                    className="pl-10 bg-steel-gray border-slate-gray text-bright-white"
                    placeholder="0.00"
                    autoComplete="off"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label className="text-bright-white">Método de Pago</Label>
                <Select value={watch('payment_method')} onValueChange={(value) => setValue('payment_method', value as any)}>
                  <SelectTrigger className="bg-steel-gray border-slate-gray text-bright-white">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent className="bg-carbon-gray border-slate-gray">
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="text-bright-white hover:bg-slate-gray/20"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-red-400 text-sm mt-1">{errors.payment_method.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="payment_date" className="text-bright-white">
                Fecha de Pago
              </Label>
              <Input
                id="payment_date"
                type="date"
                {...register('payment_date')}
                className="bg-steel-gray border-slate-gray text-bright-white"
              />
              {errors.payment_date && (
                <p className="text-red-400 text-sm mt-1">{errors.payment_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className="text-bright-white">Notas</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                className="bg-steel-gray border-slate-gray text-bright-white"
                placeholder="Optional notes about this payment..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membership Period Calculation */}
      {selectedClient && selectedPlan && calculatedPeriod && (
        <Card className="bg-carbon-gray border-slate-gray/30">
          <CardHeader>
            <CardTitle className="text-bright-white flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Membership Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-light-gray">Inicio del Período</p>
                <p className="text-bright-white font-medium">{formatDate(calculatedPeriod.start)}</p>
              </div>
              <div>
                <p className="text-sm text-light-gray">Fin del Período</p>
                <p className="text-bright-white font-medium">{formatDate(calculatedPeriod.end)}</p>
              </div>
            </div>
            
            <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
              <p className="text-sm text-neon-cyan">
                ✓ Esta membresía será válida por {selectedPlan.duration_days} días
                {selectedClient.expiration_date && new Date(selectedClient.expiration_date) >= new Date() && (
                  <span className="block mt-1">
                    Extendiendo membresía actual (expira {formatDate(selectedClient.expiration_date)})
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-slate-gray text-light-gray hover:bg-slate-gray/10"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black"
          disabled={loading || !selectedClient || !selectedPlan}
        >
          {loading ? 'Procesando...' : `Registrar Pago${watchedAmount ? ` - ${formatCurrency(watchedAmount)}` : ''}`}
        </Button>
      </div>
    </form>
  );
}