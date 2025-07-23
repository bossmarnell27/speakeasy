"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const router = (0, express_1.Router)();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase
            .from('assignments')
            .select('*')
            .order('due_date', { ascending: true });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, dueDate } = req.body;
        if (!title || !description || !dueDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const { data, error } = yield supabase
            .from('assignments')
            .insert({
            title,
            description,
            due_date: dueDate
        })
            .select()
            .single();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/:id/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { studentId, videoUrl } = req.body;
        if (!studentId) {
            return res.status(400).json({ error: 'Missing student ID' });
        }
        // Create submission in database
        const { data: submission, error } = yield supabase
            .from('submissions')
            .insert({
            assignment_id: id,
            student_id: studentId,
            video_url: videoUrl,
            submitted_at: new Date().toISOString()
        })
            .select()
            .single();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(submission);
    }
    catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
