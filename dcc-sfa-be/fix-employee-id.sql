-- Update NULL employee_id values with temporary values
-- This will allow us to make the column required

-- First, let's see how many NULL values we have
SELECT COUNT(*) as null_count FROM users WHERE employee_id IS NULL;

-- Update NULL employee_id values with a temporary format
-- Using user ID prefixed with 'EMP' to create unique employee IDs
UPDATE users 
SET employee_id = 'EMP' + CAST(id AS VARCHAR(10))
WHERE employee_id IS NULL;

-- Verify the update
SELECT COUNT(*) as updated_count FROM users WHERE employee_id LIKE 'EMP%';
SELECT id, name, email, employee_id FROM users WHERE employee_id LIKE 'EMP%';
