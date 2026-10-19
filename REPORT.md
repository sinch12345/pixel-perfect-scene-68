# Task 2 Report: AI-Generated Build (Lovable) vs Hand-Coded Build

**Project:** Nestora, a property listing website
**AI tool:** [Lovable.dev](https://lovable.dev) (free plan)
**Live site (AI build):** https://pixel-perfect-scene-68.lovable.app
**Repository (AI build):** https://github.com/sinch12345/pixel-perfect-scene-68
**Task 1 (hand-coded) for comparison:** https://sinch12345.github.io/property-listing-site/

---

## 1. Approach

I chose Lovable because it exports a real React/TypeScript codebase, syncs to GitHub in one click and publishes a live link, which covers every submission requirement.

I wrote one structured master prompt containing:

- **Sections:** sticky header, hero with advanced search, stat strip, listings with a sticky filter sidebar, quick-view modal, Leaflet map, testimonials, "Why Nestora" cards, validated lead-capture form and footer.
- **Design tokens:** colour palette with WCAG AA contrast targets (navy `#0F172A`, teal `#0F766E`, amber `#F59E0B`), Plus Jakarta Sans and Inter, an 8px spacing grid, border radii, two shadow levels and explicit hover, focus, active and disabled states.
- **Controlled variables:** the same brand name, the same 8 properties with the same prices, and the same vibe filters as Task 1, so the comparison is about method and not content.
- **Deliberately different visuals:** Task 1 used a warm, editorial look with arched images. Task 2 used a cool, modern, high-trust look with rounded rectangles, to see what the AI does with a fresh design direction.

## 2. Generation efficiency

| Event | Result |
|---|---|
| First prompt sent | 5:50 pm |
| First working preview | about 10 minutes later (6:00 pm), when the free credits ran out mid-build |
| Prompts sent | 2 in total: 1 master prompt and 1 refinement prompt |
| Refinement prompt | sent the next day at 11:33 am, interrupted by the credit limit and left the build broken |
| Recovery | restored the previous version from Lovable's version history (no credits used) |
| Hand-fix | 15 minutes, one CSS rule, 0 credits |
| Total active time, start to finish | about 6 hours, including prompt writing, audit, Lighthouse runs, GitHub setup and publishing. Waiting for credits is excluded. |

The first generation scored **17 of 20 (85%)** on my feature checklist. The three misses were:

1. **Sticky filter sidebar:** missing.
2. **Grid/list toggle:** cropped cards.
3. **Map:** looked like an illustration at first.

The AI also added a "Saved homes" section that I had not asked for.

Free-plan credits ran out twice, which interrupted both the first generation and the refinement. The second interruption produced a "page didn't load" build. This is the biggest practical risk I found with AI builders on a free tier.

## 3. Layout and design differences

| | Task 1 (hand-coded) | Task 2 (Lovable) |
|---|---|---|
| Structure | 11 separate pages | 1 long single-page layout (chosen in my prompt) |
| Look | cream, forest green and terracotta; arch motif | slate, navy and teal; rounded rectangles |
| Hero | split layout with illustrated cards | full-bleed photo with a floating search card |
| Filtering | filter bar plus URL-shareable filters | sticky sidebar, removable chips, sort, grid/list toggle |
| Listing detail | separate detail page with gallery and payment calculator | quick-view modal with gallery, calculator and enquiry form |
| Map | interactive SVG neighbourhood map | real Leaflet and OpenStreetMap map that follows the filters |
| Extras only in Task 1 | compare page, list-a-property form, settings, day/night theme | n/a |
| Extras only in Task 2 | n/a | testimonial carousel, validated lead form, stat counters, real photography |
| Responsive | hand-written breakpoints | generated breakpoints that stack to one column on mobile with no horizontal scroll |

The scope is not identical. Task 1 had more pages and unique features, while Task 2 added conversion-focused components.

## 4. Performance (Lighthouse, home page, same method for both)

| Metric | Task 1 mobile | Task 2 mobile | Task 1 desktop | Task 2 desktop |
|---|---|---|---|---|
| Performance | **85** | 65 | 91 | 91 |
| Accessibility | 95 | **97** | **100** | 97 |
| Best Practices | **100** | **100** | **100** | **100** |
| SEO | **100** | **100** | **100** | **100** |
| First Contentful Paint | **2.9 s** | 3.3 s | 1.2 s | **1.0 s** |
| Largest Contentful Paint | **3.5 s** | 5.7 s | **1.2 s** | 1.3 s |
| Total Blocking Time | **0 ms** | 160 ms | **0 ms** | 40 ms |
| Cumulative Layout Shift | **0** | **0** | 0.105 | **0.004** |
| Speed Index | **3.6 s** | 6.4 s | **1.2 s** | 2.1 s |

**Reading the results:**

- On **desktop** the AI build matched the hand-coded site on Performance (91 each) and was far better on layout stability (CLS 0.004 vs 0.105), because the prompt required fixed image aspect ratios.
- On **mobile** the hand-coded site is clearly faster. The AI build is a React single-page app, so the browser must download and run a large JavaScript bundle, and it loads photography and a map in the same page. Lighthouse flagged 7.4 s of main-thread work and about 111 KiB of unused JavaScript in an earlier run.
- **Accessibility** is about equal: the AI followed the contrast and semantic-HTML instructions well, with labelled fields, `aria-pressed` on toggles and live regions for status messages.
- **Caveats:** Task 2 mobile scores varied between runs (39, then 51, then 65). Early runs were affected by a slow network and an open console, so the final run is the headline figure. Task 1 uses illustrations while Task 2 uses real photos, which makes the comparison favour Task 1 on loading speed.

## 5. Code size and maintainability

| | Task 1 | Task 2 |
|---|---|---|
| Source lines | about 5,300 | about 6,050 |
| Lines I would maintain | about 5,300 | about 1,680 (the rest is generated UI-library code) |
| Generated UI-library files | 0 | 46 files, 4,368 lines, of which only 8 are used |
| Dependencies | 0 | 54 runtime and 22 dev |
| Stack | HTML, CSS, JavaScript | React 19, TanStack Start, Tailwind v4, shadcn/ui, Leaflet |
| Styling | one 2,744-line CSS file | one 601-line CSS file of custom classes |

**Audit findings:**

- **The prompt asked for about 10 separate components, but almost everything is in one file.** `Marketplace.tsx` is only 278 lines but 41 KB, with very long lines. Only the map got its own file.
- **The task brief expected "heavy utility classes", but the AI mostly wrote custom CSS classes.**
- **38 of 46 generated UI files are unused.** They add clutter to audit but probably little to the production bundle.
- **The README is leftover template text** and had to be replaced.
- **CSS order bug.** The list-view rule (single column) was overridden by a later responsive 3-column rule, so list cards were squeezed and clipped. One added rule fixed it.

## 6. Comparative framework

**Speed of execution.** The AI produced a complete, styled, responsive layout with search, filters, modal, map and forms in about 10 minutes. By my own estimate the hand-coded site took about 8 hours. The end-to-end AI workflow still took about 6 hours once I included writing a detailed prompt, auditing the output, recovering from credit limits and a broken build, fixing a bug, publishing and measuring. The speed gain is real for the first draft, but it is smaller across the whole task, and the work shifts from writing syntax to reviewing, testing and debugging.

**Layout flexibility and scalability.** The AI let me change the whole visual identity (palette, fonts, shapes, hero style) from a text prompt alone, something that would have meant rewriting a large CSS file by hand. The limits were the tool's own component library and the cost of changes: a multi-part follow-up prompt used up the free credits and broke the build. Splitting the page into several routes would also mean refactoring one large file first. The hand-coded site gave complete control and a multi-page structure that loads faster, but sweeping design changes were slow.

**Code cleanliness and maintainability.** The hand-coded project has no dependencies, a predictable structure and nothing I did not write. The AI project works and is accessible, but it carries a large generated library, a monolithic component file, 76 dependencies and leftover template files. It needs a targeted clean-up before it is easy to maintain.

## 7. Conclusion

**Verdict.** For this project, the hand-coded build was the better finished product, while the AI-generated build was the better starting point. Neither approach won outright, because each was better at different things.

**Where the AI build (Lovable) was better.** It produced a complete, responsive, styled layout in about 10 minutes, compared with about 8 hours of hand-coding. It let me change the whole visual identity from a single prompt, and it delivered conversion-focused components out of the box: a quick-view modal, sticky filters, a validated lead form, testimonials and a real Leaflet map. It also gave much better desktop layout stability (CLS 0.004 against 0.105).

**Where the hand-coded build was better.** It was faster on mobile (Lighthouse performance 85 against 65) because it ships no JavaScript framework and splits the site across separate pages. Its code is cleaner and easier to maintain, with zero dependencies and a predictable structure, whereas the AI build brought 76 dependencies, a monolithic component file and leftover template code. It also gave complete control, with no credit limits and no surprises.

**Where they were about equal.** Desktop performance was the same (91 each), and accessibility was very close (97 against 95 on mobile, 97 against 100 on desktop). Speed to a finished, verified product was also roughly even, because auditing the AI output, recovering from a broken build and hand-fixing bugs took about 6 hours in total.

**Recommendation.** The most effective workflow was hybrid: let the AI generate the layout, then audit it and fix the gaps by hand. Fixing the last issue by hand took 15 minutes and no credits, whereas waiting for AI credits would have taken a day. For a production property site, I would use AI to explore and draft, then hand-refine for performance and code quality.
