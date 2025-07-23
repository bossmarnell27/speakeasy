import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth';
import classRoutes from './routes/class';
import assignmentRoutes from './routes/assignments';
import submissionRoutes from './routes/submissions';
import webhookRoutes from './routes/webhook';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Speakeasy API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/class', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/webhook', webhookRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});