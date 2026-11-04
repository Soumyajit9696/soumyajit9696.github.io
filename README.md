# Personal Portfolio Website Template

A responsive, multi-page personal portfolio built with **vanilla HTML, CSS and JavaScript**. It uses a minimal neobrutalist visual style, sharp borders, offset shadows, a warm paper-inspired palette, and a set of interactive details.

**Live demo:** [soumyajit9696.github.io](https://soumyajit9696.github.io/)  
**Author:** [Soumyajit Das](https://github.com/Soumyajit9696)  
**License:** MIT for the reusable source code (see [LICENSE](LICENSE))  
**Dependencies:** None — no framework, package manager, or build step required.

> This repository began as the source of my personal website. It is shared as a starting point for your own portfolio. Replace the personal information, images, documents, links, and other identifying content before publishing your copy.

---

## Preview

Explore the [live website](https://soumyajit9696.github.io/) to see the design and interactions.

## Features

- **Multi-page layout:** Home, About, Skills, Projects, Gallery, Blog, Resources, and a custom 404 page.
- **Responsive design:** Layouts adapt to desktop, tablet, and mobile screens.
- **Light and dark themes:** Theme preference is saved locally in the browser.
- **Custom visual identity:** Neobrutalist borders, offset shadows, typography, and colour system.
- **Interactive details:** Animated atom cursor, physics-equation background effects, reading progress, and a floating tools dock.
- **Portfolio sections:** Present your biography, education, skills, projects, publications, photographs, and contact details.
- **Gallery:** Filterable image grid with a keyboard-friendly lightbox.
- **Blog integration:** The blog page can display posts from Blogger.
- **Resources section:** Share downloadable notes, documents, books, or other learning materials.
- **SEO foundations:** Semantic HTML, page metadata, canonical URLs, Open Graph/Twitter metadata, structured data, sitemap, and robots file.
- **Accessibility considerations:** Skip links, visible focus states, reduced-motion handling, and keyboard-accessible interactions.
- **Static hosting:** Works with GitHub Pages or any ordinary static web host.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page, introduction, featured work, and contact links |
| `about.html` | Biography, education, experience, and personal interests |
| `skills.html` | Skills, technologies, and tools |
| `projects.html` | Research, software, and other projects |
| `gallery.html` | Filterable photo gallery |
| `blog.html` | Blog posts and external blog integration |
| `resources.html` | Downloadable resources and bookshelf |
| `404.html` | Custom not-found page |

## Getting started

You can create your own copy in either of these ways.

### Option 1 — Use this repository as a template

1. Open this repository on GitHub.
2. Click **Use this template → Create a new repository**. If the button is unavailable, use the fork or clone method below.
3. Choose an owner and repository name.
   - For a GitHub user website, name it `YOUR-USERNAME.github.io`.
   - For a project website, choose any repository name you like.
4. Create the repository and clone it to your computer.
5. Personalise the content and settings using the checklist below.
6. Enable GitHub Pages (see [Deploy to GitHub Pages](#deploy-to-github-pages)).

### Option 2 — Fork or clone

Fork the repository on GitHub, or clone it locally:

```bash
git clone https://github.com/Soumyajit9696/soumyajit9696.github.io.git
cd soumyajit9696.github.io
```

If you publish a fork as your own website, make sure you replace the original owner's personal content and site metadata.

## Make it yours

The current version is a collection of static files rather than a configurable theme. Most personalisation is done by editing the HTML and replacing assets.

### 1. Update your personal information

Search across the HTML files and replace the author's name, biography, email address, social links, education, experience, skills, project descriptions, and other personal details.

Pay particular attention to:

- `index.html` — name, headline, introduction, featured projects, and contact links.
- `about.html` — biography, education, experience, and interests.
- `skills.html` — skill names, categories, and descriptions.
- `projects.html` — project titles, descriptions, images, and links.
- `gallery.html` — image paths, captions, and categories.
- `blog.html` — blog provider, feed URL, and post links.
- `resources.html` — resource titles, descriptions, download links, and book entries.
- `404.html` — error-page wording and links.

Also search the entire repository for `Soumyajit`, `soumyajit9696.github.io`, and the original email address. Replace remaining references where appropriate.

### 2. Replace images, documents, and other assets

- Put your images in `images/` and update the corresponding paths in the HTML.
- Replace the files in `favicon/` and the root `favicon.ico` with your own favicon set.
- Replace or remove the PDFs in `docs/`.
- Replace the self-hosted fonts in `fonts/` only if you also update the font declarations in `style.css`.
- Remove the `Songs/` folder and `favsong.mp3` if you do not want the music player or do not have permission to redistribute the audio.
- Remove any personal or unused assets that you do not want in your public repository.

Keep filenames and paths in sync. Use appropriately sized, compressed images (WebP is a good option) to improve loading performance.

### 3. Change the design

The main design system lives in `style.css`. Edit its CSS custom properties to adjust the colours, typography, spacing, borders, and shadows. Search for the `:root` and `[data-theme="dark"]` sections to find the light- and dark-theme values.

The interactive scripts are in `js/`:

| File | Responsibility |
| --- | --- |
| `main.js` | Shared navigation and site interactions |
| `brutal-tools.js` | Floating tools dock and its widgets |
| `cursor.js` | Animated atom cursor |
| `palette.js` | Theme and palette-related interactions |
| `physics-fx.js` | Decorative physics-equation effects |

You can remove an effect by removing its script reference from the HTML pages. If you remove a script, check that no remaining page element depends on it.

### 4. Update site URLs and SEO metadata

Update the following in **every relevant HTML page**, not just the home page:

- `<title>` and meta description
- Canonical URL
- Open Graph and Twitter metadata
- Structured data (JSON-LD)
- Favicon and web-app manifest references

Also update:

- `site.webmanifest` — site name, short name, theme colours, and icons.
- `sitemap.xml` — your own domain and the pages you want indexed.
- `robots.txt` — sitemap URL and crawler rules.
- `llms.txt` and `llms-full.txt` — remove or rewrite the original author's information.
- `CITATION.cff` — repository URL, author details, title, and license metadata.

If you use a custom domain, configure it in GitHub Pages and update all canonical and sitemap URLs accordingly.

### 5. Configure the blog and resources

The blog page currently uses an external Blogger source. If you use Blogger, update the feed or source URL in `js/main.js` (and any page-specific links) to point to your blog. Otherwise, replace the integration with your own posts or remove the blog section.

The resources page contains personal study materials, book entries, and audio-player content. Replace these with materials you have the right to share. Do not upload copyrighted books, music, or other third-party material without permission.

## Run locally

No installation or build command is needed. From the repository root, run:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

You can also use another local static server or a code editor's live-server extension. Some external content, such as the Blogger feed, requires an internet connection.

## Deploy to GitHub Pages

1. Push your customised files to your GitHub repository.
2. Open **Settings → Pages** in that repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your publishing branch (usually `main`) and the `/ (root)` folder, then save.
5. Wait for the deployment to finish. Your site will be available at:
   - User site: `https://YOUR-USERNAME.github.io/`
   - Project site: `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

For a project site, remember to update relative paths, canonical URLs, metadata, and sitemap entries to match the published base path. GitHub's official guide: [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Before you publish

- [ ] Replace all personal information and contact details.
- [ ] Replace profile photos, gallery images, CVs, and other documents.
- [ ] Update social, project, blog, and download links.
- [ ] Update canonical URLs, SEO metadata, sitemap, and manifest.
- [ ] Update `CITATION.cff` and remove references to the original author's identity where appropriate.
- [ ] Remove music, books, images, or other files you do not have permission to redistribute.
- [ ] Test every page and link on mobile and desktop.
- [ ] Check the browser console for missing files or JavaScript errors.
- [ ] Confirm that your public repository contains no private information.

## Credits and attribution

This template is based on the portfolio website created by **Soumyajit Das**. If you use or adapt the template, a credit or link back to the [original repository](https://github.com/Soumyajit9696/soumyajit9696.github.io) is appreciated, though it is not a condition of the MIT license for the code.

Please do not present the original author's personal content, photographs, identity, or work as your own. See [LICENSE](LICENSE) for the scope of the software license.

## Citation

If you use this repository in academic work or want to cite the original template, see [`CITATION.cff`](CITATION.cff) or use GitHub's **Cite this repository** feature. Update the citation metadata if you publish a substantially modified fork.

## License

The reusable source code is distributed under the [MIT License](LICENSE). Personal content and third-party assets are not automatically included in that grant. Read the license before reusing or redistributing any part of the repository.
