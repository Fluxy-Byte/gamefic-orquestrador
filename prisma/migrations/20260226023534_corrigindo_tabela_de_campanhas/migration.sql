/*
  Warnings:

  - Added the required column `id_organizacao` to the `Campanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_waba` to the `Campanha` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campanha" ADD COLUMN     "id_organizacao" TEXT NOT NULL,
ADD COLUMN     "id_waba" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Campanha" ADD CONSTRAINT "Campanha_id_waba_fkey" FOREIGN KEY ("id_waba") REFERENCES "waba"("id") ON DELETE CASCADE ON UPDATE CASCADE;
