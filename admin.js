import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';
import { defaultSettings, fallbackOffers } from './data.js';

const hasRealConfig = SUPABASE_URL && !SUPABASE_URL.includes('YOUR_PROJECT') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');
const supabase = hasRealConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = id => document.getElementById(id);
const authStatus = $('authStatus');
let currentSession = null;

function setStatus(msg){ authStatus.textContent = msg; }
function requireConfig(){ if(supabase) return true; setStatus('Plotëso assets/supabase-config.js para se me përdor adminin live.'); return false; }

async function ensureSeedData(){
  const settingsRes = await supabase.from('settings').select('id').eq('id',1).maybeSingle();
  if(!settingsRes.data) await supabase.from('settings').upsert({ id:1, ...defaultSettings });
  const offersRes = await supabase.from('offers').select('id').limit(1);
  if(!offersRes.data?.length) await supabase.from('offers').insert(fallbackOffers);
}

async function loadSettings(){
  if(!requireConfig()) return;
  const { data, error } = await supabase.from('settings').select('*').eq('id',1).maybeSingle();
  if(error || !data) return;
  $('brandName').value = data.brand_name || '';
  $('brandTagline').value = data.tagline || '';
  $('phone').value = data.phone || '';
  $('whatsapp').value = data.whatsapp || '';
  $('instagram').value = data.instagram || '';
  $('facebook').value = data.facebook || '';
  $('address').value = data.address || '';
  $('mapQuery').value = data.map_query || '';
  $('heroTitle').value = data.hero_title || '';
  $('heroSubtitle').value = data.hero_subtitle || '';
}

async function saveSettings(){
  if(!requireConfig()) return;
  const payload = {
    id:1,
    brand_name: $('brandName').value,
    tagline: $('brandTagline').value,
    phone: $('phone').value,
    whatsapp: $('whatsapp').value,
    instagram: $('instagram').value,
    facebook: $('facebook').value,
    address: $('address').value,
    map_query: $('mapQuery').value,
    hero_title: $('heroTitle').value,
    hero_subtitle: $('heroSubtitle').value
  };
  const { error } = await supabase.from('settings').upsert(payload);
  setStatus(error ? error.message : 'Settings u ruajtën live.');
}

function offerRow(o){
  return `<tr>
    <td>${o.city}</td><td>${o.type}</td><td>${o.price}</td><td>${o.featured ? 'Po' : 'Jo'}</td>
    <td>
      <button class="mini-btn mini-edit" data-edit="${o.id}">Edit</button>
      <button class="mini-btn mini-delete" data-delete="${o.id}">Delete</button>
    </td>
  </tr>`;
}

let offersCache = [];
async function loadOffers(){
  if(!requireConfig()) return;
  const { data, error } = await supabase.from('offers').select('*').order('created_at',{ascending:false});
  if(error) { setStatus(error.message); return; }
  offersCache = data || [];
  $('offersTableBody').innerHTML = offersCache.map(offerRow).join('');
  document.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => fillOfferForm(btn.dataset.edit));
  document.querySelectorAll('[data-delete]').forEach(btn => btn.onclick = () => deleteOffer(btn.dataset.delete));
}
function fillOfferForm(id){
  const o = offersCache.find(x => String(x.id) === String(id));
  if(!o) return;
  $('offerId').value = o.id;
  $('offerCity').value = o.city || '';
  $('offerType').value = o.type || '';
  $('offerPrice').value = o.price || '';
  $('offerDuration').value = o.duration || '';
  $('offerMeta').value = o.meta || '';
  $('offerImage').value = o.image_url || '';
  $('offerDescription').value = o.description || '';
  $('offerFeatured').value = o.featured ? 'true' : 'false';
  window.scrollTo({ top: $('offersPanel').offsetTop - 20, behavior:'smooth' });
}
function resetOfferForm(){ $('offerForm').reset(); $('offerId').value = ''; $('offerFeatured').value = 'true'; }

async function saveOffer(e){
  e.preventDefault();
  if(!requireConfig()) return;
  const payload = {
    city: $('offerCity').value,
    type: $('offerType').value,
    price: $('offerPrice').value,
    duration: $('offerDuration').value,
    meta: $('offerMeta').value,
    image_url: $('offerImage').value,
    description: $('offerDescription').value,
    featured: $('offerFeatured').value === 'true'
  };
  const id = $('offerId').value;
  let error;
  if(id){ ({ error } = await supabase.from('offers').update(payload).eq('id', id)); }
  else { ({ error } = await supabase.from('offers').insert(payload)); }
  setStatus(error ? error.message : 'Oferta u ruajt live.');
  if(!error){ resetOfferForm(); await loadOffers(); }
}
async function deleteOffer(id){
  if(!confirm('A je i sigurt?')) return;
  const { error } = await supabase.from('offers').delete().eq('id', id);
  setStatus(error ? error.message : 'Oferta u fshi.');
  if(!error) await loadOffers();
}

async function login(){
  if(!requireConfig()) return;
  const email = $('loginEmail').value.trim();
  const password = $('loginPassword').value;
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  if(error) return setStatus(error.message);
  currentSession = data.session;
  setStatus(`I kyçur si ${email}`);
  await bootAdmin();
}
async function logout(){
  if(!requireConfig()) return;
  await supabase.auth.signOut();
  currentSession = null;
  setStatus('U bë logout.');
}
async function checkSession(){
  if(!requireConfig()) return;
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  setStatus(currentSession ? `I kyçur si ${currentSession.user.email}` : 'Nuk je i kyçur.');
}
async function bootAdmin(){
  await checkSession();
  if(!currentSession) return;
  await ensureSeedData();
  await loadSettings();
  await loadOffers();
}
function bind(){
  $('loginBtn').onclick = login;
  $('logoutBtn').onclick = logout;
  $('saveSettingsBtn').onclick = saveSettings;
  $('offerForm').addEventListener('submit', saveOffer);
  $('resetOfferBtn').onclick = resetOfferForm;
}

bind();
bootAdmin();
