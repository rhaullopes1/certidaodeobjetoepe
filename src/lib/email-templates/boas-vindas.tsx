import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  assunto?: string
  corpo?: string
}

const Email = ({ assunto, corpo }: Props) => {
  const linhas = (corpo ?? '').split('\n')
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>{assunto ?? 'Bem-vindo(a) à Certidão de Objeto e Pé'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Certidão de Objeto e Pé</Text>
          <Heading style={h1}>{assunto ?? 'Sua conta foi criada'}</Heading>
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
          <Button style={botao} href="https://certidaodeobjetoepe.org/minha-conta">
            Acessar minha conta
          </Button>
          <Text style={footer}>
            Atendimento 0800 000 4604 — certidaodeobjetoepe.org
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    (data?.['assunto'] as string) ?? 'Bem-vindo(a) à Certidão de Objeto e Pé',
  displayName: 'Boas-vindas ao novo cliente',
  previewData: {
    assunto: 'Bem-vindo(a) à Certidão de Objeto e Pé, Maria',
    corpo: 'Olá Maria,\n\nSua conta foi criada com sucesso.\n\nEquipe Certidão de Objeto e Pé',
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
const botao = {
  display: 'inline-block',
  marginTop: '18px',
  backgroundColor: '#0B1F3A',
  color: '#ffffff',
  borderRadius: '10px',
  padding: '12px 22px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#6b7280', marginTop: '24px' }
