// Onde o worker executa

import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import { sendCampaing } from "../../adapters/microsservico/sendCampaing";
import { criarHistoricoDeConversa } from "../../infra/dataBase/messages";
import { LeadRegister } from "../../adapters/interfaces/Meta.interface";
import { updateContact } from "../../infra/dataBase/contacts";
import { updateNumberContactsConvertationWaba, getWabaFilterWithPhoneNumber, getWabaFilterWithId } from '../../infra/dataBase/waba';
import { getUserFilterWithPhoneAndWabaId, createUser } from '../../infra/dataBase/contacts';

export interface Task {
  nameTemplate: string,
  contato: UpdateContact,
  phoneNumberId: string,
  idWaba: number,
  phoneNotification: string
}

interface UpdateContact {
  email?: string;
  name?: string;
  phone: string;
  empresa?: string;
  dadosReunia?: {
    data_reuniao: string;
    contexto_da_reuniao: string;
  }
  problemasContato?: {
    data_do_problema: string;
    local_do_problema: string;
    contexto_da_conversa: string;
  }
}

export async function startTaskWorkerVendas() {
  const channel = getConectionTheChannel()
  const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
  const queue = `task.${nomeFila}.vendas.create`
  const dlq = `task.${nomeFila}.vendas.dlq`

  await channel.assertQueue(dlq, { durable: true })

  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: dlq
  })

  channel.prefetch(1)

  channel.consume(queue, async (msg: any) => {
    if (!msg) return

    const bodyVendas: Task = JSON.parse(msg.content.toString())
    console.log("🟠 Body recebido das vendas: " + bodyVendas)

    try {
      if (!bodyVendas.contato.phone) {
        console.log('❌ Tarefa não concluida pois não tem numero para disparo');
        channel.ack(msg);
        return;
      }

      let user = await getUserFilterWithPhoneAndWabaId(bodyVendas.contato.phone, bodyVendas.idWaba,);

      if (!user) {
        user = await createUser(bodyVendas.contato.phone, bodyVendas.idWaba);
      }

      let bodyPayload;

      if (bodyVendas.nameTemplate == "chegou_mais_um_lead") {

        bodyPayload = {
          "phone_number_id": bodyVendas.phoneNumberId,
          "payload": {
            messaging_product: "whatsapp",
            to: bodyVendas.contato.phone,
            type: "template",

            template: {
              name: bodyVendas.nameTemplate,

              language: {
                code: "pt_BR"
              },

              components: [
                {
                  "type": "body",
                  "parameters": [
                    {
                      "type": "text",
                      "text": bodyVendas.contato.name
                    }
                  ]
                }

              ]
            }
          }
        }
      }

      let result = await sendCampaing(bodyPayload);
      console.log("Resposta do microsserviço de envio: " + JSON.stringify(result.data));

      const waba = await getWabaFilterWithId(bodyVendas.idWaba);

      if (waba) {

        criarHistoricoDeConversa(
          user.id,
          waba.agentId,
          'template',
          bodyVendas.nameTemplate,
          'oi',
          String(new Date()),
          'Enviado'
        );

        updateNumberContactsConvertationWaba(waba.phoneNumberId);
      }

      const dadosParaAtualizacao = {
        name: bodyVendas.contato.name ?? "",
        email: bodyVendas.contato.email ?? "",
        empresa: bodyVendas.contato.empresa ?? "",
        phone: bodyVendas.contato.phone,

        data_reuniao: bodyVendas.contato.dadosReunia?.data_reuniao ?? "",
        contexto_da_reuniao: bodyVendas.contato.dadosReunia?.contexto_da_reuniao ?? "",

        data_do_problema: bodyVendas.contato.problemasContato?.data_do_problema ?? "",
        local_do_problema: bodyVendas.contato.problemasContato?.local_do_problema ?? "",
        contexto_da_conversa: bodyVendas.contato.problemasContato?.contexto_da_conversa ?? ""
      }
      
      updateContact(dadosParaAtualizacao.phone, dadosParaAtualizacao);

      console.log('✅ Tarefa concluída')
      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ');
      channel.nack(msg, false, false)
    }
  })
}



