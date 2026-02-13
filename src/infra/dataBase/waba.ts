import { prisma } from '../../lib/prisma'


async function verificandoExistencia(phone_number_id: string) {
    return await prisma.waba.findFirst({
        where: {
            phoneNumberId: phone_number_id
        }
    })
}

async function criarWaba(
    phone_number_id: string,
    display_phone_number: string,
) {
    return await prisma.waba.create({
        data: {
            phoneNumberId: phone_number_id,
            displayPhoneNumber: display_phone_number,
            organizationId: 1,
            agentId: 1
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
