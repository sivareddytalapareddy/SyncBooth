import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect to MongoDB database.
 * Enforces production-safe MONGODB_URI validation for cloud deployment (e.g. Render).
 */
export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const uri = (process.env.MONGODB_URI || '').trim();

    // In production, enforce presence of MONGODB_URI (e.g., MongoDB Atlas)
    if (isProduction && (!uri || uri.includes('localhost') || uri.includes('127.0.0.1'))) {
        console.error('================================================================');
        console.error('[FATAL ERROR] Production MongoDB Configuration Error');
        console.error('MONGODB_URI environment variable is missing or points to localhost.');
        console.error('Render backend requires a valid MongoDB Atlas connection string.');
        console.error('Please add MONGODB_URI in Render Web Service -> Environment Variables.');
        console.error('================================================================');
        process.exit(1);
    }

    const targetUri = uri || 'mongodb://localhost:27017/syncbooth';

    try {
        const conn = await mongoose.connect(targetUri);
        console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[MongoDB] Connection Error: ${error.message}`);
        if (isProduction || process.env.NODE_ENV !== 'test') {
            console.error('[MongoDB] Unable to connect to database. Terminating process.');
            process.exit(1);
        }
        throw error;
    }
};

export default connectDB;
