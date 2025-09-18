-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tag_name_key`(`name`),
    UNIQUE INDEX `Tag_slug_key`(`slug`),
    INDEX `Tag_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `featured_image_url` VARCHAR(191) NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `reading_time` INTEGER NOT NULL DEFAULT 5,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    INDEX `Post_slug_idx`(`slug`),
    INDEX `Post_published_idx`(`published`),
    INDEX `Post_view_count_idx`(`view_count`),
    INDEX `Post_createdAt_idx`(`createdAt`),
    INDEX `Post_authorId_idx`(`authorId`),
    INDEX `Post_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `PostTag_postId_idx`(`postId`),
    INDEX `PostTag_tagId_idx`(`tagId`),
    UNIQUE INDEX `PostTag_postId_tagId_key`(`postId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostTag` ADD CONSTRAINT `PostTag_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostTag` ADD CONSTRAINT `PostTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
