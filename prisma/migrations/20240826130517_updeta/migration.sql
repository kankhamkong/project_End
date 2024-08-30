/*
  Warnings:

  - You are about to drop the column `realname` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `realname`,
    DROP COLUMN `surname`;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `realname` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `village` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `postcode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profileuser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `realname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `gender` INTEGER NOT NULL,
    `phone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profileuser` ADD CONSTRAINT `Profileuser_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
