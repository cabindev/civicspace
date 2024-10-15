/*
  Warnings:

  - You are about to drop the column `subDistrict` on the `Tradition` table. All the data in the column will be lost.
  - Added the required column `amphoe` to the `Tradition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Tradition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Tradition` DROP COLUMN `subDistrict`,
    ADD COLUMN `amphoe` VARCHAR(191) NOT NULL,
    ADD COLUMN `amphoe_code` INTEGER NULL,
    ADD COLUMN `district_code` INTEGER NULL,
    ADD COLUMN `province_code` INTEGER NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `zipcode` INTEGER NULL;
