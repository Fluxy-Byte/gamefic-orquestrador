import { criarHistoricoDeConversa } from "../../infra/dataBase/messages";
import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import type { MetaWebhook, Answer } from '../interfaces/Meta.interface';
import { getWabaFilterWithPhoneNumber } from '../../infra/dataBase/waba';
import { getContactLog, createContactLog } from '../../infra/dataBase/logContatoComAgente';
import { getUserFilterWithPhoneAndWabaId, updateDateLastMessage, createUser } from '../../infra/dataBase/contacts';

export async function startTaskWorkerReceptive() {
    const channel = getConectionTheChannel()
    const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
    const queue = `task.${nomeFila}.receptive.create`;
    const dlq = `task.${nomeFila}.receptive.dlq`;

    await channel.assertQueue(dlq, { durable: true })

    await channel.assertQueue(queue, {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: dlq
    })

    channel.prefetch(1)

    channel.consume(queue, async (msg: any) => {
        if (!msg) return
        const body = JSON.parse(msg.content.toString())

        const task: MetaWebhook = body.bodyTask
        const repostaEnviada: Answer = body.resposta

        try {
            const mensagem = task.entry[0];
            const dadosDaMesagen = mensagem.changes[0];

            if (dadosDaMesagen.value.messages) {

                const bodyDaMenssage = dadosDaMesagen.value.messages;
                const dadosDoWaba = dadosDaMesagen.value.metadata;
                const dadosDoBodyDaMensagem = bodyDaMenssage?.[0];

                const tipoDaMensagem = dadosDoBodyDaMensagem?.type || false;
                const timesTampMensagem = dadosDoBodyDaMensagem.timestamp;
                const numeroDoContato = dadosDoBodyDaMensagem?.from || false;
                const waba = await getWabaFilterWithPhoneNumber(dadosDoWaba.phone_number_id);

                if (numeroDoContato && waba) {

                    let contato = await getUserFilterWithPhoneAndWabaId(numeroDoContato, waba.id);

                    if (!contato) {
                        contato = await createUser(numeroDoContato, waba.id);
                    }

                    const day = getDataAtualFormatada()
                    const searchLog = await getContactLog(contato.id, waba.agentId, waba.id, day);
                    
                    if (!searchLog) {
                        createContactLog(contato.id, waba.agentId, waba.id, day);
                    }
                    
                    updateDateLastMessage(numeroDoContato)

                    criarHistoricoDeConversa(
                        contato.id,
                        waba.agentId,
                        tipoDaMensagem,
                        repostaEnviada.agent,
                        repostaEnviada.client,
                        String(new Date(Number(timesTampMensagem) * 1000)),
                        'Enviado'
                    )
                }
            }

            else if (dadosDaMesagen.value.statuses) {

                const contatosAtualizados = dadosDaMesagen.value.statuses;

                contatosAtualizados.forEach((c, i) => {
                    let status = `${i} - Numero: ${c.recipient_id} - Status: ${c.status} - Serviço: ${c.pricing?.type} | ${c.pricing?.category}`;
                    console.log(status);
                });
            }

            channel.ack(msg);

        } catch (err) {
            console.error("Erro ao processar alimentação da base" + err);
        }
    })
}


export function getDataAtualFormatada(): string {
    const hoje = new Date();

    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // mês começa em 0
    const ano = hoje.getFullYear();

    return `${dia}/${mes}/${ano}`;
}