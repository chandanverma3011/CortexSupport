const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const seedAdmin = require('./seedAdmin');

// Connect to Database and seed admin
const startServer = async () => {
    await connectDB();
    await seedAdmin();

    const PORT = config.port;
    app.listen(PORT, () => {
        console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });
};

startServer();

