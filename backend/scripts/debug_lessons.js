const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/EduAble/backend/.env' });
require('c:/EduAble/backend/models/Course');
const Lesson = require('c:/EduAble/backend/models/Lesson');

async function checkLessons() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const lessons = await Lesson.find({ courseId: '69a204dc007a17a13b8c6b3f' }).lean();
        console.log(JSON.stringify(lessons, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLessons();
