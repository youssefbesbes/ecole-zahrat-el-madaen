import './styles.css';

const nav = document.getElementById('nav');
const menuBtn = document.querySelector('.menu-btn');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
});

// Netlify's free plan pins a "Powered by Netlify" badge (iframe) to the bottom-right
// corner. Lift the mobile action bar and WhatsApp button above it instead of hiding it.
function liftForBadge(){
  const badge = document.getElementById('nl-badge-frame');
  const h = badge && getComputedStyle(badge).display !== 'none' ? badge.getBoundingClientRect().height : 0;
  document.documentElement.style.setProperty('--badge-h', h + 'px');
}
new MutationObserver(liftForBadge).observe(document.body, { childList: true });
addEventListener('resize', liftForBadge);
liftForBadge();

// Page-specific code (and the Supabase client) only loads where it is used.
if (document.getElementById('form-adm')) import('./forms.js').then(m => m.initForm());
if (document.getElementById('espace')) import('./espace.js').then(m => m.initEspace());
