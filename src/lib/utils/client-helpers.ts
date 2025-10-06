import { Client } from '@/types';

export function getClientStatus(client: Client): 'active' | 'frozen' | 'inactive' {
  // If client is marked as inactive or deleted, return inactive
  if (client.status === 'inactive' || client.is_deleted) {
    return 'inactive';
  }
  
  // If client is marked as frozen, return frozen
  if (client.status === 'frozen') {
    return 'frozen';
  }
  
  // If client has no expiration date, check if they have made any payments
  if (!client.expiration_date) {
    return client.last_payment_date ? 'active' : 'inactive';
  }
  
  // Check if membership has expired
  const today = new Date();
  const expirationDate = new Date(client.expiration_date);
  
  if (expirationDate < today) {
    return 'frozen';
  }
  
  return 'active';
}

export function isClientExpiring(client: Client, daysThreshold: number = 3): boolean {
  if (!client.expiration_date || client.status !== 'active') {
    return false;
  }
  
  const today = new Date();
  const expirationDate = new Date(client.expiration_date);
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiration > 0 && daysUntilExpiration <= daysThreshold;
}

export function isClientExpired(client: Client): boolean {
  if (!client.expiration_date) {
    return false;
  }
  
  const today = new Date();
  const expirationDate = new Date(client.expiration_date);
  
  return expirationDate < today;
}

export function getDaysUntilExpiration(client: Client): number | null {
  if (!client.expiration_date) {
    return null;
  }
  
  const today = new Date();
  const expirationDate = new Date(client.expiration_date);
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiration;
}

export function getDaysSinceExpiration(client: Client): number | null {
  if (!client.expiration_date) {
    return null;
  }
  
  const today = new Date();
  const expirationDate = new Date(client.expiration_date);
  const daysSinceExpiration = Math.floor((today.getTime() - expirationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysSinceExpiration > 0 ? daysSinceExpiration : 0;
}

export function getClientStatusMessage(client: Client): string {
  const status = getClientStatus(client);
  
  switch (status) {
    case 'active':
      if (isClientExpiring(client)) {
        const days = getDaysUntilExpiration(client);
        return `Expires in ${days} day${days === 1 ? '' : 's'}`;
      }
      return 'Active membership';
      
    case 'frozen':
      const daysSinceExpiration = getDaysSinceExpiration(client);
      if (daysSinceExpiration && daysSinceExpiration > 0) {
        return `Expired ${daysSinceExpiration} day${daysSinceExpiration === 1 ? '' : 's'} ago`;
      }
      return 'Membership frozen';
      
    case 'inactive':
      return 'No active membership';
      
    default:
      return 'Unknown status';
  }
}

export function sortClientsByStatus(clients: Client[]): Client[] {
  return clients.sort((a, b) => {
    const statusA = getClientStatus(a);
    const statusB = getClientStatus(b);
    
    // Priority order: expired (frozen) -> expiring (active) -> active -> inactive
    const statusOrder = { frozen: 0, active: 1, inactive: 2 };
    
    // Special handling for expiring clients (should come after expired but before regular active)
    const aExpiring = statusA === 'active' && isClientExpiring(a);
    const bExpiring = statusB === 'active' && isClientExpiring(b);
    
    if (aExpiring && !bExpiring) return -1;
    if (!aExpiring && bExpiring) return 1;
    
    const orderA = statusOrder[statusA];
    const orderB = statusOrder[statusB];
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same status, sort by name
    return a.full_name.localeCompare(b.full_name);
  });
}

export function filterClientsByStatus(clients: Client[], status: 'all' | 'active' | 'frozen' | 'inactive' | 'expiring_soon'): Client[] {
  if (status === 'all') {
    return clients;
  }
  
  if (status === 'expiring_soon') {
    return clients.filter(client => getClientStatus(client) === 'active' && isClientExpiring(client));
  }
  
  return clients.filter(client => getClientStatus(client) === status);
}