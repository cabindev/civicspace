/*
  Warnings:

  - Added the required column `userId` to the `CreativeActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tradition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CreativeActivity` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Tradition` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Tradition` ADD CONSTRAINT `Tradition_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreativeActivity` ADD CONSTRAINT `CreativeActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
