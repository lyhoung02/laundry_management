-- Migration to add completed_at column to lms_schedules table
-- Run this if you get "Unknown column 'completed' in 'field list'" error

ALTER TABLE lms_schedules ADD COLUMN completed_at DATETIME AFTER scheduled_at;
