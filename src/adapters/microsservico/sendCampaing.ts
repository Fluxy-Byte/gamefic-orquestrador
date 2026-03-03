import axios from "axios";

const URL_DEFAULT_MICROSSERVICE = "https://gamefic-growth.egnehl.easypanel.host"
const TOKEN_META = process.env.TOKEN_META

interface DadosPayload {
    phone_number_id: string
    category: string
    payload: any
}

export const sendCampaing = async (body: DadosPayload) => {
    try {
        const url = process.env.URL_MICROSERVICE ?? URL_DEFAULT_MICROSSERVICE;
        const responseSend = await axios.post(`${url}/send-campaign`,
            body
        )
        console.log(JSON.stringify(responseSend))
        return {
            status: responseSend.status,
            data: JSON.stringify(responseSend.data)
        }

    } catch (e: any) {
        console.log(JSON.stringify(e))
        return {
            status: 500,
            data: JSON.stringify(e)
        }
    }
}


export const sendCampaingMeta = async (category: string, phone_number_id: string, payload: any) => {
    try {
        let type_message = category == "marketing" ? "marketing_messages" : "messages"
        const url = `https://graph.facebook.com/v22.0/${phone_number_id}/${type_message}`
        const { data, status } = await axios.post(
            url,
            payload,
            {
                headers: {
                    "Authorization": `Bearer ${TOKEN_META}`,
                    "Content-Type": "application/json"
                }
            }
        )

        return {
            status,
            data
        }
    } catch (e: any) {
        return {
            status: e.response?.status || 500,
            data: e.response?.data || e.message
        }
    }
}