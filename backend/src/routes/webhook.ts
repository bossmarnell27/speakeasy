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
      // New flat parameter structure
      wordChoiceScore,
      wordChoiceDescription,
      bodyLanguageScore,
      bodyLanguageDescription,
      fillerWordCount,
      fillerWordScore,
      fillerWordList,
      fillerWordDescription,
      // Legacy object support
      wordChoice,
      bodyLanguage,
      fillerWords,
      // Legacy simple text support
      wordChoiceFeedback, 
      bodyLanguageFeedback, 
      fillerWordFeedback 
    } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submission ID' });
    }

    console.log('Received feedback for submission:', submissionId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const updateData: any = {};
    if (score !== undefined) updateData.score = score;
    if (feedback !== undefined) updateData.feedback_json = feedback;

    // Handle new flat parameter structure (preferred)
    if (wordChoiceScore !== undefined || wordChoiceDescription !== undefined) {
      updateData.word_choice_feedback = JSON.stringify({
        score: wordChoiceScore || null,
        description: wordChoiceDescription || null
      });
    }
    // Handle legacy object format
    else if (wordChoice) {
      updateData.word_choice_feedback = JSON.stringify({
        score: wordChoice.score || null,
        description: wordChoice.description || null
      });
    }
    // Handle legacy simple text format
    else if (wordChoiceFeedback !== undefined) {
      updateData.word_choice_feedback = wordChoiceFeedback;
    }

    // Handle new flat parameter structure for body language
    if (bodyLanguageScore !== undefined || bodyLanguageDescription !== undefined) {
      updateData.body_language_feedback = JSON.stringify({
        score: bodyLanguageScore || null,
        description: bodyLanguageDescription || null
      });
    }
    // Handle legacy object format
    else if (bodyLanguage) {
      updateData.body_language_feedback = JSON.stringify({
        score: bodyLanguage.score || null,
        description: bodyLanguage.description || null
      });
    }
    // Handle legacy simple text format
    else if (bodyLanguageFeedback !== undefined) {
      updateData.body_language_feedback = bodyLanguageFeedback;
    }

    // Handle new flat parameter structure for filler words
    if (fillerWordCount !== undefined || fillerWordScore !== undefined || fillerWordList !== undefined || fillerWordDescription !== undefined) {
      // Convert comma-separated string to array
      let listArray: string[] = [];
      if (fillerWordList && typeof fillerWordList === 'string') {
        listArray = fillerWordList.split(',').map(word => word.trim()).filter(word => word.length > 0);
      }
      
      updateData.filler_word_feedback = JSON.stringify({
        count: fillerWordCount || 0,
        score: fillerWordScore || null,
        list: listArray,
        description: fillerWordDescription || null
      });
    }
    // Handle legacy object format
    else if (fillerWords) {
      updateData.filler_word_feedback = JSON.stringify({
        count: fillerWords.count || 0,
        score: fillerWords.score || null,
        list: fillerWords.list || [],
        description: fillerWords.description || null
      });
    }
    // Handle legacy simple text format
    else if (fillerWordFeedback !== undefined) {
      updateData.filler_word_feedback = fillerWordFeedback;
    }

    console.log('Update data:', updateData);

    const { data, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    console.log('Feedback updated successfully for submission:', submissionId);
    res.json({ message: 'Feedback updated successfully', data: data[0] });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;