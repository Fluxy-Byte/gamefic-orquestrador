import { prisma } from '../../lib/prisma'

export interface InterfaceContato {
    id: number;
    email: string | null;
    name: string | null;
    phone: string;
    start_date_conversation: Date;
    last_date_conversation: Date | null;
    objetivoLead: string | null;
    id_waba: number;
}

async function verificandoExistencia(phone: string) {
    return await prisma.contato.findFirst({
        where: {
            phone
        }
    })
}

async function updateDateLastMessage(phone: string) {
    await prisma.contato.update({
        where: {
            phone: phone
        },
        data: {
            last_date_conversation: new Date()
        }
    });
}

async function criarUsuario(phone: string, id_waba: number) {
    return await prisma.contato.create({
        data: {
            phone,
            id_waba
        }
    })
}

export async function contato(phone: string, id_waba: number) {
    try {
        let user = await verificandoExistencia(phone);

        if (!user) {
            user = await criarUsuario(phone, id_waba);
        }

        await updateDateLastMessage(phone);

        return {
            status: true,
            user
        };

    } catch (e) {
        console.error('Erro ao gerar usuário:', e);

        return {
            status: false,
            user: null
        };
    }
}


export async function getAllContacts() {
    return await prisma.contato.findMany();
}

export async function updateContactObejtivoLead(phone: string, nome: string, objetivoLead: string) {
    return await prisma.contato.update({
        where: {
            phone: phone
        },
        data: {
            objetivoLead: objetivoLead,
            name: nome
        }
    })
}