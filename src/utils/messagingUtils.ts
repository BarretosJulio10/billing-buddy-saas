
/**
 * Messaging Utilities - Compatibility Module
 * 
 * This file re-exports all messaging utilities from the new modular structure
 * to maintain backwards compatibility with existing code.
 */

import { messagingUtils as newMessagingUtils } from './messaging';
export type { WhatsAppInstance } from './messaging';

// Export all the same functions and objects from the new structure
export const messagingUtils = newMessagingUtils;
