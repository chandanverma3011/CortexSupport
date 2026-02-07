const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ai-support-db',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  nodeEnv: process.env.NODE_ENV || 'development',
};
