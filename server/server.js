const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/tasks',     require('./routes/task.routes'));
app.use('/api/diary',     require('./routes/diary.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/timelog',   require('./routes/timelog.routes'));

app.get('/', (req, res) => res.json({ message: 'Digital Productivity Diary API running ✅' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
