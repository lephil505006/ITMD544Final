-- CreateTable
CREATE TABLE `Emoji` (
    `emoji_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `emoji_group` VARCHAR(191) NOT NULL,
    `html_code` VARCHAR(191) NOT NULL,
    `unicode` VARCHAR(191) NOT NULL,
    `like_count` INTEGER NOT NULL DEFAULT 0,
    `dislike_count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`emoji_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmojiUsage` (
    `emoji_id` INTEGER NOT NULL,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `last_used_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmojiUsage_emoji_id_key`(`emoji_id`),
    INDEX `emojiUsage_emoji_idx`(`emoji_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmojiReaction` (
    `reaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `emoji_id` INTEGER NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `reaction_type` ENUM('like', 'dislike') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `emojiReaction_emoji_idx`(`emoji_id`),
    PRIMARY KEY (`reaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmojiUsage` ADD CONSTRAINT `EmojiUsage_emoji_id_fkey` FOREIGN KEY (`emoji_id`) REFERENCES `Emoji`(`emoji_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmojiReaction` ADD CONSTRAINT `EmojiReaction_emoji_id_fkey` FOREIGN KEY (`emoji_id`) REFERENCES `Emoji`(`emoji_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
