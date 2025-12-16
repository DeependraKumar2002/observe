const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        index: true
    },
    centerCode: {
        type: String,
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true,
        enum: ['user', 'admin']
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Create compound index for efficient querying
chatMessageSchema.index({ userEmail: 1, centerCode: 1, timestamp: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);