import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minlength: [2, 'Username must be at least 2 characters long']
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
        },
        passwordHash: {
            type: String,
            required: [true, 'Password hash is required']
        }
    },
    {
        timestamps: true
    }
);

// Ensure passwordHash is excluded by default when returning JSON
userSchema.methods.toSafeObject = function () {
    return {
        _id: this._id,
        id: this._id.toString(),
        username: this.username,
        email: this.email,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

export const User = mongoose.model('User', userSchema);
export default User;
