
# Database Schema for Billing Management System

This directory contains SQL files with the database schema for the Billing Management System. The files are ordered numerically and should be executed in sequence when setting up a new environment.

## Files

1. `01_initial_schema.sql` - Initial database schema with core tables and relationships
2. `02_multi_tenant.sql` - Extensions for multi-tenant SaaS functionality
3. `03_triggers_and_functions.sql` - Advanced triggers and functions for business logic

## Installation

To install the database schema on a PostgreSQL database, run the SQL files in order:

```bash
psql -U your_username -d your_database -f 01_initial_schema.sql
psql -U your_username -d your_database -f 02_multi_tenant.sql
psql -U your_username -d your_database -f 03_triggers_and_functions.sql
```

## Entity Relationship Diagram

The main entities in the system are:

- `customers` - Information about customers
- `invoices` - Invoices issued to customers
- `collection_rules` - Rules for sending payment reminders and notifications
- `message_history` - History of sent messages
- `payment_gateway_settings` - Settings for payment gateways (Mercado Pago, Asaas)
- `messaging_settings` - Settings for messaging platforms (WhatsApp, Telegram)

For multi-tenant functionality:

- `organizations` - Organizations using the SaaS platform
- `users` - Users who can access the system
- `organization_memberships` - Relationship between users and organizations

## Database Maintenance

To keep the database optimized:

1. Run the cleanup function periodically to remove old trash items:
   ```sql
   SELECT clean_up_trash();
   ```

2. Update invoice statuses daily:
   ```sql
   SELECT update_overdue_invoices();
   ```

3. Check for pending messages to be sent:
   ```sql
   SELECT * FROM get_pending_messages();
   ```

## Future Improvements

- Add audit trails for all tables
- Implement more payment gateways
- Add customer segmentation
- Add invoice batching functionality
