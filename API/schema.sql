CREATE TABLE IF NOT EXISTS activities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  price DECIMAL(10, 2),
  tags JSON,
  rating DECIMAL(3, 2),
  image_url TEXT,
  day INT,
  status ENUM('backlog', 'timeline') DEFAULT 'backlog',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 