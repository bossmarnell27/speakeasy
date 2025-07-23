import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.post('/set-role', async (req, res) => {
  try {
    const { userId, role, name } = req.body;

    if (!userId || !role || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role !== 'teacher' && role !== 'student') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role,
        name
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Role set successfully', data });
  } catch (error) {
    console.error('Error setting role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;