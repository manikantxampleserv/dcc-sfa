-- Create single admin user for DCC-SFA system
-- Email: admin@gmail.com
-- Password: 123456 (hashed)
-- User ID: 1 (used throughout the system)

-- Note: This should be run manually in your SQL Server database
-- Make sure to run this AFTER running the seeders for roles, companies, depots, and zones

-- Insert the admin user
INSERT INTO users (
    id,
    email,
    role_id,
    password_hash,
    name,
    parent_id,
    depot_id,
    zone_id,
    phone_number,
    address,
    employee_id,
    joining_date,
    reporting_to,
    profile_image,
    last_login,
    is_active,
    createdate,
    createdby,
    updatedate,
    updatedby,
    log_inst
) VALUES (
    1,                                          -- id (fixed as 1)
    'admin@gmail.com',                          -- email
    1,                                          -- role_id (assuming Super Admin role has ID 1)
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password_hash for "123456"
    'System Administrator',                     -- name
    1,                                          -- parent_id (company ID)
    1,                                          -- depot_id (first depot)
    1,                                          -- zone_id (first zone)
    '+91-9999999999',                          -- phone_number
    'System Admin Address',                     -- address
    'ADMIN001',                                -- employee_id
    '2024-01-01',                              -- joining_date
    NULL,                                       -- reporting_to (no one)
    NULL,                                       -- profile_image
    NULL,                                       -- last_login
    'Y',                                        -- is_active
    GETDATE(),                                  -- createdate
    1,                                          -- createdby (self-reference)
    NULL,                                       -- updatedate
    NULL,                                       -- updatedby
    1                                           -- log_inst
);

-- Verify the user was created
SELECT id, email, name, is_active FROM users WHERE id = 1;
