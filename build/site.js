// Multi-page FR/AR site without a framework.
// Each URL has a stub index.html containing only <!--page lang/key-->.
// This plugin replaces the stub with the shared layout + src/pages/<lang>/<key>.html,
// and turns <x-photo> tags into real <img> tags that Vite fingerprints.
import fs from 'node:fs';
import path from 'node:path';
import { layout, SITE_URL, ROUTES, urlFor } from './layout.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src/pages');
const PHOTOS_DIR = path.join(ROOT, 'src/assets/photos');

// French-only pages: the staff area and Netlify's 404 page (bilingual inside).
const EXTRA = [['fr', 'espace', 'espace/'], ['fr', '404', '']];

function entries(){
  const list = [];
  for (const lang of ['fr', 'ar']) for (const [key, p] of Object.entries(ROUTES)) list.push({ lang, key, file: (lang === 'ar' ? 'ar/' : '') + p + 'index.html' });
  for (const [lang, key, p] of EXTRA) list.push({ lang, key, file: key === '404' ? '404.html' : p + 'index.html' });
  return list;
}

// Stubs are committed, but recreate any that are missing.
function ensureStubs(){
  for (const e of entries()) {
    const f = path.join(ROOT, e.file);
    if (fs.existsSync(f)) continue;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, `<!--page ${e.lang}/${e.key}-->\n`);
  }
}

const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] ?? true]));

function photo(a){
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'avif'].find(x => fs.existsSync(path.join(PHOTOS_DIR, `${a.slot}.${x}`)));
  const cls = ['photo', a.class, ext && 'has-img', a.fit === 'contain' && 'contain'].filter(Boolean).join(' ');
  if (!ext) return `<div class="${cls}" aria-hidden="true"></div>`;
  const load = a.eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<div class="${cls}"${a.style ? ` style="${a.style}"` : ''}><img src="/src/assets/photos/${a.slot}.${ext}" alt="${a.alt || ''}" ${load} decoding="async"></div>`;
}

function render(lang, key){
  const src = fs.readFileSync(path.join(PAGES_DIR, lang, `${key}.html`), 'utf8');
  const m = src.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  const meta = m ? JSON.parse(m[1]) : {};
  const body = src.slice(m ? m[0].length : 0).replace(/<x-photo([^>]*)><\/x-photo>/g, (_, a) => photo(attrs(a)));
  return layout({ lang, key, meta, body, hasTwin: key in ROUTES });
}

export function site(){
  return {
    name: 'zahrat-site',
    config(){
      ensureStubs();
      return { build: { rollupOptions: { input: Object.fromEntries(entries().map(e => [e.file.replace(/\/?index\.html$|\.html$/, '') || 'index', path.join(ROOT, e.file)])) } } };
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html){
        const m = html.match(/<!--page (\w+)\/([\w-]+)-->/);
        return m ? render(m[1], m[2]) : html;
      },
    },
    handleHotUpdate({ file, server }){
      if (file.replaceAll('\\', '/').includes('/src/pages/')) { server.ws.send({ type: 'full-reload' }); return []; }
    },
    generateBundle(){
      const urls = entries().filter(e => e.key in ROUTES).map(e => {
        const alt = ['fr', 'ar'].map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${urlFor(l, e.key)}"/>`).join('');
        return `<url><loc>${SITE_URL}${urlFor(e.lang, e.key)}</loc>${alt}</url>`;
      });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n` });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nDisallow: /espace/\nSitemap: ${SITE_URL}/sitemap.xml\n` });
    },
  };
}
