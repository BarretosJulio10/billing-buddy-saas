
-- SQL Migration: 03_triggers_and_functions.sql
-- Advanced triggers and functions for business logic

-- Function to automatically update invoices to 'overdue' status
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up trash items older than 2 months
CREATE OR REPLACE FUNCTION clean_up_trash()
RETURNS void AS $$
BEGIN
  -- Permanently delete customers in trash older than 2 months
  DELETE FROM customers
  WHERE deleted_at IS NOT NULL
    AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '2 months';
  
  -- Permanently delete invoices in trash older than 2 months
  DELETE FROM invoices
  WHERE deleted_at IS NOT NULL
    AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '2 months';
  
  -- Permanently delete collection_rules in trash older than 2 months
  DELETE FROM collection_rules
  WHERE deleted_at IS NOT NULL
    AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '2 months';
END;
$$ LANGUAGE plpgsql;

-- Function to get pending messages for a specific day
CREATE OR REPLACE FUNCTION get_pending_messages(check_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  invoice_id UUID,
  customer_id UUID,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  amount DECIMAL(10, 2),
  due_date DATE,
  message_type VARCHAR(20),
  message_template TEXT
) AS $$
BEGIN
  -- Reminders (X days before due date)
  RETURN QUERY
  SELECT 
    i.id AS invoice_id,
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    i.amount,
    i.due_date,
    'reminder'::VARCHAR(20) AS message_type,
    cr.reminder_template AS message_template
  FROM 
    invoices i
    JOIN customers c ON i.customer_id = c.id
    JOIN collection_rules cr ON i.message_template_id = cr.id
  WHERE 
    i.status = 'pending'
    AND i.deleted_at IS NULL
    AND c.is_active = TRUE
    AND cr.is_active = TRUE
    AND i.due_date - cr.reminder_days_before = check_date
    AND (i.last_message_sent_at IS NULL OR i.last_message_sent_at < CURRENT_TIMESTAMP - INTERVAL '12 hours')
  
  UNION ALL
  
  -- Due date messages
  SELECT 
    i.id AS invoice_id,
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    i.amount,
    i.due_date,
    'dueDate'::VARCHAR(20) AS message_type,
    cr.due_date_template AS message_template
  FROM 
    invoices i
    JOIN customers c ON i.customer_id = c.id
    JOIN collection_rules cr ON i.message_template_id = cr.id
  WHERE 
    i.status = 'pending'
    AND i.deleted_at IS NULL
    AND c.is_active = TRUE
    AND cr.is_active = TRUE
    AND cr.send_on_due_date = TRUE
    AND i.due_date = check_date
    AND (i.last_message_sent_at IS NULL OR i.last_message_sent_at < CURRENT_TIMESTAMP - INTERVAL '12 hours')
  
  UNION ALL
  
  -- Overdue messages
  SELECT 
    i.id AS invoice_id,
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    i.amount,
    i.due_date,
    'overdue'::VARCHAR(20) AS message_type,
    cr.overdue_template AS message_template
  FROM 
    invoices i
    JOIN customers c ON i.customer_id = c.id
    JOIN collection_rules cr ON i.message_template_id = cr.id,
    unnest(cr.overdue_days_after) AS overdue_day
  WHERE 
    i.status = 'overdue'
    AND i.deleted_at IS NULL
    AND c.is_active = TRUE
    AND cr.is_active = TRUE
    AND check_date - i.due_date = overdue_day
    AND (i.last_message_sent_at IS NULL OR i.last_message_sent_at < CURRENT_TIMESTAMP - INTERVAL '12 hours');
END;
$$ LANGUAGE plpgsql;

-- Function to record message sent
CREATE OR REPLACE FUNCTION record_message_sent(
  invoice_id_param UUID,
  message_type_param VARCHAR(20),
  message_content_param TEXT,
  sent_to_param VARCHAR(50)
)
RETURNS void AS $$
BEGIN
  -- Record message in history
  INSERT INTO message_history (
    invoice_id,
    message_type,
    message_content,
    sent_to,
    delivery_status
  ) VALUES (
    invoice_id_param,
    message_type_param,
    message_content_param,
    sent_to_param,
    'sent'
  );
  
  -- Update invoice last_message_sent_at
  UPDATE invoices
  SET last_message_sent_at = CURRENT_TIMESTAMP
  WHERE id = invoice_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer active status
CREATE OR REPLACE FUNCTION update_customer_status(
  customer_id_param UUID,
  is_active_param BOOLEAN
)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET is_active = is_active_param,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = customer_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to restore item from trash
CREATE OR REPLACE FUNCTION restore_from_trash(
  item_id UUID,
  item_type VARCHAR(20)
)
RETURNS void AS $$
BEGIN
  CASE item_type
    WHEN 'customer' THEN
      UPDATE customers
      SET deleted_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = item_id;
      
    WHEN 'invoice' THEN
      UPDATE invoices
      SET deleted_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = item_id;
      
    WHEN 'collection_rule' THEN
      UPDATE collection_rules
      SET deleted_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = item_id;
      
    ELSE
      RAISE EXCEPTION 'Unknown item type: %', item_type;
  END CASE;
END;
$$ LANGUAGE plpgsql;
