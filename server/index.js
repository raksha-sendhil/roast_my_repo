import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import roastRouter from './routes/roast.js';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api', roastRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
