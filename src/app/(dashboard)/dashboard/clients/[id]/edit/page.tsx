'use client';

import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { ClientForm } from '@/components/clients/ClientForm';
import { useClient } from '@/hooks';
import { Client } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const { client, loading, error, refetch } = useClient(clientId);

  const handleSuccess = (updatedClient: Client) => {
    router.push(`/dashboard/clients/${updatedClient.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black">
        <TopBar title="Edit Client" showBack />
        <div className="p-4 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-neon-cyan" />
            <p className="text-slate-gray mt-2">Loading client...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-deep-black">
        <TopBar title="Edit Client" showBack />
        <div className="p-4 max-w-2xl mx-auto">
          <Card className="bg-carbon-gray border-slate-gray/30 p-8 text-center">
            <p className="text-red-400">Failed to load client</p>
            <p className="text-sm text-slate-gray/70 mt-2">{error || 'Client not found'}</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-3 border-slate-gray text-slate-gray hover:bg-slate-gray/10"
            >
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black">
      <TopBar title="Edit Client" showBack />

      <div className="p-4 max-w-2xl mx-auto">
        <ClientForm
          client={client}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}