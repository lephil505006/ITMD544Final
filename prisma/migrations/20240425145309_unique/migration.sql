/*
  Warnings:

  - A unique constraint covering the columns `[html_code]` on the table `Emoji` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Emoji_html_code_key` ON `Emoji`(`html_code`);
