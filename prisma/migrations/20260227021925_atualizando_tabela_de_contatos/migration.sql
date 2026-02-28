/*
  Warnings:

  - You are about to drop the column `instrucao` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `nivelInteresse` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `objetivoLead` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `problemaCentral` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `solucao` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `urgenciaLead` on the `contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contact" DROP COLUMN "instrucao",
DROP COLUMN "nivelInteresse",
DROP COLUMN "objetivoLead",
DROP COLUMN "problemaCentral",
DROP COLUMN "solucao",
DROP COLUMN "urgenciaLead",
ADD COLUMN     "empresa" TEXT;
