import axios from "axios";

const URL_DEFAULT_MICROSSERVICE = "https://gamefic-growth.egnehl.easypanel.host"

export async function getAudio(idAudio: string, MENSAGM_DEFAULT: string) {
    try {
        const url = process.env.URL_MICROSERVICE ?? URL_DEFAULT_MICROSSERVICE;
        const urlMicroService = `${url}/transcribe-audio`;
        const { data, status } = await axios.post(urlMicroService,
            {
                "idAudio": idAudio
            }
        )
        
        return {
            status: status == 200,
            data: data.mensagem ?? MENSAGM_DEFAULT
        }
    } catch (e: any) {
        return {
            status: false,
            data: MENSAGM_DEFAULT
        }
    }
}