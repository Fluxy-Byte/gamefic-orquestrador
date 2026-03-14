import axios from "axios";

const URL_DEFAULT_MICROSSERVICE = "https://gamefic-growth.egnehl.easypanel.host";
const TOKEN_META = process.env.TOKEN_META;

export const sendMenssagem = async (props: { mensagem: string, idMensagem: string, numeroDoContato: string, phone_number_id: string }) => {
    try {

        console.log(`\n\n📢 Enviando mensagem para microserviço: ${props.mensagem} para o numero ${props.numeroDoContato}\n\n`)

        const url = process.env.URL_MICROSERVICE ?? URL_DEFAULT_MICROSSERVICE;
        const responseSend = await axios.post(`${url}/send-message`,
            {
                "mensagem": props.mensagem,
                "idMensagem": props.idMensagem,
                "numeroDoContato": props.numeroDoContato,
                "phone_number_id": props.phone_number_id
            }
        )

        return {
            status: responseSend.status,
            data: JSON.stringify(responseSend.data)
        }

    } catch (e) {
        console.log(`❌ Erro ao requisitar meta message: ${JSON.stringify(e)}`)
        return {
            status: 500,
            data: JSON.stringify(e)
        }
    }
}

export const sendMenssagemMeta = async (props: { mensagem: string, idMensagem: string, numeroDoContato: string, phoneNumberId: string }) => {
    try {

        console.log(`\n\n📢 Enviando mensagem para microserviço: ${props.mensagem} para o numero ${props.numeroDoContato}\n\n`)

        const url = `https://graph.facebook.com/v22.0/${props.phoneNumberId}/messages`

        const responseSend = await axios.post(url,
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": props.numeroDoContato,
                "context": {
                    "message_id": props.idMensagem
                },
                "type": "text",
                "text": {
                    "preview_url": false,
                    "body": props.mensagem
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${TOKEN_META}`
                }
            }
        )

        return {
            status: responseSend.status,
            data: JSON.stringify(responseSend.data)
        }

    } catch (e) {
        console.log(`❌ Erro ao requisitar meta message: ${JSON.stringify(e)}`)
        return {
            status: 500,
            data: JSON.stringify(e)
        }
    }
}

export const sendVideoMeta = async (props: { linkVideo: string, mensagem: string, idMensagem: string, numeroDoContato: string, phoneNumberId: string }) => {
    try {

        console.log(`\n\n📢 Enviando mensagem para microserviço: ${props.mensagem} para o numero ${props.numeroDoContato}\n\n`)

        const url = `https://graph.facebook.com/v22.0/${props.phoneNumberId}/messages`

        const responseSend = await axios.post(url,
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": props.numeroDoContato,
                "context": {
                    "message_id": props.idMensagem
                },
                "type": "video",
                "video": {
                    "link": props.linkVideo,
                    "caption": props.mensagem
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${TOKEN_META}`
                }
            }
        )

        return {
            status: responseSend.status,
            data: JSON.stringify(responseSend.data)
        }

    } catch (e) {
        console.log(`❌ Erro ao requisitar meta message: ${JSON.stringify(e)}`)
        return {
            status: 500,
            data: JSON.stringify(e)
        }
    }
}