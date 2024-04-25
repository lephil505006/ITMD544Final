/*
  Warnings:

  - You are about to drop the column `emoji_group` on the `emoji` table. All the data in the column will be lost.
  - Added the required column `group` to the `Emoji` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `emoji` DROP COLUMN `emoji_group`,
    ADD COLUMN `group` VARCHAR(191) NOT NULL;
