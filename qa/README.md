# Portfolio QA

Run from the repository root:

- `python qa/static-audit.py`
- `node qa/regression.cjs`

The static audit checks all 12 HTML pages, local asset references and links, fragment targets, duplicate IDs within each active/template scope, image alt attributes, external-link isolation, CSS asset paths, and application JavaScript syntax.

Regression checks validate the 17-project inventory, Hotel Grand Minaro's first position, removed project exclusions, internal case-study destinations, all six Work filters, and the three hero configurations. Hero checks cover a clear initial frame, fully completed blur, scrolling back to the clear frame, and reduced-motion mode.

Fixes from this pass:

- Added missing Back to top targets on Work and About.
- Prevented native keyboard-focus scrolling from offsetting the animated career rail.
- Gave every character button its own accessible description.
- Constrained tooltips to short viewports and allowed scrolling of their content.
- Kept sticky scenes tied to viewport scrolling without horizontal overflow containers.
- Added preview-dialog scroll locking, focus restoration, and smooth-scroll exclusions for the letter viewer.
- Made Work reveals respond to reduced-motion preference changes.
- Strengthened keyboard focus outlines for Work filters and secondary actions.

Limits: no browser controller was available, so rendered desktop/mobile layout, real pointer/touch behavior, and live external-link availability remain unverified. The CV download intentionally stays disabled until the owner's CV is supplied. Campus Lost & Found includes remote source-article imagery.
