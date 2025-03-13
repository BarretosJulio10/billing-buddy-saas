
// This file provides supplementary types for Supabase tables
// Use these types in your application code instead of modifying the generated types file

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  is_active: boolean;
  collection_rule_id?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CollectionRule {
  id: string;
  name: string;
  is_active: boolean;
  reminder_days_before: number;
  send_on_due_date: boolean;
  overdue_days_after: number[];
  reminder_template: string;
  due_date_template: string;
  overdue_template: string;
  confirmation_template: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_link?: string;
  status: 'pending' | 'paid' | 'overdue' | 'canceled';
  payment_method?: string;
  payment_gateway?: string;
  payment_gateway_id?: string;
  collection_rule_id?: string;
  organization_id: string;
  paid_at?: string;
  payment_amount?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MessageHistory {
  id: string;
  customer_id: string;
  invoice_id?: string;
  message_type: string;
  channel: string;
  content: string;
  status: string;
  organization_id: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export interface PaymentGatewaySetting {
  id: string;
  gateway_name: string;
  api_key: string;
  api_secret?: string;
  additional_config?: Record<string, any>;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessagingSetting {
  id: string;
  channel: string;
  api_endpoint?: string;
  auth_token?: string;
  phone_number?: string;
  additional_config?: Record<string, any>;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  logo_url?: string;
  primary_color: string;
  subscription_status: 'active' | 'overdue' | 'canceled' | 'trial' | 'permanent';
  subscription_due_date?: string;
  subscription_amount?: number;
  last_payment_date?: string;
  gateway?: 'mercadopago' | 'asaas';
  is_admin: boolean;
  blocked: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface User {
  id: string;
  organization_id: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}
