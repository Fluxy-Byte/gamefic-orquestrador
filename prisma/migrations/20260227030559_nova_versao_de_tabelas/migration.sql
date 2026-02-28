/*
  Warnings:

  - You are about to drop the column `contexto` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `dataEHorario` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `etapa` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `localidade` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `problema` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `produto` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `tomLead` on the `contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contact" DROP COLUMN "contexto",
DROP COLUMN "dataEHorario",
DROP COLUMN "etapa",
DROP COLUMN "localidade",
DROP COLUMN "problema",
DROP COLUMN "produto",
DROP COLUMN "tomLead";

-- CreateTable
CREATE TABLE "ReunioesContato" (
    "id" SERIAL NOT NULL,
    "data_reuniao" TEXT NOT NULL,
    "contexto_da_reuniao" TEXT NOT NULL,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "ReunioesContato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemasContato" (
    "id" SERIAL NOT NULL,
    "data_do_problema" TEXT NOT NULL,
    "local_do_problema" TEXT NOT NULL,
    "contexto_da_conversa" TEXT NOT NULL,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "ProblemasContato_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReunioesContato" ADD CONSTRAINT "ReunioesContato_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemasContato" ADD CONSTRAINT "ProblemasContato_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
