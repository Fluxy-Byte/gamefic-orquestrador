import axios from "axios";

const URL_DEFAULT_MICROSSERVICE = "https://gamefic-growth.egnehl.easypanel.host"

export const sendCampaing = async (body: any) => {
    try {
        const url = process.env.URL_MICROSERVICE ?? URL_DEFAULT_MICROSSERVICE;
        const responseSend = await axios.post(`${url}/send-campaign`,
            body
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