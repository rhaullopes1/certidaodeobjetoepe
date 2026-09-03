# Atualização completa, correção de erros e alta performance

O trabalho cobrirá o site público, área do cliente e painel administrativo, preservando regras de negócio, pedidos existentes, autenticação e integrações.

## 1. Diagnóstico e linha de base

- Executar verificação de tipos e build de produção para localizar erros reais de compilação, SSR e rotas.
- Testar com navegador os fluxos essenciais: home, menu, solicitação, pedido/pagamento, acompanhamento, login, minha conta e páginas administrativas.
- Registrar erros de console, falhas de rede, links quebrados, overflow mobile e tempos/peso de carregamento antes das mudanças.
- Separar falhas corrigíveis no código de bloqueios externos. A geração do checkout Stripe continuará dependente de uma chave com permissão `checkout_session_write`; enquanto isso, o Pix e a mensagem de contingência devem permanecer utilizáveis.

## 2. Navegação rápida e consistente

- Configurar preload por intenção nos links e um tempo de validade adequado para impedir recargas imediatas de loaders já pré-carregados.
- Revisar links internos, redirecionamentos permanentes do blog, restauração de rolagem, foco e estados pendentes das rotas.
- Padronizar a experiência de carregamento no site, na conta e no painel com skeletons/estados de espera, evitando telas vazias durante autenticação ou busca de dados.
- Manter o menu responsivo recém-implementado e validar abertura, fechamento, teclado, destinos e navegação em celular e desktop.

## 3. Redução do JavaScript e recursos críticos

- Retirar o `jsPDF` do carregamento inicial das rotas de pedido, acompanhamento e administração; carregar o gerador somente quando o usuário clicar para baixar o comprovante.
- Carregar QR Code e outros recursos opcionais apenas nas telas e momentos em que forem necessários.
- Otimizar a imagem principal para LCP, mantendo dimensões estáveis e prioridade correta sem prejudicar qualidade.
- Hospedar localmente as fontes Sora e Manrope em WOFF2, com `font-display: swap`, removendo requisições bloqueantes ao Google Fonts.
- Remover dependências/importações não utilizados apenas quando a análise confirmar que não há consumidores.

## 4. Dados rápidos no site, conta e backoffice

- Centralizar as consultas em opções reutilizáveis do TanStack Query, com `staleTime`, cache e invalidação coerentes.
- Iniciar consultas no preload/loader das rotas seguras e consumir o cache na tela, eliminando o efeito “abre página, depois começa a buscar”.
- Reduzir chamadas repetidas de perfil e permissão de equipe em cada navegação, invalidando o cache somente quando login, logout ou dados mudarem.
- Manter atualização em tempo real onde é necessária, mas interromper ou desacelerar polling quando pedido/pagamento chegar a um status final.
- Preservar a proteção da área autenticada e adicionar feedback imediato enquanto a sessão é validada.

## 5. Entrega rápida das páginas públicas

- Atualizar `@lovable.dev/vite-tanstack-config` para uma versão compatível com pré-renderização confiável.
- Pré-renderizar somente páginas públicas com conteúdo igual para todos os visitantes: home, institucionais, guias, blog, tribunais, estados e públicos específicos.
- Usar uma lista explícita de URLs e excluir rigorosamente pedido, acompanhamento com dados, autenticação, minha conta, admin e endpoints.
- Manter SSR/dados dinâmicos onde houver sessão, protocolo ou conteúdo particular.

## 6. Correções funcionais e robustez

- Corrigir erros encontrados no build, console, rede e navegação durante a auditoria, sem alterar preços ou regras comerciais.
- Concluir os redirecionamentos 301 dos artigos consolidados e garantir que sitemap e links internos só apontem para URLs canônicas.
- Revisar o service worker para atualização segura do cache, sem armazenar respostas privadas, APIs ou funções do servidor.
- Garantir mensagens de erro e ações de recuperação claras no formulário, checkout, acompanhamento e painel.
- Confirmar que rotas privadas continuam com `noindex` e que páginas públicas mantêm metadados próprios.

## 7. Validação final

- Rodar verificação de tipos e build de produção sem erros.
- Fazer testes de ponta a ponta nos fluxos público, cliente e administrativo, incluindo falhas e recuperação.
- Validar em 320 px, tablet e desktop: ausência de rolagem horizontal, textos legíveis e controles acessíveis.
- Comparar quantidade de requisições, JavaScript carregado, LCP/CLS e tempo de navegação antes/depois.
- Confirmar que páginas públicas, arquivos estáticos e rotas profundas respondem corretamente no ambiente de produção.

## Detalhes técnicos confirmados

- `src/router.tsx` invalida atualmente o preload de rotas imediatamente (`defaultPreloadStaleTime: 0`).
- `src/lib/comprovante-pdf.ts` importa `jsPDF` estaticamente, e três rotas carregam esse módulo mesmo sem download do PDF.
- Consultas em pedido, conta e painel começam somente após a montagem e, em vários pontos, não definem política de cache.
- As fontes são carregadas por stylesheet externo no layout raiz.
- A configuração de build está em `@lovable.dev/vite-tanstack-config` 2.13.1; pré-renderização confiável exige 2.20.0 ou superior.
- O projeto já possui divisão automática de código por rota, dimensões na imagem principal e cache seguro para APIs; esses pontos serão preservados.
