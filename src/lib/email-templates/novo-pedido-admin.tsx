import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Certidao {
  numeroProcesso?: string
  nomeParte?: string
  cpf?: string
  observacoes?: string | null
}

interface Props {
  protocolo?: string
  quantidade?: number
  valor?: string
  email?: string
  whatsapp?: string
  certidoes?: Certidao[]
  url?: string
}

const Email = ({ protocolo, quantidade = 1, valor, email, whatsapp, certidoes = [], url }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{`Novo pedido ${protocolo ?? ''} — Certidão de Objeto e Pé`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Certidão de Objeto e Pé</Text>
        <Heading style={h1}>Novo pedido recebido</Heading>
        <Text style={text}>
          Um cliente acabou de solicitar certidões pelo site. Dados resumidos abaixo.
        </Text>

        <Section style={box}>
          <Text style={label}>Protocolo</Text>
          <Text style={protocoloStyle}>{protocolo ?? '—'}</Text>
          <Text style={label}>Quantidade</Text>
          <Text style={value}>{quantidade}</Text>
          {valor ? (
            <>
              <Text style={label}>Valor total</Text>
              <Text style={value}>{valor}</Text>
            </>
          ) : null}
          <Text style={label}>E-mail do cliente</Text>
          <Text style={value}>{email ?? '—'}</Text>
          <Text style={label}>WhatsApp do cliente</Text>
          <Text style={value}>{whatsapp ?? '—'}</Text>
        </Section>

        {certidoes.length > 0 ? (
          <Section>
            <Heading as="h2" style={h2}>
              Certidões solicitadas
            </Heading>
            {certidoes.map((c, i) => (
              <Section key={i} style={item}>
                <Text style={itemTitle}>{`Certidão ${i + 1}`}</Text>
                <Text style={itemLine}>{`Processo: ${c.numeroProcesso ?? '—'}`}</Text>
                <Text style={itemLine}>{`Parte: ${c.nomeParte ?? '—'}`}</Text>
                <Text style={itemLine}>{`CPF: ${c.cpf ?? '—'}`}</Text>
                {c.observacoes ? (
                  <Text style={itemLine}>{`Observação: ${c.observacoes}`}</Text>
                ) : null}
              </Section>
            ))}
          </Section>
        ) : null}

        <Hr style={hr} />
        {url ? (
          <>
            <Text style={text}>
              Acompanhe e gerencie o pedido no painel administrativo:
            </Text>
            <Link href={url} style={button}>Abrir no painel</Link>
          </>
        ) : null}
        <Text style={footer}>
          E-mail automático enviado a cada nova venda pelo site.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Novo pedido ${data?.['protocolo'] ?? ''} — Certidão de Objeto e Pé`.trim(),
  displayName: 'Notificação interna de novo pedido',
  previewData: {
    protocolo: 'COP-2026-ABC123',
    quantidade: 2,
    valor: 'R$ 497,00',
    email: 'cliente@example.com',
    whatsapp: '11999999999',
    url: 'https://certidaodeobjetoepe.org/admin/COP-2026-ABC123',
    certidoes: [
      { numeroProcesso: '0001234-56.2024.8.26.0100', nomeParte: 'Maria Silva Souza', cpf: '123.456.789-01' },
      { numeroProcesso: '0009876-54.2023.8.13.0024', nomeParte: 'João Pereira Lima', cpf: '987.654.321-00' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '600px' }
const brand = { fontSize: '13px', letterSpacing: '1px', color: '#B08D3F', margin: '0 0 8px', textTransform: 'uppercase' as const }
const h1 = { fontSize: '24px', color: '#0B1F3A', margin: '0 0 12px' }
const h2 = { fontSize: '17px', color: '#0B1F3A', margin: '20px 0 8px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#33415C', margin: '0 0 12px' }
const box = { backgroundColor: '#F4F6FA', borderRadius: '10px', padding: '16px 18px', margin: '16px 0' }
const label = { fontSize: '12px', color: '#6B7A90', margin: '8px 0 2px', textTransform: 'uppercase' as const }
const value = { fontSize: '16px', color: '#0B1F3A', margin: '0', fontWeight: 700 }
const protocoloStyle = { fontSize: '20px', color: '#0B1F3A', margin: '0', fontWeight: 700, letterSpacing: '1px' }
const item = { borderLeft: '3px solid #B08D3F', padding: '4px 0 4px 12px', margin: '0 0 12px' }
const itemTitle = { fontSize: '14px', color: '#0B1F3A', fontWeight: 700, margin: '0 0 4px' }
const itemLine = { fontSize: '14px', color: '#33415C', margin: '0 0 2px' }
const hr = { borderColor: '#E3E8EF', margin: '20px 0' }
const button = {
  display: 'inline-block',
  backgroundColor: '#0B1F3A',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  margin: '8px 0 16px',
}
const footer = { fontSize: '12px', color: '#6B7A90', margin: '0' }
