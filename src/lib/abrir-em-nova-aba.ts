/**
 * Abre uma nova aba no próprio clique (antes de qualquer await) para não ser
 * bloqueada como pop-up (Safari/iOS, Opera), corta o opener por segurança e só
 * então aponta para o link assinado. Se falhar, fecha a aba vazia e repassa o erro.
 */
export async function abrirEmNovaAba(obterUrl: () => Promise<string>): Promise<void> {
  const aba = window.open("about:blank", "_blank");
  if (aba) aba.opener = null;
  try {
    const url = await obterUrl();
    if (aba && !aba.closed) aba.location.replace(url);
    else window.location.assign(url);
  } catch (e) {
    aba?.close();
    throw e;
  }
}
