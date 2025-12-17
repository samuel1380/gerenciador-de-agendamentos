-- Database Schema for TiDB / MySQL

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    avatar VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    image VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT 1
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE, -- YYYY-MM-DD
    time VARCHAR(10) NOT NULL, -- HH:MM
    slot_label VARCHAR(50),
    available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    status ENUM('pending','accepted','rejected','completed','cancelled') DEFAULT 'pending',
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(service_id) REFERENCES services(id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    `read` BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(255) PRIMARY KEY,
    value TEXT
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    payload TEXT,
    user_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data

-- Services
INSERT INTO services (title, price, duration_minutes, image, description) VALUES 
('Manicure Completa', 35.00, 45, 'assets/service1.jpg', 'Cutilagem e esmaltação completa.'),
('Pedicure Simples', 30.00, 40, 'assets/service2.jpg', 'Cutilagem e esmaltação dos pés.'),
('Spa dos Pés', 50.00, 60, 'assets/service3.jpg', 'Hidratação profunda, esfoliação e massagem.');

-- Settings
INSERT IGNORE INTO settings (`key`, value) VALUES 
('quiz_daily_limit', '3'),
('quiz_xp_reward', '50'),
('appointment_xp_reward', '100'),
('xp_per_level', '200');
