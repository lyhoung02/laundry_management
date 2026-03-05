// Run this script to add the completed_at column to lms_schedules table
// Usage: node migrations/add_completed_at.js

const pool = require('../config/database');

async function addColumn() {
  try {
    // Check if column exists
    const [columns] = await pool.execute(
      "SHOW COLUMNS FROM lms_schedules LIKE 'completed_at'"
    );
    
    if (columns.length === 0) {
      console.log('Adding completed_at column to lms_schedules table...');
      await pool.execute(
        'ALTER TABLE lms_schedules ADD COLUMN completed_at DATETIME AFTER scheduled_at'
      );
      console.log('✓ Column added successfully!');
    } else {
      console.log('✓ Column completed_at already exists');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addColumn();
