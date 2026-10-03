import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meusPapeis, ehAdministrativo, ehOperador } from "@/lib/papeis";

// Barreira de todo o /admin: só admin/equipe. Operador vai para /operacao sem carregar dados.
export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const papeis = await meusPapeis();
    if (ehAdministrativo(papeis)) return;
    if (ehOperador(papeis)) throw redirect({ to: "/operacao" });
    throw redirect({ to: "/minha-conta" });
  },
  component: () => <Outlet />,
});
