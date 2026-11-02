-- AlterTable
ALTER TABLE `Activity` ADD COLUMN `issueKey` VARCHAR(40) NULL;

-- CreateIndex
CREATE INDEX `Activity_issueKey_idx` ON `Activity`(`issueKey`);
