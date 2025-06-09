/*
  Warnings:

  - You are about to drop the column `verification` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verification",
ADD COLUMN     "isverified" BOOLEAN NOT NULL DEFAULT false;
