# Plano premium: formulário de 1 passo, garantia de 5 dias úteis e app mobile

Baseado no relatório de auditoria enviado, com três frentes aprovadas: formulário sem atrito, garantia + linguagem simples, e experiência mobile tipo aplicativo. O rastreamento automático por WhatsApp fica de fora — apenas botões de suporte humano mais visíveis.

## 1. Formulário inteligente de 1 passo

Hoje a solicitação tem duas etapas ("Etapa 1 de 2"), com dados do processo separados de quantidade, valor e contatos.

O que muda:
- Tela única, com o resumo do valor sempre visível numa barra fixa no rodapé (no celular) ou coluna lateral (no computador), atualizando conforme a quantidade de certidões.
- O reconhecimento automático do número do processo (tribunal, estado, cidade, comarca, sistema e ano) continua aparecendo logo abaixo do campo, agora como primeira prova de que o pedido está correto.
- Aviso claro quando o dígito verificador não confere, sem travar o envio.
- Botão único "Continuar para o pagamento", com o mesmo controle de validação campo a campo já existente.
- Certidões adicionais viram blocos que se abrem sob demanda, sem trocar de tela.

## 2. Garantia de prazo e linguagem simples

- Selo de garantia: "Certidão em até 5 dias úteis ou devolvemos 100% do valor", exibido na home, na página de solicitação, no resumo do pedido e na página de acompanhamento.
- Página curta explicando a garantia (prazo contado a partir da confirmação do pagamento, exceções de processo em segredo de justiça ou tribunal fora do ar) e link no rodapé e nos termos.
- Micro-copy humanizado: revisão dos textos para trocar termos jurídicos por linguagem cotidiana em todo o fluxo de compra (formulário, resumo, acompanhamento, e-mails). Exemplos: "parte envolvida" → "nome de quem está no processo"; "emolumentos/taxas do tribunal" → "taxa do tribunal já inclusa"; "protocolo" ganha explicação "seu número de acompanhamento".
- Bloco de apoio humano: quando o pedido fica parado, expira ou o processo corre em segredo de justiça, aparece um aviso com botão direto de WhatsApp e e-mail de suporte (sem envio automático).

## 3. Experiência mobile tipo aplicativo (PWA) e velocidade

- Manifesto do app, ícones e cores da marca para o site poder ser instalado na tela inicial do celular.
- Service worker leve para carregamento instantâneo em visitas repetidas, sempre buscando dados novos de pedidos (nada de status desatualizado em cache).
- Convite discreto de "Instalar app" apenas no celular, dispensável.
- Ajustes de performance: imagens em formato moderno com carregamento adiado, fontes com carregamento otimizado e revisão dos maiores blocos da home para reduzir o tempo até a primeira interação.
- Checkout: destaque do Pix copia e cola/QR Code e habilitação das carteiras digitais (Apple Pay / Google Pay) no cartão, mantendo a confirmação automática atual.

## Fora deste plano

- Envio automático de status por WhatsApp (exige contratar API oficial).
- Área B2B de pedidos em lote com desconto — fica para uma etapa seguinte.

## Detalhes técnicos

- `src/routes/solicitar.tsx`: remover o estado `etapa` e o `avancar`, unificando os campos num único `form`; manter `validarCampo`, `certidaoCompleta`, `PainelReconhecimento` e o envio via `criarPedido`; adicionar resumo fixo (`sticky`) com `precoCentavos`.
- Garantia: constante `GARANTIA_DIAS_UTEIS = 5` e texto em `src/lib/site.ts`; novo componente de selo reutilizado em `index.tsx`, `solicitar.tsx`, `pedido.$protocolo.tsx` e `acompanhar.tsx`; nova rota `src/routes/garantia.tsx` com `head()` próprio e entrada no `sitemap[.]xml.ts`.
- Micro-copy: revisão de rótulos em `solicitar.tsx`, `src/lib/site.ts` (status/FAQ) e templates de e-mail em `src/lib/email-templates/`.
- PWA: `public/manifest.webmanifest`, ícones 192/512, `<link rel="manifest">` no `__root.tsx`, service worker próprio em `public/sw.js` registrado após hidratação (sem plugin novo no Vite), com `NetworkFirst` para rotas de dados e `CacheFirst` só para estáticos.
- Checkout: em `src/lib/stripe.server.ts`, manter `payment_method_types` com `card`+`pix` e habilitar carteiras via `automatic_payment_methods` quando aplicável.
- Sem mudanças de banco de dados.
