-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN');

-- CreateTable
CREATE TABLE "agent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mensagem" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waba" (
    "id" SERIAL NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "displayPhoneNumber" TEXT NOT NULL,
    "qtdContatos" INTEGER DEFAULT 0,
    "qtdConversao" INTEGER DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "agentId" INTEGER NOT NULL,

    CONSTRAINT "waba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_waba" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "wabaId" INTEGER NOT NULL,

    CONSTRAINT "contact_waba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "empresa" TEXT,
    "startDateConversation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDateConversation" TIMESTAMP(3),

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "rdstation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "rdstation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanha" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "qtdDeContatos" INTEGER NOT NULL DEFAULT 0,
    "qtdDeFalhas" INTEGER NOT NULL DEFAULT 0,
    "qtdDeEnviadas" INTEGER NOT NULL DEFAULT 0,
    "dataDeEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nameTemplate" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_waba" INTEGER NOT NULL,

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
CREATE UNIQUE INDEX "waba_phoneNumberId_key" ON "waba"("phoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "waba_displayPhoneNumber_key" ON "waba"("displayPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "contact_phone_key" ON "contact"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "rdstation_name_key" ON "rdstation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rdstation_refresh_token_key" ON "rdstation"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "Campanha_name_key" ON "Campanha"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LogContatoComAgente_day_key" ON "LogContatoComAgente"("day");

-- AddForeignKey
ALTER TABLE "waba" ADD CONSTRAINT "waba_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_waba" ADD CONSTRAINT "contact_waba_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_waba" ADD CONSTRAINT "contact_waba_wabaId_fkey" FOREIGN KEY ("wabaId") REFERENCES "waba"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReunioesContato" ADD CONSTRAINT "ReunioesContato_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemasContato" ADD CONSTRAINT "ProblemasContato_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campanha" ADD CONSTRAINT "Campanha_id_waba_fkey" FOREIGN KEY ("id_waba") REFERENCES "waba"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContatosCampanha" ADD CONSTRAINT "ContatosCampanha_id_contato_fkey" FOREIGN KEY ("id_contato") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContatosCampanha" ADD CONSTRAINT "ContatosCampanha_id_campanha_fkey" FOREIGN KEY ("id_campanha") REFERENCES "Campanha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogContatoComAgente" ADD CONSTRAINT "LogContatoComAgente_id_contato_fkey" FOREIGN KEY ("id_contato") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogContatoComAgente" ADD CONSTRAINT "LogContatoComAgente_id_waba_fkey" FOREIGN KEY ("id_waba") REFERENCES "waba"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogContatoComAgente" ADD CONSTRAINT "LogContatoComAgente_id_agent_fkey" FOREIGN KEY ("id_agent") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
