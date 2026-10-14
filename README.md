# Prabhath Rathnayaka - Portfolio

UX/UI design portfolio: Home, Work, About, nine case studies, scroll animations, project filters and previews.

## Deploy

1. Create a repository in your personal GitHub account and commit this folder's contents to it. A private repository is suitable for keeping source private.
2. In Vercel, select Add New Project and import the repository under your personal Hobby account.
3. Use Framework: Other; Build command: `npm run build`; Output directory: `public`; Root directory: repository root. The included `vercel.json` specifies the build configuration.
4. Deploy. Future pushes to the production branch trigger deployments through the Git integration.

## Build and verify

Node.js 20+ and Python 3 are needed for the checks. The project has no application dependencies.

```sh
npm run build
python qa/static-audit.py
node qa/regression.cjs
```

For a local preview, serve `public/` with your preferred static web server.

## Edit

Edit files in `site/`, then rebuild. `public/` is generated and ignored by Git.

- `site/index.html`: Home.
- `site/work/index.html`: Work.
- `site/about/index.html`: About.
- `site/case-studies/`: nine case studies.
- `site/design-system.css`: shared styles.
- `site/projects-data.js`, `site/work-page-data.js`: project data.

Main pages have both initial content and matching templates; update both when editing. Fonts, images and scripts are included. The build rewrites the former Site origin in HTML metadata using Vercel's automatic production URL environment variable. No secret configuration is needed.

Email: prabhathdesigner77@gmail.com. WhatsApp: +94 75 396 5737.

Campus Lost & Found includes remote Hashnode image panels. Some Work entries link to Behance. Resume access depends on the owner's Google Drive sharing settings.

Vercel Hobby is for personal, non-commercial use and remains subject to its current terms and limits. Domain registration is separate.
