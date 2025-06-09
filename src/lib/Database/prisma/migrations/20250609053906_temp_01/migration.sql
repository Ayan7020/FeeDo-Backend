-- CreateEnum
CREATE TYPE "accountType" AS ENUM ('Credential', 'Google');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "accountType" "accountType" NOT NULL DEFAULT 'Credential',
    "verification" BOOLEAN NOT NULL DEFAULT false,
    "kela" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
