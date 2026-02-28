import { prisma } from '../../lib/prisma'

export async function getContatosCampanha(idCampanha: number) {
    return await prisma.contatosCampanha.findMany({
        where: {
            id_campanha: idCampanha
        },
        include: {
            contact: true
        }
    })
}

interface CreateContactsCampaing {
    status: string
    body_retorno: string
    id_campanha: number
    id_contato: number
}

export async function createContatosCampanha(data: CreateContactsCampaing) {
    return await prisma.contatosCampanha.create({
        data
    })
}