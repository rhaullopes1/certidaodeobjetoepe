import { jsPDF } from "jspdf";
import { formatarBRL, statusPedido } from "./site";

export type ComprovanteDados = {
  protocolo: string;
  numeroProcesso: string;
  nomeParte?: string | null;
  cpf: string;
  quantidade: number;
  email: string;
  whatsapp: string;
  valorCentavos: number;
  status: string;
  criadoEm: string;
  pagoEm?: string | null;
  observacoes?: string | null;
  certidoes: { numeroProcesso: string; nomeParte: string; cpf: string }[];
};

const NAVY: [number, number, number] = [12, 32, 64];
const GOLD: [number, number, number] = [176, 141, 60];
const CINZA: [number, number, number] = [110, 118, 130];

function dataBR(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

/** Gera o comprovante do pedido em PDF e devolve o documento jsPDF. */
export function gerarComprovantePedido(p: ComprovanteDados) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const larguraPagina = doc.internal.pageSize.getWidth();
  const alturaPagina = doc.internal.pageSize.getHeight();
  const margem = 48;
  let y = 0;

  // Cabeçalho
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, larguraPagina, 96, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Certidão de Objeto e Pé", margem, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(214, 219, 228);
  doc.text("Comprovante de solicitação — certidaodeobjetoepe.org", margem, 64);
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Protocolo ${p.protocolo}`, larguraPagina - margem, 44, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Emitido em ${new Date().toLocaleString("pt-BR")}`, larguraPagina - margem, 62, {
    align: "right",
  });

  y = 132;

  function titulo(texto: string) {
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(texto, margem, y);
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1.2);
    doc.line(margem, y, margem + 48, y);
    y += 18;
  }

  function linha(label: string, valor: string) {
    if (y > alturaPagina - 90) {
      doc.addPage();
      y = 72;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...CINZA);
    doc.text(label, margem, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 36, 48);
    const texto = doc.splitTextToSize(valor, larguraPagina - margem * 2 - 170);
    doc.text(texto, larguraPagina - margem, y, { align: "right" });
    y += 14 * texto.length + 6;
    doc.setDrawColor(226, 230, 236);
    doc.setLineWidth(0.6);
    doc.line(margem, y - 8, larguraPagina - margem, y - 8);
  }

  const st = statusPedido(p.status);

  titulo("Dados do pedido");
  linha("Serviço", "Certidão de Objeto e Pé");
  linha("Protocolo", p.protocolo);
  linha("Situação", st.label);
  linha("Solicitado em", dataBR(p.criadoEm));
  if (p.pagoEm) linha("Pagamento confirmado em", dataBR(p.pagoEm));
  linha("Quantidade", `${p.quantidade} ${p.quantidade > 1 ? "certidões" : "certidão"}`);
  linha("Valor total", formatarBRL(p.valorCentavos));

  y += 14;
  titulo("Contato do solicitante");
  linha("E-mail", p.email);
  linha("WhatsApp", p.whatsapp);

  y += 14;
  titulo("Certidões solicitadas");
  const lista =
    p.certidoes.length > 0
      ? p.certidoes
      : [{ numeroProcesso: p.numeroProcesso, nomeParte: p.nomeParte ?? "—", cpf: p.cpf }];

  lista.forEach((c, i) => {
    if (y > alturaPagina - 120) {
      doc.addPage();
      y = 72;
    }
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margem, y - 12, larguraPagina - margem * 2, 74, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(`Certidão ${i + 1}`, margem + 14, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 68, 80);
    doc.text(`Processo: ${c.numeroProcesso}`, margem + 14, y + 24);
    doc.text(`Parte: ${c.nomeParte}`, margem + 14, y + 40);
    doc.text(`CPF: ${c.cpf}`, margem + 14, y + 56);
    y += 88;
  });

  if (p.observacoes) {
    if (y > alturaPagina - 120) {
      doc.addPage();
      y = 72;
    }
    y += 6;
    titulo("Observações");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 68, 80);
    const obs = doc.splitTextToSize(p.observacoes, larguraPagina - margem * 2);
    doc.text(obs, margem, y);
    y += 14 * obs.length;
  }

  // Rodapé em todas as páginas
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...CINZA);
    doc.text(
      "Este documento é um comprovante de solicitação de serviço e não substitui a certidão emitida pelo tribunal.",
      margem,
      alturaPagina - 42,
      { maxWidth: larguraPagina - margem * 2 },
    );
    doc.text(`Página ${i} de ${total}`, larguraPagina - margem, alturaPagina - 26, {
      align: "right",
    });
    doc.text("certidaodeobjetoepe.org", margem, alturaPagina - 26);
  }

  return doc;
}

export function baixarComprovantePedido(p: ComprovanteDados) {
  gerarComprovantePedido(p).save(`comprovante-${p.protocolo}.pdf`);
}
