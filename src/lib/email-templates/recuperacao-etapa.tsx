import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  assunto?: string
  corpo?: string
  titulo?: string
}

const Email = ({ assunto, corpo, titulo }: Props) => {
  const linhas = (corpo ?? '').split('\n')
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>{assunto ?? 'Seu pedido aguarda pagamento'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Certidão de Objeto e Pé</Text>
          <Heading style={h1}>{titulo ?? assunto ?? 'Seu pedido aguarda pagamento'}</Heading>
          {linhas.map((linha, i) =>
            linha.trim() === '' ? (
              <Text key={i} style={espaco}>
                &nbsp;
              </Text>
            ) : (
              <Text key={i} style={text}>
                {linha}
              </Text>
            ),
          )}
          <Text style={footer}>
            Se você já pagou, desconsidere este aviso. Pedidos sem pagamento expiram após 7 dias.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    (data?.['assunto'] as string) ?? 'Seu pedido aguarda pagamento',
  displayName: 'Recuperação de pedido pendente',
  previewData: {
    assunto: 'Seu pedido COP2026ABC123 está quase pronto',
    corpo: 'Olá Maria,\n\nSeu pedido COP2026ABC123 ainda aguarda pagamento.\n\nValor do pedido: R$ 197,00\n\nLink: https://certidaodeobjetoepe.org/pedido/COP2026ABC123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '600px' }
const brand = {
  fontSize: '13px',
  letterSpacing: '1px',
  color: '#B08D3F',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}
const h1 = { fontSize: '22px', color: '#0B1F3A', margin: '0 0 16px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#233047', margin: '0 0 6px' }
const espaco = { margin: '0 0 10px', fontSize: '6px', lineHeight: '6px' }
const footer = { fontSize: '12px', color: '#6b7280', marginTop: '24px' }
