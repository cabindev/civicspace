/*
  Warnings:

  - Added the required column `amphoe` to the `PublicPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `PublicPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `PublicPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PublicPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PublicPolicy` ADD COLUMN `amphoe` VARCHAR(191) NOT NULL,
    ADD COLUMN `amphoe_code` INTEGER NULL,
    ADD COLUMN `district` VARCHAR(191) NOT NULL,
    ADD COLUMN `district_code` INTEGER NULL,
    ADD COLUMN `province` VARCHAR(191) NOT NULL,
    ADD COLUMN `province_code` INTEGER NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `village` VARCHAR(191) NULL,
    ADD COLUMN `zipcode` INTEGER NULL;
