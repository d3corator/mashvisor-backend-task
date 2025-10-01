-- Create listings table for Real Estate API
CREATE TABLE IF NOT EXISTS `listings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `bedrooms` int NOT NULL,
  `agent_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agent_id` (`agent_id`),
  KEY `idx_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert sample data
INSERT INTO `listings` (`title`, `city`, `price`, `bedrooms`, `agent_id`) VALUES
('Modern Apartment', 'new york', 250000.00, 2, 101),
('Cozy Suburban Home', 'chicago', 320000.00, 3, 102),
('Luxury Condo', 'new york', 450000.00, 4, 103),
('Family House', 'los angeles', 380000.00, 3, 101),
('Downtown Loft', 'chicago', 280000.00, 1, 102);