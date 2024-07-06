/*
  Warnings:

  - You are about to drop the `user_details` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `books` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user_details` DROP FOREIGN KEY `user_details_user_id_fkey`;

-- AlterTable
ALTER TABLE `books` ADD COLUMN `category` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `user_details`;
