
import { format, addDays, subDays, isSameDay } from "date-fns";

// Types for the messaging system
export type MessageTemplate = {
  id: string;
  name: string;
  reminderTemplate: string;
  dueDateTemplate: string;
  overdueTemplate: string;
  confirmationTemplate: string;
};

export type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  description: string;
  dueDate: Date;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod: "mercadopago" | "asaas";
  messageTemplateId: string;
  lastMessageSentAt?: Date;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  isActive: boolean;
};

export type CollectionRule = {
  id: string;
  name: string;
  isActive: boolean;
  reminderDaysBefore: number;
  sendOnDueDate: boolean;
  overdueDaysAfter: number[];
  reminderTemplate: string;
  dueDateTemplate: string;
  overdueTemplate: string;
  confirmationTemplate: string;
};

export interface MessagePayload {
  to: string;
  message: string;
  invoiceId: string;
  messageType: "reminder" | "dueDate" | "overdue" | "confirmation";
}

// Function to check which messages need to be sent
export function checkPendingMessages(
  invoices: Invoice[],
  customers: Customer[],
  collectionRules: CollectionRule[]
): MessagePayload[] {
  const today = new Date();
  const pendingMessages: MessagePayload[] = [];

  // Only process active invoices (pending or overdue)
  const activeInvoices = invoices.filter(
    (invoice) => invoice.status === "pending" || invoice.status === "overdue"
  );

  activeInvoices.forEach((invoice) => {
    const customer = customers.find((c) => c.id === invoice.customerId);
    
    // Skip if customer not found or not active
    if (!customer || !customer.isActive || !customer.phone) {
      return;
    }

    const rule = collectionRules.find((r) => r.id === invoice.messageTemplateId);
    
    // Skip if rule not found or not active
    if (!rule || !rule.isActive) {
      return;
    }

    // Check for reminder (X days before due date)
    if (rule.reminderDaysBefore > 0) {
      const reminderDate = subDays(invoice.dueDate, rule.reminderDaysBefore);
      if (isSameDay(today, reminderDate)) {
        const message = formatMessage(rule.reminderTemplate, {
          cliente: customer.name,
          valor: formatCurrency(invoice.amount),
          dias_para_vencer: rule.reminderDaysBefore.toString(),
          link: `https://pay.example.com/${invoice.id}`
        });

        pendingMessages.push({
          to: customer.phone,
          message,
          invoiceId: invoice.id,
          messageType: "reminder"
        });
      }
    }

    // Check for due date message
    if (rule.sendOnDueDate && isSameDay(today, invoice.dueDate)) {
      const message = formatMessage(rule.dueDateTemplate, {
        cliente: customer.name,
        valor: formatCurrency(invoice.amount),
        link: `https://pay.example.com/${invoice.id}`
      });

      pendingMessages.push({
        to: customer.phone,
        message,
        invoiceId: invoice.id,
        messageType: "dueDate"
      });
    }

    // Check for overdue messages
    if (today > invoice.dueDate && invoice.status === "overdue") {
      const daysSinceOverdue = Math.floor(
        (today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (rule.overdueDaysAfter.includes(daysSinceOverdue)) {
        const message = formatMessage(rule.overdueTemplate, {
          cliente: customer.name,
          valor: formatCurrency(invoice.amount),
          dias_atraso: daysSinceOverdue.toString(),
          link: `https://pay.example.com/${invoice.id}`
        });

        pendingMessages.push({
          to: customer.phone,
          message,
          invoiceId: invoice.id,
          messageType: "overdue"
        });
      }
    }
  });

  return pendingMessages;
}

// Format message templates by replacing variables
function formatMessage(template: string, variables: Record<string, string>): string {
  let formattedMessage = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    formattedMessage = formattedMessage.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return formattedMessage;
}

// Format currency as BRL
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Example function to send WhatsApp messages
export async function sendWhatsAppMessage(payload: MessagePayload): Promise<boolean> {
  try {
    // In a real implementation, this would call the WhatsApp API
    console.log(`Sending WhatsApp message to ${payload.to}: ${payload.message}`);
    
    // This is a mock implementation - in a real app, you would make an API call here
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}

// Example function to send Telegram messages
export async function sendTelegramMessage(payload: MessagePayload): Promise<boolean> {
  try {
    // In a real implementation, this would call the Telegram API
    console.log(`Sending Telegram message to ${payload.to}: ${payload.message}`);
    
    // This is a mock implementation - in a real app, you would make an API call here
    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

// The main function that would be called by a cron job
export async function processDailyMessages(
  invoices: Invoice[],
  customers: Customer[],
  collectionRules: CollectionRule[]
): Promise<void> {
  const pendingMessages = checkPendingMessages(invoices, customers, collectionRules);
  
  // Process each message
  for (const message of pendingMessages) {
    // You can choose which messaging platform to use based on your configuration
    await sendWhatsAppMessage(message);
    // Or use Telegram
    // await sendTelegramMessage(message);
  }
  
  console.log(`Processed ${pendingMessages.length} messages`);
}
