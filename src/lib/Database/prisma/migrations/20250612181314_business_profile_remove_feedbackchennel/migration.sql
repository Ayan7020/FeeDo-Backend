/*
  Warnings:

  - You are about to drop the column `feedbackChannels` on the `BusinessProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessProfile" DROP COLUMN "feedbackChannels";

-- DropEnum
DROP TYPE "FeedbackChannel";
