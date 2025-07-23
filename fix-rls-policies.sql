-- Fix RLS Policies for API Access
-- Run this in your Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Students can insert their own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can insert their own enrollments" ON enrollments;

-- Create new policies that work with API calls
CREATE POLICY "Allow submission inserts via API" ON submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow enrollment inserts via API" ON enrollments
    FOR INSERT WITH CHECK (true);

-- Also ensure profiles can be inserted via API
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Allow profile inserts via API" ON profiles
    FOR INSERT WITH CHECK (true);

-- Keep the SELECT policies restrictive for security
-- But allow API operations for INSERT/UPDATE where needed