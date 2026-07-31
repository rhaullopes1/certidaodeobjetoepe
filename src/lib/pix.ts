// Gerador de BR Code (Pix "copia e cola") — padrão EMV do Banco Central.

function tlv(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, max);
}

export function gerarPixCopiaECola({
  chave,
  nome,
  cidade,
  valorCentavos,
  txid,
}: {
  chave: string;
  nome: string;
  cidade: string;
  valorCentavos: number;
  txid: string;
}) {
  const merchantAccount = tlv("00", "br.gov.bcb.pix") + tlv("01", chave);
  const valor = (valorCentavos / 100).toFixed(2);
  const referencia = sanitize(txid, 25).replace(/ /g, "") || "***";

  const payload =
    tlv("00", "01") +
    tlv("26", merchantAccount) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", valor) +
    tlv("58", "BR") +
    tlv("59", sanitize(nome, 25)) +
    tlv("60", sanitize(cidade, 15)) +
    tlv("62", tlv("05", referencia)) +
    "6304";

  return payload + crc16(payload);
}