import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { Request, Response } from "express";

import { createTaskCampaign } from "../services/producers/task.producer.campaign"// Criar task para campanhas
import { createTaskVendas } from "../services/producers/task.producer.vendas"// Criar task para campanhas
import { coletarHistorico } from "../infra/dataBase/messages";
import { HandleReceptiveWebhook } from "../services/handleMessages/handleReceptiveWebhook";
import {
    getAllContacts,
    getUserFilterWithWabaId,
    createUser,
    getUserFilterWithPhoneAndWabaId,
    updateNameContact,
    getUserFilterWithPhone,
    updateContact,
    createMeetToContact,
    getMeetToContact,
    getProblemsToContact,
    createProblemToContact
} from "../infra/dataBase/contacts";
import { rdStationGet, rdStationPost } from "../infra/dataBase/rdstation";
import { createWaba, getAllWaba, getWabaFilterOrganization, getWabaFilterWithPhoneNumber, updateWaba } from "../infra/dataBase/waba";
import { createAgent, getAgentFilterWithId, getAllAgent, updateAgente, getAgentFilterWithOrganizationId } from "../infra/dataBase/agent";
import { getTemplates } from "../adapters/meta/templates";
import { getCampanhas } from "../infra/dataBase/campanhas";
import { getContatosCampanha } from "../infra/dataBase/contatosCampanha";
import { swaggerDocument } from "../routes/swagger"

import type { ModelCamping } from "../services/workes/task.worker.campaign";

const routes = express();
routes.use(cors());
routes.use(express.json());

routes.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Para validar o token de acesso webhook
routes.get("/api/v1/receptive/webhook", async (req: any, res: any) => {
    try {
        const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
        const verifyToken = process.env.VERIFY_TOKEN;
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('WEBHOOK VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.status(403).end();
        }
    } catch (e) {
        console.log("❌ Erro tentar verificar webhook GET-/api/v1/receptive/webhook: " + e)
        return res.status(500).end();
    }
})

// Receber mensagens e alteração de status do webhook da meta
routes.post("/api/v1/receptive/webhook", async (req: any, res: any) => {
    try {
        res.status(200).end()
        // await createTaskReceptive(req.body);
        await HandleReceptiveWebhook(req.body)
        return
    } catch (e) {
        console.log("❌ Erro ao tentar criar mensagem na fila POST-/api/v1/receptive/webhook: " + e)
        res.status(500).end();
    }
})


// Receber mensagens ativas para disparo
routes.post("/api/v1/campaign", async (req: any, res: any) => {
    try {
        const bodyToCampaing: ModelCamping = req.body;
        console.log(bodyToCampaing)
        if (bodyToCampaing.payload.numbers.length == 0 || !bodyToCampaing.payload.template_name || !bodyToCampaing.payload.type) {
            return res.status(401).json({
                status: false,
                message: "Erro ao inserir na fila de disparo pois esta faltando dados no corpo da req.",
                error: ""
            });
        }

        await createTaskCampaign(bodyToCampaing);

        return res.status(200).json({
            status: true,
            message: "Campanha inserida na fila de disparo com sucesso.",
            error: ""
        })
    } catch (e) {
        console.log("❌ Erro ao tentar criar campaign na fila POST-/api/v1/campaign: " + e)
        res.status(500).json({
            status: false,
            message: "Erro ao inserir na fila de disparo.",
            error: JSON.stringify(e)
        });
    }
})

type ParamsCampaings = {
    idOrganizacao: string
    idWaba: number
}

routes.get("/api/v1/campaign", async (req: Request<ParamsCampaings>, res: any) => {
    try {
        const { idOrganizacao, idWaba } = req.query;

        if (!idOrganizacao || typeof idOrganizacao != "string" || !idWaba || typeof idOrganizacao != "string") {
            return res.status(401).json({
                status: false,
                campanhas: [],
                message: "Necessario os campos idOrganizacao e idWaba como params query na URL",
                error: ""
            });
        }

        const result = await getCampanhas(idOrganizacao, Number(idWaba));

        return res.status(200).json({
            status: true,
            campanhas: result,
            message: "Campanhas coletadas com sucesso",
            error: ""
        })
    } catch (e) {
        console.log("❌ Erro ao tentar criar campaign na fila POST-/api/v1/campaign: " + e)
        res.status(500).json({
            status: false,
            campanhas: [],
            message: "Erro ao coletar dados da campanha",
            error: JSON.stringify(e)
        });
    }
})

type ParamsContactsCampaing = {
    idCampanha: string
}

routes.get("/api/v1/contacts-campaing", async (req: Request<ParamsContactsCampaing>, res: any) => {
    try {
        const { idCampanha } = req.query;

        if (!idCampanha || typeof idCampanha != "string") {
            return res.status(401).json({
                status: false,
                contatos: [],
                message: "Necessario o campo idCampanha como params query na URL",
                error: ""
            });
        }

        const result = await getContatosCampanha(Number(idCampanha));

        return res.status(200).json({
            status: true,
            contatos: result,
            message: "Contatos coletadas com sucesso",
            error: ""
        })
    } catch (e) {
        console.log("❌ Erro ao tentar criar campaign na fila POST-/api/v1/campaign: " + e)
        res.status(500).json({
            status: false,
            contatos: [],
            message: "Erro ao coletar contatos da campanha",
            error: JSON.stringify(e)
        });
    }
})

// Receber mensagens ativas para disparo
routes.post("/api/v1/vendas", async (req: any, res: any) => {
    try {
        const bodyToCampaing: any = req.body;

        if (!bodyToCampaing.nameTemplate || !bodyToCampaing.phone || !bodyToCampaing.phoneNumberId || !bodyToCampaing.phoneSquadSales) {
            return res.status(401).json({
                status: false,
                message: "Erro ao inserir na fila de disparo pois esta faltando dados no corpo da req.",
                error: ""
            });
        }

        await createTaskVendas(bodyToCampaing);

        return res.status(200).json({
            status: true,
            message: "Venda inserida na fila de disparo com sucesso.",
            error: ""
        })
    } catch (e) {
        console.log("❌ Erro ao tentar criar venda na fila POST-/api/v1/vendas: " + e)
        res.status(500).json({
            status: false,
            message: "Erro ao inserir na fila de disparo.",
            error: JSON.stringify(e)
        });
    }
})



type ParamsContact = {
    waba_id?: string
    phone?: string
}

routes.get("/api/v1/contacts", async (req: Request<ParamsContact>, res: Response) => {
    try {
        const { waba_id } = req.query;

        if (waba_id && typeof waba_id == "string") {
            const contatos = await getUserFilterWithWabaId(Number(waba_id));
            return res.status(200).json({
                status: true,
                contatos,
                message: "Contatos na base"
            })
        } else {
            const users = await getAllContacts();
            res.status(200).json({
                status: true,
                message: "Contatos na base",
                contatos: users
            });
        }
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            contatos: []
        });
    }
})


routes.get("/api/v1/contact", async (req: Request<ParamsContact>, res: Response) => {
    try {
        const { phone } = req.query;

        if (phone && typeof phone == "string") {
            const contato = await getUserFilterWithPhone(phone);
            return res.status(200).json({
                status: true,
                contato,
                message: "Contato na base"
            })
        } res.status(500).json({
            status: false,
            message: "Phone não encontrado",
            contato: null
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            contato: null
        });
    }
})

routes.post("/api/v1/contact", async (req, res) => {
    try {
        const { phone, idWaba } = req.body;

        let user = await getUserFilterWithPhoneAndWabaId(phone, idWaba)

        if (!user) {
            user = await createUser(phone, idWaba)
        }

        res.status(200).json({
            status: true,
            message: "Contato encontrado com sucesso",
            contato: user
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor ao criar usuario",
            contato: null
        });
    }
})

routes.put("/api/v1/contact", async (req, res) => {
    try {
        const { phone, name, email, empresa } = req.body;

        if (!phone) {
            return res.status(400).json({
                status: false,
                message: "Necessário o campo phone para atualizar",
                contato: null
            });
        }

        const dadosParaAtualizacao: Record<string, any> = {};

        if (name) dadosParaAtualizacao.name = name;
        if (email) dadosParaAtualizacao.email = email;
        if (empresa) dadosParaAtualizacao.empresa = empresa;

        if (Object.keys(dadosParaAtualizacao).length === 0) {
            return res.status(400).json({
                status: false,
                message: "Nenhum campo válido para atualização foi enviado",
                contato: null
            });
        }

        const user = await updateContact(phone, dadosParaAtualizacao);

        return res.status(200).json({
            status: true,
            message: "Contato atualizado com sucesso",
            contato: user
        });

    } catch (e: any) {
        console.error(e);
        return res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            contato: null
        });
    }
});

routes.put("/api/v1/contact/name", async (req, res) => {
    try {
        const { phone, name } = req.body;
        const user = await updateNameContact(phone, name);
        res.status(200).json({
            status: true,
            message: "Sucesso ao atualizar nome do usuario",
            contato: user
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor",
            contato: null
        });
    }
})

type ParamsContactOutherDatas = {
    phone: string
}

routes.get("/api/v1/contact-reuniao", async (req: Request<ParamsContactOutherDatas>, res) => {
    try {
        const { phone } = req.query;

        let user = await getUserFilterWithPhone(phone as string)

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "Contato não encontrado para o phone informado",
                reuniaos: []
            });
        }

        const reuniao = await getMeetToContact(user.id);

        res.status(200).json({
            status: true,
            message: "Reuniões encontradas com sucesso",
            reuniaos: reuniao
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor ao buscar reuniões",
            reuniaos: []
        });
    }
})


routes.post("/api/v1/contact-reuniao", async (req, res) => {
    try {
        const { phone, data_reuniao, contexto_da_reuniao } = req.body;

        let user = await getUserFilterWithPhone(phone)

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "Contato não encontrado para o phone informado",
                reuniao: null
            });
        }

        const reuniao = await createMeetToContact(user.id, data_reuniao, contexto_da_reuniao);

        res.status(200).json({
            status: true,
            message: "Reunião criada com sucesso",
            reuniao: reuniao
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor ao criar reunião",
            reuniao: null
        });
    }
})


routes.get("/api/v1/contact-problema", async (req: Request<ParamsContactOutherDatas>, res) => {
    try {
        const { phone } = req.query;

        let user = await getUserFilterWithPhone(phone as string)

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "Contato não encontrado para o phone informado",
                problemas: []
            });
        }

        const problema = await getProblemsToContact(user.id);

        res.status(200).json({
            status: true,
            message: "Problemas encontrados com sucesso",
            problemas: problema
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor ao buscar problemas",
            problemas: []
        });
    }
})

routes.post("/api/v1/contact-problema", async (req, res) => {
    try {
        const { phone, data_do_problema, contexto_da_conversa, local_do_problema } = req.body;

        let user = await getUserFilterWithPhone(phone)

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "Contato não encontrado para o phone informado",
                problema: null
            });
        }

        const problema = await createProblemToContact(user.id, data_do_problema, contexto_da_conversa, local_do_problema);

        res.status(200).json({
            status: true,
            message: "Problema criado com sucesso",
            problema: problema
        });
    } catch (e: any) {
        console.log(JSON.stringify(e))
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor ao criar problema",
            problema: null
        });
    }
})



type ParamsRDCRM = {
    name: string;
}

routes.get("/api/v1/rdcrm", async (req: Request<ParamsRDCRM>, res: Response) => {
    try {
        const { name } = req.params;
        const result = await rdStationGet(name);

        if (!result.status) {
            return res.status(500).json({
                status: false,
                data: null,
            })
        }

        return res.status(200).json({
            status: true,
            data: result.dados,
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: false,
            data: null,
        })
    }
})

routes.post("/api/v1/rdcrm", async (req, res) => {
    try {
        const body = req.body

        const result = await rdStationPost(body)

        if (!result.status) {
            return res.status(500).json({
                status: false,
                data: null,
            })
        }

        return res.status(200).json({
            status: true,
            data: result.dados,
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: false,
            data: null,
        })
    }
})


routes.post("/api/v1/waba", async (req, res) => {
    try {
        const { phone_number_id, display_phone_number, idOrganization, idAgente } = req.body;

        if (!phone_number_id ||
            !display_phone_number ||
            !idOrganization ||
            !idAgente ||
            typeof phone_number_id != "string" ||
            typeof display_phone_number != "string" ||
            typeof idOrganization != "string" ||
            typeof idAgente != "number"
        ) {
            return res.status(400).json({
                status: false,
                waba: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: phone_number_id = string, display_phone_number = string, idOrganization = string, idAgente = number"
            })
        }

        const result = await createWaba(phone_number_id, display_phone_number, idOrganization, idAgente);

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            waba: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})

type WabaQuery = {
    phone_number_id?: string
}

routes.get("/api/v1/waba", async (req: Request<WabaQuery>, res) => {
    try {
        const { phone_number_id } = req.query;

        if (phone_number_id && typeof phone_number_id == "string") {
            const waba = await getWabaFilterWithPhoneNumber(phone_number_id);
            return res.status(200).json({
                status: true,
                waba,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: phone_number_id = string"
            })
        } else {
            const waba = await getAllWaba();
            return res.status(200).json({
                status: true,
                waba,
                mensagem: ""
            })
        }
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})

type WabaQueryWhitOrganization = {
    organization_id?: string
}

routes.get("/api/v1/list-wabas", async (req: Request<WabaQueryWhitOrganization>, res) => {
    try {
        const { organization_id } = req.query;

        if (organization_id && typeof organization_id == "string") {

            const wabas = await getWabaFilterOrganization(organization_id);
            return res.status(200).json({
                status: true,
                wabas,
                mensagem: ""
            })
        } else {
            const waba = await getAllWaba();
            return res.status(200).json({
                status: true,
                waba,
                mensagem: ""
            })
        }


    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})


routes.put("/api/v1/waba", async (req: Request<WabaQuery>, res) => {
    try {
        const { agentId, displayPhoneNumber, organizationId } = req.body;
        const { phone_number_id } = req.query;

        if (!phone_number_id ||
            typeof phone_number_id != "string"
        ) {
            return res.status(400).json({
                status: false,
                waba: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: phone_number_id = string, agentId = number, displayPhoneNumber? = string e organizationId = string"
            })
        }

        const result = await updateWaba(phone_number_id, { agentId, displayPhoneNumber, organizationId, phoneNumberId: phone_number_id });

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            waba: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})


type AgentQuery = {
    id_agent?: string
    organization_id?: string
}

routes.get("/api/v1/agent", async (req: Request<AgentQuery>, res) => {
    try {
        const { id_agent, organization_id } = req.query;

        if (id_agent && typeof id_agent == "string") {
            const agent = await getAgentFilterWithId(Number(id_agent));
            return res.status(200).json({
                status: true,
                agent,
                mensagem: "Consulta concluida usando id_agent como filtro"
            })
        } else if (organization_id && typeof organization_id == "string") {
            const agent = await getAgentFilterWithOrganizationId(organization_id);
            return res.status(200).json({
                status: true,
                agent,
                mensagem: "Consulta concluida usando organization_id como filtro"
            })
        } else {
            const agent = await getAllAgent();
            return res.status(200).json({
                status: true,
                agent,
                mensagem: "Consulta completa concluida"
            })
        }
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            agent: null,
            mensagem: "Erro interno no servidor"
        })
    }
})



routes.post("/api/v1/agent", async (req, res) => {
    try {
        const { name, url, organizationId } = req.body;
        console.log(name, url, organizationId)
        if (!name ||
            !url ||
            !organizationId ||
            typeof organizationId != "string" ||
            typeof name != "string" ||
            typeof url != "string"
        ) {
            return res.status(400).json({
                status: false,
                agent: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: name = string, url = string"
            })
        }

        const result = await createAgent(name, url, organizationId);

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            agent: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            agent: null,
            mensagem: "Erro interno no servidor"
        })
    }
})



routes.put("/api/v1/agent", async (req: Request<AgentQuery>, res) => {
    try {
        const { name, url, mensagem, organizationId } = req.body;
        const { id_agent } = req.query;

        if (!name ||
            !url ||
            typeof name != "string" ||
            typeof url != "string"
        ) {
            return res.status(400).json({
                status: false,
                agent: null,
                mensagem: "Necessario revisar os dados necessário no seu body da requisição. Campos esperados e tipos do valor: name = string, url = string, mensagem? = string e id_agent como query",
                organizationId: organizationId ?? ""
            })
        }

        const result = await updateAgente(Number(id_agent), { name, url, mensagem });

        return res.status(result ? 200 : 400).json({
            status: result ? true : false,
            agent: result,
            mensagem: ""
        })
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            agent: null,
            mensagem: "Erro interno no servidor"
        })
    }
})


routes.get("/api/v1/templates", async (req, res) => {           // Coletar templates do waba
    try {
        const result = await getTemplates();
        return res.status(result.status).json(result)

    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            status: false,
            waba: null,
            mensagem: "Erro interno no servidor"
        })
    }
})


type HistoricoQuery = {
    user?: string
    agente?: string
}

routes.get("/api/v1/historico", async (req: Request<HistoricoQuery>, res: Response) => {
    try {
        const { user, agente } = req.query;

        console.log(user, agente)

        if (!agente || !user) {
            return res.status(500).json({
                status: false,
                historico: [],
                message: "user e agente são obrigatórios",
            })
        }
        const result = await coletarHistorico(Number(user), Number(agente));

        return res.status(200).json({
            status: true,
            historico: result,
            message: "Mensagens coletadas",
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: false,
            historico: [],
            message: "Erro interno no servidor",
        })
    }
})


routes.get("/api/v1/healths", (_: any, res: any) => {
    res.json({ status: "ok" });
});

export default routes;

// npm install --save-dev @types/cors