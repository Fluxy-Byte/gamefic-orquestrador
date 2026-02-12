/*
  Warnings:

  - You are about to drop the column `id_number_waba` on the `Contato` table. All the data in the column will be lost.
  - The primary key for the `Waba` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_number_waba` on the `Waba` table. All the data in the column will be lost.
  - You are about to drop the column `number_phone` on the `Waba` table. All the data in the column will be lost.
  - The `organization` column on the `Waba` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[phone_number_id]` on the table `Waba` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[display_phone_number]` on the table `Waba` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_waba` to the `Contato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `display_phone_number` to the `Waba` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number_id` to the `Waba` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contato" DROP CONSTRAINT "Contato_id_number_waba_fkey";

-- DropIndex
DROP INDEX "Waba_number_phone_key";

-- AlterTable
ALTER TABLE "Contato" DROP COLUMN "id_number_waba",
ADD COLUMN     "id_waba" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Waba" DROP CONSTRAINT "Waba_pkey",
DROP COLUMN "id_number_waba",
DROP COLUMN "number_phone",
ADD COLUMN     "display_phone_number" TEXT NOT NULL,
ADD COLUMN     "id_waba" SERIAL NOT NULL,
ADD COLUMN     "phone_number_id" TEXT NOT NULL,
DROP COLUMN "organization",
ADD COLUMN     "organization" INTEGER[],
ADD CONSTRAINT "Waba_pkey" PRIMARY KEY ("id_waba");

-- CreateIndex
CREATE UNIQUE INDEX "Waba_phone_number_id_key" ON "Waba"("phone_number_id");

-- CreateIndex
CREATE UNIQUE INDEX "Waba_display_phone_number_key" ON "Waba"("display_phone_number");

-- AddForeignKey
ALTER TABLE "Contato" ADD CONSTRAINT "Contato_id_waba_fkey" FOREIGN KEY ("id_waba") REFERENCES "Waba"("id_waba") ON DELETE RESTRICT ON UPDATE CASCADE;
