-- AlterTable
ALTER TABLE `Image` ADD COLUMN `publicPolicyId` VARCHAR(191) NULL,
    MODIFY `traditionId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PublicPolicy` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `signingDate` DATETIME(3) NOT NULL,
    `level` ENUM('NATIONAL', 'PROVINCIAL', 'DISTRICT', 'SUB_DISTRICT', 'VILLAGE') NOT NULL,
    `implementationArea` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `results` TEXT NULL,
    `videoLink` VARCHAR(191) NULL,
    `policyFileUrl` VARCHAR(191) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_publicPolicyId_fkey` FOREIGN KEY (`publicPolicyId`) REFERENCES `PublicPolicy`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
