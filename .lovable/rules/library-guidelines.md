# Certidão de objeto e pé — Guidelines

## Components

The design system exports these components — import them from `@ws-08de5d984df3deba4c32/65572438-586d-4b2b-a4d1-e0ac34b1c95f` and compose them before building anything from scratch:

`AlternativasContato`, `BlogContent`, `Button`, `Constants`, `LinksRelacionados`, `PageShell`, `SeloGarantia`, `SiteHeader`, `TrfLanding`, `UserMenu`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-08de5d984df3deba4c32/65572438-586d-4b2b-a4d1-e0ac34b1c95f/styles.css` (source — preferred import)
- `@ws-08de5d984df3deba4c32/65572438-586d-4b2b-a4d1-e0ac34b1c95f/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

