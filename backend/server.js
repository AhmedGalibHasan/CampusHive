import dotenv from 'dotenv';
import app, { initDb } from './app.js';

// Load env for server runs
dotenv.config({ path: '.env' });

// Start server
const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err?.message || err);
    process.exit(1);
  });