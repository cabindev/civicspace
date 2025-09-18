-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `emailVerified` DATETIME(3) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenCreatedAt` DATETIME(3) NULL,
    `resetTokenExpiresAt` DATETIME(3) NULL,
    `lastPasswordReset` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_resetToken_key`(`resetToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
