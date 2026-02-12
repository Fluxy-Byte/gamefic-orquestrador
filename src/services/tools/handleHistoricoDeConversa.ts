import { criarHistoricoDeConversa } from "../../infra/dataBase/messages"
import { contato } from "../../infra/dataBase/contacts";
import type { InterfaceContato } from "../../infra/dataBase/contacts";
import type { InterfaceWaba } from "../../infra/dataBase/waba";
import { waba } from "../../infra/dataBase/waba";
import type { Metadata } from "../interfaces/MetaWebhook";

export async function handleHistoricoDeConversa(numeroDoContato: string, repostaEnviada: string, tipoDaMensagem: string, mensagemRecebida: string, timesTampMensagem: string, status: string, dadosDoWaba: Metadata) {
    let respostaParaMensagem = repostaEnviada ?? "😔 Ops! Tivemos um pequeno imprevisto no momento.\nPedimos que tente novamente mais tarde.\n\n📞 Se for urgente, fale com a gente pelo número: +55 11 3164-7487\n\nA Gamefic agradece seu contato! 💙😊";

    const dadosWaba: InterfaceWaba | undefined = (await waba(dadosDoWaba.phone_number_id, dadosDoWaba.display_phone_number)).waba;

    if (dadosWaba) {
        const usuario = await contato(numeroDoContato, dadosWaba?.id_waba);

        if (usuario.user) {
            const dadosUser: InterfaceContato = usuario.user
            await criarHistoricoDeConversa(
                dadosUser.id,
                tipoDaMensagem,
                mensagemRecebida,
                respostaParaMensagem,
                timesTampMensagem,
                status
            )
        }
    }
}
