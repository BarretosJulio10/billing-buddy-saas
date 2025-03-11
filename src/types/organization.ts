
export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  subscriptionStatus: 'active' | 'overdue' | 'canceled' | 'permanent';
  subscriptionDueDate: string;
  subscriptionAmount: number;
  lastPaymentDate?: string;
  gateway: 'mercadopago' | 'asaas';
  isAdmin: boolean;
  blocked: boolean;
}

export interface User {
  id: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionDetails {
  status: string;
  dueDate: string;
  amount: number;
  lastPaymentDate?: string;
  gateway: string;
  blocked: boolean;
}
