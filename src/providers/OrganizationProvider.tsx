
import React, { createContext, useContext, ReactNode } from 'react';
import { Organization } from '@/types/organization';
import { OrganizationContextType } from '@/hooks/organization/types';
import { useOrganizationData } from '@/hooks/organization/useOrganizationData';
import { useOrganizationSettings } from '@/hooks/organization/useOrganizationSettings';

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  // Use the organization data hook
  const {
    organization,
    user,
    loading,
    error,
    subscriptionDetails,
    fetchOrganizationData
  } = useOrganizationData();

  // Use the organization settings hook
  const { updateOrganizationSettings } = useOrganizationSettings(
    organization,
    fetchOrganizationData
  );

  // Refresh organization data
  const refreshOrganization = async () => {
    await fetchOrganizationData();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        user,
        loading,
        error,
        isAdmin: organization?.isAdmin || false,
        subscriptionDetails,
        organizationId: organization?.id || null,
        refreshOrganization,
        updateOrganizationSettings,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
