/*
  Warnings:

  - You are about to drop the column `ExpiredAt` on the `refreshToken` table. All the data in the column will be lost.
  - Added the required column `expiredAt` to the `refreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refreshToken" DROP COLUMN "ExpiredAt",
ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL;
