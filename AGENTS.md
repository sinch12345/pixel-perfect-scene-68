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

- Keep the Nestora page in small domain-specific sections under `src/components/nestora` and its typed mock listings in `src/data` so the route composes presentation while reusable listing facts remain separate.
- Render Leaflet only through a lazy import inside ClientOnly, with its stylesheet imported in the global CSS import block, so server rendering stays browser-safe and map tiles retain their positioning.
