import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.get('/', async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ error: 'Missing user ID or role' });
    }

    let query = supabase
      .from('submissions')
      .select(`
        *,
        assignments (
          title,
          description,
          due_date
        ),
        profiles (
          name
        )
      `);

    if (role === 'student') {
      query = query.eq('student_id', userId);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;