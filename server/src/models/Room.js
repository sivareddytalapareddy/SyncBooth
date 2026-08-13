import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        roomCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            length: 6
        },
        hostUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        participantUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        status: {
            type: String,
            enum: ['WAITING', 'ACTIVE', 'CAPTURING', 'COMPLETED', 'CLOSED'],
            default: 'WAITING'
        }
    },
    {
        timestamps: true
    }
);

export const Room = mongoose.model('Room', roomSchema);
export default Room;
