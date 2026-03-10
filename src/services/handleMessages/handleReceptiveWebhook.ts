import { MetaWebhook, Metadata, Answer, Message } from '../interfaces/Meta.interface';
import { createTaskReceptive } from "../producers/task.producer.receptive";
import { getAudio } from "../../adapters/microsservico/getAudio";
import { sendMenssagem } from "../../adapters/microsservico/sendMenssage";
import { getAnwser } from "../../adapters/tools/getAnwser";

interface ReseultGetAudio {
    status: boolean,
    data: string
}

export async function HandleReceptiveWebhook(task: MetaWebhook) {
    try {

        const mensagemDefault = process.env.MENSAGM_DEFAULT ?? "😔 Ops! Tivemos um pequeno imprevisto no momento.\nPedimos que tente novamente mais tarde.\n\n📞 Se for urgente, fale com a gente pelo número: +55 11 3164-7487\n\nA Gamefic agradece seu contato! 💙😊";
        let mensagemAnswer: Answer = {
            agent: mensagemDefault,
            client: "Mensagem do usuario não foi indentificada"
        };

        const taskMessage = task.entry[0];
        const dadosDaMesagen = taskMessage.changes[0];

        if (dadosDaMesagen.value.messages) {

            const bodyDaMenssage = dadosDaMesagen.value.messages;
            const metadados = dadosDaMesagen.value.metadata;
            const dadosDoBodyDaMensagem = bodyDaMenssage?.[0];

            const tipoDaMensagem = dadosDoBodyDaMensagem?.type || false; // Tipo da mensagem: Text / Audio
            const idMensagem = dadosDoBodyDaMensagem?.id || false; // Id da mensagem para usar na resposta
            const numeroDoContato = dadosDoBodyDaMensagem?.from || false; // Numero do contato que esta enviando mensgem
            // const idWaba = taskMessage.id; // Id do waba para saber do numero e agente
            console.log(`Mensagem recebida do agente: ${metadados.display_phone_number} 📲`);

            if (idMensagem && numeroDoContato) {

                if (tipoDaMensagem === "audio") {
                    mensagemAnswer = await tratarMensagensDeAudio( // Converte o audio e retorna mensagem gerada pelo agente
                        dadosDoBodyDaMensagem,
                        numeroDoContato,
                        mensagemDefault,
                        metadados
                    );

                } else if (tipoDaMensagem === "text") {
                    mensagemAnswer = await tratarMensagensDeTexto( // Gerada mensagem pelo agente
                        dadosDoBodyDaMensagem,
                        numeroDoContato,
                        mensagemDefault,
                        metadados
                    );
                } else if (tipoDaMensagem === "button") {
                    mensagemAnswer = await tratarMensagensDeButton( // Gerada mensagem pelo agente
                        dadosDoBodyDaMensagem,
                        numeroDoContato,
                        mensagemDefault,
                        metadados
                    );
                }

                console.log(`REPOSTA DO AGENTE: ${mensagemAnswer}`)

                sendBodyToMenssage( // Envia para growth como mensagem normal
                    idMensagem,
                    numeroDoContato,
                    mensagemAnswer.agent,
                    metadados.phone_number_id
                )

                createTaskReceptive({
                    bodyTask: task,
                    resposta: mensagemAnswer
                });

            }
            console.log('---------💚 Tratamento de mensagem concluida---------');
        }

    } catch (err) {
        console.log('---------❌ Erro ao processar webhook---------');
        console.error(err);
    }
}


async function tratarMensagensDeAudio(dados: Message, numeroDoContato: string, MENSAGM_DEFAULT: string, metadados: Metadata) {
    try {
        const urlAudio = dados.audio?.url;
        const idAudio = dados.audio?.id;
        let mensagem = MENSAGM_DEFAULT;
        let result = "Não foi possivel trancrever o audio";

        if (urlAudio && idAudio) {
            const resultgGetAudio: ReseultGetAudio = await getAudio(idAudio, MENSAGM_DEFAULT);

            if (resultgGetAudio.status && resultgGetAudio.data) {
                result = resultgGetAudio.data
                mensagem = await getAnwser(result, numeroDoContato, MENSAGM_DEFAULT, metadados);
            }
        }

        return {
            agent: mensagem,
            client: result
        }

    } catch (e: any) {
        console.log("❌ Erro ao coletar mensagem de audio: " + e);
        return {
            agent: MENSAGM_DEFAULT,
            client: "Mensagem do usuario não encontrada"
        }
    }
}

async function tratarMensagensDeTexto(dados: Message, numeroDoContato: string, MENSAGM_DEFAULT: string, metadados: Metadata) {
    try {
        let responseToUser = MENSAGM_DEFAULT;

        if (dados.text?.body) {
            const mensagemUser = dados.text?.body;
            responseToUser = await getAnwser(mensagemUser, numeroDoContato, MENSAGM_DEFAULT, metadados);
        }

        return {
            agent: responseToUser,
            client: dados.text?.body ?? "Mensagem do usuario não encontrada"
        }

    } catch (e: any) {
        console.log("❌ Erro ao coletar mensagem de texto: " + e);
        return {
            agent: MENSAGM_DEFAULT,
            client: dados.text?.body ?? "Mensagem do usuario não encontrada"
        };
    }
}

async function tratarMensagensDeButton(dados: Message, numeroDoContato: string, MENSAGM_DEFAULT: string, metadados: Metadata) {
    try {
        let responseToUser = MENSAGM_DEFAULT;

        if (dados.button?.text) {
            const mensagemUser = dados.button.text;
            responseToUser = await getAnwser(mensagemUser, numeroDoContato, MENSAGM_DEFAULT, metadados);
        }

        return {
            agent: responseToUser,
            client: dados.button?.text ?? "Mensagem do usuario não encontrada"
        }

    } catch (e: any) {
        console.log("❌ Erro ao coletar mensagem de texto: " + e);
        return {
            agent: MENSAGM_DEFAULT,
            client: dados.button?.text ?? "Mensagem do usuario não encontrada"
        };
    }
}


async function sendBodyToMenssage(idMensagem: string, numeroDoContato: string, consultaResposta: string, phone_number_id: string) {
    try {

        const listaDeRespostas = await quebrarMensagem(consultaResposta);

        for (const mensagem of listaDeRespostas) {

            sendMenssagem({
                mensagem,
                idMensagem,
                numeroDoContato,
                phone_number_id
            })

            await new Promise(r => setTimeout(r, 20000))
        }
    } catch (e: any) {
        console.log("Erro ao enviar mensagem: " + e)
    }
}

function quebrarMensagem(texto: string, limite = 800): string[] {
    const textoFormatado = texto.replace(/\*\*/g, "*");

    const frases = textoFormatado.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    const mensagens: string[] = [];
    let atual = "";

    for (const frase of frases) {
        const limpa = frase.trim();

        if ((atual + " " + limpa).length > limite) {
            mensagens.push(atual.trim());
            atual = limpa;
        } else {
            atual += " " + limpa;
        }
    }

    if (atual.trim()) {
        mensagens.push(atual.trim());
    }

    return mensagens;
}