-- CreateTable
CREATE TABLE "LogContatoComAgente" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "id_contato" INTEGER NOT NULL,
    "id_agent" INTEGER NOT NULL,
    "id_waba" INTEGER NOT NULL,

    CONSTRAINT "LogContatoComAgente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LogContatoComAgente_day_key" ON "LogContatoComAgente"("day");

-- AddForeignKey
ALTER TABLE "LogContatoComAgente" ADD CONSTRAINT "LogContatoComAgente_id_contato_fkey" FOREIGN KEY ("id_contato") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogContatoComAgente" ADD CONSTRAINT "LogContatoComAgente_id_waba_fkey" FOREIGN KEY ("id_waba") REFERENCES "waba"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogContatoComAgente" ADD CONSTRAINT "LogContatoComAgente_id_agent_fkey" FOREIGN KEY ("id_agent") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
