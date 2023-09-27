-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop_id` INTEGER NOT NULL,
    `order_shop_id` BIGINT NOT NULL,
    `customer_shop_id` BIGINT NULL,
    `order_code` VARCHAR(32) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(32) NULL,
    `note` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL,
    `line_items` TEXT NOT NULL,
    `total` BIGINT NOT NULL,
    `amount` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_order_shop_id_key`(`order_shop_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
