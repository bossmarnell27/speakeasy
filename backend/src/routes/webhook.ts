import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.post('/feedback', async (req, res) => {
  try {
    const { submissionId, score, feedback } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submission ID' });
    }

    const { data, error } = await supabase
      .from('submissions')
      .update({
        score,
        feedback_json: feedback
      })
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