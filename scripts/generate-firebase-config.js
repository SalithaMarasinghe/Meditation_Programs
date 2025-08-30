import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the .env file
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Generate the config file content
const configContent = `// Auto-generated file - do not edit manually
window.firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`;

// Ensure public directory exists
const publicDir = join(__dirname, '../public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Write the config file
writeFileSync(join(publicDir, 'firebase-config.js'), configContent);

console.log('Firebase config file generated successfully!');
