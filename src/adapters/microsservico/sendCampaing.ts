import axios from "axios";

const URL_DEFAULT_MICROSSERVICE = "https://gamefic-growth.egnehl.easypanel.host"

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