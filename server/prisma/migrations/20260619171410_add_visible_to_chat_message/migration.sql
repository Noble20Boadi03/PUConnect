-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "visibleToId" TEXT;

-- CreateIndex
CREATE INDEX "chat_messages_visibleToId_idx" ON "chat_messages"("visibleToId");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_visibleToId_fkey" FOREIGN KEY ("visibleToId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
