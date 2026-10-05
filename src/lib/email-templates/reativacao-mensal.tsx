import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  nome?: string
  protocolo?: string
  processo?: string
  valor?: string
  parcela?: string
  url?: string
}

const Email = ({ nome, protocolo, processo, valor, parcela, url }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{`Seu pedido ${protocolo ?? ''} continua salvo — agora em até 3x no cartão`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Certidão de Objeto e Pé</Text>
        <Heading style={h1}>{nome ? `${nome}, seu pedido continua salvo` : 'Seu pedido continua salvo'}</Heading>
        <Text style={text}>
          Você havia solicitado a Certidão de Objeto e Pé do seu processo, mas o pagamento não foi
          concluído. Sabemos que nem sempre dá para pagar à vista, por isso agora você pode
          pagar por Pix ou parcelar no cartão.
        </Text>
        <Section style={box}>
          <Text style={label}>Protocolo</Text>
          <Text style={value}>{protocolo ?? '—'}</Text>
          {processo ? (<><Text style={label}>Processo</Text><Text style={value}>{processo}</Text></>) : null}
          {valor ? (<><Text style={label}>Valor</Text><Text style={value}>{valor}{parcela ? ` ou 3x de ${parcela} no cartão` : ''}</Text></>) : null}
        </Section>
        {url ? (
          <Section style={{ textAlign: 'center' as const, margin: '20px 0' }}>
            <Button href={url} style={button}>Concluir meu pedido</Button>
          </Section>
        ) : null}
        <Text style={text}>
          Ao abrir o link, seu pedido é reativado com os mesmos dados — não precisa preencher nada
          de novo. Assim que o pagamento for confirmado, ele entra na fila de emissão. Prazo de
          emissão: de 1 a 5 dias úteis, variando de acordo com a comarca e o tribunal emissor.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Se você não precisa mais da certidão, desconsidere esta mensagem.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `${data?.['nome'] ? `${data['nome']}, s` : 'S'}eu pedido de Certidão de Objeto e Pé agora pode ser parcelado em 3x`,
  displayName: 'Reativação mensal (dias 5 e 10)',
  previewData: {
    nome: 'Maria',
    protocolo: 'COP2026ABC123',
    processo: '0000000-00.2024.8.26.0100',
    valor: 'R$ 247,00',
    parcela: 'R$ 82,33',
    url: 'https://certidaodeobjetoepe.org/pedido/COP2026ABC123',
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
const button = { backgroundColor: '#0B1F3A', color: '#ffffff', borderRadius: '999px', padding: '14px 28px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }
const hr = { borderColor: '#E3E8EF', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#6B7A90', margin: '0' }
