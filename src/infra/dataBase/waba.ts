import { prisma } from '../../lib/prisma'

export interface InterfaceWaba {
    id_waba: number;
    phone_number_id: string;
    display_phone_number: string;
    organization?: number[];
}


async function verificandoExistencia(phone_number_id: string) {
    return await prisma.waba.findFirst({
        where: {
            phone_number_id
        }
    })
}

async function criarWaba(
    phone_number_id: string,
    display_phone_number: string
) {
    return await prisma.waba.create({
        data: {
            phone_number_id,
            display_phone_number,
            id_organization: 1
        }
    })
}


export async function waba(phone_number_id: string, display_phone_number: string) {
    try {
        let waba = await verificandoExistencia(phone_number_id);

        if (!waba) {
            waba = await criarWaba(phone_number_id, display_phone_number);
        }

        return {
            status: true,
            waba
        };

    } catch (e) {
        console.error('Erro ao gerar waba:', e);

        return {
            status: false,
            waba: undefined
        };
    }
}
