
import { getConectionTheChannel } from '../../infra/rabbitMQ/conection';

// Onde a API recebe tarefas

export interface Task {
    name_template: string,
    dados: LeadRegister
}


export interface LeadRegister {
    nome: string,
    produto?: string,
    nivelInteresse?: string,
    problemaCentral?: string,
    objetivoLead?: string,
    tomLead?: string,
    urgenciaLead?: string,
    instrucao?: string,
    telefone: string,
    nomeAgente: string,
    telefoneAgente: string,
    problema?: string,
    etapa?: string,
}

export async function createTaskVendas(task: Task) {
    try {
        console.log(task)
        const nomeFila = process.env.NOME_FILA_RABBITMQ ?? "fluxy";
        const channel = await getConectionTheChannel()
        console.log(`🟠 Criou na fila vendas`);
        const queue = `task.${nomeFila}.vendas.create`
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), {
            persistent: true
        })
        return;
    } catch (e: any) {
        console.log("Erro ao iniciar conexão com rabbitmq: " + e)
    }
}