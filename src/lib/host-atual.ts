import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

/** Host da requisição atual: cabeçalho no servidor, window.location no navegador. */
export const hostAtual = createIsomorphicFn()
  .server(() => {
    try {
      return getRequestHost();
    } catch {
      return "";
    }
  })
  .client(() => window.location.host);
