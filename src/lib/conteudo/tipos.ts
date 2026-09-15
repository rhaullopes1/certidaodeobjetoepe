export const NICHOS = {
  caminhoneiros: "Caminhoneiros e transportadores",
  motoristas_app: "Motoristas de aplicativo",
} as const;

export type Nicho = keyof typeof NICHOS;

export const CANAIS = [
  { id: "blog", nome: "Blog / SEO" },
  { id: "google_business", nome: "Google Business Profile" },
  { id: "youtube", nome: "YouTube Shorts" },
  { id: "tiktok", nome: "TikTok" },
  { id: "instagram", nome: "Instagram / Reels" },
  { id: "facebook", nome: "Facebook" },
] as const;

export type CanalId = (typeof CANAIS)[number]["id"];

export const STATUS_ITEM = [
  "draft",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
] as const;

export type StatusItem = (typeof STATUS_ITEM)[number];

export interface Agenda {
  horarioCaminhoneiros: string;
  horarioMotoristas: string;
  timezone: string;
  ativo: boolean;
  modoTeste: boolean;
}

export const AGENDA_PADRAO: Agenda = {
  horarioCaminhoneiros: "08:00",
  horarioMotoristas: "18:00",
  timezone: "America/Sao_Paulo",
  ativo: true,
  modoTeste: true,
};

export function rotuloStatus(s: string) {
  const mapa: Record<string, string> = {
    draft: "Rascunho",
    approved: "Aprovado",
    scheduled: "Agendado",
    publishing: "Publicando",
    published: "Publicado",
    failed: "Falhou",
    skipped: "Não publicado (canal sem conexão)",
  };
  return mapa[s] ?? s;
}

export function utmUrl(canal: string, nicho: string, caminho = "/solicitar") {
  const base = `https://certidaodeobjetoepe.org${caminho}`;
  const p = new URLSearchParams({
    utm_source: canal,
    utm_medium: canal === "blog" ? "organic" : "social",
    utm_campaign: `cop-${nicho}`,
  });
  return `${base}?${p.toString()}`;
}
