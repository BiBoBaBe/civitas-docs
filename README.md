# Civitas documentation site

A static site. Plain HTML, one stylesheet, no JavaScript, no dependencies, no build step needed to
serve it. Every link is relative, so it works at a domain root, under a project path such as
`https://someone.github.io/civitas-docs/`, and from a local `file://` open.

## Preview it locally

Any static server will do. From this folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Or just open `index.html` in a browser. The relative links work either way.

## Editing

Page content lives in `pages/*.html` as fragments. Each fragment starts with a small metadata
comment (`title`, `description`) and then the body, with no `<h1>` (the shell writes it).

`build.mjs` wraps every fragment in the shell, writes the sidebar and the on-this-page list, adds
previous/next links, and drops the finished files next to it:

```sh
node build.mjs
```

The generated HTML is committed on purpose, so the folder can be dropped into a repository and
served as-is. Run the build after every content change and commit both the fragment and the
generated page.

To add a page: write `pages/<slug>.html`, add `["<slug>", "Title"]` to the right section of
`SECTIONS` in `build.mjs`, and rebuild. Sidebar, ordering and the previous/next links follow.

## Publishing on GitHub Pages

This folder is written to be the **root of its own repository**. Copy its contents (not the folder
itself) into an empty repo:

```sh
cp -R . /path/to/civitas-docs/
cd /path/to/civitas-docs
git add . && git commit -m "docs site"
```

Then in that repository: **Settings → Pages → Build and deployment → Deploy from a branch →
`main` / `/ (root)`**. Save, wait a minute, and the site is live.

`.nojekyll` is included so GitHub serves the files as they are rather than running them through
Jekyll.

If instead you want to serve it from inside a larger repository, GitHub Pages only offers the
repository root or a folder named `docs/`, so the contents have to live in one of those two places.

### A custom domain

Add a `CNAME` file containing the domain at the root, point the DNS at GitHub, and set the domain
under Settings → Pages. Nothing in the site needs changing, because no link is absolute.

## What is in here

| Path | What it is |
| --- | --- |
| `index.html` and the other `*.html` | Generated pages. Do not edit by hand. |
| `404.html` | Served by GitHub Pages for unknown paths. |
| `pages/` | The source fragments. Edit these. |
| `assets/styles.css` | The whole stylesheet. Light and dark, no framework. |
| `assets/img/` | Isometric room art used on the pages. |
| `build.mjs` | The generator. |
| `.nojekyll` | Tells GitHub Pages not to run Jekyll. |

## House rules for the content

- British spelling.
- No explicit text and no explicit images, anywhere. The site describes adult mechanics in neutral
  terms on one page and shows nothing.
- No real names, no personal data, no screenshots containing anybody's likeness.
- Concrete examples from the fictional world rather than abstract claims.
- Say plainly when something is not built.
