-- Add feedback columns to submissions table
-- Run this in your Supabase SQL Editor

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS word_choice_feedback TEXT,
ADD COLUMN IF NOT EXISTS body_language_feedback TEXT,
ADD COLUMN IF NOT EXISTS filler_word_feedback TEXT;

-- Optional: Add index for faster queries when filtering by feedback availability
CREATE INDEX IF NOT EXISTS idx_submissions_feedback_available 
ON submissions (id) 
WHERE word_choice_feedback IS NOT NULL 
   OR body_language_feedback IS NOT NULL 
   OR filler_word_feedback IS NOT NULL;

-- Update existing records to have NULL values (already default, but explicit)
-- No need to run this unless you want to explicitly set NULL
-- UPDATE submissions SET 
--   word_choice_feedback = NULL,
--   body_language_feedback = NULL, 
--   filler_word_feedback = NULL
-- WHERE word_choice_feedback IS NULL;