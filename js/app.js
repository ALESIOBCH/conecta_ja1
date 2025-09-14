const DB = { url: '../data/providers.json' };
const UI = {
  results: document.getElementById('results'),
  cards: document.getElementById('cards'),
  year: document.getElementById('year'),
  q: document.getElementById('q'),
  form: document.getElementById('searchForm'),
};
document.getElementById('year').textContent = new Date().getFullYear();

// Helpers
const isCEP = (s) => /\d{5}-?\d{3}/.test(s) || /\d{5}/.test(s);
const norm = (s) => (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
const onlyDigits = (s) => (s||'').replace(/\D/g,'');

// Load DB
let PROVIDERS = [];
fetch(DB.url).then(r=>r.json()).then(j=>PROVIDERS = j.providers);

// Search handler
UI.form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const termRaw = UI.q.value || '';
  const term = norm(termRaw);
  if(!term){ return; }

  let matches = [];
  if(isCEP(termRaw)){
    const prefix = onlyDigits(termRaw).slice(0,5);
    matches = PROVIDERS.filter(p => (p.cep_prefixes||[]).some(cp => cp.startsWith(prefix)));
  } else {
    matches = PROVIDERS.filter(p => (p.cities||[]).some(c => norm(c).includes(term)));
  }

  // exclusividade: se alguma entrada marca a cidade como exclusiva, mostra só ela
  if(!isCEP(termRaw)){
    const cityName = termRaw;
    const exclusive = PROVIDERS.find(p => (p.exclusive_cities||[]).some(c => norm(c)===norm(cityName)));
    if(exclusive){ matches = [exclusive]; }
  }

  renderCards(matches, termRaw);
});

function renderCards(list, query){
  UI.cards.innerHTML = '';
  if(!list.length){
    UI.cards.innerHTML = `<div class="card">Nenhum provedor parceiro encontrado para <strong>${query}</strong>. Tente outra cidade/CEP.</div>`;
    UI.results.style.display = 'block';
    return;
  }
  list.forEach(p=>{
    const plans = (p.plans||[]).map(pl => `<span class="chip">${pl.name} • ${pl.price||''}</span>`).join('');
    const cities = (p.cities||[]).slice(0,5).join(', ');
    const prefill = encodeURIComponent(`Olá, encontrei seu provedor pela ConectaJá. Tenho interesse de instalação em ${query}.`);
    const whats = `https://wa.me/${(p.contacts?.whats||'').replace(/\D/g,'')}?text=${prefill}`;
    const email = `mailto:${p.contacts?.email||''}?subject=${encodeURIComponent('Interesse em instalação')}&body=${prefill}`;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${p.name}</h3>
      <div class="muted mini">Atende: ${cities}${(p.exclusive_cities||[]).includes(query) ? ' • Exclusivo' : ''}</div>
      <div class="chips">${plans}</div>
      <div class="row">
        <a class="btn" href="${whats}" target="_blank" rel="noopener">Falar no WhatsApp</a>
        <a class="btn ghost" href="${email}">Enviar e‑mail</a>
        ${p.contacts?.site ? `<a class="btn ghost" href="${p.contacts.site}" target="_blank" rel="noopener">Site</a>` : ''}
      </div>
    `;
    UI.cards.appendChild(card);
  });
  UI.results.style.display = 'block';

  // salva lead localmente (demo)
  saveLead({ query, ts: new Date().toISOString(), results: list.map(x=>x.id) });
}

// Local demo DB for leads
function saveLead(obj){
  try{
    const k = 'cj_leads';
    const data = JSON.parse(localStorage.getItem(k) || '[]');
    data.push(obj);
    localStorage.setItem(k, JSON.stringify(data));
  }catch(e){ /* ignore */ }
}
