/* =====================================================
   ENUMS
===================================================== */

export enum Role {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
}

/* =====================================================
   AGENT
===================================================== */

export interface Agent {
  id: number;
  name: string;
  url: string;
  mensagem?: string | null;
  organizationId?: string | null;

  wabas?: Waba[];
  logContatoComAgente?: LogContatoComAgente[];
}

/* =====================================================
   WABA
===================================================== */

export interface Waba {
  id: number;
  phoneNumberId: string;
  displayPhoneNumber: string;

  qtdContatos?: number | null;
  qtdConversao?: number | null;

  organizationId: string;
  agentId: number;

  agent?: Agent;
  campanha?: Campanha[];
  contactWabas?: ContactWaba[];
  logContatoComAgente?: LogContatoComAgente[];
}

/* =====================================================
   CONTACT ↔ WABA (JOIN)
===================================================== */

export interface ContactWaba {
  id: number;
  contactId: number;
  wabaId: number;

  contact?: Contact;
  waba?: Waba;
}

/* =====================================================
   CONTACT
===================================================== */

export interface Contact {
  id: number;
  email?: string | null;
  name?: string | null;
  phone: string;
  empresa?: string | null;

  startDateConversation: Date;
  lastDateConversation?: Date | null;

  contactWabas?: ContactWaba[];
  contatosCampanha?: ContatosCampanha[];
  logContatoComAgente?: LogContatoComAgente[];
  reunioes?: ReunioesContato[];
  problemas?: ProblemasContato[];
}

/* =====================================================
   REUNIÕES DO CONTATO
===================================================== */

export interface ReunioesContato {
  id: number;
  data_reuniao: string;
  contexto_da_reuniao: string;

  contactId: number;
  contact?: Contact;
}

/* =====================================================
   PROBLEMAS DO CONTATO
===================================================== */

export interface ProblemasContato {
  id: number;
  data_do_problema: string;
  local_do_problema: string;
  contexto_da_conversa: string;

  contactId: number;
  contact?: Contact;
}

/* =====================================================
   RD STATION
===================================================== */

export interface Rdstation {
  id: number;
  name: string;

  access_token: string;
  token_type: string;
  expires_in: number;

  refresh_token: string;
  expires_at?: Date | null;
}

/* =====================================================
   CAMPANHA
===================================================== */

export interface Campanha {
  id: number;
  name: string;

  qtdDeContatos: number;
  qtdDeFalhas: number;
  qtdDeEnviadas: number;

  dataDeEnvio: Date;
  nameTemplate: string;

  id_organizacao: string;
  id_waba: number;

  waba?: Waba;
  contatosCampanha?: ContatosCampanha[];
}

/* =====================================================
   CONTATOS DA CAMPANHA
===================================================== */

export interface ContatosCampanha {
  id: number;
  status: string;
  body_retorno?: string | null;

  id_campanha: number;
  id_contato: number;

  contact?: Contact;
  campanha?: Campanha;
}

/* =====================================================
   LOG DE CONTATO COM AGENTE
===================================================== */

export interface LogContatoComAgente {
  id: number;
  day: string;

  id_contato: number;
  id_agent: number;
  id_waba: number;

  contact?: Contact;
  agent?: Agent;
  waba?: Waba;
}