/*
  Warnings:

  - Added the required column `statusdelovery` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusdescription` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `statusdelovery` INTEGER NOT NULL,
    ADD COLUMN `statusdescription` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('User', 'ADMIN', 'DELIVERY') NOT NULL;
