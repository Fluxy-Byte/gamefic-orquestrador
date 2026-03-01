import { OpenAPIV3 } from "openapi-types";

export const swaggerDocument: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "API WhatsApp Campaign & CRM",
        description: "API para campanhas, contatos, reuniões, problemas, WABA, agentes, vendas e webhook Meta",
        version: "1.0.0",
    },

    servers: [
        {
            url: "http://localhost:5202/api/v1",
            description: "Servidor Local",
        },
        {
            url: "https://gamefic-orquestrador.egnehl.easypanel.host/api/v1",
            description: "Servidor Prod",
        }
    ],

    tags: [
        { name: "Webhook" },
        { name: "Campaign" },
        { name: "Vendas" },
        { name: "Contacts" },
        { name: "Reuniões" },
        { name: "Problemas" },
        { name: "RD Station" },
        { name: "WABA" },
        { name: "Agent" },
        { name: "Histórico" },
        { name: "Health" },
    ],

    paths: {
        /* =========================
           WEBHOOK META
        ========================== */
        "/receptive/webhook": {
            get: {
                tags: ["Webhook"],
                summary: "Validação do Webhook Meta",
                parameters: [
                    { name: "hub.mode", in: "query", required: true, schema: { type: "string" } },
                    { name: "hub.challenge", in: "query", required: true, schema: { type: "string" } },
                    { name: "hub.verify_token", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Webhook validado com sucesso" },
                    403: { description: "Token inválido" },
                },
            },
            post: {
                tags: ["Webhook"],
                summary: "Recebe mensagens e status do WhatsApp",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object", additionalProperties: true },
                        },
                    },
                },
                responses: {
                    200: { description: "Evento recebido" },
                },
            },
        },

        /* =========================
           CAMPAIGN
        ========================== */
        "/campaign": {
            post: {
                tags: ["Campaign"],
                summary: "Criar campanha",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    payload: {
                                        type: "object",
                                        required: ["numbers", "template_name", "type"],
                                        properties: {
                                            numbers: {
                                                type: "array",
                                                items: { type: "string" },
                                            },
                                            template_name: { type: "string" },
                                            type: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Campanha inserida na fila" },
                    401: { description: "Dados inválidos" },
                },
            },
            get: {
                tags: ["Campaign"],
                summary: "Listar campanhas",
                parameters: [
                    { name: "idOrganizacao", in: "query", required: true, schema: { type: "string" } },
                    { name: "idWaba", in: "query", required: true, schema: { type: "number" } },
                ],
                responses: {
                    200: { description: "Campanhas retornadas" },
                },
            },
        },

        "/contacts-campaing": {
            get: {
                tags: ["Campaign"],
                summary: "Listar contatos da campanha",
                parameters: [
                    { name: "idCampanha", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Contatos retornados" },
                },
            },
        },

        /* =========================
           VENDAS
        ========================== */
        "/vendas": {
            post: {
                tags: ["Vendas"],
                summary: "Criar venda",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name_template", "dados"],
                                properties: {
                                    name_template: { type: "string" },
                                    dados: { type: "object", additionalProperties: true },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Venda inserida na fila" },
                },
            },
        },

        /* =========================
           CONTACTS
        ========================== */
        "/contacts": {
            get: {
                tags: ["Contacts"],
                summary: "Listar contatos",
                parameters: [
                    { name: "waba_id", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Lista de contatos" },
                },
            },
        },

        "/contact": {
            get: {
                tags: ["Contacts"],
                summary: "Buscar contato por telefone",
                parameters: [
                    { name: "phone", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Contato encontrado" },
                    404: { description: "Contato não encontrado" },
                },
            },
            post: {
                tags: ["Contacts"],
                summary: "Criar ou buscar contato",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["phone", "idWaba"],
                                properties: {
                                    phone: { type: "string" },
                                    idWaba: { type: "number" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Contato retornado" },
                },
            },
            put: {
                tags: ["Contacts"],
                summary: "Atualizar dados do contato",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["phone"],
                                properties: {
                                    phone: { type: "string" },
                                    name: { type: "string" },
                                    email: { type: "string" },
                                    empresa: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Contato atualizado" },
                    400: { description: "Dados inválidos" },
                },
            },
        },

        "/contact/name": {
            put: {
                tags: ["Contacts"],
                summary: "Atualizar nome do contato",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                required: ["phone", "name"],
                                type: "object",
                                properties: {
                                    phone: { type: "string" },
                                    name: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Nome atualizado" },
                },
            },
        },

        /* =========================
           REUNIÕES
        ========================== */
        "/contact-reuniao": {
            get: {
                tags: ["Reuniões"],
                summary: "Listar reuniões do contato",
                parameters: [
                    { name: "phone", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Reuniões encontradas" },
                },
            },
            post: {
                tags: ["Reuniões"],
                summary: "Criar reunião",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                required: ["phone", "data_reuniao", "contexto_da_reuniao"],
                                type: "object",
                                properties: {
                                    phone: { type: "string" },
                                    data_reuniao: { type: "string" },
                                    contexto_da_reuniao: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Reunião criada" },
                },
            },
        },

        /* =========================
           PROBLEMAS
        ========================== */
        "/contact-problema": {
            get: {
                tags: ["Problemas"],
                summary: "Listar problemas do contato",
                parameters: [
                    { name: "phone", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Problemas encontrados" },
                },
            },
            post: {
                tags: ["Problemas"],
                summary: "Criar problema",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                required: ["phone", "data_do_problema", "contexto_da_conversa", "local_do_problema"],
                                type: "object",
                                properties: {
                                    phone: { type: "string" },
                                    data_do_problema: { type: "string" },
                                    contexto_da_conversa: { type: "string" },
                                    local_do_problema: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Problema criado" },
                },
            },
        },

        /* =======================
       WABA
    ======================= */
        "/api/v1/waba": {
            post: {
                tags: ["WABA"],
                summary: "Criar WABA",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    phone_number_id: { type: "string", example: "1234567890" },
                                    display_phone_number: { type: "string", example: "+5511999999999" },
                                    idOrganization: { type: "string", example: "org_123" },
                                    idAgente: { type: "number", example: 1 }
                                },
                                required: [
                                    "phone_number_id",
                                    "display_phone_number",
                                    "idOrganization",
                                    "idAgente"
                                ]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "WABA criado com sucesso" },
                    400: { description: "Dados inválidos" }
                }
            },

            get: {
                tags: ["WABA"],
                summary: "Buscar WABA",
                parameters: [
                    {
                        name: "phone_number_id",
                        in: "query",
                        required: false,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    200: { description: "WABA(s) encontrado(s)" }
                }
            },

            put: {
                tags: ["WABA"],
                summary: "Atualizar WABA",
                parameters: [
                    {
                        name: "phone_number_id",
                        in: "query",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    agentId: { type: "number", example: 2 },
                                    displayPhoneNumber: { type: "string", example: "+5511888888888" },
                                    organizationId: { type: "string", example: "org_456" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "WABA atualizado" },
                    400: { description: "Erro ao atualizar WABA" }
                }
            }
        },

        "/api/v1/list-wabas": {
            get: {
                tags: ["WABA"],
                summary: "Listar WABAs por organização",
                parameters: [
                    {
                        name: "organization_id",
                        in: "query",
                        required: false,
                        schema: { type: "string", example: "org_123" }
                    }
                ],
                responses: {
                    200: { description: "Lista de WABAs" }
                }
            }
        },

        /* =======================
   AGENT
======================= */
        "/api/v1/agent": {
            get: {
                tags: ["Agent"],
                summary: "Listar agentes",
                parameters: [
                    {
                        name: "id_agent",
                        in: "query",
                        required: false,
                        schema: { type: "string", example: "1" }
                    },
                    {
                        name: "organization_id",
                        in: "query",
                        required: false,
                        schema: { type: "string", example: "org_123" }
                    }
                ],
                responses: {
                    200: { description: "Agentes encontrados" }
                }
            },

            post: {
                tags: ["Agent"],
                summary: "Criar agente",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string", example: "Agente Vendas" },
                                    url: { type: "string", example: "https://meu-agente.com/webhook" },
                                    organizationId: { type: "string", example: "org_123" }
                                },
                                required: ["name", "url", "organizationId"]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Agente criado com sucesso" },
                    400: { description: "Erro nos dados enviados" }
                }
            },

            put: {
                tags: ["Agent"],
                summary: "Atualizar agente",
                parameters: [
                    {
                        name: "id_agent",
                        in: "query",
                        required: true,
                        schema: { type: "string", example: "1" }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string", example: "Agente Atualizado" },
                                    url: { type: "string", example: "https://novo-endpoint.com" },
                                    mensagem: { type: "string", example: "Mensagem padrão do agente" }
                                },
                                required: ["name", "url"]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Agente atualizado" },
                    400: { description: "Erro ao atualizar agente" }
                }
            }
        },

        /* =========================
           RD STATION
        ========================== */
        "/rdcrm": {
            get: {
                tags: ["RD Station"],
                summary: "Buscar lead no RD Station",
                parameters: [
                    { name: "name", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Lead retornado" },
                },
            },
            post: {
                tags: ["RD Station"],
                summary: "Criar lead no RD Station",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object", additionalProperties: true },
                        },
                    },
                },
                responses: {
                    200: { description: "Lead criado" },
                },
            },
        },

        /* =========================
           HISTÓRICO
        ========================== */
        "/historico": {
            get: {
                tags: ["Histórico"],
                summary: "Buscar histórico de mensagens",
                parameters: [
                    { name: "user", in: "query", required: true, schema: { type: "string" } },
                    { name: "agente", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Histórico retornado" },
                },
            },
        },

        /* =========================
           HEALTH
        ========================== */
        "/healths": {
            get: {
                tags: ["Health"],
                summary: "Health check",
                responses: {
                    200: { description: "API online" },
                },
            },
        },
    },
};