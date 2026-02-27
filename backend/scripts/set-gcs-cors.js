/**
 * Run this ONCE to configure CORS on your GCS bucket so browsers can stream videos.
 * Usage: node scripts/set-gcs-cors.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const corsConfig = [
  {
    origin: ['http://localhost:3000', 'https://*.vercel.app', '*'],
    responseHeader: ['Content-Type', 'Range', 'Accept-Ranges', 'Content-Range'],
    method: ['GET', 'HEAD', 'OPTIONS'],
    maxAgeSeconds: 3600,
  },
];

async function setCors() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    console.error('GCS_BUCKET_NAME not set in .env');
    process.exit(1);
  }

  console.log(`Setting CORS on bucket: ${bucketName}`);
  await storage.bucket(bucketName).setCorsConfiguration(corsConfig);
  console.log('✅ CORS configured successfully! Videos can now stream in the browser.');
}

setCors().catch(err => {
  console.error('❌ Failed to set CORS:', err.message);
  process.exit(1);
});
