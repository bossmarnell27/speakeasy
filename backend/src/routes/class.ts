import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('class')
      .select('*')
      .single();

    if (error) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/join', async (req, res) => {
  try {
    const { userId, joinCode } = req.body;

    if (!userId || !joinCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: classData, error: classError } = await supabase
      .from('class')
      .select('*')
      .eq('join_code', joinCode)
      .single();

    if (classError || !classData) {
      return res.status(404).json({ error: 'Invalid join code' });
    }

    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        student_id: userId,
        class_id: classData.id
      });

    if (enrollError) {
      return res.status(400).json({ error: enrollError.message });
    }

    res.json({ message: 'Successfully joined class', class: classData });
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;