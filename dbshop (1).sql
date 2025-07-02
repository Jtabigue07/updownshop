-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 02, 2025 at 01:48 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Smartphones'),
(2, 'Laptops'),
(3, 'Accessories'),
(4, 'Tablets');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(10) DEFAULT NULL,
  `fname` varchar(50) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `addressline` varchar(255) DEFAULT NULL,
  `town` varchar(100) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `user_id`, `title`, `fname`, `lname`, `addressline`, `town`, `zipcode`, `phone`, `image_path`) VALUES
(1, 2, 'Mr', 'jay', 'tabigue', 'muntinlupa city', 'ads', 'wq', '09518767766', 'images/4c0f8623-2da7-4ec2-8dcd-c9edd05c1e6c-1751381248178-883401373.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `orderinfo`
--

CREATE TABLE `orderinfo` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_date` datetime DEFAULT current_timestamp(),
  `total` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderinfo`
--

INSERT INTO `orderinfo` (`id`, `user_id`, `order_date`, `total`, `status`) VALUES
(1, 2, '2025-06-27 02:14:33', 1999.99, 'Pending'),
(2, 2, '2025-06-27 02:27:58', 1899.98, 'Pending'),
(3, 4, '2025-06-27 11:52:53', 899.99, 'Pending'),
(4, 2, '2025-07-01 22:27:07', 899.99, 'Pending'),
(5, 2, '2025-07-01 23:20:43', 899.99, 'Pending'),
(6, 1, '2025-07-01 23:23:42', 100.00, 'success'),
(7, 2, '2025-07-02 00:15:03', 1499.99, 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `orderline`
--

CREATE TABLE `orderline` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderline`
--

INSERT INTO `orderline` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 3, 1, 1999.99),
(2, 2, 2, 1, 899.99),
(3, 2, 1, 1, 999.99),
(4, 3, 2, 1, 899.99),
(5, 4, 2, 1, 899.99),
(6, 5, 2, 1, 899.99),
(7, 6, 1, 2, 50.00),
(8, 7, 4, 1, 1499.99);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `specs` text DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `image`, `brand`, `specs`, `stock`, `category_id`) VALUES
(1, 'iPhone 14', 'Latest Apple smartphone', 999.99, 'images/360_F_207713277_vqnMNyJKP0cd5D5qDnwgafh4WcdYcwZN-1751389305431-682914227.jpg', 'Apple', '128GB, 5G, Dual Camera', 10, 1),
(2, 'Galaxy S23', 'Flagship Samsung phone', 899.99, '', 'Samsung', '256GB, 5G, Triple Camera', 8, 1),
(3, 'MacBook Pro', 'Apple laptop', 1999.99, '', 'Apple', 'M2, 16GB RAM, 512GB SSD', 5, 2),
(4, 'Dell XPS 13', 'Premium Windows laptop', 1499.99, '', 'Dell', 'i7, 16GB RAM, 1TB SSD', 7, 2),
(5, 'Wireless Earbuds', 'Bluetooth earbuds', 99.99, '', 'Sony', 'Noise Cancelling', 20, 3),
(6, 'iPad Air', 'Apple tablet', 599.99, '', 'Apple', '64GB, WiFi', 12, 4),
(7, 'new', NULL, 12.00, 'images/47ea4d60-813e-4839-879f-d004cf3eb8b1-1751385619377-295340656.jpg', NULL, NULL, 12, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `deleted_at` datetime DEFAULT NULL,
  `token` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `deleted_at`, `token`) VALUES
(1, 'Super Admin', 'superadmin@example.com', '$2b$10$yourHashedPasswordHere', 'admin', NULL, NULL),
(2, 'jhay tabigue', 'jhaytabigue187123@gmail.com', '$2b$10$xZ.pN3J42ZIYX1.UGPFZme/xB2YCJpHazJiEdqe8Tu1PkD.WCOEea', 'user', NULL, NULL),
(3, 'admin', 'admin@gmail.com', '$2b$10$snk4k6UGo/HuaTOqYpD.FeIa1Z0UD5AtDliHm9hAGF7Dzkiu00L0C', 'admin', NULL, NULL),
(4, 'jasoncode', 'jason@gmail.com', '$2b$10$Vcd9ccUAEkZjANXuZirkk.TsiPoqLNyKuL8ddTiPGl26/LTrbulS.', 'user', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `orderinfo`
--
ALTER TABLE `orderinfo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orderline`
--
ALTER TABLE `orderline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orderinfo`
--
ALTER TABLE `orderinfo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orderline`
--
ALTER TABLE `orderline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orderline`
--
ALTER TABLE `orderline`
  ADD CONSTRAINT `orderline_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orderinfo` (`id`),
  ADD CONSTRAINT `orderline_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
