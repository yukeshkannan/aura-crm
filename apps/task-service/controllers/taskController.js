const Task = require('../models/Task');
const { formatResponse } = require('../../../packages/utils');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 }); // Sort by due date (soonest first)
    formatResponse(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return formatResponse(res, 404, 'Task not found');
    }

    formatResponse(res, 200, 'Task retrieved successfully', task);
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Public
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    formatResponse(res, 201, 'Task created successfully', task);
  } catch (err) {
    formatResponse(res, 400, 'Invalid data', err.message);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Public
exports.updateTask = async (req, res) => {
  try {
    const originalTask = await Task.findById(req.params.id);

    if (!originalTask) {
      return formatResponse(res, 404, 'Task not found');
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Check for status change or assignment change
    if (task.assignedTo && (
        originalTask.status !== task.status || 
        originalTask.assignedTo?.toString() !== task.assignedTo.toString()
    )) {
        try {
            // Lazy load User model to avoid circular dependency issues or just path issues
             // We access the User model from auth-service (Monorepo shortcut)
             // In a real microservice, we would request user details from Auth Service API
            const User = require('../../auth-service/models/User'); 
            const assignedUser = await User.findById(task.assignedTo);

            if (assignedUser && assignedUser.email) {
                const axios = require('axios');
                const subject = `Task Update: ${task.title}`;
                const message = `
                    <h3>Task Updated</h3>
                    <p><strong>Title:</strong> ${task.title}</p>
                    <p><strong>Status:</strong> ${originalTask.status} -> ${task.status}</p>
                    <p><strong>Priority:</strong> ${task.priority}</p>
                    <p><strong>Assigned To:</strong> ${assignedUser.name}</p>
                    <br/>
                    <p>Please check the CRM for more details.</p>
                `;

                // Fire and forget notification
                axios.post('http://localhost:5005/api/notifications/email', {
                    to: assignedUser.email,
                    subject,
                    message
                }).catch(err => console.error("Failed to send notification:", err.message));
            }
        } catch (noteErr) {
            console.error("Notification Error:", noteErr.message);
        }
    }

    formatResponse(res, 200, 'Task updated successfully', task);
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return formatResponse(res, 404, 'Task not found');
    }

    await task.deleteOne();

    formatResponse(res, 200, 'Task deleted successfully', {});
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};
