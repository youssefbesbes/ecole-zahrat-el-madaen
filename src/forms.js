import { supabase } from './supabase.js';

const AR = document.documentElement.lang === 'ar';
// Keeps phone numbers left-to-right inside Arabic text (otherwise "97 516 240" shows as "240 516 97").
const ltr = (s) => '⁦' + s + '⁩';
const T = AR ? {
  fix: 'يرجى التثبت من الخانات المشار إليها.',
  sending: 'جارٍ الإرسال…',
  fail: 'تعذّر تسجيل الطلب. أرسلوه مباشرة إلى المدرسة: ',
  failWa: 'عبر واتساب', failCall: ` أو اتصلوا على الرقم ${ltr('97 516 240')}.`,
  kindTest: 'الدخول إلى هذا المستوى يكون بعد اختبار قبول. اختاروا دورة الاختبار أدناه.',
  kindIns: 'تسجيل أولي مباشر، دون اختبار.',
  doneTest: ['تم إرسال طلب الاختبار', (o) => `تلقّت المدرسة طلب اختبار القبول لـ ${o.enfant}، دورة ${o.sessionLabel}. ستتصل بكم الإدارة على الرقم ${ltr(o.tel)} لتأكيد اليوم والساعة.`],
  doneIns: ['تم إرسال التسجيل الأولي', (o) => `تلقّت المدرسة التسجيل الأولي لـ ${o.enfant} في ${o.niveauLabel}. ستتصل بكم الإدارة على الرقم ${ltr(o.tel)}.`],
} : {
  fix: 'Vérifiez les champs signalés.',
  sending: 'Envoi en cours…',
  fail: 'La demande n’a pas pu être enregistrée. Envoyez-la directement à l’école : ',
  failWa: 'envoyer sur WhatsApp', failCall: ' ou appelez le 97 516 240.',
  kindTest: 'L’entrée à ce niveau se fait sur test d’admission. Choisissez une session ci-dessous.',
  kindIns: 'Pré-inscription directe, sans test.',
  doneTest: ['Demande de test envoyée', (o) => `L’école a bien reçu la demande de test d’admission pour ${o.enfant}, session ${o.sessionLabel}. L’administration vous appellera au ${o.tel} pour confirmer le jour et l’heure.`],
  doneIns: ['Pré-inscription envoyée', (o) => `L’école a bien reçu la pré-inscription de ${o.enfant} en ${o.niveauLabel}. L’administration vous appellera au ${o.tel}.`],
};

const phoneOk = v => /^(\+?216)?\s*[2-9]\d(\s?\d){6}$/.test(v.trim());
const emailOk = v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function waLink(o){
  const t = (o.type === 'test' ? 'Bonjour, je souhaite réserver un test d’admission.' : 'Bonjour, je souhaite pré-inscrire mon enfant.')
    + '\nEnfant : ' + (o.enfant||'') + '\nNiveau : ' + (o.niveau||'') + (o.session ? '\nSession : ' + o.session : '')
    + '\nParent : ' + (o.parent||'') + '\nTéléphone : ' + (o.tel||'');
  return 'https://wa.me/21697516240?text=' + encodeURIComponent(t);
}

export function initForm(){
  const form = document.getElementById('form-adm');
  const done = document.getElementById('done-adm');
  const notice = form.querySelector('[data-notice]');
  const btn = form.querySelector('button[type=submit]');
  const label = btn.textContent;
  const niveau = form.elements.niveau;
  const sessionBox = document.getElementById('adm-session');
  const errSession = document.getElementById('err-session');
  const kind = document.getElementById('adm-kind');
  const isTest = () => !!niveau.selectedOptions[0]?.hasAttribute('data-test');

  // Grade 2+ needs an admission test: show the session step.
  function syncKind(){
    const chosen = !!niveau.value;
    sessionBox.hidden = !isTest();
    form.querySelector('[data-step]').textContent = isTest() ? '3' : '2';
    kind.hidden = !chosen;
    kind.textContent = isTest() ? T.kindTest : T.kindIns;
    if (!isTest()) { form.querySelectorAll('input[name=session]').forEach(r => r.checked = false); errSession.hidden = true; }
  }
  niveau.addEventListener('change', syncKind);
  syncKind();

  function validate(){
    let first = null;
    form.querySelectorAll('.field').forEach(f => f.classList.remove('err'));
    const mark = (el) => { const f = el.closest('.field'); if (f) f.classList.add('err'); if (!first) first = el; };
    form.querySelectorAll('[required]').forEach(el => { if (el.type === 'checkbox' ? !el.checked : !el.value.trim()) mark(el); });
    form.querySelectorAll('input[type=tel]').forEach(el => { if (el.value.trim() && !phoneOk(el.value)) mark(el); });
    form.querySelectorAll('input[type=email]').forEach(el => { if (!emailOk(el.value)) mark(el); });
    if (isTest()){
      const any = form.querySelector('input[name=session]:checked');
      errSession.hidden = !!any;
      if (!any && !first) first = form.querySelector('input[name=session]');
    }
    if (first) first.focus();
    return !first;
  }

  // Column names match the `demandes` table in supabase/schema.sql.
  // Values (niveau, session) are stored in French whatever the page language.
  function collect(){
    const fd = new FormData(form);
    const o = { type: isTest() ? 'test' : 'inscription', accord: true };
    ['session','enfant','naissance','niveau','ecole_actuelle','parent','tel','email','message'].forEach(k => {
      const v = fd.get(k); if (v != null && String(v).trim() !== '') o[k] = String(v).trim().slice(0, 1000);
    });
    return o;
  }

  async function save(o){
    if (!supabase) return false;
    // No .select(): visitors may insert but never read the table back (RLS).
    const { error } = await supabase.from('demandes').insert(o);
    if (error) console.error('Supabase insert', error);
    return !error;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    notice.textContent = ''; notice.classList.remove('warn');
    if (!validate()) { notice.textContent = T.fix; notice.classList.add('warn'); return; }
    const o = collect();
    const bot = form.elements.site.value;
    btn.disabled = true; btn.textContent = T.sending;
    let saved = false;
    try { saved = bot ? true : await save(o); } catch (err) { saved = false; }
    btn.disabled = false; btn.textContent = label;
    if (!saved){
      notice.classList.add('warn');
      notice.replaceChildren(document.createTextNode(T.fail));
      const a = document.createElement('a'); a.href = waLink(o); a.textContent = T.failWa; a.target = '_blank'; a.rel = 'noopener';
      notice.append(a, document.createTextNode(T.failCall));
      return;
    }
    const view = Object.assign({}, o, {
      niveauLabel: niveau.selectedOptions[0].textContent,
      sessionLabel: form.querySelector('input[name=session]:checked + label b')?.textContent || '',
    });
    const [title, text] = o.type === 'test' ? T.doneTest : T.doneIns;
    done.querySelector('[data-done-title]').textContent = title;
    done.querySelector('[data-done-text]').textContent = text(view);
    form.hidden = true; done.classList.add('show'); done.focus();
    form.reset(); syncKind();
  });
  form.addEventListener('input', (e) => {
    const f = e.target.closest('.field'); if (f) f.classList.remove('err');
    if (e.target.name === 'session') errSession.hidden = true;
  });
}
