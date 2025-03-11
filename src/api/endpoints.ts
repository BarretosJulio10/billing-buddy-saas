
/**
 * API Endpoints for Billing Management System
 * This file serves as documentation for all API endpoints used in the system.
 * In a real implementation, these would connect to a backend API.
 */

// Base URL for the API
export const API_BASE_URL = '/api';

// Customer Endpoints
export const CUSTOMER_ENDPOINTS = {
  LIST: `${API_BASE_URL}/customers`,
  GET: (id: string) => `${API_BASE_URL}/customers/${id}`,
  CREATE: `${API_BASE_URL}/customers`,
  UPDATE: (id: string) => `${API_BASE_URL}/customers/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/customers/${id}`,
  ACTIVATE: (id: string) => `${API_BASE_URL}/customers/${id}/activate`,
  DEACTIVATE: (id: string) => `${API_BASE_URL}/customers/${id}/deactivate`,
  RESTORE: (id: string) => `${API_BASE_URL}/customers/${id}/restore`,
};

// Invoice Endpoints
export const INVOICE_ENDPOINTS = {
  LIST: `${API_BASE_URL}/invoices`,
  GET: (id: string) => `${API_BASE_URL}/invoices/${id}`,
  CREATE: `${API_BASE_URL}/invoices`,
  UPDATE: (id: string) => `${API_BASE_URL}/invoices/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/invoices/${id}`,
  MARK_AS_PAID: (id: string) => `${API_BASE_URL}/invoices/${id}/pay`,
  CANCEL: (id: string) => `${API_BASE_URL}/invoices/${id}/cancel`,
  RESTORE: (id: string) => `${API_BASE_URL}/invoices/${id}/restore`,
  BY_CUSTOMER: (customerId: string) => `${API_BASE_URL}/customers/${customerId}/invoices`,
  SEND: (id: string) => `${API_BASE_URL}/invoices/${id}/send`,
};

// Collection Rule Endpoints
export const COLLECTION_RULE_ENDPOINTS = {
  LIST: `${API_BASE_URL}/collection-rules`,
  GET: (id: string) => `${API_BASE_URL}/collection-rules/${id}`,
  CREATE: `${API_BASE_URL}/collection-rules`,
  UPDATE: (id: string) => `${API_BASE_URL}/collection-rules/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/collection-rules/${id}`,
  ACTIVATE: (id: string) => `${API_BASE_URL}/collection-rules/${id}/activate`,
  DEACTIVATE: (id: string) => `${API_BASE_URL}/collection-rules/${id}/deactivate`,
  RESTORE: (id: string) => `${API_BASE_URL}/collection-rules/${id}/restore`,
};

// Messaging Endpoints
export const MESSAGING_ENDPOINTS = {
  WHATSAPP: {
    CONNECT: `${API_BASE_URL}/messaging/whatsapp/connect`,
    DISCONNECT: `${API_BASE_URL}/messaging/whatsapp/disconnect`,
    STATUS: `${API_BASE_URL}/messaging/whatsapp/status`,
    SEND: `${API_BASE_URL}/messaging/whatsapp/send`,
  },
  TELEGRAM: {
    CONNECT: `${API_BASE_URL}/messaging/telegram/connect`,
    DISCONNECT: `${API_BASE_URL}/messaging/telegram/disconnect`,
    STATUS: `${API_BASE_URL}/messaging/telegram/status`,
    SEND: `${API_BASE_URL}/messaging/telegram/send`,
  },
};

// Payment Gateway Endpoints
export const PAYMENT_GATEWAY_ENDPOINTS = {
  MERCADO_PAGO: {
    CONNECT: `${API_BASE_URL}/payment/mercadopago/connect`,
    DISCONNECT: `${API_BASE_URL}/payment/mercadopago/disconnect`,
    STATUS: `${API_BASE_URL}/payment/mercadopago/status`,
    CREATE_PAYMENT: `${API_BASE_URL}/payment/mercadopago/create`,
    WEBHOOK: `${API_BASE_URL}/payment/mercadopago/webhook`,
  },
  ASAAS: {
    CONNECT: `${API_BASE_URL}/payment/asaas/connect`,
    DISCONNECT: `${API_BASE_URL}/payment/asaas/disconnect`,
    STATUS: `${API_BASE_URL}/payment/asaas/status`,
    CREATE_PAYMENT: `${API_BASE_URL}/payment/asaas/create`,
    WEBHOOK: `${API_BASE_URL}/payment/asaas/webhook`,
  },
};

// Trash Endpoints
export const TRASH_ENDPOINTS = {
  LIST: `${API_BASE_URL}/trash`,
  RESTORE: (id: string, type: string) => `${API_BASE_URL}/trash/${type}/${id}/restore`,
  DELETE_PERMANENT: (id: string, type: string) => `${API_BASE_URL}/trash/${type}/${id}`,
};

// System Endpoints
export const SYSTEM_ENDPOINTS = {
  CRON: {
    RUN_MESSAGING: `${API_BASE_URL}/system/cron/messaging`,
    RUN_OVERDUE_CHECK: `${API_BASE_URL}/system/cron/overdue-check`,
    RUN_CLEANUP: `${API_BASE_URL}/system/cron/cleanup`,
  },
  SETTINGS: {
    GET: `${API_BASE_URL}/system/settings`,
    UPDATE: `${API_BASE_URL}/system/settings`,
  },
};

// Example usage:
// To get a list of customers: fetch(CUSTOMER_ENDPOINTS.LIST)
// To update an invoice: fetch(INVOICE_ENDPOINTS.UPDATE('123'), { method: 'PUT', body: JSON.stringify(data) })
