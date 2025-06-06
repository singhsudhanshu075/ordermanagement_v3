/*
  # Add invoice number to dispatches

  1. Changes
    - Add invoice_number column to dispatches table
*/

ALTER TABLE dispatches
ADD COLUMN IF NOT EXISTS invoice_number text;