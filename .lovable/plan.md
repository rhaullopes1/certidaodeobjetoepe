# Responsividade mobile do painel administrativo

O projeto usa React (TanStack Start) com Tailwind CSS v4 e componentes shadcn/ui — todo o ajuste será feito com classes utilitárias do Tailwind.

## Diagnóstico

A meta tag de viewport já está correta no layout raiz. O estouro horizontal no celular vem do cabeçalho do painel: os cinco links (Pedidos, Histórico, Recuperação, E-mails, Documentos) ficam em uma linha fixa junto com logo e botão "Sair", sem quebra nem recolhimento. As tabelas já estão em contêineres com rolagem própria, mas o corpo da página não trava o eixo X, então a rolagem "vaza" para a página inteira.

## O que será feito

1. **Trava global de eixo X**
   - Em `src/styles.css`, aplicar `width: 100%`, `max-width: 100vw` e `overflow-x: hidden` em `html, body`.

2. **Cabeçalho do painel com menu hambúrguer**
   - No `AdminHeader` (usado por todas as telas do backoffice): no mobile mostrar logo + botão de menu; os links e o "Sair" passam para um painel expansível abaixo do cabeçalho.
   - A partir de `md:`, volta ao layout horizontal atual, sem mudança visual no desktop.
   - Título do cabeçalho com `truncate` e contêiner com `min-w-0` para nunca vazar.

3. **Conteúdo das páginas**
   - Padding mobile `px-4` (mantendo `sm:px-8`), `w-full` e `break-words` em títulos/parágrafos longos nas telas: Pedidos, Histórico, Recuperação, E-mails, Documentos e detalhe do pedido.
   - Filtros e formulários em coluna única no mobile; campos com `min-w-0` para não empurrar a largura.

4. **Tabelas e listas**
   - Confirmar que toda tabela está dentro de um wrapper `overflow-x-auto` com `w-full` (as três atuais já estão) e adicionar `max-w-full` onde necessário, para que a rolagem aconteça só dentro da tabela.
   - Itens de lista do histórico com `min-w-0` e `break-words` para textos longos (protocolo, observação).

## Escopo

Apenas apresentação e layout: nenhuma alteração em regras de negócio, consultas, e-mails ou pagamentos.
