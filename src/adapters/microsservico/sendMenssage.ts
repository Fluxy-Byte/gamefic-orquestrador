import axios from "axios";

const URL_DEFAULT_MICROSSERVICE = "https://gamefic-growth.egnehl.easypanel.host"

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
