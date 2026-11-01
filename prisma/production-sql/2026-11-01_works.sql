-- 2026-11-01 ตารางงานในพื้นที่ (Activity + พื้นที่/ลิงก์/ไฟล์/นโยบาย)
-- เพิ่มตารางใหม่อย่างเดียว ไม่แตะ User หรือตารางเดิม — รันใน phpMyAdmin ได้ (MySQL 5.7+/MariaDB)
-- รันก่อนสคริปต์ scripts/import-stopdrink-works.mjs

-- CreateTable
CREATE TABLE `Activity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `sourceSystem` VARCHAR(50) NULL,
    `sourceId` INTEGER NULL,
    `category` VARCHAR(100) NULL,
    `subCategory` VARCHAR(100) NULL,
    `authorName` VARCHAR(200) NULL,
    `authorEmail` VARCHAR(191) NULL,
    `areaName` VARCHAR(191) NULL,
    `district` VARCHAR(191) NOT NULL,
    `amphoe` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `areaScope` ENUM('VILLAGE', 'SUBDISTRICT', 'DISTRICT', 'PROVINCE') NOT NULL DEFAULT 'SUBDISTRICT',
    `region` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `locationSource` ENUM('TAMBON', 'PIN', 'GPS', 'LINK', 'PLACE') NOT NULL DEFAULT 'TAMBON',
    `participantCount` INTEGER NULL,
    `partners` JSON NULL,
    `hasSurvey` BOOLEAN NOT NULL DEFAULT false,
    `coverageVillages` INTEGER NULL,
    `coverageHouseholds` INTEGER NULL,
    `coveragePopulation` INTEGER NULL,
    `coordinatorName` VARCHAR(191) NULL,
    `coordinatorRole` VARCHAR(191) NULL,
    `coordinatorPhone` VARCHAR(191) NULL,
    `coordinatorLine` VARCHAR(191) NULL,
    `coordinatorConsent` BOOLEAN NOT NULL DEFAULT false,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `storyLead` TEXT NULL,
    `storyProcess` TEXT NULL,
    `storyLessons` TEXT NULL,
    `status` ENUM('PLANNING', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `startDate` DATETIME(3) NULL,
    `startDatePrecision` ENUM('DAY', 'YEAR') NOT NULL DEFAULT 'DAY',
    `endDate` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Activity_isPublished_idx`(`isPublished`),
    INDEX `Activity_province_idx`(`province`),
    INDEX `Activity_province_amphoe_district_idx`(`province`, `amphoe`, `district`),
    INDEX `Activity_region_idx`(`region`),
    INDEX `Activity_status_idx`(`status`),
    INDEX `Activity_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `Activity_sourceSystem_sourceId_key`(`sourceSystem`, `sourceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityPolicy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activityId` INTEGER NOT NULL,
    `level` ENUM('VILLAGE', 'SUBDISTRICT', 'DISTRICT', 'PROVINCE', 'NATIONAL') NOT NULL,
    `name` VARCHAR(300) NULL,
    `type` VARCHAR(100) NULL,
    `year` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityPolicy_level_idx`(`level`),
    UNIQUE INDEX `ActivityPolicy_activityId_level_key`(`activityId`, `level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityArea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activityId` INTEGER NOT NULL,
    `areaName` VARCHAR(200) NULL,
    `district` VARCHAR(191) NOT NULL,
    `amphoe` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `locationSource` ENUM('TAMBON', 'PIN', 'GPS', 'LINK', 'PLACE') NOT NULL DEFAULT 'TAMBON',
    `note` VARCHAR(200) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityArea_activityId_idx`(`activityId`),
    INDEX `ActivityArea_province_amphoe_district_idx`(`province`, `amphoe`, `district`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activityId` INTEGER NOT NULL,
    `url` VARCHAR(2000) NOT NULL,
    `title` VARCHAR(200) NULL,
    `kind` ENUM('FACEBOOK', 'YOUTUBE', 'TIKTOK', 'DRIVE', 'WEB') NOT NULL DEFAULT 'WEB',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLink_activityId_idx`(`activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activityId` INTEGER NOT NULL,
    `kind` ENUM('DOCUMENT', 'IMAGE') NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `caption` VARCHAR(191) NULL,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `policyLevel` ENUM('VILLAGE', 'SUBDISTRICT', 'DISTRICT', 'PROVINCE', 'NATIONAL') NULL,
    `isSurvey` BOOLEAN NOT NULL DEFAULT false,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityAttachment_activityId_idx`(`activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ActivityPolicy` ADD CONSTRAINT `ActivityPolicy_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityArea` ADD CONSTRAINT `ActivityArea_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLink` ADD CONSTRAINT `ActivityLink_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityAttachment` ADD CONSTRAINT `ActivityAttachment_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

