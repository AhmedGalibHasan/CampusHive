import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const fixUserIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log('\nCurrent indexes on users collection:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check if userId index exists
    const userIdIndex = indexes.find(idx => idx.key && idx.key.userId);
    
    if (userIdIndex) {
      console.log(`\nFound userId index: ${userIdIndex.name}`);
      console.log('Dropping userId index...');
      
      // Drop the userId index
      await usersCollection.dropIndex(userIdIndex.name);
      console.log('✓ Successfully dropped userId index');
    } else {
      console.log('\nNo userId index found. Collection is already clean.');
    }

    // Also remove userId field from any existing documents (if it exists)
    const result = await usersCollection.updateMany(
      { userId: { $exists: true } },
      { $unset: { userId: "" } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✓ Removed userId field from ${result.modifiedCount} user document(s)`);
    }

    // List indexes again to confirm
    const newIndexes = await usersCollection.indexes();
    console.log('\nIndexes after cleanup:');
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✓ Index cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user index:', error);
    process.exit(1);
  }
};

fixUserIndex();

