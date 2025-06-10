-- Drop existing tables if they exist
DROP TABLE IF EXISTS trip_activities;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE trips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create activities table
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    price DECIMAL(10,2),
    rating DECIMAL(2,1),
    image_url VARCHAR(255),
    position_lat DECIMAL(10,8),
    position_lng DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trip_activities table
CREATE TABLE trip_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    activity_id INT NOT NULL,
    day INT,
    status ENUM('backlog', 'timeline') DEFAULT 'backlog',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Insert test data
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@example.com', '$2b$10$YourHashedPasswordHere');

-- Insert test trips
INSERT INTO trips (user_id, title, description, start_date, end_date, budget) VALUES
(1, 'Tokyo Adventure', 'Exploring Tokyo for a week', '2024-06-01', '2024-06-07', 2000.00);

-- Insert test activities
INSERT INTO activities (title, description, address, price, rating, image_url, position_lat, position_lng) VALUES
('Tokyo Tower', 'Famous landmark in Tokyo', '4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan', 25.00, 4.5, 'https://example.com/tokyo-tower.jpg', 35.6586, 139.7454),
('Shibuya Crossing', 'World''s busiest pedestrian crossing', 'Shibuya City, Tokyo 150-0043, Japan', 0.00, 4.8, 'https://example.com/shibuya.jpg', 35.6595, 139.7035),
('Tsukiji Outer Market', 'Famous fish market', '4 Chome-16-2 Tsukiji, Chuo City, Tokyo 104-0045, Japan', 0.00, 4.6, 'https://example.com/tsukiji.jpg', 35.6654, 139.7697);

-- Link activities to trip
INSERT INTO trip_activities (trip_id, activity_id, status, day) VALUES
(1, 1, 'backlog', NULL),
(1, 2, 'timeline', 1),
(1, 3, 'backlog', NULL); 