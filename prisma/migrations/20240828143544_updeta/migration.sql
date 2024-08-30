/*
  Warnings:

  - Added the required column `stock` to the `books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addrss_id` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `books` ADD COLUMN `stock` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `addrss_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_addrss_id_fkey` FOREIGN KEY (`addrss_id`) REFERENCES `Address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
