-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED');

-- AlterTable
-- Existing students lose automatic course access and wait for admin approval.
-- Admins and curators keep access.
ALTER TABLE "User" ADD COLUMN "accessStatus" "AccessStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "User" SET "accessStatus" = 'ACTIVE' WHERE "role" IN ('ADMIN', 'CURATOR');
