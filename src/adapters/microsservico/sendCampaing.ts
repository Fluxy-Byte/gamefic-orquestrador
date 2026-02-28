import axios from "axios";

export const sendCampaing = async (body: any) => {
    try {
        const url = process.env.URL_MICROSERVICE ?? "https://fluxe-fluxy-growth.egnehl.easypanel.host";
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