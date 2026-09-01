# Botão de acesso vira "Painel do usuário"

Hoje o botão "Entrar" no topo leva a uma tela escrita como área da equipe ("Painel da equipe", "Criar conta da equipe", "Entrar no painel") e, após o login, joga todo mundo em `/admin`. A tela passa a ser a porta de entrada do cliente; o acesso da equipe continua existindo, mas sem aparecer no site principal.

## Como vai ficar

1. A tela de acesso passa a se chamar **Painel do usuário**, com o texto "Acesse sua conta ou crie uma conta para acompanhar seus pedidos, ver o status e pagar pedidos pendentes".
2. Botões e links reescritos para o cliente: "Entrar na minha conta", "Criar minha conta", "Ainda não tem conta? Criar conta" / "Já tenho conta — entrar". Entrar com Google continua igual.
3. Depois de entrar (e-mail/senha ou Google), o cliente vai direto para **/minha-conta**, e não mais para o painel administrativo.
4. Quem é da equipe entra pelo mesmo botão e cai em `/minha-conta`; o acesso ao back office continua no menu do topo (item "Back office", que só aparece para a equipe) e pela URL `/admin`, que segue protegida.
5. Nenhuma menção a "equipe", "acesso restrito" ou "painel administrativo" fica visível no site principal.

## Detalhes técnicos

- `src/routes/auth.tsx`:
  - `head()`: título/descrição do cliente ("Minha conta | Certidão de Objeto e Pé"), mantendo `noindex`.
  - Trocar os três `navigate({ to: "/admin" })` (sessão existente, login por senha, Google) e o `emailRedirectTo` do cadastro por `/minha-conta`.
  - Reescrever títulos, subtítulo, rótulos dos botões e o texto de alternância entre entrar/criar; ajustar o aviso de confirmação de e-mail.
- Nada muda em `/admin`, no gate `_authenticated` ou nas permissões — apenas texto e destino do redirecionamento.
