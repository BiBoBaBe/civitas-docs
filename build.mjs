// Builds the Civitas documentation site.
//
// No framework, no dependencies, no install. Each page is an HTML fragment in `pages/`; this
// script wraps it in the shell, writes the sidebar and the on-this-page list, and drops the
// finished files next to it. The generated HTML is committed on purpose: the whole point is that
// the folder can be dropped into a repository root and served as-is.
//
//   node build.mjs
//
// Every link the pages emit is relative, so the site works at a domain root, under a project
// path like https://someone.github.io/civitas-docs/, and from a local file:// open.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const SECTIONS = [
  {
    title: "Start here",
    pages: [
      ["index", "What Civitas is"],
      ["the-idea", "The idea in five minutes"],
      ["why", "Why it works this way"],
    ],
  },
  {
    title: "How the world works",
    pages: [
      ["people", "People"],
      ["motives", "Wants and motives"],
      ["time", "Time"],
      ["places", "Places, doors and walls"],
      ["records", "What the world records"],
      ["gossip", "Gossip"],
      ["plans", "Plans, arrangements and trips"],
      ["terms", "Terms and couples"],
      ["pictures", "Pictures"],
    ],
  },
  {
    title: "Playing",
    pages: [
      ["screens", "The screens"],
      ["adult-play", "Adult play"],
    ],
  },
  {
    title: "Example worlds",
    pages: [
      ["tremont", "Tremont"],
      ["tremont-phone", "The phone and its apps"],
      ["isekai", "Trapped in the game"],
      ["other-worlds", "Three more worlds"],
    ],
  },
  {
    title: "Building your own",
    pages: [
      ["your-own-world", "Making your own world"],
      ["how-a-world-gets-built", "How a world gets built"],
      ["limits", "Honest limits"],
    ],
  },
];

const ORDER = SECTIONS.flatMap((section) => section.pages);

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const navFor = (current, id) =>
  `<nav class="nav" id="${id}" aria-label="Documentation">` +
  SECTIONS.map(
    (section) =>
      `<p class="nav-heading">${section.title}</p>\n<ul>` +
      section.pages
        .map(([slug, title]) => {
          const here = slug === current;
          return `<li><a href="${slug}.html"${here ? ' aria-current="page"' : ""}>${title}</a></li>`;
        })
        .join("") +
      `</ul>`,
  ).join("\n") +
  `</nav>`;

/** Pulls the h2s out of a fragment, giving each one an id if the author did not. */
function outline(body) {
  const headings = [];
  const withIds = body.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (whole, attrs = "", text) => {
    const existing = /\bid="([^"]+)"/.exec(attrs ?? "");
    const id = existing ? existing[1] : slugify(text);
    headings.push({ id, text: text.replace(/<[^>]+>/g, "").trim() });
    return existing ? whole : `<h2 id="${id}"${attrs ?? ""}>${text}</h2>`;
  });
  return { body: withIds, headings };
}

function tocFor(headings) {
  if (headings.length < 3) {
    return "";
  }
  return (
    `<aside class="toc" aria-label="On this page"><p class="toc-heading">On this page</p><ul>` +
    headings.map((h) => `<li><a href="#${h.id}">${h.text}</a></li>`).join("") +
    `</ul></aside>`
  );
}

function footerNav(current) {
  const i = ORDER.findIndex(([slug]) => slug === current);
  if (i === -1) {
    return "";
  }
  const prev = ORDER[i - 1];
  const next = ORDER[i + 1];
  const link = (page, rel, label) =>
    page
      ? `<a class="pager-link pager-${rel}" href="${page[0]}.html"><span>${label}</span><strong>${page[1]}</strong></a>`
      : `<span class="pager-link pager-empty"></span>`;
  return `<nav class="pager" aria-label="Neighbouring pages">${link(prev, "prev", "Previous")}${link(next, "next", "Next")}</nav>`;
}

const FAVICON =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20rx='7'%20fill='%2318140f'/%3E%3Cpath%20d='M6%2024V14l10-6%2010%206v10'%20fill='none'%20stroke='%23d79a4e'%20stroke-width='2'%20stroke-linejoin='round'/%3E%3Crect%20x='13'%20y='17'%20width='6'%20height='7'%20fill='%23d79a4e'/%3E%3C/svg%3E";

function shell({ slug, title, description, body, headings, isError }) {
  const heading = slug === "index" ? "Civitas" : title;
  const toc = isError ? "" : tocFor(headings);
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${slug === "index" ? "Civitas: a world that remembers" : `${title} · Civitas`}</title>
<meta name="description" content="${description}">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="${title} · Civitas">
<meta property="og:description" content="${description}">
<meta property="og:type" content="article">
<link rel="stylesheet" href="assets/styles.css">
<link rel="icon" href="${FAVICON}">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="topbar">
  <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"></span>Civitas</a>
  <details class="menu">
    <summary>Contents</summary>
    ${navFor(slug, `nav-mobile`)}
  </details>
</header>

<div class="shell">
  <aside class="sidebar">
    <a class="brand brand-desk" href="index.html"><span class="brand-mark" aria-hidden="true"></span>Civitas<em>documentation</em></a>
    ${navFor(slug, `nav-desktop`)}
  </aside>

  <main id="main" class="content">
    <article class="prose${isError ? " prose-error" : ""}">
      <h1>${heading}</h1>
      ${body.trim()}
    </article>
    ${isError ? "" : footerNav(slug)}
    <footer class="foot">
      <p>Civitas is a personal project, documented as it actually behaves. The example world is
      fiction and every character in it is an adult.</p>
    </footer>
  </main>

  ${toc}
</div>
</body>
</html>
`;
}

const PAGES = [
  ...ORDER.map(([slug, title]) => ({ slug, title })),
  { slug: "404", title: "Page not found", isError: true },
];

mkdirSync(join(root, "assets"), { recursive: true });

for (const page of PAGES) {
  const raw = readFileSync(join(root, "pages", `${page.slug}.html`), "utf8");
  const match = raw.match(/^<!--\s*meta\s*([\s\S]*?)-->\s*/);
  const meta = {};
  if (match) {
    for (const line of match[1].split("\n")) {
      const at = line.indexOf(":");
      if (at > 0) {
        meta[line.slice(0, at).trim()] = line.slice(at + 1).trim();
      }
    }
  }
  const { body, headings } = outline(match ? raw.slice(match[0].length) : raw);
  writeFileSync(
    join(root, `${page.slug}.html`),
    shell({
      slug: page.slug,
      title: meta.title ?? page.title,
      description: meta.description ?? "",
      body,
      headings,
      isError: page.isError ?? false,
    }),
  );
}

console.log(`built ${PAGES.length} pages`);
