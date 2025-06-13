-- Create trip_days table if it doesn't exist
CREATE TABLE IF NOT EXISTS trip_days (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    day_number INT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trip_day (trip_id, day_number)
); 