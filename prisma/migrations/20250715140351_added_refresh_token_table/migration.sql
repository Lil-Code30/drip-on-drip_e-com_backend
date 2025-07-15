/*
  Warnings:

  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "token";

-- CreateTable
CREATE TABLE "refreshToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "refresToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "ExpiredAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refreshToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "refreshToken" ADD CONSTRAINT "refreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
