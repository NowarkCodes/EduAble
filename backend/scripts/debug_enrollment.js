const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/EduAble/backend/.env' });

// Register models
require('c:/EduAble/backend/models/Course');
const Enrollment = require('c:/EduAble/backend/models/Enrollment');
const User = require('c:/EduAble/backend/models/User');

async function checkEnrollments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: 'pratham' });
        if (!user) {
            console.log('User pratham not found');
            process.exit(0);
        }
        const enrollments = await Enrollment.find({ userId: user._id })
            .populate('courseId', 'title thumbnail totalLessons')
            .lean();
        console.log(JSON.stringify({ user: user.name, enrollments }, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEnrollments();
