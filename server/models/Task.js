const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Deferred'],
        default: 'Open',
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    dueDate: { type: Date },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    activityLog: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String },
        timestamp: { type: Date, default: Date.now },
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        timestamp: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
