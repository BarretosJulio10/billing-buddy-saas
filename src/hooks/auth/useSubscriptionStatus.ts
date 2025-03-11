
import { useEffect, useState } from 'react';
import { Organization } from '@/types/organization';

export function useSubscriptionStatus(organization: Organization | null) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [subscriptionExpiringSoon, setSubscriptionExpiringSoon] = useState(false);

  useEffect(() => {
    if (organization) {
      // Check if organization is blocked
      setIsBlocked(organization.blocked);
      
      // Check if subscription is expiring soon
      const dueDate = new Date(organization.subscriptionDueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setSubscriptionExpiringSoon(
        diffDays <= 7 && 
        diffDays > 0 && 
        organization.subscriptionStatus === 'active'
      );
    } else {
      setIsBlocked(false);
      setSubscriptionExpiringSoon(false);
    }
  }, [organization]);

  return {
    isBlocked,
    subscriptionExpiringSoon
  };
}
