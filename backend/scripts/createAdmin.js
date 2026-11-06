import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@1';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminPassword, salt);
        await existingAdmin.save();
        console.log('✓ Updated existing user to admin');
      } else {
        // Update password if needed
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminPassword, salt);
        await existingAdmin.save();
        console.log('✓ Admin already exists, password updated');
      }
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        department: 'Administration',
        studentId: '',
        phone: ''
      });

      await admin.save();
      console.log('✓ Admin user created successfully');
    }

    console.log('\nAdmin credentials:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('\n✓ Admin setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

