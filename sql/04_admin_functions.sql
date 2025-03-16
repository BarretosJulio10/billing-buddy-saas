
-- SQL Migration: 04_admin_functions.sql
-- Admin functions for statistics and management

-- Function to count customers for an organization
CREATE OR REPLACE FUNCTION count_customers_by_org(org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  customer_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO customer_count
  FROM customers
  WHERE organization_id = org_id
  AND deleted_at IS NULL;
  
  RETURN customer_count;
END;
$$;

-- Function to count invoices for an organization
CREATE OR REPLACE FUNCTION count_invoices_by_org(org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invoice_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invoice_count
  FROM invoices
  WHERE organization_id = org_id
  AND deleted_at IS NULL;
  
  RETURN invoice_count;
END;
$$;

-- Function to count collection rules for an organization
CREATE OR REPLACE FUNCTION count_collections_by_org(org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  collection_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO collection_count
  FROM collection_rules
  WHERE organization_id = org_id
  AND deleted_at IS NULL;
  
  RETURN collection_count;
END;
$$;

-- Function for admin to check organization payment status and block if needed
CREATE OR REPLACE FUNCTION check_organization_payment_status()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  blocked_count INTEGER := 0;
BEGIN
  UPDATE organizations
  SET 
    blocked = TRUE,
    subscription_status = 'overdue'
  WHERE 
    subscription_due_date < CURRENT_DATE
    AND subscription_status = 'active'
    AND is_admin = FALSE
    AND blocked = FALSE
  RETURNING COUNT(*) INTO blocked_count;
  
  RETURN blocked_count;
END;
$$;

-- Function for admin to login as organization (impersonation)
CREATE OR REPLACE FUNCTION admin_login_as_organization(admin_user_id UUID, target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  success BOOLEAN := FALSE;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM organizations o
    JOIN users u ON u.organization_id = o.id
    WHERE u.id = admin_user_id
    AND o.is_admin = TRUE
  ) INTO is_admin;
  
  IF is_admin THEN
    -- Record impersonation (could be expanded to log this action)
    success := TRUE;
  END IF;
  
  RETURN success;
END;
$$;
