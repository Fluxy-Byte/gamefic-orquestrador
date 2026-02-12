/*
  Warnings:

  - You are about to drop the column `organization` on the `Waba` table. All the data in the column will be lost.
  - Added the required column `id_organization` to the `Waba` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Waba" DROP COLUMN "organization",
ADD COLUMN     "id_organization" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Organization" (
    "id_organization" SERIAL NOT NULL,
    "name_organization" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id_organization")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_organization_key" ON "Organization"("name_organization");

-- AddForeignKey
ALTER TABLE "Waba" ADD CONSTRAINT "Waba_id_organization_fkey" FOREIGN KEY ("id_organization") REFERENCES "Organization"("id_organization") ON DELETE RESTRICT ON UPDATE CASCADE;
