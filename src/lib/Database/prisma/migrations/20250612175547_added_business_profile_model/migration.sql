/*
  Warnings:

  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('SaaS', 'Ecommerce', 'Healthcare', 'EdTech', 'FinTech', 'Other');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('B2B', 'B2C', 'Hybrid');

-- CreateEnum
CREATE TYPE "FeedbackChannel" AS ENUM ('Email', 'Chat', 'SupportTicket', 'Survey', 'AppReview', 'SocialMedia');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hasBusinessProfile" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Workspace";

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "customerType" "CustomerType" NOT NULL,
    "feedbackChannels" "FeedbackChannel"[],
    "targetRegions" TEXT[],
    "Description" TEXT NOT NULL,
    "analysisGoals" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "BusinessProfile"("userId");

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
