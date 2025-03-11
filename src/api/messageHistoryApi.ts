
/**
 * Message History API
 * 
 * Provides functions for managing message history records.
 */

export interface MessageHistory {
  id?: string;
  customer_id: string;
  invoice_id?: string;
  message_type: 'reminder' | 'due_date' | 'overdue' | 'confirmation';
  channel: 'whatsapp' | 'telegram' | 'email';
  content: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at?: string;
  error_message?: string;
}

export const messageHistoryApi = {
  async create(messageData: Omit<MessageHistory, 'id'>): Promise<MessageHistory> {
    console.log('Creating message history record:', messageData);
    // In a real implementation, this would make an API call
    return {
      id: crypto.randomUUID(),
      ...messageData,
      created_at: new Date().toISOString()
    } as MessageHistory;
  },
  
  async getByInvoice(invoiceId: string): Promise<MessageHistory[]> {
    console.log('Fetching message history for invoice:', invoiceId);
    // In a real implementation, this would make an API call
    return [];
  },
  
  async getByCustomer(customerId: string): Promise<MessageHistory[]> {
    console.log('Fetching message history for customer:', customerId);
    // In a real implementation, this would make an API call
    return [];
  }
};
