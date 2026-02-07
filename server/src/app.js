const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes'); // Will be enabled later
const ticketRoutes = require('./routes/ticketRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const csatRoutes = require('./routes/csatRoutes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('AI Customer Support System API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/csat', csatRoutes);

// Error Handling
app.use(notFound); // Will be enabled after implementing middleware
app.use(errorHandler);

module.exports = app;
