# Portfolio reference draft

Private working clone of https://tareqmahmud.info/, requested as a starting point for Prabhath’s portfolio. Original copy, portraits, project imagery and CV belong to the reference designer and are temporary reference content. Replace before sharing publicly.

## Editing
- `dist/index.html`: navigation, hero, summary, process, capabilities, about, contact and footer templates.
- `dist/styles.css`: styling and responsive layouts.
- `dist/portfolio.js`: animation, smooth scrolling, project card rendering, tabs, menu and copy email.
- `dist/img`, `dist/media`, `dist/logos`: local reference assets.

No original analytics are retained. Fonts and icons are stored locally.

## Animated project showcase
`dist/project-showcase.js` renders the existing project content into vertical cards, adds keyboard/pointer controls, and mounts the carousel when the home view appears. `dist/project-showcase.css` controls the presentation. The same WebGL carousel renderer as https://gahan.earth/ is retained in `dist/vendor/card-carousel.js` for the requested animation. Reference content remains temporary. The ordinary project grid remains available if WebGL is unavailable.

The project showcase now uses Stretch exclusively. Its sticky stage advances through all cards according to vertical page scroll, reverses when scrolling up, and keeps centre-card links and keyboard access.

## Prabhath’s projects
- `dist/projects-data.js`: nine project records, preview images, internal case-study paths, and live product URLs.
- `dist/case-studies/<slug>/index.html`: eight independent pages with source-derived overview text and original study panels. No outbound Behance links.
- `dist/case-study.css`: responsive case-study layout.
- `dist/user-projects.css`: project previews and action buttons.
- `dist/img/projects`: the supplied project artwork, with 63 original case-study panels and the FighterConnect preview.

Five cards offer only View case study. Three offer View case study and View live project; those studies also offer View live product. FighterConnect offers only View live project. The reference designer’s project routes have been removed. Hero, about, portrait, CV, and contact copy remain temporary reference content pending personalization.

Closing thank-you panels are omitted from all eight case-study pages. The two embedded closing blocks are clipped with the image layout, preserving preceding design content and original source assets.

The scroll-driven carousel slows around each centred project using a continuous focus curve, with faster travel between cards. The curve works in both directions; keyboard targets remain at each card centre and reduced-motion behavior remains discrete.

The homepage summary cards have been replaced by an open, responsive statistics strip: 2+ years of experience, 25+ projects, 20+ clients, and 4 honors & awards. Styles are in `dist/portfolio-stats.css`.

Shared palette follows iamsandy.com: navy #101F2C, warm ivory #D6D0C4, and copper/brown supporting shades. Accent orange is brightened to #FFA33D. Homepage, project carousel frames, controls, statistics, and case-study chrome use this palette; original project artwork retains its own colors.

Project carousel cards use 4:3 landscape geometry and full-card thumbnails shared with the project grid. The desktop centre card is sized to roughly 52% of viewport width, with neighboring cards visible. Synthetic title frames are removed; caption and actions remain below. Stretch and centre slowdown remain.

The Stretch renderer now displays overlapping pairs of projects: two full portrait cards at each focus stop, advancing one project per scroll interval. Each card has a thumbnail, title, subtitle, one-line description, and arrow. Native per-card links appear on hover/focus and remain visible on touch screens; the separate controls below the gallery are removed. Hover targets follow the renderer’s actual spring position and disable during transitions.
