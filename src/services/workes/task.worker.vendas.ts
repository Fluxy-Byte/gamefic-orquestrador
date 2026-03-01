// Onde o worker executa

import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import { sendCampaing } from "../../adapters/microsservico/sendCampaing";
import { criarHistoricoDeConversa } from "../../infra/dataBase/messages";
import type { DadosToSendNotification } from '../interfaces/Vendas.interface';
import { updateContact } from "../../infra/dataBase/contacts";
import { updateNumberContactsConvertationWaba, getWabaFilterWithId } from '../../infra/dataBase/waba';
import { getUserFilterWithPhone, createUser } from '../../infra/dataBase/contacts';
import { getWabaFilterWithPhoneNumber } from '../../infra/dataBase/waba';

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

    const bodyVendas: DadosToSendNotification = JSON.parse(msg.content.toString())
    console.log("🟠 Body recebido das vendas: " + bodyVendas)

    try {
      if (!bodyVendas.phone) {
        console.log('❌ Tarefa não concluida pois não tem numero para disparo');
        channel.ack(msg);
        return;
      }
      const waba = await getWabaFilterWithPhoneNumber(bodyVendas.phoneNumberId);
      let user = await getUserFilterWithPhone(bodyVendas.phone);

      if (!user) {
        user = await createUser(bodyVendas.phone, waba?.id ?? 1);
      }

      let bodyPayload;

      if (bodyVendas.nameTemplate == "chegou_mais_um_lead") {

        bodyPayload = {
          "phone_number_id": bodyVendas.phoneNumberId,
          "payload": {
            messaging_product: "whatsapp",
            to: bodyVendas.phoneSquadSales,
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
                      "text": bodyVendas.nameTemplate
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

      console.log('✅ Tarefa concluída')
      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ');
      channel.nack(msg, false, false)
    }
  })
}



