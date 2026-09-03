# Substituir bloco de garantia por CTA de WhatsApp no formulário

## Contexto

Na página `/solicitar`, o bloco `<SeloGarantia className="mt-6" />` exibe:

> Certidão em até 5 dias úteis ou devolvemos 100% do valor — como funciona

O usuário quer substituí-lo por um bloco direto e focado em conversão via WhatsApp, para ajudar clientes que não sabem o número completo do processo.

## Mudança

Em `src/routes/solicitar.tsx`, substituir a linha `<SeloGarantia className="mt-6" />` (linha ~438) por um bloco com:

- Texto: "Não sabe o número completo do processo? Fale com a nossa equipe no WhatsApp que ajudamos você a identificar agora mesmo."
- Botão/link: "Falar com Especialista" — abre o WhatsApp (`whatsappLink(...)` já importado de `@/lib/site`) com mensagem pré-preenchida sobre ajuda com o número do processo.

O bloco mantém o estilo visual do restante da página (cartão `rounded-2xl border border-input bg-card`), com ícone do WhatsApp (lucide `MessageCircle`) e o link abrindo em nova aba com `rel="noopener noreferrer"`.

## Fora de escopo

- O `SeloGarantia` continua sendo usado na home, no resumo do pedido e no acompanhamento — sem alterações nesses locais.
- `GARANTIA_TITULO` e `GARANTIA_DIAS_UTEIS` em `src/lib/site.ts` não mudam.
