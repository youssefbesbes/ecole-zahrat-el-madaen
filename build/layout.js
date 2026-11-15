// Shared page shell: <head>, header, footer, mobile action bar. FR and AR.

// Netlify sets URL at build time; override with SITE_URL once the domain is known.
export const SITE_URL = (process.env.SITE_URL || process.env.URL || 'https://zahrat-al-madaeen.netlify.app').replace(/\/$/, '');

// key -> URL path. Order = navigation order.
export const ROUTES = {
  accueil: '',
  ecole: 'ecole/',
  pedagogie: 'pedagogie/',
  admissions: 'admissions/',
  actualites: 'actualites/',
  contact: 'contact/',
};

export const urlFor = (lang, key) => '/' + (lang === 'ar' ? 'ar/' : '') + ROUTES[key];

const PHONE = '97 516 240', TEL = '+21697516240', WA = 'https://wa.me/21697516240';
const EMAIL = 'zahratalmadaeen3@gmail.com';
const FB = 'https://www.facebook.com/profile.php?id=100063904543650';

const T = {
  fr: {
    dir: 'ltr', locale: 'fr_TN',
    fonts: 'family=Baloo+2:wght@600;700;800&family=Figtree:wght@400;500;600;700',
    skip: 'Aller au contenu',
    brand: 'Zahrat Al Madaeen', brandSub: 'زهرة المدائن · Nouvelle Médina', home: 'Zahrat Al Madaeen, accueil',
    nav: { accueil: 'Accueil', ecole: 'L’école', pedagogie: 'Pédagogie', admissions: 'Admissions', actualites: 'Actualités', contact: 'Contact' },
    navLabel: 'Navigation principale', menu: 'Ouvrir le menu',
    cta: 'Réserver un test', switchTo: 'العربية', switchLabel: 'النسخة العربية',
    band: ['Une question sur l’admission ?', `Réservez un test en ligne ou appelez l’administration au ${PHONE}.`],
    bar: ['Appeler', 'WhatsApp', 'Réserver un test'], wa: 'Écrire à l’école sur WhatsApp',
    footAbout: ['École Zahrat Al Madaeen', 'École primaire privée, du préparatoire à la 6e année.<br>3, rue de Bizerte, Nouvelle Médina 3, 2063 Ben Arous.'],
    footSite: 'Le site', footContact: 'Nous joindre', map: 'Plan d’accès', staff: 'Espace école',
    legal: '© École Zahrat Al Madaeen. Site réalisé par Youssef Besbes.',
  },
  ar: {
    dir: 'rtl', locale: 'ar_TN',
    fonts: 'family=Baloo+Bhaijaan+2:wght@600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700',
    skip: 'الانتقال إلى المحتوى',
    brand: 'زهرة المدائن', brandSub: 'Zahrat Al Madaeen · المدينة الجديدة', home: 'زهرة المدائن، الصفحة الرئيسية',
    nav: { accueil: 'الرئيسية', ecole: 'المدرسة', pedagogie: 'البيداغوجيا', admissions: 'التسجيل', actualites: 'الأخبار', contact: 'اتصل بنا' },
    navLabel: 'القائمة الرئيسية', menu: 'فتح القائمة',
    cta: 'احجز اختبارًا', switchTo: 'Français', switchLabel: 'Version française',
    band: ['سؤال حول التسجيل؟', `احجزوا اختبارًا عبر الموقع أو اتصلوا بالإدارة على الرقم <span dir="ltr">${PHONE}</span>.`],
    bar: ['اتصل', 'واتساب', 'احجز اختبارًا'], wa: 'راسلوا المدرسة على واتساب',
    footAbout: ['المدرسة الابتدائية الخاصة زهرة المدائن', 'مدرسة ابتدائية خاصة، من السنة التحضيرية إلى السنة السادسة.<br>3 نهج بنزرت، المدينة الجديدة 3، 2063 بن عروس.'],
    footSite: 'الموقع', footContact: 'للتواصل', map: 'خريطة الوصول', staff: null,
    legal: '© المدرسة الابتدائية الخاصة زهرة المدائن. تصميم الموقع: يوسف بسباس.',
  },
};

const flower = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><g transform="translate(24 24)"><ellipse rx="7" ry="13" cy="-11" fill="#FFC53D"/><ellipse rx="7" ry="13" cy="-11" fill="#FF7A9A" transform="rotate(72)"/><ellipse rx="7" ry="13" cy="-11" fill="#3DBE84" transform="rotate(144)"/><ellipse rx="7" ry="13" cy="-11" fill="#2370BF" transform="rotate(216)"/><ellipse rx="7" ry="13" cy="-11" fill="#FFC53D" transform="rotate(288)"/><circle r="7" fill="#17324D"/></g></svg>`;
const icon = {
  phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  wa: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20l1.3-5.2A8.4 8.4 0 1 1 21 11.5z"/></svg>',
  cal: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function schema(){
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ElementarySchool',
    name: 'École Zahrat Al Madaeen', alternateName: 'المدرسة الابتدائية الخاصة زهرة المدائن',
    url: SITE_URL + '/', image: SITE_URL + '/og.jpg', logo: SITE_URL + '/favicon.svg',
    telephone: TEL, email: EMAIL, foundingDate: '2011-06-11',
    address: { '@type': 'PostalAddress', streetAddress: '3, rue de Bizerte', addressLocality: 'Nouvelle Médina 3, Ben Arous', postalCode: '2063', addressCountry: 'TN' },
    sameAs: [FB],
  });
}

export function layout({ lang, key, meta, body, hasTwin }){
  const t = T[lang], other = lang === 'fr' ? 'ar' : 'fr';
  const noindex = key === 'espace' || key === '404';
  const showBand = !['admissions', 'espace', '404'].includes(key);
  const href = (k) => urlFor(lang, k);
  const canonical = hasTwin ? SITE_URL + urlFor(lang, key) : null;

  const nav = Object.entries(t.nav).map(([k, label]) => `<a href="${href(k)}"${k === key ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ');
  const alternates = hasTwin ? ['fr', 'ar'].map(l => `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${urlFor(l, key)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${SITE_URL}${urlFor('fr', key)}">` : '';
  const footLinks = ['ecole', 'pedagogie', 'admissions', 'actualites'].map(k => `<li><a href="${href(k)}">${t.nav[k]}</a></li>`).join('');

  return `<!doctype html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description || '')}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${lang === 'ar' ? 'زهرة المدائن' : 'École Zahrat Al Madaeen'}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description || '')}">
${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
<meta property="og:image" content="${SITE_URL}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0F7A51">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${t.fonts}&display=swap" rel="stylesheet">
${key === 'accueil' ? `<script type="application/ld+json">${schema()}</script>` : ''}
<script type="module" src="/src/main.js"></script>
</head>
<body data-page="${key}">
<a class="skip" href="#contenu">${t.skip}</a>

<header class="top">
  <div class="wrap">
    <a class="brand" href="${href('accueil')}" aria-label="${t.home}">
      ${flower(46)}
      <span><b>${t.brand}</b><span>${t.brandSub}</span></span>
    </a>
    <div class="top-end">
      ${hasTwin ? `<a class="lang" href="${urlFor(other, key)}" hreflang="${other}" lang="${other}" title="${t.switchLabel}">${t.switchTo}</a>` : ''}
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="${t.menu}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
    <nav class="nav" id="nav" aria-label="${t.navLabel}">
      ${nav}
      <a class="btn btn-main" href="${href('admissions')}#formulaire">${t.cta}</a>
    </nav>
  </div>
</header>

<main id="contenu">
${body}
${showBand ? `
<div class="wrap band-wrap">
  <div class="band">
    <div><h2>${t.band[0]}</h2><p>${t.band[1]}</p></div>
    <a class="btn" href="${href('admissions')}#formulaire">${t.cta}</a>
  </div>
</div>` : ''}
</main>

<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <h3>${t.footAbout[0]}</h3>
        <p class="muted">${t.footAbout[1]}</p>
      </div>
      <div>
        <h3>${t.footSite}</h3>
        <ul>${footLinks}</ul>
      </div>
      <div>
        <h3>${t.footContact}</h3>
        <ul><li><a href="tel:${TEL}" dir="ltr">${PHONE}</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li><li><a href="${FB}" rel="noopener">Facebook</a></li><li><a href="${href('contact')}">${t.map}</a></li></ul>
      </div>
    </div>
    <p class="legal">${t.legal}${t.staff ? ` · <a href="/espace/">${t.staff}</a>` : ''}</p>
  </div>
</footer>

${key === 'espace' ? '' : `<a class="wa" href="${WA}" aria-label="${t.wa}" rel="noopener">${icon.wa}</a>
<nav class="mbar" aria-label="${t.footContact}">
  <a href="tel:${TEL}">${icon.phone}<span>${t.bar[0]}</span></a>
  <a href="${WA}" rel="noopener">${icon.wa}<span>${t.bar[1]}</span></a>
  <a class="mbar-main" href="${href('admissions')}#formulaire">${icon.cal}<span>${t.bar[2]}</span></a>
</nav>`}
</body>
</html>
`;
}
