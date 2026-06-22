-- CreateEnum
CREATE TYPE "AdminTier" AS ENUM ('super_admin', 'moderator', 'support');

-- CreateEnum
CREATE TYPE "ProviderApprovalStatus" AS ENUM ('none', 'pending', 'approved', 'rejected');

-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'locked_by_admin';

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'shadowbanned';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "adminTier" "AdminTier",
ADD COLUMN     "providerApprovalStatus" "ProviderApprovalStatus" NOT NULL DEFAULT 'none',
ADD COLUMN     "providerAppliedAt" TIMESTAMP(3),
ADD COLUMN     "providerReviewedAt" TIMESTAMP(3),
ADD COLUMN     "providerReviewNote" TEXT;

-- Backfill existing providers as approved
UPDATE "users" SET "providerApprovalStatus" = 'approved' WHERE "role" = 'provider';

-- Backfill existing admins as super_admin
UPDATE "users" SET "adminTier" = 'super_admin' WHERE "role" = 'admin';
