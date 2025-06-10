const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const session = require('express-session');

const authRoutes = require('./routes/auth.routes');
const donorRoutes = require('./routes/donor.routes');
const seekerRoutes = require('./routes/seeker.routes');
const doctorRoutes = require('./routes/doctor.routes');
const messageRoutes = require('./routes/message.routes');
const userRoutes = require('./routes/user.routes');
const zoomRoutes = require('./routes/zoom.routes');
const slowDown = require('express-slow-down');

dotenv.config();

const app = express();

app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
);

app.use(express.json());

app.use(cookieParser());

app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your_default_session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 30 * 60 * 1000 // 30 minutes
      }
    })
);
/**
 * Максимум 3 швидких запити за 1 годину (windowMs: 60 хв.)
 * Після 3-го запиту: кожен новий запит чекає на 2 секунди (2000 мс)
 * **/

const anySlowDown = slowDown({
  windowMs: 60 * 60 * 1000,
  delayAfter: 3,
  delayMs: 2000
});

app.post(
    '/api/auth/forgot-password',
    anySlowDown,
    require('./controllers/auth.controller').forgotOrResetPassword
);

const messageSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100,           // allow 10 requests without delay
  delayMs: 2000             // add 2s delay for each request beyond 10
});


app.use(helmet());
// app.use(morgan('dev')); // для логування дій

mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/seekers', seekerRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/messages', messageSlowDown, messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/zoom', zoomRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
