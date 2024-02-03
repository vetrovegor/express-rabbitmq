import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    nickname: String,
    password: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

export const User = mongoose.model('user', UserSchema);