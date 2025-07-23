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
            .from('class')
            .select('*')
            .single();
        if (error) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching class:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, joinCode } = req.body;
        if (!userId || !joinCode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const { data: classData, error: classError } = yield supabase
            .from('class')
            .select('*')
            .eq('join_code', joinCode)
            .single();
        if (classError || !classData) {
            return res.status(404).json({ error: 'Invalid join code' });
        }
        const { error: enrollError } = yield supabase
            .from('enrollments')
            .insert({
            student_id: userId,
            class_id: classData.id
        });
        if (enrollError) {
            return res.status(400).json({ error: enrollError.message });
        }
        res.json({ message: 'Successfully joined class', class: classData });
    }
    catch (error) {
        console.error('Error joining class:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
