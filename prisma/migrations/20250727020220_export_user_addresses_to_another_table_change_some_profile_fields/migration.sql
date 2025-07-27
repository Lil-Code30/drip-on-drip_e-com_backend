/*
  Warnings:

  - You are about to drop the column `addressLine1` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "avatarUrl",
DROP COLUMN "bio",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "phoneNumber",
DROP COLUMN "postalCode",
DROP COLUMN "state";

-- CreateTable
CREATE TABLE "Addresses" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT,
    "profileId" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Addresses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Addresses" ADD CONSTRAINT "Addresses_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
