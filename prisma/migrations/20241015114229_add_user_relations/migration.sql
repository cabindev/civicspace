/*
  Warnings:

  - Added the required column `userId` to the `EthnicGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PublicPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EthnicGroup` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PublicPolicy` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PublicPolicy` ADD CONSTRAINT `PublicPolicy_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EthnicGroup` ADD CONSTRAINT `EthnicGroup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
