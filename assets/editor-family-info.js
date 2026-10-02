(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const E=()=>window.CAIC_EDITOR;
const esc=v=>E()?.esc?E().esc(v):String(v??'');
const defaults=()=>({
  visible:true,
  kicker:'Para as famílias',
  title:'Informações para as Famílias',
  text:'Acesse rapidamente as informações mais procuradas do CAIC.',
  workshops:{visible:true,icon:'🩰⚽',label:'Horários das Oficinas',sub:'Confira os horários de Ballet e Futsal.',button:'Ver horários →',modalTitle:'Horários das Oficinas',image:'/assets/horarios-oficinas.svg',alt:'Horários das oficinas de Ballet e Futsal do CAIC'},
  cards:[
    {visible:true,icon:'📅',label:'Calendário Escolar',sub:'Datas e eventos do ano letivo.',button:'Ver calendário →',href:'#calendario'},
    {visible:true,icon:'⏰',label:'Horários da Escola',sub:'Consulte a rotina do período integral.',button:'Ver horários →',href:'#horarios'},
    {visible:true,icon:'👩‍🏫',label:'Turmas / Professores',sub:'Acompanhe a organização das turmas e professores.',button:'Abrir painel →',href:'/painel'},
    {visible:false,icon:'🍽️',label:'Cardápio',sub:'Consulte o cardápio escolar.',button:'Ver cardápio →',href:'#'}
  ]
});
function ensureData(){
  const e=E(); if(!e?.state)return false;
  if(!e.state.familyInfo)e.state.familyInfo=defaults();
  if(!Array.isArray(e.state.familyInfo.cards))e.state.familyInfo.cards=[];
  if(!e.state.familyInfo.workshops)e.state.familyInfo.workshops=defaults().workshops;
  if(!Array.isArray(e.state.sectionOrder))e.state.sectionOrder=[];
  if(!e.state.sectionOrder.includes('familias')){
    const i=e.state.sectionOrder.indexOf('avisos');
    e.state.sectionOrder.splice(i>=0?i+1:0,0,'familias');
  }
  return true;
}
function ensureNav(){
  const side=$('.side'); if(!side||$('.nav-item[data-section="familyInfo"]'))return;
  const btn=document.createElement('button');
  btn.className='nav-item';btn.dataset.section='familyInfo';btn.textContent='👨‍👩‍👧‍👦 Famílias';
  const ref=$('.nav-item[data-section="featuredNotice"]',side);
  if(ref)ref.after(btn);else side.insertBefore(btn,side.querySelector('.order-box'));
  btn.addEventListener('click',()=>E()?.setSection?.('familyInfo'));
}
function field(label,path,type='text',placeholder=''){
  const val=E()?.getDeep?.(path);
  const id='fi_'+path.replace(/[^a-z0-9]/gi,'_');
  if(type==='checkbox')return `<div class="switchrow"><label for="${id}"><b>${esc(label)}</b></label><input id="${id}" data-fi-path="${esc(path)}" type="checkbox" ${val===true?'checked':''}></div>`;
  if(type==='textarea')return `<div class="field"><label for="${id}">${esc(label)}</label><textarea id="${id}" data-fi-path="${esc(path)}" ${placeholder?`placeholder="${esc(placeholder)}"`:''}>${esc(val??'')}</textarea></div>`;
  if(type==='image')return `<div class="field"><label>${esc(label)}</label><div class="media-row"><input data-fi-path="${esc(path)}" value="${esc(val||'')}" placeholder="/assets/... ou URL"><button class="btn ghost sm fiPickMedia" data-path="${esc(path)}" type="button">🖼</button></div></div>`;
  return `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" data-fi-path="${esc(path)}" type="${type}" value="${esc(val??'')}" ${placeholder?`placeholder="${esc(placeholder)}"`:''}></div>`;
}
const group=(title,html)=>`<div class="group"><h3>${esc(title)}</h3>${html}</div>`;
function renderPanel(){
  const e=E(); if(!ensureData()||e.currentSection!=='familyInfo')return;
  $('#propsTitle').textContent='Informações para as Famílias';
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.section==='familyInfo'));
  const s=e.state.familyInfo;
  let html=group('Seção',
    field('Mostrar seção','familyInfo.visible','checkbox')+
    field('Linha superior','familyInfo.kicker')+
    field('Título','familyInfo.title')+
    field('Descrição','familyInfo.text','textarea')
  );
  html+=group('Card principal — Oficinas',
    field('Mostrar card de oficinas','familyInfo.workshops.visible','checkbox')+
    `<div class="row2">${field('Ícone','familyInfo.workshops.icon')}${field('Título','familyInfo.workshops.label')}</div>`+
    field('Descrição','familyInfo.workshops.sub','textarea')+
    `<div class="row2">${field('Texto do botão','familyInfo.workshops.button')}${field('Título ao ampliar','familyInfo.workshops.modalTitle')}</div>`+
    field('Imagem dos horários','familyInfo.workshops.image','image')+
    field('Texto alternativo','familyInfo.workshops.alt')
  );
  html+=`<div class="group"><h3>Outros atalhos</h3><div class="hint">Você pode editar, ocultar, reordenar ou criar novos cards.</div>${(s.cards||[]).map((c,i)=>`<div class="list-card"><div class="list-card-head"><strong>${esc(c.label||`Card ${i+1}`)}</strong><div><button class="btn ghost sm fiMove" data-index="${i}" data-dir="-1" type="button">↑</button><button class="btn ghost sm fiMove" data-index="${i}" data-dir="1" type="button">↓</button><button class="btn danger sm fiDelete" data-index="${i}" type="button">Excluir</button></div></div>${field('Visível',`familyInfo.cards.${i}.visible`,'checkbox')}<div class="row2">${field('Ícone',`familyInfo.cards.${i}.icon`)}${field('Título',`familyInfo.cards.${i}.label`)}</div>${field('Descrição',`familyInfo.cards.${i}.sub`,'textarea')}<div class="row2">${field('Texto do botão',`familyInfo.cards.${i}.button`)}${field('Link',`familyInfo.cards.${i}.href`)}</div></div>`).join('')}<button class="btn primary sm" id="fiAddCard" type="button">+ Novo card</button></div>`;
  $('#propsBody').innerHTML=html;
  wirePanel();
}
function wirePanel(){
  $$('[data-fi-path]').forEach(el=>{
    const evt=el.type==='checkbox'?'change':'input';
    el.addEventListener(evt,()=>E()?.setDeep?.(el.dataset.fiPath,el.type==='checkbox'?el.checked:el.value));
  });
  $$('.fiPickMedia').forEach(b=>b.addEventListener('click',()=>E()?.openMedia?.(b.dataset.path)));
  $$('.fiMove').forEach(b=>b.addEventListener('click',()=>{
    const a=E().state.familyInfo.cards,i=Number(b.dataset.index),j=i+Number(b.dataset.dir);
    if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];E().markDirty();window.dispatchEvent(new CustomEvent('caic-editor-rerender'));
  }));
  $$('.fiDelete').forEach(b=>b.addEventListener('click',()=>{
    const i=Number(b.dataset.index);if(!confirm('Excluir este card?'))return;E().state.familyInfo.cards.splice(i,1);E().markDirty();window.dispatchEvent(new CustomEvent('caic-editor-rerender'));
  }));
  $('#fiAddCard')?.addEventListener('click',()=>{
    E().state.familyInfo.cards.push({visible:true,icon:'ℹ️',label:'Novo card',sub:'Descrição',button:'Acessar →',href:'#'});E().markDirty();window.dispatchEvent(new CustomEvent('caic-editor-rerender'));
  });
}
function fixOrderLabel(){
  const x=$('.order-item[data-id="familias"]');if(x)x.textContent='☰ 👨‍👩‍👧‍👦 Famílias';
}
function refresh(){ensureNav();if(!ensureData())return;fixOrderLabel();renderPanel()}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='cms-section-click'||e.data.section!=='familyInfo')return;E()?.setSection?.('familyInfo')});
window.addEventListener('caic-editor-loaded',()=>setTimeout(refresh,0));
window.addEventListener('caic-editor-rerender',()=>setTimeout(refresh,0));
document.addEventListener('DOMContentLoaded',()=>{ensureNav();const t=setInterval(()=>{if(E()?.state){clearInterval(t);refresh()}},120);setTimeout(()=>clearInterval(t),12000)});
})();
