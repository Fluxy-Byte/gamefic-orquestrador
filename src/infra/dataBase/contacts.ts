import { prisma } from '../../lib/prisma';
import { LeadRegisterUpdate } from '../../adapters/interfaces/Meta.interface';
import { getWabaFilterWithPhoneNumber, getWabaFilterWithId } from './waba';

export async function getUserFilterWithPhone(phone: string) {  // Filtrando com telefone
    return await prisma.contact.findFirst({
        where: { phone },
        include: {
            contactWabas: {
                include: { waba: true },
            },
        },
    });
}

export async function createUser(phone: string, wabaId: number) { // Criando com telefone e id do waba
    const contato = await prisma.contact.create({
        data: {
            phone,
            contactWabas: {
                create: {
                    waba: {
                        connect: { id: wabaId },
                    },
                },
            },
        },
        include: {
            contactWabas: {
                include: { waba: true },
            },
        },
    });

    await prisma.contactWaba.create({
        data: {
            contactId: contato.id,
            wabaId
        },
        include: {
            waba: true
        }
    });

    return contato
}

export async function getUserFilterWithPhoneAndWabaId( // Filtro com telefone e id do waba
    phone: string,
    wabaId: number
) {
    return await prisma.contact.findFirst({
        where: {
            phone,
            contactWabas: {
                some: {
                    wabaId,
                },
            },
        },
        include: {
            contactWabas: {
                where: { wabaId },
                include: { waba: true },
            },
        },
    });
}

export async function getUserFilterWithWabaId(  // Criando com id do waba
    wabaId: number
) {
    return await prisma.contact.findMany({
        where: {
            contactWabas: {
                some: {
                    wabaId,
                },
            },
        }
    });
}


export async function updateDateLastMessage(phone: string) {  // Atualizando ultima mensagem do contato
    await prisma.contact.update({
        where: {
            phone: phone
        },
        data: {
            lastDateConversation: new Date()
        }
    });
}



export async function getAllContacts() { // Coletando todos os contatos
    return await prisma.contact.findMany({
        include: {
            contactWabas: {
                include: { waba: true },
            },
        },
    });
}

interface UpdateContact {
    email?: string;
    name?: string;
    empresa?: string;
}

export async function updateContact(phone: string, dados: UpdateContact) { // Atualizando contato com os dados
    console.log('Atualizando contato com os seguintes dados:', dados);
    return await prisma.contact.update({
        where: {
            phone: phone
        },
        data: dados
    })
}

export async function updateNameContact( // Atualizar nome do contato
    phone: string,
    name: string
) {
    return await prisma.contact.update({
        where: {
            phone
        },
        data: {
            name
        }
    });
}


export async function createMeetToContact(contactId: number, data_reuniao: string, contexto_da_reuniao: string) { // Criar reunião para contato
    return await prisma.reunioesContato.create({
        data: {
            contactId,
            data_reuniao,
            contexto_da_reuniao
        }
    })
}

export async function getMeetToContact(contactId: number) { // Coletar reunião de um contato
    return await prisma.reunioesContato.findMany({
        where: {
            contactId
        }
    })
}

export async function createProblemToContact(contactId: number, data_do_problema: string, contexto_da_conversa: string, local_do_problema: string) { // Criar problema para contato
    return await prisma.problemasContato.create({
        data: {
            contactId,
            data_do_problema,
            contexto_da_conversa,
            local_do_problema
        }
    })
}

export async function getProblemsToContact(contactId: number) { // Coletar problemas de um contato
    return await prisma.problemasContato.findMany({
        where: {
            contactId
        }
    })
}