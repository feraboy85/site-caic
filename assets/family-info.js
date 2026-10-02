(()=>{
'use strict';
const SUPABASE_URL='https://agrghfjrtkngkugotgwb.supabase.co';
const SUPABASE_KEY='sb_publishable_Q91vgZ7v3BQu_q3H8Zctiw_aKqQ4W8H';
const previewMode=new URLSearchParams(location.search).get('cmsPreview')==='1';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const img=v=>{if(!v)return'';if(/^(https?:|data:)/i.test(v))return v;return v.startsWith('/')?v:'/'+v};
const safeHref=v=>{const x=String(v||'').trim();return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(x)?x:'#'};
const now=()=>new Date();
function active(item){if(!item||item.visible===false)return false;const n=now();if(item.startsAt&&new Date(item.startsAt)>n)return false;if(item.endsAt&&new Date(item.endsAt)<n)return false;return true}
function ensureSection(){
  let sec=$('#familias');
  if(sec)return sec;
  sec=document.createElement('section');
  sec.className='section family-info-section cms-editable';
  sec.id='familias';
  sec.dataset.cmsSection='familyInfo';
  sec.hidden=true;
  sec.innerHTML=`<div class="container"><div class="section-head"><div><div class="kicker" id="familyInfoKicker">Para as famílias</div><h2 id="familyInfoTitle">Informações para as Famílias</h2></div><p id="familyInfoText">Acesse rapidamente as informações mais procuradas do CAIC.</p></div><div class="family-info-grid" id="familyInfoGrid"></div></div>`;
  const main=$('main');
  const after=$('#avisos');
  if(after?.parentNode===main)after.after(sec);else main?.prepend(sec);
  return sec;
}
function ensureModal(){
  let m=$('#familyWorkshopsModal');
  if(m)return m;
  m=document.createElement('div');
  m.className='family-workshops-modal';m.id='familyWorkshopsModal';m.setAttribute('aria-hidden','true');
  m.innerHTML=`<div class="family-workshops-dialog" role="dialog" aria-modal="true" aria-labelledby="familyWorkshopsTitle"><div class="family-workshops-head"><strong id="familyWorkshopsTitle">Horários das Oficinas</strong><button class="family-workshops-close" type="button" aria-label="Fechar">×</button></div><div class="family-workshops-scroll"><img id="familyWorkshopsImage" src="" alt="Horários das oficinas do CAIC"></div></div>`;
  document.body.appendChild(m);
  const close=()=>{m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')};
  $('.family-workshops-close',m).addEventListener('click',close);
  m.addEventListener('click',e=>{if(e.target===m)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('open'))close()});
  return m;
}
function openWorkshops(src,title){
  if(!src)return;
  const m=ensureModal();
  $('#familyWorkshopsTitle',m).textContent=title||'Horários das Oficinas';
  $('#familyWorkshopsImage',m).src=img(src);
  m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
}
function workshopCard(w){
  if(!active(w))return'';
  return `<button class="family-info-card workshops" id="familyWorkshopsCard" type="button"><div class="family-info-media"><img loading="lazy" src="${esc(img(w.image))}" alt="${esc(w.alt||w.label||'Horários das oficinas')}"></div><div class="family-info-card-body"><div class="family-info-icon">${esc(w.icon||'🩰⚽')}</div><h3>${esc(w.label||'Horários das Oficinas')}</h3><p>${esc(w.sub||'Confira os horários de Ballet e Futsal.')}</p><span class="family-info-action">${esc(w.button||'Ver horários →')}</span></div></button>`;
}
function normalCard(c){
  if(!active(c))return'';
  const href=safeHref(c.href);
  const external=/^https?:\/\//i.test(href);
  return `<a class="family-info-card" href="${esc(href)}"${external?' target="_blank" rel="noopener"':''}><div class="family-info-card-body"><div class="family-info-icon">${esc(c.icon||'ℹ️')}</div><h3>${esc(c.label||'Informação')}</h3><p>${esc(c.sub||'')}</p><span class="family-info-action">${esc(c.button||'Acessar →')}</span></div></a>`;
}
function reorder(c){
  const main=$('main');if(!main)return;
  (c.sectionOrder||[]).forEach(id=>{const el=document.getElementById(id);if(el)main.appendChild(el)});
}
function render(c){
  const sec=ensureSection();
  const f=c?.familyInfo||{};
  sec.hidden=!active(f);
  if(sec.hidden)return;
  $('#familyInfoKicker').textContent=f.kicker||'Para as famílias';
  $('#familyInfoTitle').textContent=f.title||'Informações para as Famílias';
  $('#familyInfoText').textContent=f.text||'Acesse rapidamente as informações mais procuradas do CAIC.';
  const w=f.workshops||{};
  const grid=$('#familyInfoGrid');
  grid.innerHTML=workshopCard(w)+(f.cards||[]).map(normalCard).join('');
  const wc=$('#familyWorkshopsCard');
  if(wc)wc.addEventListener('click',()=>openWorkshops(w.image,w.modalTitle||w.label));
  reorder(c);
}
async function loadPublished(){
  try{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/cms_published_content?slug=eq.home&select=content`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});
    if(!r.ok)throw new Error(`CMS ${r.status}`);
    const rows=await r.json();
    if(rows[0]?.content)render(rows[0].content);
  }catch(e){console.error('CAIC famílias:',e)}
}
window.addEventListener('message',e=>{if(!previewMode||e.origin!==location.origin)return;if(e.data?.type==='cms-preview'&&e.data.content)render(e.data.content)});
document.addEventListener('DOMContentLoaded',()=>{ensureSection();ensureModal();loadPublished()});
})();
