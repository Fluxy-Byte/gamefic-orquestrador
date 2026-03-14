import axios from "axios";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const URL_DEFAULT_MICROSSERVICE = "https://gamefic-growth.egnehl.easypanel.host"

const TOKEN_META = process.env.TOKEN_META;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

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

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/*
========================================
FUNÇÃO PRINCIPAL
========================================
Recebe o id do audio do WhatsApp
Retorna apenas a transcrição
========================================
*/

export async function transcreverAudioWhatsApp(idAudio: string, MENSAGM_DEFAULT: string): Promise<string> {
    try {

        const audioUrl = await getAudioMeta(idAudio);

        const audioPath = await downloadAudio(audioUrl);

        const texto = await converterAudio(audioPath, MENSAGM_DEFAULT);

        return texto ?? MENSAGM_DEFAULT;

    } catch (e) {
        console.error("Erro na transcrição:", e);
        return MENSAGM_DEFAULT;
    }
}

/*
========================================
1 - PEGAR URL DO AUDIO NA META
========================================
*/

async function getAudioMeta(idAudio: string): Promise<string> {

    const url = `https://graph.facebook.com/v24.0/${idAudio}`;

    const { data } = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${TOKEN_META}`
        }
    });

    if (!data.url) {
        throw new Error("URL do áudio não encontrada");
    }

    return data.url;
}

/*
========================================
2 - BAIXAR AUDIO
========================================
*/

async function downloadAudio(audioUrl: string): Promise<string> {

    const baseDir = process.cwd();
    const audioDir = path.join(baseDir, "audios");

    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir);
    }

    const filename = `audio_${Date.now()}.ogg`;
    const filepath = path.join(audioDir, filename);

    const response = await axios.get(audioUrl, {
        headers: {
            Authorization: `Bearer ${TOKEN_META}`
        },
        responseType: "arraybuffer",
        timeout: 60000
    });

    if (response.status !== 200) {
        throw new Error("Erro ao baixar áudio");
    }

    fs.writeFileSync(filepath, response.data);

    return filepath;
}

/*
========================================
3 - CONVERTER AUDIO COM GEMINI
========================================
*/

async function converterAudio(filepath: string, MENSAGM_DEFAULT: string): Promise<string> {

    if (!fs.existsSync(filepath)) {
        throw new Error("Arquivo não encontrado");
    }

    const mimeTypes: any = {
        ".ogg": "audio/ogg",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac"
    };

    const ext = path.extname(filepath).toLowerCase();
    const mimeType = mimeTypes[ext] || "audio/ogg";

    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const audioBuffer = fs.readFileSync(filepath);

        const result = await model.generateContent([
            {
                text: "Transcreva este áudio na íntegra, respeitando a pontuação."
            },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: audioBuffer.toString("base64")
                }
            }
        ]);

        const text = result.response.text();

        fs.unlinkSync(filepath);

        return text;

    } catch (e: any) {

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        return MENSAGM_DEFAULT;
    }
}