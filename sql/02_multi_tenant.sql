
-- SQL Migration: 02_multi_tenant.sql
-- Extension for multi-tenant functionality for SaaS model

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations Table (for multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    subscription_status VARCHAR(20) DEFAULT 'trial',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    reset_password_token VARCHAR(255),
    reset_password_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Organization Memberships
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- Add organization_id to existing tables
ALTER TABLE customers ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE collection_rules ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE invoices ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE payment_gateway_settings ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE messaging_settings ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE system_settings ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Add not null constraints
ALTER TABLE customers ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE collection_rules ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE payment_gateway_settings ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE messaging_settings ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE system_settings ALTER COLUMN organization_id SET NOT NULL;

-- Add indexes for organization_id
CREATE INDEX idx_customers_organization_id ON customers(organization_id);
CREATE INDEX idx_collection_rules_organization_id ON collection_rules(organization_id);
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_payment_gateway_settings_organization_id ON payment_gateway_settings(organization_id);
CREATE INDEX idx_messaging_settings_organization_id ON messaging_settings(organization_id);
CREATE INDEX idx_system_settings_organization_id ON system_settings(organization_id);

-- Triggers for organization membership
CREATE TRIGGER update_organization_memberships_updated_at BEFORE UPDATE
ON organization_memberships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add RLS policies for multi-tenant data isolation
-- Example for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_organization_isolation ON customers
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

-- Similar policies would be created for other tables
ALTER TABLE collection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

-- Function to set the current_organization_id for the session
CREATE OR REPLACE FUNCTION set_current_organization_id(org_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_organization_id', org_id::text, false);
END;
$$ LANGUAGE plpgsql;
