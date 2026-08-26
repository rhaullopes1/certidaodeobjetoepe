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

interface Props {
  protocolo?: string
  valor?: string
  url?: string
}

const Email = ({ protocolo, valor, url }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{`Seu pedido ${protocolo ?? ''} aguarda o pagamento — Certidão de Objeto e Pé`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Certidão de Objeto e Pé</Text>
        <Heading style={h1}>Seu pedido aguarda o pagamento</Heading>
        <Text style={text}>
          Identificamos que o pedido abaixo ainda não foi pago. Para não perder a solicitação,
          conclua o pagamento pelo link.
        </Text>

        <Section style={box}>
          <Text style={label}>Protocolo</Text>
          <Text style={protocoloStyle}>{protocolo ?? '—'}</Text>
          {valor ? (
            <>
              <Text style={label}>Valor total</Text>
              <Text style={value}>{valor}</Text>
            </>
          ) : null}
        </Section>

        <Hr style={hr} />
        <Text style={text}>
          {url
            ? `Pague e acompanhe o pedido em: ${url}`
            : 'Acompanhe o pedido pelo site usando seu número de protocolo.'}
        </Text>
        <Text style={footer}>
          Pedidos sem pagamento expiram após 7 dias. Se você já pagou, desconsidere este aviso.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Lembrete: pedido ${data?.['protocolo'] ?? ''} aguarda pagamento`.trim(),
  displayName: 'Lembrete de pagamento pendente',
  previewData: {
    protocolo: 'COP-2026-ABC123',
    valor: 'R$ 297,00',
    url: 'https://certidaodeobjetoepe.org/pedido/COP-2026-ABC123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '600px' }
const brand = { fontSize: '13px', letterSpacing: '1px', color: '#B08D3F', margin: '0 0 8px', textTransform: 'uppercase' as const }
const h1 = { fontSize: '24px', color: '#0B1F3A', margin: '0 0 12px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#33415C', margin: '0 0 12px' }
const box = { backgroundColor: '#F4F6FA', borderRadius: '10px', padding: '16px 18px', margin: '16px 0' }
const label = { fontSize: '12px', color: '#6B7A90', margin: '8px 0 2px', textTransform: 'uppercase' as const }
const value = { fontSize: '16px', color: '#0B1F3A', margin: '0', fontWeight: 700 }
const protocoloStyle = { fontSize: '20px', color: '#0B1F3A', margin: '0', fontWeight: 700, letterSpacing: '1px' }
const hr = { borderColor: '#E3E8EF', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#6B7A90', margin: '0' }
