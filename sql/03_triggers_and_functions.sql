
-- SQL Migration: 03_triggers_and_functions.sql
-- Advanced triggers and functions for business logic

-- Function to get all items in trash (deleted in the last 2 months)
CREATE OR REPLACE FUNCTION get_trash_items()
RETURNS TABLE (
    id UUID,
    entity_type TEXT,
    name TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Get customers in trash
    RETURN QUERY
    SELECT 
        c.id, 
        'customer'::TEXT as entity_type,
        c.name,
        c.deleted_at
    FROM customers c
    WHERE c.deleted_at IS NOT NULL 
    AND c.deleted_at > (CURRENT_TIMESTAMP - INTERVAL '2 months');

    -- Get collection rules in trash
    RETURN QUERY
    SELECT 
        cr.id, 
        'collection_rule'::TEXT as entity_type,
        cr.name,
        cr.deleted_at
    FROM collection_rules cr
    WHERE cr.deleted_at IS NOT NULL 
    AND cr.deleted_at > (CURRENT_TIMESTAMP - INTERVAL '2 months');

    -- Get invoices in trash
    RETURN QUERY
    SELECT 
        i.id, 
        'invoice'::TEXT as entity_type,
        i.description as name,
        i.deleted_at
    FROM invoices i
    WHERE i.deleted_at IS NOT NULL 
    AND i.deleted_at > (CURRENT_TIMESTAMP - INTERVAL '2 months');
END;
$$ LANGUAGE plpgsql;

-- Function to restore item from trash
CREATE OR REPLACE FUNCTION restore_from_trash(
    p_id UUID,
    p_entity_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_success BOOLEAN := FALSE;
BEGIN
    IF p_entity_type = 'customer' THEN
        UPDATE customers SET deleted_at = NULL WHERE id = p_id;
        v_success := TRUE;
    ELSIF p_entity_type = 'collection_rule' THEN
        UPDATE collection_rules SET deleted_at = NULL WHERE id = p_id;
        v_success := TRUE;
    ELSIF p_entity_type = 'invoice' THEN
        UPDATE invoices SET deleted_at = NULL WHERE id = p_id;
        v_success := TRUE;
    END IF;
    
    RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- Function to permanently delete item from trash
CREATE OR REPLACE FUNCTION permanently_delete_from_trash(
    p_id UUID,
    p_entity_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_success BOOLEAN := FALSE;
BEGIN
    IF p_entity_type = 'customer' THEN
        DELETE FROM customers WHERE id = p_id AND deleted_at IS NOT NULL;
        v_success := TRUE;
    ELSIF p_entity_type = 'collection_rule' THEN
        DELETE FROM collection_rules WHERE id = p_id AND deleted_at IS NOT NULL;
        v_success := TRUE;
    ELSIF p_entity_type = 'invoice' THEN
        DELETE FROM invoices WHERE id = p_id AND deleted_at IS NOT NULL;
        v_success := TRUE;
    END IF;
    
    RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old trash items (older than 2 months)
CREATE OR REPLACE FUNCTION clean_up_trash() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_customer_count INTEGER := 0;
    v_collection_rule_count INTEGER := 0;
    v_invoice_count INTEGER := 0;
BEGIN
    -- Delete customers older than 2 months
    DELETE FROM customers 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < (CURRENT_TIMESTAMP - INTERVAL '2 months')
    RETURNING COUNT(*) INTO v_customer_count;
    
    -- Delete collection rules older than 2 months
    DELETE FROM collection_rules 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < (CURRENT_TIMESTAMP - INTERVAL '2 months')
    RETURNING COUNT(*) INTO v_collection_rule_count;
    
    -- Delete invoices older than 2 months
    DELETE FROM invoices 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < (CURRENT_TIMESTAMP - INTERVAL '2 months')
    RETURNING COUNT(*) INTO v_invoice_count;
    
    v_count := v_customer_count + v_collection_rule_count + v_invoice_count;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending messages that need to be sent
CREATE OR REPLACE FUNCTION get_pending_messages() RETURNS TABLE (
    invoice_id UUID,
    customer_id UUID,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    message_type VARCHAR(50),
    template_text TEXT,
    payment_link VARCHAR(255),
    amount DECIMAL(10, 2),
    days_to_due INTEGER,
    days_overdue INTEGER
) AS $$
BEGIN
    -- Get reminder messages
    RETURN QUERY
    SELECT 
        i.id as invoice_id,
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        'reminder'::VARCHAR(50) as message_type,
        cr.reminder_template as template_text,
        i.payment_link,
        i.amount,
        (i.due_date - CURRENT_DATE) as days_to_due,
        NULL::INTEGER as days_overdue
    FROM 
        invoices i
        JOIN customers c ON i.customer_id = c.id
        JOIN collection_rules cr ON COALESCE(i.collection_rule_id, c.collection_rule_id) = cr.id
    WHERE 
        i.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND c.is_active = TRUE
        AND i.status = 'pending'
        AND (i.due_date - CURRENT_DATE) = cr.reminder_days_before
        AND NOT EXISTS (
            SELECT 1 FROM message_history mh 
            WHERE mh.invoice_id = i.id 
            AND mh.message_type = 'reminder'
        );
    
    -- Get due date messages
    RETURN QUERY
    SELECT 
        i.id as invoice_id,
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        'due_date'::VARCHAR(50) as message_type,
        cr.due_date_template as template_text,
        i.payment_link,
        i.amount,
        0 as days_to_due,
        NULL::INTEGER as days_overdue
    FROM 
        invoices i
        JOIN customers c ON i.customer_id = c.id
        JOIN collection_rules cr ON COALESCE(i.collection_rule_id, c.collection_rule_id) = cr.id
    WHERE 
        i.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND c.is_active = TRUE
        AND i.status = 'pending'
        AND i.due_date = CURRENT_DATE
        AND cr.send_on_due_date = TRUE
        AND NOT EXISTS (
            SELECT 1 FROM message_history mh 
            WHERE mh.invoice_id = i.id 
            AND mh.message_type = 'due_date'
        );
    
    -- Get overdue messages
    RETURN QUERY
    SELECT 
        i.id as invoice_id,
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        'overdue'::VARCHAR(50) as message_type,
        cr.overdue_template as template_text,
        i.payment_link,
        i.amount,
        NULL::INTEGER as days_to_due,
        (CURRENT_DATE - i.due_date) as days_overdue
    FROM 
        invoices i
        JOIN customers c ON i.customer_id = c.id
        JOIN collection_rules cr ON COALESCE(i.collection_rule_id, c.collection_rule_id) = cr.id
    WHERE 
        i.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND c.is_active = TRUE
        AND i.status = 'pending'
        AND i.due_date < CURRENT_DATE
        AND (CURRENT_DATE - i.due_date) = ANY(cr.overdue_days_after)
        AND NOT EXISTS (
            SELECT 1 FROM message_history mh 
            WHERE mh.invoice_id = i.id 
            AND mh.message_type = 'overdue'
            AND mh.created_at::date = CURRENT_DATE
        );
    
    -- Get confirmation messages
    RETURN QUERY
    SELECT 
        i.id as invoice_id,
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        'confirmation'::VARCHAR(50) as message_type,
        cr.confirmation_template as template_text,
        i.payment_link,
        i.amount,
        NULL::INTEGER as days_to_due,
        NULL::INTEGER as days_overdue
    FROM 
        invoices i
        JOIN customers c ON i.customer_id = c.id
        JOIN collection_rules cr ON COALESCE(i.collection_rule_id, c.collection_rule_id) = cr.id
    WHERE 
        i.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND c.is_active = TRUE
        AND i.status = 'paid'
        AND i.paid_at > (CURRENT_TIMESTAMP - INTERVAL '1 day')
        AND NOT EXISTS (
            SELECT 1 FROM message_history mh 
            WHERE mh.invoice_id = i.id 
            AND mh.message_type = 'confirmation'
        );
END;
$$ LANGUAGE plpgsql;

-- Function to update the status of overdue invoices
CREATE OR REPLACE FUNCTION update_overdue_invoices() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE invoices
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE
    AND deleted_at IS NULL
    RETURNING COUNT(*) INTO v_count;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to apply payment to invoice
CREATE OR REPLACE FUNCTION apply_payment(
    p_invoice_id UUID,
    p_amount DECIMAL(10, 2),
    p_payment_method VARCHAR(50),
    p_payment_gateway VARCHAR(50),
    p_payment_gateway_id VARCHAR(255)
) RETURNS BOOLEAN AS $$
DECLARE
    v_success BOOLEAN := FALSE;
BEGIN
    UPDATE invoices
    SET 
        status = 'paid',
        paid_at = CURRENT_TIMESTAMP,
        payment_amount = p_amount,
        payment_method = p_payment_method,
        payment_gateway = p_payment_gateway,
        payment_gateway_id = p_payment_gateway_id
    WHERE id = p_invoice_id
    AND deleted_at IS NULL;
    
    IF FOUND THEN
        v_success := TRUE;
    END IF;
    
    RETURN v_success;
END;
$$ LANGUAGE plpgsql;
