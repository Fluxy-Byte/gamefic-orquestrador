import { prisma } from '../../lib/prisma'

export async function getCampanhas(idOrganizacao: string, idWaba: number) {
    return await prisma.campanha.findMany({
        where: {
            id_organizacao: idOrganizacao,
            id_waba: idWaba
        }
    })
}

interface createCampaing {
    name: string
    qtdDeContatos?: number
    qtdDeFalhas?: number
    qtdDeEnviadas?: number
    nameTemplate: string
    id_organizacao: string
    id_waba: number
}

export async function createCampanha(data: createCampaing) {
    return await prisma.campanha.create({
        data
    })
}

export async function updateNumberSendCampaing(idCampanha: number) {
    return await prisma.campanha.update({
        where: {
            id: idCampanha
        },
        data: {
            qtdDeEnviadas: {
                increment: 1
            },
            qtdDeContatos: {
                increment: 1
            }
        }
    })
}

export async function updateNumberFailedCampaing(idCampanha: number) {
    return await prisma.campanha.update({
        where: {
            id: idCampanha
        },
        data: {
            qtdDeFalhas: {
                increment: 1
            },
            qtdDeContatos: {
                increment: 1
            }
        }
    })
}