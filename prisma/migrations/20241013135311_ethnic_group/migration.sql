-- AlterTable
ALTER TABLE `Image` ADD COLUMN `ethnicGroupId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `EthnicGroup` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `history` TEXT NOT NULL,
    `activityName` VARCHAR(191) NOT NULL,
    `activityOrigin` TEXT NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `amphoe` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `village` VARCHAR(191) NULL,
    `zipcode` INTEGER NULL,
    `district_code` INTEGER NULL,
    `amphoe_code` INTEGER NULL,
    `province_code` INTEGER NULL,
    `activityDetails` TEXT NOT NULL,
    `alcoholFreeApproach` TEXT NOT NULL,
    `startYear` INTEGER NOT NULL,
    `results` TEXT NULL,
    `videoLink` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EthnicCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EthnicCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EthnicGroup` ADD CONSTRAINT `EthnicGroup_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `EthnicCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_ethnicGroupId_fkey` FOREIGN KEY (`ethnicGroupId`) REFERENCES `EthnicGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
