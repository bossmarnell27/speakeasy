import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.post('/feedback', async (req, res) => {
  try {
    const { 
      submissionId, 
      score, 
      feedback, 
      wordChoiceFeedback, 
      bodyLanguageFeedback, 
      fillerWordFeedback 
    } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submission ID' });
    }

    const updateData: any = {};
    if (score !== undefined) updateData.score = score;
    if (feedback !== undefined) updateData.feedback_json = feedback;
    if (wordChoiceFeedback !== undefined) updateData.word_choice_feedback = wordChoiceFeedback;
    if (bodyLanguageFeedback !== undefined) updateData.body_language_feedback = bodyLanguageFeedback;
    if (fillerWordFeedback !== undefined) updateData.filler_word_feedback = fillerWordFeedback;

    const { data, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Feedback updated successfully', data });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;