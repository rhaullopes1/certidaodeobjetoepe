import React from 'react'
import {
  Body,
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
  certidoes?: Certidao[]
  url?: string
}

const mascararCpf = (cpf?: string) => {
  const d = (cpf ?? '').replace(/\D/g, '')
  if (d.length !== 11) return cpf ?? '—'
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}

const Email = ({ protocolo, quantidade = 1, valor, certidoes = [], url }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{`Pedido ${protocolo ?? ''} recebido — Certidão de Objeto e Pé`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Certidão de Objeto e Pé</Text>
        <Heading style={h1}>Recebemos sua solicitação</Heading>
        <Text style={text}>
          Seu pedido foi registrado com sucesso. Guarde o número de protocolo abaixo para
          acompanhar o andamento.
        </Text>

        <Section style={box}>
          <Text style={label}>Protocolo</Text>
          <Text style={protocoloStyle}>{protocolo ?? '—'}</Text>
          <Text style={label}>Quantidade de certidões</Text>
          <Text style={value}>{quantidade}</Text>
          {valor ? (
            <>
              <Text style={label}>Valor total</Text>
              <Text style={value}>{valor}</Text>
            </>
          ) : null}
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
                <Text style={itemLine}>{`CPF: ${mascararCpf(c.cpf)}`}</Text>
                {c.observacoes ? (
                  <Text style={itemLine}>{`Observação: ${c.observacoes}`}</Text>
                ) : null}
              </Section>
            ))}
          </Section>
        ) : null}

        <Hr style={hr} />
        <Text style={text}>
          {url
            ? `Acompanhe o status e o pagamento em: ${url}`
            : 'Acompanhe o status do pedido pelo site usando seu número de protocolo.'}
        </Text>
        <Text style={footer}>
          Este é um e-mail automático de confirmação do seu pedido.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Pedido ${data?.['protocolo'] ?? ''} recebido — Certidão de Objeto e Pé`.trim(),
  displayName: 'Confirmação de pedido',
  previewData: {
    protocolo: 'COP-2026-ABC123',
    quantidade: 2,
    valor: 'R$ 497,00',
    url: 'https://certidaodeobjetoepe.org/pedido/COP-2026-ABC123',
    certidoes: [
      { numeroProcesso: '0001234-56.2024.8.26.0100', nomeParte: 'Maria Silva Souza', cpf: '12345678901' },
      { numeroProcesso: '0009876-54.2023.8.13.0024', nomeParte: 'João Pereira Lima', cpf: '98765432100' },
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
const footer = { fontSize: '12px', color: '#6B7A90', margin: '0' }
