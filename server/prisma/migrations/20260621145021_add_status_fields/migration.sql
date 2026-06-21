-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('active', 'hidden_by_owner', 'removed_by_admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'banned');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';
