-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shippingFirstName" DROP NOT NULL,
ALTER COLUMN "shippingLastName" DROP NOT NULL,
ALTER COLUMN "shippingAddressLine1" DROP NOT NULL,
ALTER COLUMN "shippingCity" DROP NOT NULL,
ALTER COLUMN "shippingState" DROP NOT NULL,
ALTER COLUMN "shippingPostalCode" DROP NOT NULL,
ALTER COLUMN "shippingCountry" DROP NOT NULL;
