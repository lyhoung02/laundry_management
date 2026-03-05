-- Laundry Management System Database Schema

CREATE TABLE IF NOT EXISTS lms_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','manager','staff') DEFAULT 'staff',
  language ENUM('en','km') DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(30),
  address TEXT,
  type ENUM('individual','business','healthcare','hospitality') DEFAULT 'individual',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category ENUM('linen','uniform','towel','healthcare','other') DEFAULT 'linen',
  rfid_tag VARCHAR(100),
  quantity INT DEFAULT 0,
  min_quantity INT DEFAULT 10,
  unit VARCHAR(30) DEFAULT 'piece',
  condition_status ENUM('good','worn','damaged','retired') DEFAULT 'good',
  customer_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES lms_customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lms_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT,
  status ENUM('pending','picked_up','washing','drying','folding','quality_check','ready','delivered','cancelled') DEFAULT 'pending',
  priority ENUM('normal','high','urgent') DEFAULT 'normal',
  pickup_date DATETIME,
  delivery_date DATETIME,
  actual_delivery DATETIME,
  total_weight DECIMAL(10,2),
  total_items INT DEFAULT 0,
  cost_per_pound DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  special_instructions TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES lms_customers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES lms_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lms_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  inventory_item_id INT,
  item_name VARCHAR(150) NOT NULL,
  quantity INT DEFAULT 1,
  wash_type ENUM('standard','delicate','heavy','sanitize','dry_clean') DEFAULT 'standard',
  special_instructions TEXT,
  FOREIGN KEY (order_id) REFERENCES lms_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_item_id) REFERENCES lms_inventory_items(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lms_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  order_id INT,
  schedule_type ENUM('pickup','washing','delivery','maintenance') DEFAULT 'washing',
  scheduled_at DATETIME NOT NULL,
  completed_at DATETIME,
  assigned_to INT,
  status ENUM('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES lms_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES lms_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lms_quality_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  checked_by INT,
  temperature DECIMAL(5,2),
  detergent_used VARCHAR(100),
  wash_cycle VARCHAR(100),
  result ENUM('pass','fail','reprocess') DEFAULT 'pass',
  notes TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES lms_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (checked_by) REFERENCES lms_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lms_compliance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  action VARCHAR(200) NOT NULL,
  description TEXT,
  performed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES lms_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES lms_users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO lms_users (name, email, password, role) VALUES 
('Admin', 'admin@laundry.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample customers
INSERT IGNORE INTO lms_customers (name, email, phone, type) VALUES
('City Hospital', 'laundry@cityhospital.com', '+855-12-345678', 'healthcare'),
('Grand Hotel Phnom Penh', 'housekeeping@grandhotel.com', '+855-23-456789', 'hospitality'),
('Sok Dara Family', 'sokdara@email.com', '+855-17-234567', 'individual');
