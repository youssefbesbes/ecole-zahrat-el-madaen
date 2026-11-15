import { supabase } from './supabase.js';

const STATUTS = [['nouvelle','Nouvelle'],['contactee','Famille contactée'],['confirmee','Test confirmé'],['inscrit','Inscrit'],['refusee','Sans suite']];
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); } catch(e){ return ''; } };
const $ = (id) => document.getElementById(id);

let rows = [], filter = 'tout', channel = null, isAdmin = false, session = null;

async function checkAdmin(){
  if (!session) return false;
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

async function refreshAuth(s){
  session = s;
  isAdmin = await checkAdmin();
  showEspace();
}

export function initEspace(){
  if (!supabase) { showEspace(); return; }
  supabase.auth.getSession().then(({ data }) => refreshAuth(data.session));
  supabase.auth.onAuthStateChange((event, s) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') refreshAuth(s);
  });

  const login = $('esp-login');
  const notice = login.querySelector('[data-notice]');
  login.addEventListener('submit', async (e) => {
    e.preventDefault();
    notice.textContent = ''; notice.classList.add('warn');
    const email = login.elements.email.value.trim(), password = login.elements.password.value;
    login.querySelectorAll('.field').forEach(f => f.classList.toggle('err', !f.querySelector('input').value.trim()));
    if (!email || !password) return;
    const btn = login.querySelector('button[type=submit]');
    btn.disabled = true;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    btn.disabled = false;
    if (error) { notice.textContent = error.status === 400 ? 'E-mail ou mot de passe incorrect.' : 'Connexion impossible pour le moment, réessayez.'; return; }
    login.reset();
  });

  $('esp-logout').addEventListener('click', async () => {
    if (channel) { supabase.removeChannel(channel); channel = null; }
    rows = [];
    await supabase.auth.signOut();
  });
  $('esp-csv').addEventListener('click', exportCsv);

  document.querySelectorAll('.chip[data-filter]').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    document.querySelectorAll('.chip[data-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));
}

function showEspace(){
  const locked = $('esp-locked'), main = $('esp-main'), login = $('esp-login');
  if (!supabase){ login.hidden = true; main.hidden = true; locked.hidden = false; locked.textContent = 'L’espace école n’est pas encore configuré (Supabase).'; return; }
  if (!session){ login.hidden = false; locked.hidden = true; main.hidden = true; return; }
  login.hidden = true;
  if (!isAdmin){ locked.hidden = false; locked.textContent = 'Ce compte n’a pas accès à l’espace école.'; main.hidden = true; return; }
  locked.hidden = true; main.hidden = false;
  $('esp-who').textContent = 'Connecté : ' + (session.user.email || '');
  if (channel) return;
  load();
  // Live updates: new requests from the site and status changes from other staff.
  channel = supabase.channel('demandes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes' }, load)
    .subscribe();
}

async function load(){
  const { data, error } = await supabase.from('demandes').select('*').order('created_at', { ascending: false }).limit(1000);
  if (error) { $('esp-count').textContent = 'Impossible de charger les demandes.'; return; }
  rows = data;
  render();
}

function render(){
  const tb = $('esp-rows');
  const list = rows.filter(r => filter === 'tout' || r.type === filter);
  $('esp-count').textContent = list.length + (list.length > 1 ? ' demandes' : ' demande');
  $('esp-empty').hidden = list.length > 0;
  tb.replaceChildren();
  list.forEach(r => {
    const tr = document.createElement('tr');
    const td = (t) => { const c = document.createElement('td'); c.textContent = t || ''; tr.append(c); return c; };
    td(fmtDate(r.created_at));
    const tc = document.createElement('td'); const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = r.type === 'test' ? 'Test' : 'Pré-inscription'; tc.append(tag); tr.append(tc);
    td(r.enfant); td(r.niveau); td(r.session || '—'); td(r.parent);
    const tel = document.createElement('td'); if (r.tel){ const a = document.createElement('a'); a.href = 'tel:' + String(r.tel).replace(/\s/g,''); a.textContent = r.tel; tel.append(a); } tr.append(tel);
    td([r.message, r.email, r.naissance && 'Né(e) le ' + new Date(r.naissance).toLocaleDateString('fr-FR'), r.ecole_actuelle && 'École : ' + r.ecole_actuelle].filter(Boolean).join(' · '));
    const sc = document.createElement('td'); const sel = document.createElement('select'); sel.setAttribute('aria-label','Suivi de la demande de ' + (r.enfant||''));
    STATUTS.forEach(([v,l]) => sel.append(new Option(l, v)));
    sel.value = STATUTS.some(s => s[0] === r.statut) ? r.statut : 'nouvelle';
    sel.addEventListener('change', async () => {
      sel.disabled = true;
      const { error } = await supabase.from('demandes').update({ statut: sel.value }).eq('id', r.id);
      if (error) sel.value = r.statut || 'nouvelle'; else r.statut = sel.value;
      sel.disabled = false;
    });
    sc.append(sel); tr.append(sc);
    tb.append(tr);
  });
}

function exportCsv(){
  const cols = ['created_at','type','statut','session','enfant','naissance','niveau','ecole_actuelle','parent','tel','email','message'];
  const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const list = rows.filter(r => filter === 'tout' || r.type === filter);
  const csv = '﻿' + [cols.join(';'), ...list.map(r => cols.map(c => esc(r[c])).join(';'))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'demandes-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
