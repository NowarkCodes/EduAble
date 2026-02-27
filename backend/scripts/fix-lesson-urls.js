/**
 * One-time fix: strip GCS signed-URL query params from all existing Lesson.videoUrl fields.
 * Converts expired signed URLs like: https://storage.googleapis.com/bucket/path?X-Goog-Algorithm=...
 * To permanent URLs like:            https://storage.googleapis.com/bucket/path
 *
 * Run: node scripts/fix-lesson-urls.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');

async function fixLessonUrls() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  const lessons = await Lesson.find({ videoUrl: { $exists: true, $ne: null } }).lean();
  console.log(`Found ${lessons.length} lessons with video URLs.`);

  let fixed = 0;
  for (const lesson of lessons) {
    const original = lesson.videoUrl;
    let permanent = original;

    try {
      const parsed = new URL(original);
      // Strip query params (signed URL tokens)
      permanent = `${parsed.origin}${parsed.pathname}`;
    } catch {
      // Not a URL, leave as-is
    }

    if (permanent !== original) {
      await Lesson.updateOne({ _id: lesson._id }, { $set: { videoUrl: permanent } });
      console.log(`Fixed: ${original.slice(0, 80)}...`);
      console.log(`   -> ${permanent}`);
      fixed++;
    }
  }

  console.log(`\n✅ Done. Fixed ${fixed} lesson URL(s).`);
  await mongoose.disconnect();
}

fixLessonUrls().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
