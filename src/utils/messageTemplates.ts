
/**
 * Message Templates Utility
 * 
 * Provides functions for working with message templates.
 */

interface TemplateVariables {
  customerName?: string;
  amount?: number;
  daysUntilDue?: number;
  daysOverdue?: number;
  paymentLink?: string;
}

/**
 * Creates a message from a template by replacing variables with actual values
 */
export const createMessageFromTemplate = (
  template: string,
  variables: TemplateVariables
): string => {
  let message = template;
  
  if (variables.customerName) {
    message = message.replace(/\{cliente\}/g, variables.customerName);
  }
  
  if (variables.amount) {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(variables.amount);
    message = message.replace(/\{valor\}/g, formattedAmount);
  }
  
  if (variables.daysUntilDue !== undefined) {
    message = message.replace(/\{dias_para_vencer\}/g, variables.daysUntilDue.toString());
  }
  
  if (variables.daysOverdue !== undefined) {
    message = message.replace(/\{dias_atraso\}/g, variables.daysOverdue.toString());
  }
  
  if (variables.paymentLink) {
    message = message.replace(/\{link\}/g, variables.paymentLink);
  }
  
  return message;
};
