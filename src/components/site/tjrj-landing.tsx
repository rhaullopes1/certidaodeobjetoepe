import { Link } from "@tanstack/react-router";
import { Scale, MessageCircle, Phone, MapPin, Landmark, FileText, Info } from "lucide-react";
import { whatsappLink, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { UserMenu } from "@/components/user-menu";

const SITE = "https://certidaodeobjetoepe.org";
export const TJRJ_URL = `${SITE}/certidao-de-objeto-e-pe/rj`;
const URL = TJRJ_URL;
const TITLE = "Certidão de Objeto e Pé RJ (TJRJ): Como Solicitar Online";
const DESC =
  "Como solicitar a Certidão de Objeto e Pé de processos do TJRJ, no Rio de Janeiro: quem emite, dados necessários, PJe e eproc, 2º grau, processos arquivados e acompanhamento.";

const COMARCAS = [
  "Rio de Janeiro (Capital)",
  "Niterói",
  "São Gonçalo",
  "Duque de Caxias",
  "Nova Iguaçu",
  "Campos dos Goytacazes",
  "Petrópolis",
  "Volta Redonda",
];

const FAQ_TJRJ: { q: string; a: string }[] = [
  {
    q: "O que é a Certidão de Objeto e Pé no TJRJ?",
    a: "É uma certidão judicial emitida pelo Tribunal de Justiça do Estado do Rio de Janeiro que informa o objeto da ação, as partes e a situação atual do processo. Ela apenas descreve o processo; não o encerra nem o remove.",
  },
  {
    q: "Quem emite a certidão?",
    a: "A unidade judicial do TJRJ onde o processo tramita ou tramitou (cartório da vara no 1º grau ou secretaria do órgão julgador no 2º grau). O certidaodeobjetoepe.org não é órgão público: fazemos a solicitação por você e acompanhamos o pedido.",
  },
  {
    q: "Que dados preciso informar?",
    a: "O número do processo e o nome da parte. Com eles localizamos a comarca, a unidade e o sistema em que o processo está. Se você não tiver o número, fale com a nossa equipe antes de pedir.",
  },
  {
    q: "É possível pedir para processo eletrônico?",
    a: "Sim. No TJRJ, processos eletrônicos tramitam no PJe, no Portal de Serviços e, de forma gradativa desde 2024, no eproc. Identificamos o sistema do seu processo antes de fazer o pedido.",
  },
  {
    q: "E para processo físico ou arquivado?",
    a: "Também é possível, mas o atendimento depende da unidade judicial. Processos arquivados podem precisar de desarquivamento, que tem custas próprias na tabela do TJRJ, e costumam levar mais tempo.",
  },
  {
    q: "O que acontece em processo sob segredo de justiça?",
    a: "O acesso é restrito. Em regra, a certidão só pode ser fornecida a quem tem legitimidade no processo, e a emissão depende da análise da unidade judicial.",
  },
  {
    q: "A certidão do TJRJ é usada em compra e venda de imóvel?",
    a: "Pode ser pedida. Quando aparece ação em nome do vendedor, cartórios e bancos costumam solicitar a certidão para entender o objeto e a situação do processo.",
  },
  {
    q: "Quanto tempo demora?",
    a: "O prazo de emissão é de 1 a 5 dias úteis, conforme a comarca e o tribunal emissor.",
  },
];

export function tjrjHead() {
  return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "pt-BR", href: URL },
      { rel: "alternate", hrefLang: "x-default", href: URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${URL}#webpage`,
          url: URL,
          name: TITLE,
          description: DESC,
          inLanguage: "pt-BR",
          about: { "@type": "GovernmentOrganization", name: "Tribunal de Justiça do Estado do Rio de Janeiro" },
          publisher: { "@id": `${SITE}/#organization` },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${URL}#faq`,
          inLanguage: "pt-BR",
          mainEntity: FAQ_TJRJ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE },
            { "@type": "ListItem", position: 2, name: "Estados atendidos", item: `${SITE}/certidao-de-objeto-e-pe` },
            { "@type": "ListItem", position: 3, name: "Rio de Janeiro (TJRJ)", item: URL },
          ],
        }),
      },
    ],
  };
}

__BODY__