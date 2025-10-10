'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Payment } from '@/types';

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client_id');

  const handleSuccess = (payment: Payment) => {
    if (payment.client_id !== '00000000-0000-0000-0000-000000000001') {
      router.push(`/dashboard/clients/${payment.client_id}`);
    } else {
      router.push('/dashboard/payments');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-black-beauty">
      <TopBar title="Register Payment" showBack />

      <div className="p-4 max-w-2xl mx-auto">
        <PaymentForm
          selectedClientId={clientId || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
