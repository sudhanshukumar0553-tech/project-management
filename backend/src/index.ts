import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import boardRoutes from './routes/boards';
import listRoutes from './routes/lists';
import cardRoutes from './routes/cards';
import memberRoutes from './routes/members';
import searchRoutes from './routes/search';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
