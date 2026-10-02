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
- CPN (/admin/cpn) routes certificates from data in cpn_certificate_routes (linked to cnj_tribunais); never hardcode route modality in UI or infer automatic issuance from the system name — routes must be registered/verified.
