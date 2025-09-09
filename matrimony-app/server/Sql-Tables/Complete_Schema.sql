-- Complete Database Schema for Matrimony Portal
-- This script creates all necessary tables for the current entity structure

-- Create the Database
CREATE DATABASE IF NOT EXISTS `railway` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the Database
USE `railway`;

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS `profile_view`;
DROP TABLE IF EXISTS `pendingrequest`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `preferences`;
DROP TABLE IF EXISTS `profile_pictures`;
DROP TABLE IF EXISTS `Users`;

-- Create the Users Table (updated schema)
CREATE TABLE `Users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `phone` VARCHAR(15) NULL,
    `address` TEXT NULL,
    `marital_status` ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED') NOT NULL DEFAULT 'SINGLE',
    `religion` VARCHAR(50) NULL,
    `caste` VARCHAR(50) NULL,
    `mother_tongue` VARCHAR(50) NULL,
    `education` VARCHAR(255) NULL,
    `profession` VARCHAR(255) NULL,
    `annual_income` VARCHAR(50) NULL,
    `hobbies` VARCHAR(500) NULL,
    `bio` VARCHAR(500) NULL,
    `age` INT NULL,
    `location` VARCHAR(255) NULL,
    `subscription_status` INT DEFAULT 0,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATE NULL,
    `profile_approved` BOOLEAN DEFAULT FALSE,
    `created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the Preferences Table
CREATE TABLE `preferences` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `age` INT NOT NULL,
    `location` VARCHAR(255) NULL,
    `religion` VARCHAR(50) NULL,
    `caste` VARCHAR(50) NULL,
    `education` VARCHAR(255) NULL,
    `profession` VARCHAR(255) NULL,
    `gender` VARCHAR(10) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_preferences` (`user_id`)
);

-- Create the ProfilePictures Table
CREATE TABLE `profile_pictures` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `image_name` VARCHAR(255) NULL,
    `image_type` VARCHAR(50) NULL,
    `file_url` VARCHAR(500) NULL,
    `user_id` BIGINT NOT NULL,
    `created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);

-- Create the Messages Table
CREATE TABLE `messages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `content` VARCHAR(1000) NOT NULL,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `sender_id` BIGINT NOT NULL,
    `receiver_id` BIGINT NOT NULL,
    `created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`receiver_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);

-- Create the PendingRequests Table (default JPA naming)
CREATE TABLE `pendingrequest` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sender_id` BIGINT NOT NULL,
    `receiver_id` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`receiver_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);

-- Create the ProfileViews Table
CREATE TABLE `profile_view` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `viewer_user_id` BIGINT NOT NULL,
    `viewed_user_id` BIGINT NOT NULL,
    `viewed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`viewer_user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`viewed_user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX `idx_users_email` ON `Users`(`email`);
CREATE INDEX `idx_users_gender` ON `Users`(`gender`);
CREATE INDEX `idx_users_location` ON `Users`(`location`);
CREATE INDEX `idx_preferences_user_id` ON `preferences`(`user_id`);
CREATE INDEX `idx_messages_sender_receiver` ON `messages`(`sender_id`, `receiver_id`);
CREATE INDEX `idx_pending_requests_sender_receiver` ON `pendingrequest`(`sender_id`, `receiver_id`);
CREATE INDEX `idx_profile_views_viewer_viewed` ON `profile_view`(`viewer_user_id`, `viewed_user_id`);

-- Insert sample admin user (password: admin123)
INSERT INTO `Users` (`first_name`, `last_name`, `email`, `password`, `gender`, `date_of_birth`, `role`, `is_active`, `profile_approved`) 
VALUES ('Admin', 'User', 'admin@matrimony.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'MALE', '1990-01-01', 'ADMIN', TRUE, TRUE);

-- Insert sample regular user (password: user123)
INSERT INTO `Users` (`first_name`, `last_name`, `email`, `password`, `gender`, `date_of_birth`, `role`, `is_active`, `profile_approved`) 
VALUES ('Test', 'User', 'user@matrimony.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'FEMALE', '1995-01-01', 'USER', TRUE, TRUE);

-- Create default preferences for sample users
INSERT INTO `preferences` (`age`, `location`, `religion`, `caste`, `education`, `profession`, `gender`, `user_id`) 
VALUES (25, 'Any', 'Any', 'Any', 'Any', 'Any', 'MALE', 2);

COMMIT;
