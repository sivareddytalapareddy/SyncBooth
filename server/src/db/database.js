import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/syncbooth';

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return mongoose.connection;
        }
        
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[MongoDB] Connection Error: ${error.message}`);
        // Do not crash server in test environment if mongo is mocked
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

export default connectDB;
