import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect to MongoDB database.
 * Enforces production-safe MONGODB_URI validation for cloud deployment.
 */
export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const uri = (process.env.MONGODB_URI || '').trim();

    if (isProduction && (!uri || uri.includes('localhost') || uri.includes('127.0.0.1'))) {
        console.error('================================================================');
        console.error('[FATAL ERROR] MONGODB_URI is missing in Render Environment Variables.');
        console.error('Please go to Render Dashboard -> Web Service -> Environment');
        console.error('Add MONGODB_URI=mongodb+srv://Sync:I26A1657Siv@syncbooth-db.xvneteq.mongodb.net/syncbooth?retryWrites=true&w=majority&appName=syncbooth-db');
        console.error('================================================================');
        throw new Error('MONGODB_URI is missing in production environment');
    }

    const targetUri = uri || 'mongodb://localhost:27017/syncbooth';

    try {
        const conn = await mongoose.connect(targetUri);
        console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[MongoDB] Connection Error: ${error.message}`);
        throw error;
    }
};

export default connectDB;
