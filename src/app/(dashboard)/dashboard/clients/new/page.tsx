'use client';

import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { ClientForm } from '@/components/clients/ClientForm';
import { Client } from '@/types';

export default function NewClientPage() {
  const router = useRouter();

  const handleSuccess = (client: Client) => {
    router.push(`/dashboard/clients/${client.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-black-beauty">
      <TopBar title="New Client" showBack />

      <div className="p-4 max-w-2xl mx-auto">
        <ClientForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
