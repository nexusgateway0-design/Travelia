import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';
import { defaultSettings, fallbackOffers, galleryImages } from './data.js';

const hasRealConfig = SUPABASE_URL && !SUPABASE_URL.includes('YOUR_PROJECT') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');
const supabase = hasRealConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let currentOffers = [...fallbackOffers];
let currentSettings = { ...defaultSettings };

function qs(id){ return document.getElementById(id); }
function page(){ return document.body.dataset.page || 'home'; }
function encodeMessage(msg){ return encodeURIComponent(msg); }
function waLink(text='Pershendetje Travelia, dua nje oferte.'){
  const clean = (currentSettings.whatsapp || '38348722112').replace(/\D/g,'');
  return `https://wa.me/${clean}?text=${encodeMessage(text)}`;
}
function headerTemplate(){
  const links = [
    ['index.html','Kryefaqja','home'],
    ['destinations.html','Destinacionet','destinations'],
    ['offers.html','Ofertat','offers'],
    ['about.html','Rreth Nesh','about'],
    ['gallery.html','Galeria','gallery'],
    ['contact.html','Kontakti','contact'],
    ['admin.html','Admin','admin']
  ];
  return `<header class="nav"><div class="container nav-inner">
    <a href="index.html" class="brand">
      <div class="brand-logo"><span>✈</span></div>
      <div class="brand-text"><strong>${currentSettings.brand_name.toLowerCase()}</strong><small>${currentSettings.tagline}</small></div>
    </a>
    <nav class="nav-links">${links.map(([href,label,key])=>`<a class="${page()===key?'active':''}" href="${href}">${label}</a>`).join('')}</nav>
    <a class="btn btn-primary" href="${waLink()}" target="_blank">WhatsApp</a>
  </div></header>`;
}
function footerTemplate(){
  return `<footer class="footer"><div class="container footer-grid">
    <div class="brand"><div class="brand-logo"><span>✈</span></div><div class="brand-text"><strong>${currentSettings.brand_name.toLowerCase()}</strong><small>${currentSettings.tagline}</small></div></div>
    <p>© 2026 ${currentSettings.brand_name} L.L.C — ${currentSettings.address} • ${currentSettings.phone}</p>
  </div></footer>`;
}
function renderLayout(){
  const h = qs('site-header'); if(h) h.innerHTML = headerTemplate();
  const f = qs('site-footer'); if(f) f.innerHTML = footerTemplate();
  const float = qs('floatWhatsapp'); if(float) float.href = waLink();
}
function offerCard(offer){
  return `<article class="card">
    <div class="card-media">
      <img src="${offer.image_url}" alt="${offer.city}">
      <div class="badge">${offer.type}</div>
      <div class="price">${offer.price}</div>
    </div>
    <div class="card-body">
      <h3 class="card-title">${offer.city}</h3>
      <p class="card-text">${offer.description || ''}</p>
      <div class="card-meta"><span>${offer.duration || ''}</span><span>${offer.meta || ''}</span></div>
      <div class="card-actions">
        <a class="btn btn-dark" href="${waLink(`Pershendetje Travelia, dua oferte per ${offer.city}.`)}" target="_blank">Rezervo</a>
        <a class="btn btn-outline" href="contact.html">Detaje</a>
      </div>
    </div>
  </article>`;
}
function renderFeatured(){ const el=qs('featuredOffers'); if(!el) return; el.innerHTML = currentOffers.filter(x=>x.featured).slice(0,3).map(offerCard).join(''); }
function renderOffersPage(){
  const wrap = qs('allOffers'); if(!wrap) return;
  const city = qs('filterCity')?.value || 'all';
  const type = qs('filterType')?.value || 'all';
  const data = currentOffers.filter(o => (city==='all'||o.city===city) && (type==='all'||o.type===type));
  wrap.innerHTML = data.map(offerCard).join('');
  const empty = qs('offersEmpty'); if(empty) empty.style.display = data.length ? 'none' : 'block';
}
function uniqueCities(){ return [...new Set(currentOffers.map(x=>x.city))].sort(); }
function fillCitySelect(select, allText='— Të gjitha destinacionet —'){
  if(!select) return;
  select.innerHTML = `<option value="all">${allText}</option>` + uniqueCities().map(c=>`<option value="${c}">${c}</option>`).join('');
}
function renderHomeSearch(){
  fillCitySelect(qs('destinationSelect'));
  const quick = qs('quickTags');
  if(quick) quick.innerHTML = uniqueCities().slice(0,6).map(c=>`<button class="tag" data-city="${c}">${c}</button>`).join('');
  const btn = qs('searchBtn');
  if(btn) btn.onclick = () => {
    const city = qs('destinationSelect')?.value || 'all';
    const type = qs('tripType')?.value || 'all';
    const query = new URLSearchParams();
    if(city !== 'all') query.set('city', city);
    if(type !== 'all') query.set('type', type);
    location.href = `offers.html${query.toString() ? `?${query.toString()}` : ''}`;
  };
  quick?.querySelectorAll('.tag').forEach(btn=>btn.onclick=()=>{
    location.href=`offers.html?city=${encodeURIComponent(btn.dataset.city)}`;
  });
}
function renderDestinations(){
  const grid = qs('destinationsGrid'); if(!grid) return;
  const cards = uniqueCities().map(city => currentOffers.find(x=>x.city===city)).filter(Boolean);
  grid.innerHTML = cards.map(o=>`<a href="offers.html?city=${encodeURIComponent(o.city)}" class="dest"><img src="${o.image_url}" alt="${o.city}"><div class="dest-content"><h3>${o.city}</h3><p>${o.description || ''}</p></div></a>`).join('');
}
function renderGallery(){ const grid = qs('galleryGrid'); if(!grid) return; grid.innerHTML = galleryImages.map(src=>`<img src="${src}" alt="Travel image">`).join(''); }
function renderContact(){
  const list = qs('contactList'); if(list){ list.innerHTML = `
    <div class="contact-row"><small>WhatsApp / Telefon</small><div>${currentSettings.phone}</div></div>
    <div class="contact-row"><small>Adresa</small><div>${currentSettings.address}</div></div>
    <div class="contact-row"><small>Shërbimet</small><div>Bileta avioni, hotele, city breaks, paketa turistike</div></div>
    <div class="contact-row"><small>Kontakt i shpejtë</small><div><a href="${waLink()}" target="_blank" style="color:var(--gold);font-weight:800">Kliko për WhatsApp →</a></div></div>`; }
  const map = qs('mapFrame'); if(map){ map.src = `https://www.google.com/maps?q=${encodeURIComponent(currentSettings.map_query)}&z=15&output=embed`; }
  const wa = qs('waBtn'); if(wa) wa.href = waLink();
  const ig = qs('igBtn'); if(ig) ig.href = currentSettings.instagram || '#';
  const fb = qs('fbBtn'); if(fb) fb.href = currentSettings.facebook || '#';
}
function applyTexts(){
  const title = qs('hero-title'); if(title) title.innerHTML = currentSettings.hero_title;
  const subtitle = qs('hero-subtitle'); if(subtitle) subtitle.textContent = currentSettings.hero_subtitle;
  const heroWa = qs('hero-whatsapp'); if(heroWa) heroWa.href = waLink();
}
function applyQueryFilters(){
  const params = new URLSearchParams(location.search);
  const city = params.get('city'); const type = params.get('type');
  fillCitySelect(qs('filterCity'), 'Të gjitha destinacionet');
  if(qs('filterCity') && city) qs('filterCity').value = city;
  if(qs('filterType') && type) qs('filterType').value = type;
  qs('filterCity')?.addEventListener('change', renderOffersPage);
  qs('filterType')?.addEventListener('change', renderOffersPage);
}
function rerender(){ renderLayout(); applyTexts(); renderFeatured(); renderHomeSearch(); applyQueryFilters(); renderOffersPage(); renderDestinations(); renderGallery(); renderContact(); }

async function fetchSettings(){
  if(!supabase) return;
  const { data } = await supabase.from('settings').select('*').eq('id',1).maybeSingle();
  if(data) currentSettings = data;
}
async function fetchOffers(){
  if(!supabase) return;
  const { data } = await supabase.from('offers').select('*').order('created_at',{ascending:false});
  if(data?.length) currentOffers = data;
}
function subscribeRealtime(){
  if(!supabase) return;
  supabase.channel('public-offers').on('postgres_changes',{event:'*',schema:'public',table:'offers'}, async()=>{ await fetchOffers(); rerender(); }).subscribe();
  supabase.channel('public-settings').on('postgres_changes',{event:'*',schema:'public',table:'settings'}, async()=>{ await fetchSettings(); rerender(); }).subscribe();
}

(async function init(){
  await fetchSettings();
  await fetchOffers();
  rerender();
  subscribeRealtime();
})();
