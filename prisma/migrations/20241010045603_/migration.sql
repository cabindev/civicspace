/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `Tradition` table. All the data in the column will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `File` DROP FOREIGN KEY `File_traditionId_fkey`;

-- AlterTable
ALTER TABLE `Tradition` DROP COLUMN `videoUrl`,
    ADD COLUMN `policyFileUrl` VARCHAR(191) NULL,
    ADD COLUMN `videoLink` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `File`;
