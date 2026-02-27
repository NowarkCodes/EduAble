const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/EduAble/backend/.env' });
const Course = require('c:/EduAble/backend/models/Course');

async function checkCourses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const courses = await Course.find({}).sort({ createdAt: -1 }).limit(10);
        console.log(JSON.stringify(courses.map(c => ({ id: c._id, title: c.title, thumbnail: c.thumbnail })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCourses();
