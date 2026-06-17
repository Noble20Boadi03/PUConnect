-- CreateTable
CREATE TABLE "muted_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "participantUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "muted_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "muted_conversations_userId_participantUsername_key" ON "muted_conversations"("userId", "participantUsername");

-- AddForeignKey
ALTER TABLE "muted_conversations" ADD CONSTRAINT "muted_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
