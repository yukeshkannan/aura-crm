const mongoose = require('mongoose');
const Task = require('./apps/task-service/models/Task');
const User = require('./apps/auth-service/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './apps/task-service/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/company_crm';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI.replace('mongo:27017', 'localhost:27017'));
        console.log('Connected to DB');

        const users = await User.find({ role: 'Employee' });
        console.log('Employees:', users.map(u => ({ id: u._id.toString(), name: u.name })));

        const tasks = await Task.find({});
        console.log('All Tasks:', tasks.map(t => ({ 
            id: t._id, 
            title: t.title, 
            assignedTo: t.assignedTo ? t.assignedTo.toString() : 'Unassigned',
            dueDate: t.dueDate
        })));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
