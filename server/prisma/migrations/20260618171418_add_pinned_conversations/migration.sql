-- CreateTable
CREATE TABLE "pinned_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "participantUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinned_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pinned_conversations_userId_participantUsername_key" ON "pinned_conversations"("userId", "participantUsername");

-- AddForeignKey
ALTER TABLE "pinned_conversations" ADD CONSTRAINT "pinned_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
