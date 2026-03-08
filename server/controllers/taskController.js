const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    const { status, priority, assignee } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;


    if (assignee) {
        query.assignee = assignee; // Mongoose auto-casts string to ObjectId
    }

    try {
        const tasks = await Task.find(query)
            .populate('assignee', 'username avatarUrl')
            .populate('reporter', 'username avatarUrl')
            .populate('project', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignee', 'username avatarUrl')
            .populate('reporter', 'username avatarUrl')
            .populate('project', 'name')
            .populate('activityLog.user', 'username avatarUrl')
            .populate('comments.user', 'username avatarUrl');

        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private (Admin/Manager)
const createTask = async (req, res) => {
    const { title, description, priority, dueDate, assignee, project, status } =
        req.body;

    try {
        const task = new Task({
            title,
            description,
            priority,
            dueDate,
            assignee,
            project,
            status,
            reporter: req.user._id,
            activityLog: [
                {
                    user: req.user._id,
                    action: `created task "${title}"`,
                },
            ],
        });

        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Role-based update logic
        if (req.user.role === 'developer') {
            // Developers can only update status, progress, and add comments (handled separately usually, 
            // but here we might accept comments in the update body or a separate route. 
            // The prompt says "add to comments", usually a separate endpoint is better, but let's see.
            // "Developers can only update the status, progress, and add to comments"

            // Let's allow updating status and progress directly here.
            if (req.body.status && req.body.status !== task.status) {
                task.status = req.body.status;
                task.activityLog.push({
                    user: req.user._id,
                    action: `changed status to ${task.status}`
                });
            }
            if (req.body.progress !== undefined) {
                task.progress = req.body.progress;
            }

            // If they try to update other fields, we ignore them or could warn.
            // For now, we just save the changes we allowed.
        } else {
            // Admin/Manager can update everything
            if (req.body.title) task.title = req.body.title;
            if (req.body.description) task.description = req.body.description;
            if (req.body.priority) task.priority = req.body.priority;
            if (req.body.dueDate) task.dueDate = req.body.dueDate;
            if (req.body.assignee) task.assignee = req.body.assignee;
            if (req.body.project) task.project = req.body.project;
            if (req.body.status && req.body.status !== task.status) {
                task.status = req.body.status;
                task.activityLog.push({
                    user: req.user._id,
                    action: `changed status to ${task.status}`
                });
            }
            if (req.body.progress) task.progress = req.body.progress;
        }

        // Handle comments (if passed in body, though usually a separate endpoint)
        // Let's assume a separate endpoint for comments is better for structure, but 
        // to stick to the prompt's "PUT /:id Update task details", I will handle simple updates here.
        // If a comment is passed:
        if (req.body.comment) {
            task.comments.push({
                user: req.user._id,
                text: req.body.comment,
                timestamp: Date.now()
            });
        }

        const updatedTask = await task.save();
        res.json(updatedTask);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Manager)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Logic: Only Admin or the reporter can delete? Or maybe Manager too.
        // Assuming strict role logic: Admin & Manager can delete any task.
        // Developer cannot delete.
        if (req.user.role === 'developer') {
            return res.status(403).json({ message: 'Not authorized to delete tasks' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};
