-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "chatMessageId" TEXT,
ADD COLUMN     "postId" TEXT,
ADD COLUMN     "reviewId" TEXT,
ADD COLUMN     "senderUsername" TEXT,
ADD COLUMN     "serviceRequestId" TEXT;
