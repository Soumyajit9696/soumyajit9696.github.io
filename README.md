# Soumyajit Das — Personal Portfolio

Minimal **neobrutalism** portfolio for Soumyajit Das — physics postgraduate researcher (DFT,
2D materials) and scientific software developer (VaspViz, WallPrx).

**Live:** https://soumyajit9696.github.io/ · **License:** MIT · **Stack:** plain HTML + CSS + JS, no build step

## Pages

| Page | What's on it |
|------|--------------|
| `index.html` | Hero, stats, "What I do" cards, featured projects, latest blog posts, contact CTA |
| `about.html` | Hero: photo with sticker badges + live typing terminal, bio, stats, education & research timelines, beyond physics |
| `skills.html` | Filterable skill cards: 6 domain filters, category badges, proficiency meters (no progress bars) |
| `projects.html` | **Research Reports lead**: M.Sc. project (NIT Silchar) and summer internship (IISER Kolkata) as featured cards — details left, A4 front-page cover right, lightbox — then **VaspViz**, **WallPrx** & **Theorem** cards below |
| `gallery.html` | Filterable photo grid (B.Sc memory · NIT Diary · trips · physics · misc) + keyboard-friendly lightbox |
| `blog.html` | Latest Sci-Tech Science posts (live-refreshed from Blogger) |
| `resources.html` | Downloads grid (notes, bookshelf) + 48-book grid (12 per topic, search + toggleable topic pills) + playlist player with seek & volume |
| `404.html` | "Drifted out of the Brillouin zone" |

Sidebar navigation order: **Home · About · Skills · Projects · Gallery · Blog · Resources**

## Repository structure

```text
├── index.html … 404.html      # the 8 pages (Home · About · Skills · Projects · Gallery · Blog · Resources · 404)
├── style.css                  # the whole design system — no framework
├── js/                        # main.js, brutal-tools.js, cursor.js, palette.js, physics-fx.js
├── images/ fonts/ favicon/    # self-hosted assets (webp images, woff2 fonts, SVG favicon set)
├── docs/                      # CV & résumé (PDF)
├── Songs/ + favsong.mp3       # resources-page playlist
├── CITATION.cff               # GitHub “Cite this repository” metadata
├── sitemap.xml · robots.txt · site.webmanifest · llms.txt · llms-full.txt
└── LICENSE · README.md · .gitignore · .nojekyll
```

## Design system — minimal neobrutalism

- **Look:** sharp corners, 2px ink borders, hard offset shadows (`5px 5px 0`), paper background
- **Palette:** paper `#FAF8F2` / ink `#101014` / ultramarine `#2D4BFF` + yellow `#FFC700` and pink `#FF8AE2` sparks
- **Type:** Space Grotesk (display) + Inter (body), self-hosted woff2 with metric-override fallbacks
- **Dark mode:** cream borders + dim cream shadows, persisted in `localStorage`, no flash on load

All styles live in `style.css`; core interactions in `js/main.js` (vanilla, no dependencies).

## Interactive extras

- **Tools dock** (`js/brutal-tools.js`, bottom-right “Tools” button): draggable neobrutalist
  widgets — analog clock, BibTeX citation card, profile links and a feedback form (opens the
  visitor's mail app). Theme-synced, Shadow-DOM isolated, built lazily on first click so the
  page-load main-thread work stays near zero.
- **Atom Orbiter cursor** (`js/cursor.js`): the pointer is a live atom — the site's own mark,
  animated. A breathing nucleus dot marks the true pointer; three elliptical orbits (0°/60°/120°)
  ride a damped spring behind it (ζ ≈ 0.58), precessing and squashing along the velocity vector
  (length contraction). One electron per orbit spins up with the pointer's kinetic energy, each
  dragging a fading trail, while a comet wake of soft particles follows the pointer (additive
  glow in dark mode). Hover a link and the atom is *excited* — shells expand and tint accent,
  electrons jump to the spectrum colours and race; idle 1.6 s and it cools down; every click
  radiates two photon ring wavefronts plus a spectrum particle burst. The whole system sits
  exactly under the pointer (no magnetic offset), and the native OS cursor is fully hidden.
  Rendering is DPI-aware: the canvas carries an explicit CSS size and re-reads
  `devicePixelRatio` on every resize/monitor move, so the atom stays pixel-aligned
  and crisp on any display scale (100%–200%, incl. Windows 125%/150% laptops).
  Press **Shift+R** for a reading guide, **Shift+M** for the on-screen caliper
  (px/cm + angle), **Esc** to clear — tools need Shift so they can never fire
  accidentally, and the caliper shows a status chip and auto-clears 4.5 s after
  the second point. Auto-disabled on touch devices and for `prefers-reduced-motion`
  (native cursor), auto-themes with dark mode. Orbits scale gently with display
  density (`devicePixelRatio`, +15% at 2x) so the atom reads the same physical
  size on every screen.
- **Physics FX** (`js/physics-fx.js`, every page): a site-wide drifting chalkboard
  of physics equations. Each page carries its own set, matched to what the page
  is about — the classics on the home hero (E = mc², de Broglie, uncertainty,
  Maxwell…), the DFT world on About (Schrödinger, Hohenberg–Kohn, the SCF
  cycle ρ→V→ψ→ρ), the math kit on Skills (Fourier, gradient descent, the
  perceptron), the simulator's tools on Projects (DOS, Newton, Bragg), the
  optics bench on Gallery (grating, thin lens, Rayleigh criterion), information
  theory on Blog (Shannon, Bayes, the second law), student classics on
  Resources (photoelectric, Ohm, pendulum) and the physics of being lost on
  404. Equations rise slowly in faint italic serif and politely scatter away
  from the pointer. Purely ambient and decorative: `aria-hidden`,
  `pointer-events:none`, zero layout shift; pauses off-screen or tab-hidden;
  DPI-aware buffer (explicit CSS size + `devicePixelRatio` re-read); repulsion
  uses each rendered string's visible extent (measureText), so the far end of
  a long equation behaves properly; `prefers-reduced-motion` gets a calm
  static scatter. Heading text is lifted above the canvas (relative + z1) so
  the chalkboard always sits behind the type.
- **Reading progress bar** (`js/main.js` + `style.css`, every page): a thin accent
  progress bar along the very top edge fills as you read (rAF-throttled, GPU
  `scaleX`, zero layout shift, pointer-events none). Hidden in print.
- **Compact sidebar**: the left menu is tightened so it fits
  short laptop viewports (≤720 px tall) with no visible scrollbar at all
  (`scrollbar-width:none` + hidden WebKit track; still wheel-scrollable on
  very short screens).
- **Copy email** (About): the inline email address gets a one-tap **Copy** chip
  (clipboard API with `execCommand` fallback) and a small toast confirms the
  copy — recruiters never have to select text by hand again.
- **Reading time** (Blog): live post cards show an “≈ N min read” label computed
  from the full post content (200 wpm), with the site's yellow-square accent.
- **Welcome note** (home, once per session): a neobrutalist yellow card greets first-time
  visitors per session with a time-of-day greeting — "Good morning / afternoon / evening /
  night, visitor!" plus a live local-time chip, a matching well-wish ("Have a good day…")
  and a quantum-flavoured P.S. Accessible dialog (Esc / backdrop click to close,
  focus-trapped, zero layout shift), links straight into the projects page.

## Performance & SEO

- Zero render-blocking third parties — analytics (GTM/GA) loads only after user interaction
- LCP image + fonts preloaded; every `<img>` has explicit `width`/`height` (no CLS)
- Lazy-loading below the fold, deferred JS, `prefers-reduced-motion` respected
- Semantic HTML, one `<h1>` per page, `aria-current` nav, skip link, focus-visible outlines
- JSON-LD (Person, WebSite, SoftwareApplication, BreadcrumbList), canonical URLs, OG/Twitter cards
- `sitemap.xml`, `robots.txt` (AI-crawler friendly), `llms.txt` + `llms-full.txt` for AI agents

## Local preview

The site is fully static — any static file server works:

```bash
# from the repository root
python3 -m http.server 8000
# open http://localhost:8000
```

(The blog page refreshes its post cards live from Blogger, so keep an internet
connection on to see real posts.)

## Deploy

This repository **is** the site: push to the `main` branch of
[Soumyajit9696/soumyajit9696.github.io](https://github.com/Soumyajit9696/soumyajit9696.github.io)
and GitHub Pages serves it at <https://soumyajit9696.github.io/> with HTTPS and
gzip automatically. The `.nojekyll` file at the root disables Jekyll processing,
so Pages ships the files exactly as committed.

## Citation

If you want to cite this repository, use GitHub’s **“Cite this repository”**
button (APA & BibTeX, generated from [`CITATION.cff`](CITATION.cff)), or the
BibTeX below:

```bibtex
@misc{das2026website,
  author       = {Das, Soumyajit},
  title        = {Soumyajit Das -- Personal Portfolio Website},
  year         = {2026},
  url          = {https://soumyajit9696.github.io/},
  note         = {M.Sc. Physics, NIT Silchar. Creator of VaspViz: https://github.com/Soumyajit9696/VaspViz}
}
```

## License

The source code is released under the [MIT License](LICENSE). The design and
the written content (blog excerpts, CV, photos) are © 2026 Soumyajit Das —
please don’t reuse them as your own without permission.
