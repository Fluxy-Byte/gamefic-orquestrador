// Onde o worker executa

import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';
import { sendCampaing } from "../../adapters/microsservico/sendCampaing";
import { criarHistoricoDeConversa } from "../../infra/dataBase/messages";
import { getWabaFilterWithPhoneNumber } from '../../infra/dataBase/waba';
import { createCampanha, updateNumberSendCampaing, updateNumberFailedCampaing } from "../../infra/dataBase/campanhas";
import { createContatosCampanha } from "../../infra/dataBase/contatosCampanha";
import { createUser, getUserFilterWithPhoneAndWabaId, updateContact } from "../../infra/dataBase/contacts";

interface PhoneUser {
  phone: string,
  email?: string;
  name?: string;
  empresa?: string;
  parametersHeader: [],
  parametersBody: []
}

export interface ModelCamping {
  payload: {
    numbers: PhoneUser[],
    template_name: string,
    language: string
    type: string
  },
  name_campanha: string
  phone_number_id: string
  id_organizacao: string
}

export async function startTaskWorkerCampaign() {
  const channel = getConectionTheChannel()
  const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
  const queue = `task.${nomeFila}.campaign.create`
  const dlq = `task.${nomeFila}.campaign.dlq`

  await channel.assertQueue(dlq, { durable: true })

  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: dlq
  })

  channel.prefetch(1)

  channel.consume(queue, async (msg: any) => {
    if (!msg) return

    const bodyCampaign: ModelCamping = JSON.parse(msg.content.toString())

    try {
      if (bodyCampaign.payload.numbers.length == 0) {
        console.log('❌ Tarefa não concluida pois não tem numeros para disparo');
        channel.ack(msg);
        return;
      }

      const waba = await getWabaFilterWithPhoneNumber(bodyCampaign.phone_number_id);

      if (!waba) {
        console.log('❌ Tarefa não concluida pois não encontramos o Waba');
        channel.ack(msg);
        return;
      }

      const dados = {
        name: bodyCampaign.name_campanha,
        nameTemplate: bodyCampaign.payload.template_name,
        id_organizacao: bodyCampaign.id_organizacao,
        id_waba: waba.id,
      }

      const campaign = await createCampanha(dados);

      if (!campaign) {
        console.log('❌ Tarefa não concluida pois não criamos a campanha');
        channel.ack(msg);
        return;
      }

      for (let i = 0; i < bodyCampaign.payload.numbers.length; i++) {
        let contact = bodyCampaign.payload.numbers[i];

        const parametros = contact.parametersHeader.length > 0 ? [
          {
            "type": "header",
            "parameters": contact.parametersHeader
          },
          {
            "type": "body",
            "parameters": contact.parametersBody
          }
        ] : [
          {
            "type": "body",
            "parameters": contact.parametersBody
          }
        ]

        const dataToSend = {
          messaging_product: "whatsapp",
          to: contact.phone,
          type: "template",

          template: {
            name: bodyCampaign.payload.template_name,

            language: {
              code: bodyCampaign.payload.language
            },

            components: parametros
          }
        };

        const result = await sendCampaing({
          phone_number_id: bodyCampaign.phone_number_id,
          category: "marketing",
          payload: dataToSend
        });


        let user = await getUserFilterWithPhoneAndWabaId(contact.phone, waba.id);

        if (!user) {
          user = await createUser(contact.phone, waba.id);
        }

        let dadosParaUpdateContact: Record<string, string> = {}

        if (contact.email && contact.email != user.email) dadosParaUpdateContact["email"] = contact.email;
        if (contact.empresa && contact.empresa != user.empresa) dadosParaUpdateContact["empresa"] = contact.empresa;
        if (contact.name && contact.name != user.name) dadosParaUpdateContact["name"] = contact.name;

        if (Object.keys(dadosParaUpdateContact).length > 0) {
          await updateContact(user.phone, dadosParaUpdateContact)
        }

        const dados = {
          status: result.status == 200 ? "Enviado" : "Falha",
          body_retorno: JSON.stringify(result),
          id_campanha: campaign.id,
          id_contato: user.id,
        }

        createContatosCampanha(dados);
        if (result.status == 200) {
          updateNumberSendCampaing(campaign.id);
        } else {
          updateNumberFailedCampaing(campaign.id);
        }

        criarHistoricoDeConversa(
          user.id,
          waba.agentId,
          'template',
          bodyCampaign.payload.template_name,
          'oi',
          String(new Date()),
          'enviado'
        );
      }

      console.log('🛠 Executando tarefa');
      console.log(JSON.stringify(bodyCampaign));

      console.log('✅ Tarefa concluída')
      channel.ack(msg)
    } catch (err) {
      console.log('❌ Falhou, jogando pra DLQ: ' + JSON.stringify(err));
      channel.nack(msg, false, false)
    }
  })
}



// bodyPayload = {
//   "phone_number_id": bodyVendas.phoneNumberId,
//   "payload": {
//     messaging_product: "whatsapp",
//     to: dadosLead.telefoneAgente,
//     type: "template",

//     template: {
//       name: bodyVendas.nameTemplate,

//       language: {
//         code: "pt_BR"
//       },

//       components: [
//         {
//           "type": "header",
//           "parameters": [
//             {
//               "type": "text",
//               "text": dadosLead.nomeAgente
//             }
//           ]
//         },
//         {
//           "type": "body",
//           "parameters": [
//             {
//               "type": "text",
//               "text": dadosLead.nome
//             },
//             {
//               "type": "text",
//               "text": dadosLead.telefone
//             },
//             {
//               "type": "text",
//               "text": dadosLead.produto
//             },
//             {
//               "type": "text",
//               "text": dadosLead.nivelInteresse
//             }
//           ]
//         }

//       ]
//     }
//   }
// }