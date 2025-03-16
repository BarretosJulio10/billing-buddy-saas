
export interface CollectionRule {
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
}
