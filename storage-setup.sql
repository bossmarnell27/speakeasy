-- Storage Setup for Videos Bucket
-- Run this in your Supabase SQL Editor after creating the videos bucket

-- Create policy to allow authenticated users to upload videos
INSERT INTO storage.policies (bucket_id, name, definition, check, command)
VALUES (
    'videos',
    'Allow authenticated uploads',
    '(auth.role() = ''authenticated'')',
    '(auth.role() = ''authenticated'')',
    'INSERT'
) ON CONFLICT DO NOTHING;

-- Create policy to allow public access to videos (for viewing)
INSERT INTO storage.policies (bucket_id, name, definition, check, command)
VALUES (
    'videos',
    'Allow public access',
    'true',
    'true', 
    'SELECT'
) ON CONFLICT DO NOTHING;