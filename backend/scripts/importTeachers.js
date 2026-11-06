import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import Teacher from '../models/Teacher.js';
import connectDB from '../config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
await connectDB();

// Function to extract teacher ID from name (e.g., "Md. Saiful Islam [MSI]" -> "MSI")
const extractTeacherId = (name) => {
  const match = name.match(/\[([^\]]+)\]/);
  return match ? match[1] : null;
};

// Function to check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

const importTeachers = async () => {
  try {
    // Try multiple possible paths for the CSV file
    const possiblePaths = [
      path.join(__dirname, '../../teachers.csv'),
      path.join(process.cwd(), 'teachers.csv'),
    ];
    
    let csvPath = null;
    for (const possiblePath of possiblePaths) {
      if (fileExists(possiblePath)) {
        csvPath = possiblePath;
        break;
      }
    }
    
    if (!csvPath) {
      console.error(`CSV file not found. Tried:`);
      possiblePaths.forEach(p => console.error(`  - ${p}`));
      process.exit(1);
    }
    
    if (!fileExists(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`);
      process.exit(1);
    }

    const teachers = [];
    let rowCount = 0;
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          try {
            const name = row.Name?.trim() || '';
            const designation = row.Designation?.trim() || '';
            const email = row.Email?.trim() || '';
            let imagePath = row['Image Path']?.trim() || '';

            // Skip if essential fields are missing
            if (!name || !email) {
              console.log(`Skipping row ${rowCount}: Missing name or email`);
              skippedCount++;
              return;
            }

            // Extract teacher ID from name
            const teacherId = extractTeacherId(name);
            if (!teacherId) {
              console.log(`Skipping row ${rowCount}: Could not extract teacher ID from name: ${name}`);
              skippedCount++;
              return;
            }

            // Validate image path if provided
            if (imagePath) {
              // Normalize path separators
              imagePath = imagePath.replace(/\\/g, '/');
              
              // Remove leading slash if present
              if (imagePath.startsWith('/')) {
                imagePath = imagePath.substring(1);
              }
              
              // Check if image file exists in backend/public/
              // CSV path: "uploads/avatars/image.jpg"
              // Actual location: backend/public/uploads/avatars/image.jpg
              const fullImagePath = path.join(__dirname, '..', 'public', imagePath);
              
              if (fileExists(fullImagePath)) {
                console.log(`✓ Image found: ${imagePath}`);
                // Keep the path as stored in CSV (e.g., "uploads/avatars/image.jpg")
                // This will work with the static file serving
              } else {
                console.log(`⚠ Image NOT found: ${imagePath}`);
                console.log(`  Expected location: ${fullImagePath}`);
                // Keep the path anyway - maybe file will be added later
                // Or set to empty if you want placeholder
                // imagePath = ''; // Uncomment if you want placeholder for missing images
              }
            }

            teachers.push({
              teacherId,
              name,
              designation,
              email,
              imagePath: imagePath || '', // Keep the path even if file not found initially
            });
          } catch (error) {
            console.error(`Error processing row ${rowCount}:`, error.message);
            errorCount++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`\nParsed ${rowCount} rows from CSV`);
    console.log(`Valid teachers found: ${teachers.length}`);
    console.log(`Skipped: ${skippedCount}, Errors: ${errorCount}\n`);

    // Import to database
    for (const teacherData of teachers) {
      try {
        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ 
          $or: [
            { teacherId: teacherData.teacherId },
            { email: teacherData.email }
          ]
        });

        if (existingTeacher) {
          console.log(`Teacher already exists: ${teacherData.name} (${teacherData.teacherId})`);
          skippedCount++;
          continue;
        }

        const teacher = new Teacher(teacherData);
        await teacher.save();
        console.log(`✓ Imported: ${teacherData.name} (${teacherData.teacherId})`);
        importedCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Duplicate entry skipped: ${teacherData.name} (${teacherData.teacherId})`);
          skippedCount++;
        } else {
          console.error(`Error importing ${teacherData.name}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total rows processed: ${rowCount}`);
    console.log(`Successfully imported: ${importedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('=====================\n');

    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
};

importTeachers();

