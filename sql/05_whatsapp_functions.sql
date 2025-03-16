
-- SQL Migration: 05_whatsapp_functions.sql
-- Functions for managing WhatsApp instances

-- Function to get a WhatsApp instance for an organization
CREATE OR REPLACE FUNCTION public.get_whatsapp_instance(org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  instance_data JSON;
BEGIN
  SELECT 
    json_build_object(
      'id', id,
      'instance_name', instance_name,
      'status', status,
      'qrcode', qrcode,
      'number', number,
      'created_at', created_at
    ) INTO instance_data
  FROM whatsapp_instances
  WHERE organization_id = org_id
  LIMIT 1;
  
  RETURN instance_data;
END;
$$;

-- Function to create a WhatsApp instance
CREATE OR REPLACE FUNCTION public.create_whatsapp_instance(org_id UUID, instance_name_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_instance JSON;
BEGIN
  INSERT INTO whatsapp_instances (
    organization_id, 
    instance_name, 
    status
  )
  VALUES (
    org_id, 
    instance_name_param, 
    'pending'
  )
  RETURNING json_build_object(
    'id', id,
    'instance_name', instance_name,
    'status', status,
    'created_at', created_at
  ) INTO new_instance;
  
  RETURN new_instance;
END;
$$;

-- Function to update a WhatsApp instance
CREATE OR REPLACE FUNCTION public.update_whatsapp_instance(org_id UUID, instance_name_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_instance JSON;
BEGIN
  UPDATE whatsapp_instances
  SET 
    instance_name = instance_name_param,
    updated_at = NOW()
  WHERE 
    organization_id = org_id
  RETURNING json_build_object(
    'id', id,
    'instance_name', instance_name,
    'status', status,
    'qrcode', qrcode,
    'number', number,
    'updated_at', updated_at
  ) INTO updated_instance;
  
  RETURN updated_instance;
END;
$$;

-- Function to update a WhatsApp instance status
CREATE OR REPLACE FUNCTION public.update_whatsapp_instance_status(
  instance_name_param TEXT, 
  status_param TEXT, 
  qrcode_param TEXT DEFAULT NULL,
  number_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE whatsapp_instances
  SET 
    status = status_param,
    qrcode = COALESCE(qrcode_param, qrcode),
    number = COALESCE(number_param, number),
    updated_at = NOW()
  WHERE 
    instance_name = instance_name_param;
    
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$;

-- Function to delete a WhatsApp instance
CREATE OR REPLACE FUNCTION public.delete_whatsapp_instance(org_id UUID, instance_name_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  DELETE FROM whatsapp_instances
  WHERE 
    organization_id = org_id AND
    instance_name = instance_name_param;
    
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$;
