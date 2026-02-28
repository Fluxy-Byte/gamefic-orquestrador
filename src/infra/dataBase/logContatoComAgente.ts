import { prisma } from '../../lib/prisma'

export async function getContactLog(idContato: number, idWaba: number, idAgente: number, data: string) {
    return await prisma.logContatoComAgente.findFirst({
        where: {
            id_contato: idContato,
            id_agent: idAgente,
            id_waba: idWaba,
            day: data
        }
    })
}

export async function createContactLog(idContato: number, idWaba: number, idAgente: number, data: string) {
    return await prisma.logContatoComAgente.create({
        data: {
            id_contato: idContato,
            id_agent: idAgente,
            id_waba: idWaba,
            day: data
        }
    })
}