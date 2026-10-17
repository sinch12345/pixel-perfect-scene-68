# Nestora property marketplace

## Outcome
Replace the starter page with a polished, conversion-focused single-page home marketplace based on the uploaded brief.

## Work
- Establish a semantic teal-and-slate design system and app-specific page metadata.
- Add typed sample listings and build responsive navigation, hero search, filters, listing cards, saved homes, quick views, neighborhood map, social proof, lead capture, and footer.
- Make filtering, sorting, view toggles, saved homes, quick-view calculator, and enquiry forms usable with keyboard-accessible controls.
- Verify the home page, core interactions, tests, and the current preview build.

## Technical notes
- Keep the page at `/` and use existing TanStack Start and shadcn UI patterns.
- Isolate any Leaflet code from server rendering; use browser-only rendering for the map.
- Keep the requested demo listings as local typed data; no backend or persistence beyond in-page state is needed.