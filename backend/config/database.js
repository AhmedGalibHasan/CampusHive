import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const options = {};
    if (process.env.MONGODB_DBNAME) {
      options.dbName = process.env.MONGODB_DBNAME;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    return conn.connection;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};

export default connectDB;

