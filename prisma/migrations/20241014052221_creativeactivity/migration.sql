-- AlterTable
ALTER TABLE `Image` ADD COLUMN `creativeActivityId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CreativeActivity` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subCategoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `amphoe` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `zipcode` INTEGER NULL,
    `district_code` INTEGER NULL,
    `amphoe_code` INTEGER NULL,
    `province_code` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL,
    `village` VARCHAR(191) NULL,
    `coordinatorName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `summary` TEXT NOT NULL,
    `results` TEXT NULL,
    `startYear` INTEGER NOT NULL,
    `videoLink` VARCHAR(191) NULL,
    `reportFileUrl` VARCHAR(191) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreativeCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CreativeCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreativeSubCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreativeActivity` ADD CONSTRAINT `CreativeActivity_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `CreativeCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreativeActivity` ADD CONSTRAINT `CreativeActivity_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `CreativeSubCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreativeSubCategory` ADD CONSTRAINT `CreativeSubCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `CreativeCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_creativeActivityId_fkey` FOREIGN KEY (`creativeActivityId`) REFERENCES `CreativeActivity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
