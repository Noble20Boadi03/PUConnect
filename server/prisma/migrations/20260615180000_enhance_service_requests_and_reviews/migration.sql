-- CreateEnum
CREATE TYPE "ServiceRequestKind" AS ENUM ('service', 'response');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('pending', 'active', 'pending_review', 'completed', 'cancelled', 'declined');

-- AlterTable: migrate service_requests
ALTER TABLE "service_requests" ADD COLUMN "kind" "ServiceRequestKind" NOT NULL DEFAULT 'service';
ALTER TABLE "service_requests" ADD COLUMN "acceptedAt" TIMESTAMP(3);
ALTER TABLE "service_requests" ADD COLUMN "completionRequestedAt" TIMESTAMP(3);
ALTER TABLE "service_requests" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Convert status column from text to enum
ALTER TABLE "service_requests" ADD COLUMN "status_new" "ServiceRequestStatus" NOT NULL DEFAULT 'active';

UPDATE "service_requests" SET "status_new" = CASE
  WHEN "status" = 'pending' THEN 'pending'::"ServiceRequestStatus"
  WHEN "status" = 'accepted' THEN 'active'::"ServiceRequestStatus"
  WHEN "status" = 'declined' THEN 'declined'::"ServiceRequestStatus"
  WHEN "status" = 'completed' THEN 'completed'::"ServiceRequestStatus"
  ELSE 'active'::"ServiceRequestStatus"
END;

ALTER TABLE "service_requests" DROP COLUMN "status";
ALTER TABLE "service_requests" RENAME COLUMN "status_new" TO "status";

UPDATE "service_requests" SET "acceptedAt" = "createdAt" WHERE "status" IN ('active', 'pending_review', 'completed');

-- AlterTable: reviews
ALTER TABLE "reviews" ADD COLUMN "serviceRequestId" TEXT;
ALTER TABLE "reviews" ADD COLUMN "postId" TEXT;

CREATE UNIQUE INDEX "reviews_serviceRequestId_key" ON "reviews"("serviceRequestId");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
