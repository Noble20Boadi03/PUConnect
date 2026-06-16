/*
  Warnings:

  - You are about to drop the column `chatMessageId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `reviewId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `senderUsername` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `serviceRequestId` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "chatMessageId",
DROP COLUMN "postId",
DROP COLUMN "reviewId",
DROP COLUMN "senderUsername",
DROP COLUMN "serviceRequestId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "push_token" TEXT;
