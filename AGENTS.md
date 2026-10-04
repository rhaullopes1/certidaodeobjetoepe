<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- Process location is deterministic only (CNJ parser → cnj_* tables → DataJud adapter → team-registered units in comarcas_contatos); never use AI or infer the vara from the OOOO code — accuracy and traceable sources matter more than completeness.
- CPN (/admin/cpn) routes certificates from data in cpn_certificate_routes (linked to cnj_tribunais; one row per tribunal × system × grau × requester profile, with tipo_rota, steps, channels and an official source excerpt); displayed status stays VERIFICAR until an admin verifies it — never hardcode routes in UI or infer automatic issuance from the system name, because the catalog must only grow from verifiable official evidence.

- Back-office access = roles admin/equipe only (private.is_staff, src/lib/papeis.ts); operador_certidao reaches only /operacao and reads orders solely through security-definer RPCs scoped to its operador_pedidos assignments — keeps the operator isolated at the database level.
- /operacao is strictly operational: the operator has no direct SELECT on operador_pedidos, sees only tipo='certidao' attachments (table + storage), and every operator RPC uses an explicit column projection with no financial or admin fields (observacao_admin, valores, remuneração); admin-only notes go to pedido_andamentos.observacao_interna — so future operator staff can never reach commercial data.
- Future operator staff (titular → auxiliares) should be a new role plus an explicit authorization table checked inside the same operator RPCs, never broader table grants — keeps a single audited access path.
- Host-based branding lives only in src/lib/branding.ts (resolved once in the root beforeLoad via src/lib/host-atual.ts and read from route context); VITE_OPERATOR_PORTAL_HOST enables the Efficiency-branded operator portal (only /auth and /operacao*, no commercial scripts/links) — keeps white-label logic out of scattered conditionals and the commercial host unchanged when unset.
