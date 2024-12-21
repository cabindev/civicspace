/*
  Warnings:

  - Added the required column `hasAlcoholPromote` to the `Tradition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasAnnouncement` to the `Tradition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasCampaign` to the `Tradition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasInspector` to the `Tradition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasMonitoring` to the `Tradition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasPolicy` to the `Tradition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Tradition` ADD COLUMN `hasAlcoholPromote` BOOLEAN NOT NULL,
    ADD COLUMN `hasAnnouncement` BOOLEAN NOT NULL,
    ADD COLUMN `hasCampaign` BOOLEAN NOT NULL,
    ADD COLUMN `hasInspector` BOOLEAN NOT NULL,
    ADD COLUMN `hasMonitoring` BOOLEAN NOT NULL,
    ADD COLUMN `hasPolicy` BOOLEAN NOT NULL;
