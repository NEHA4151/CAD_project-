-- RDS Migration: pft_users table
-- Run this on your PostgreSQL RDS instance before starting the backend.
-- This creates the user accounts table used by /api/login and /api/user.
--
-- Note: "ENABLE ROW LEVEL SECURITY" from the Supabase version has been removed —
-- it is Supabase-specific and has no effect on standard PostgreSQL RDS.

CREATE TABLE IF NOT EXISTS pft_users (
    id       SERIAL       PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
