
-- SQL Migration: 01_initial_schema.sql
-- Initial database schema with core tables and relationships

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    document VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    collection_rule_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Collection Rules Table - Templates for messages
CREATE TABLE collection_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER NOT NULL,
    send_on_due_date BOOLEAN DEFAULT TRUE,
    overdue_days_after INTEGER[] NOT NULL,
    reminder_template TEXT NOT NULL,
    due_date_template TEXT NOT NULL,
    overdue_template TEXT NOT NULL,
    confirmation_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add foreign key constraint to customers table
ALTER TABLE customers ADD CONSTRAINT fk_customers_collection_rule FOREIGN KEY (collection_rule_id) REFERENCES collection_rules(id);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_link VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    payment_gateway_id VARCHAR(255),
    collection_rule_id UUID REFERENCES collection_rules(id),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Message History Table
CREATE TABLE message_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id),
    message_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Gateway Settings Table
CREATE TABLE payment_gateway_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_name VARCHAR(50) NOT NULL,
    api_key TEXT NOT NULL,
    api_secret TEXT,
    additional_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messaging Settings Table
CREATE TABLE messaging_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel VARCHAR(50) NOT NULL,
    api_endpoint VARCHAR(255),
    auth_token TEXT,
    phone_number VARCHAR(20),
    additional_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables with updated_at column
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE
ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_collection_rules_updated_at BEFORE UPDATE
ON collection_rules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE
ON invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payment_gateway_settings_updated_at BEFORE UPDATE
ON payment_gateway_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_messaging_settings_updated_at BEFORE UPDATE
ON messaging_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE
ON system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes
CREATE INDEX idx_customers_collection_rule_id ON customers(collection_rule_id);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_message_history_customer_id ON message_history(customer_id);
CREATE INDEX idx_message_history_invoice_id ON message_history(invoice_id);

-- Soft delete index for trash
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_collection_rules_deleted_at ON collection_rules(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NOT NULL;
