-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('text', 'system');

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "kind" "MessageKind" NOT NULL DEFAULT 'text';
