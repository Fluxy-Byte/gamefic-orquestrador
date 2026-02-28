-- CreateTable
CREATE TABLE "Campanha" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "qtdDeContatos" INTEGER NOT NULL DEFAULT 0,
    "qtdDeFalhas" INTEGER NOT NULL DEFAULT 0,
    "qtdDeEnviadas" INTEGER NOT NULL DEFAULT 0,
    "dataDeEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nameTemplate" TEXT NOT NULL,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContatosCampanha" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Enviado',
    "body_retorno" TEXT,
    "id_campanha" INTEGER NOT NULL,
    "id_contato" INTEGER NOT NULL,

    CONSTRAINT "ContatosCampanha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campanha_name_key" ON "Campanha"("name");

-- AddForeignKey
ALTER TABLE "ContatosCampanha" ADD CONSTRAINT "ContatosCampanha_id_contato_fkey" FOREIGN KEY ("id_contato") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContatosCampanha" ADD CONSTRAINT "ContatosCampanha_id_campanha_fkey" FOREIGN KEY ("id_campanha") REFERENCES "Campanha"("id") ON DELETE CASCADE ON UPDATE CASCADE;
