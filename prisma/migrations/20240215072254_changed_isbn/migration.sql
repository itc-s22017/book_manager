/*
  Warnings:

  - You are about to alter the column `isbn13` on the `book` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(13,0)`.
  - You are about to alter the column `rentalDate` on the `rental` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `returnDeadline` on the `rental` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `returnDate` on the `rental` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `book` MODIFY `isbn13` DECIMAL(13, 0) NOT NULL;

-- AlterTable
ALTER TABLE `rental` MODIFY `rentalDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `returnDeadline` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `returnDate` DATETIME NULL;
