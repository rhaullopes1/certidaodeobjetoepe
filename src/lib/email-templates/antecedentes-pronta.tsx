import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  protocolo?: string
  nome?: string
  numero?: string
  emissao?: string
  validade?: string
  mensagem?: string
  pdfUrl?: string
  url?: string
}

const Email = ({
  protocolo,
  nome,
  numero,
  emissao,
  validade,
  mensagem,
  pdfUrl,
  url,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{`Sua Certidão de Antecedentes Criminais Federal está pronta`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Sua certidão está pronta</Heading>
        <Text style={p}>
          {nome ? `${nome}, a` : 'A'} Certidão de Antecedentes Criminais emitida pela Polícia
          Federal foi concluída e está disponível abaixo.
        </Text>

        {pdfUrl && (
          <Section style={{ margin: '24px 0' }}>
            <Button style={botao} href={pdfUrl}>
              Abrir certidão em PDF
            </Button>
          </Section>
        )}

        <Section style={caixa}>
          {protocolo && <Text style={linha}>Protocolo do pedido: <b>{protocolo}</b></Text>}
          {numero && <Text style={linha}>Número da certidão: <b>{numero}</b></Text>}
          {emissao && <Text style={linha}>Emitida em: <b>{emissao}</b></Text>}
          {validade && <Text style={linha}>Válida até: <b>{validade}</b></Text>}
        </Section>

        {mensagem && (
          <>
            <Hr style={hr} />
            <Text style={citacao}>{mensagem}</Text>
          </>
        )}

        <Hr style={hr} />
        <Text style={rodape}>
          O documento é emitido diretamente pelos sistemas da Polícia Federal e pode ser
          conferido pelo número da certidão no site do órgão emissor.
        </Text>
        {url && (
          <Text style={rodape}>
            Acompanhe o pedido em <a href={url}>{url}</a>
          </Text>
        )}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Sua Certidão de Antecedentes Criminais Federal está pronta',
  displayName: 'Antecedentes criminais — certidão pronta',
  previewData: {
    protocolo: 'COP2026ABCDEFGH',
    nome: 'Maria Souza',
    numero: '1111111111111',
    emissao: '21/12/2025 15:20:32',
    validade: '20/03/2026',
    mensagem:
      'A Polícia Federal CERTIFICA, após pesquisa no Sistema Nacional de Informações Criminais - SINIC, que até a presente data, NÃO CONSTA condenação com trânsito em julgado em nome de MARIA SOUZA.',
    pdfUrl: 'https://exemplo.com/certidao.pdf',
    url: 'https://certidaodeobjetoepe.org/pedido/COP2026ABCDEFGH',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', color: '#0f2744', margin: '0 0 12px' }
const p = { fontSize: '15px', lineHeight: '24px', color: '#243b53' }
const caixa = {
  backgroundColor: '#f5f7fa',
  borderRadius: '10px',
  padding: '14px 18px',
  margin: '18px 0',
}
const linha = { fontSize: '14px', lineHeight: '22px', color: '#243b53', margin: '2px 0' }
const citacao = { fontSize: '14px', lineHeight: '22px', color: '#334e68', fontStyle: 'italic' as const }
const botao = {
  backgroundColor: '#0f2744',
  color: '#ffffff',
  borderRadius: '10px',
  padding: '13px 22px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
}
const hr = { borderColor: '#e2e8f0', margin: '20px 0' }
const rodape = { fontSize: '12px', lineHeight: '19px', color: '#627d98' }
