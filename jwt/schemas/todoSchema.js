const mongoose = require('mongoose');

const toSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
    },
    data: {
        type: Date,
        default: Date.now,
    },
});

module.exports = toSchema;
