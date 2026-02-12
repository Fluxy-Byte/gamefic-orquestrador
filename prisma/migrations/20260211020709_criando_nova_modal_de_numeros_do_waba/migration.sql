/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "Contato" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "start_date_conversation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_date_conversation" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "objetivoLead" TEXT,
    "id_number_waba" TEXT NOT NULL,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waba" (
    "id_number_waba" TEXT NOT NULL,
    "number_phone" TEXT NOT NULL,
    "organization" INTEGER NOT NULL,

    CONSTRAINT "Waba_pkey" PRIMARY KEY ("id_number_waba")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contato_phone_key" ON "Contato"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Waba_number_phone_key" ON "Waba"("number_phone");

-- AddForeignKey
ALTER TABLE "Contato" ADD CONSTRAINT "Contato_id_number_waba_fkey" FOREIGN KEY ("id_number_waba") REFERENCES "Waba"("id_number_waba") ON DELETE RESTRICT ON UPDATE CASCADE;
