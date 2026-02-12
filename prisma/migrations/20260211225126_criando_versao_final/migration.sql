/*
  Warnings:

  - You are about to drop the `ConversationHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConversationHistory" DROP CONSTRAINT "ConversationHistory_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationHistory" DROP CONSTRAINT "ConversationHistory_userId_fkey";

-- DropTable
DROP TABLE "ConversationHistory";
