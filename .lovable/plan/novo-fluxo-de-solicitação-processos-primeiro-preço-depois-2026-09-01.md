# Novo fluxo de solicitação: processos primeiro, preço depois

Reformular `/solicitar` para uma tela única, sem preço, focada em captar os processos e os dados do solicitante. O valor só aparece na tela de resumo, junto com o Pix.

## Tela 1 — Solicitação (sem nenhum valor em R$)

**Blocos de processo (dinâmicos)**
- Começa com um bloco obrigatório.
- Cada bloco tem: número do processo (máscara CNJ), nome completo da parte daquele processo, as informações reconhecidas automaticamente em formato de pílulas discretas (tribunal, segmento, estado, cidade, comarca/foro, ano) e um campo de observação próprio com o texto de apoio "Observações para este processo (ex: solicitar denúncia do Ministério Público, certidão de inteiro teor, etc.)".
- Botão secundário elegante [ + Adicionar outro processo ] logo abaixo do último bloco.
- Blocos adicionais ganham um ícone discreto de lixeira no canto superior direito para remoção.
- Limite de 5 processos por pedido (mesmo teto da tabela atual); ao atingir, o botão de adicionar é substituído por um aviso curto orientando a falar com o atendimento para volumes maiores.

**Dados do solicitante (uma única vez, ao final)**
- E-mail (sem confirmação dupla), nome completo, CPF e WhatsApp com DDD.
- Sem campo de senha.

**CTA**
- Botão grande em azul-marinho profundo com acabamento metálico: **"Solicitar Orçamento e Enviar Pedido"**.
- Nenhum preço, tabela de pacotes ou selo com valor nesta tela. O selo de garantia continua, mas sem menção a valores.

## Criação automática da conta (em segundo plano)

Ao enviar, o site cria o pedido e dispara um acesso sem senha por e-mail (link mágico) usando o e-mail informado, guardando nome, CPF e WhatsApp no cadastro. O pedido é vinculado automaticamente à conta assim que ela é confirmada, então o cliente encontra tudo em "Minha conta" sem nunca digitar senha. Se o envio do e-mail falhar, o pedido continua válido e o cliente segue normalmente pelo protocolo.

## Tela 2 — Resumo e pagamento

Redireciona para a página do protocolo já existente, reorganizada para começar pelo resumo:
- Lista de todos os processos enviados, com a parte e a observação de cada um.
- Valor total calculado pela quantidade de certidões (1 = R$ 297,00 e pacotes proporcionais).
- Botão direto **"Gerar QR Code e Código Pix"**, com cartão como alternativa.

## Detalhes técnicos

- `src/lib/pedidos.schema.ts`: adicionar `observacoes` opcional (até 1000 caracteres) em `certidaoSchema`; manter `nomeParte` por processo; tornar o CPF um dado do solicitante (um por pedido) em vez de por certidão; `quantidade` e `valorTotalCentavos` passam a ser derivados no servidor a partir de `certidoes.length`, não mais enviados pela tela.
- `src/routes/solicitar.tsx`: reescrever o corpo do formulário com uma lista `processos[]` (add/remove), reconhecimento CNJ por bloco via `decodificarProcesso` com debounce por índice, remoção do seletor de quantidade, da tabela de preços, da barra fixa de valor e de todos os campos de senha/confirmação.
- Criação de conta: substituir `signUp`/`signInWithPassword` por `supabase.auth.signInWithOtp` com `shouldCreateUser: true` e metadados (nome, CPF, WhatsApp). A vinculação do pedido ao usuário já acontece pelo gatilho existente por e-mail.
- `src/lib/pedidos.server.ts`: gravar as observações por certidão no JSON de `certidoes`, calcular o total pela tabela oficial e manter a gravação de UF/cidade a partir do primeiro processo reconhecido.
- `src/routes/pedido.$protocolo.tsx`: exibir a lista de processos com parte e observação e destacar o botão de Pix com o novo texto.
- `src/lib/admin.ts` e templates de e-mail: mostrar a observação de cada processo onde hoje só aparece a observação geral.
- Ajustar o `head()` de `/solicitar` (título e descrição sem promessa de valor imediato) e revalidar tudo com `bunx tsgo --noEmit` e um teste de navegador em mobile e desktop.

## Fora do escopo

- Mudança na tabela de preços ou nos pacotes.
- Alteração do provedor de pagamento (segue Stripe com Pix e cartão).
- Fluxo de orçamento manual: o valor continua automático, apenas deixa de aparecer antes do resumo.
