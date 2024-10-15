/*
  Warnings:

  - You are about to drop the column `implementationArea` on the `PublicPolicy` table. All the data in the column will be lost.
  - You are about to alter the column `content` on the `PublicPolicy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `PublicPolicy` DROP COLUMN `implementationArea`,
    MODIFY `content` JSON NOT NULL;
