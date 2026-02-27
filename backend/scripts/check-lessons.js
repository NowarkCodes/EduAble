require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const lessons = await Lesson.find({}).select('title videoUrl').lean();
  lessons.forEach(l => {
    console.log(`[${l.title}]`);
    console.log(`  URL: ${l.videoUrl || '(empty)'}`);
  });
  await mongoose.disconnect();
}
check().catch(console.error);
