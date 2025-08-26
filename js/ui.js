import { toggleFav, isFav } from './storage.js';

export function toast(msg, ms = 1800) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
}

export function skeletonCards(n = 8) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
        const s = document.createElement('div'); s.className = 'skeleton';
        frag.appendChild(s);
    }
    return frag;
}

export function renderGames(container, results = []) {
    container.innerHTML = '';
    results.forEach(g => {
        container.appendChild(gameCard(g));
    });
    if (!results.length) {
        const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'No results.';
        container.appendChild(p);
    }
}

function openTrailer(name) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' trailer')}`;
    window.open(url, '_blank', 'noopener');
}

function openStoreLink(stores) {
    if (!stores?.results?.length) { toast('No store link found'); return; }
    // Prefer Steam if present:
    const steam = stores.results.find(s => /steam/i.test(s.store?.name || s.store?.slug || ''));
    const first = steam || stores.results[0];
    const url = first?.url || first?.store?.domain && ('https://' + first.store.domain);
    if (url) window.open(url, '_blank', 'noopener'); else toast('No store link found');
}

function gameCard(g) {
    // Minimal safe fields
    const id = g.id, name = g.name;
    const img = (g.background_image || g.background_image_additional || '');
    const rating = (g.metacritic || g.rating || 0);
    const badges = [];
    if (g.genres?.length) badges.push(...g.genres.slice(0, 2).map(x => x.name));
    if (g.parent_platforms?.length) badges.push(...g.parent_platforms.slice(0, 2).map(x => x.platform.name));
    const card = document.createElement('article');
    card.className = 'card tilt'; card.innerHTML = `
    <div class="card-media shimmer">${img ? `<img class="game-thumb" src="${img}" alt="">` : ''}</div>
    <div class="card-body">
      <h3>${name}</h3>
      <div class="badges">${badges.map(b => `<span class="badge">${b}</span>`).join('')}</div>
      <p class="muted tiny">Score: ${rating || '—'}</p>
      <div class="actions">
        <button class="btn btn-primary buy"><i class="fa-brands fa-steam-symbol"></i> Buy</button>
        <button class="btn trailer"><i class="fa-brands fa-youtube"></i> Trailer</button>
        <button class="btn fav"><i class="fa-${isFav(id) ? 'solid' : 'regular'} fa-heart"></i> Save</button>
      </div>
    </div>
  `;
    card.querySelector('.trailer').addEventListener('click', () => openTrailer(name));
    card.querySelector('.buy').addEventListener('click', () => card.dispatchEvent(new CustomEvent('buy-game', { detail: { id }, bubbles: true })));
    card.querySelector('.fav').addEventListener('click', (e) => {
        const saved = toggleFav({ id, name, background_image: img, genres: g.genres || [], parent_platforms: g.parent_platforms || [], metacritic: rating });
        e.currentTarget.innerHTML = `<i class="fa-${saved ? 'solid' : 'regular'} fa-heart"></i> Save`;
        toast(saved ? 'Saved to favorites' : 'Removed from favorites');
    });
    return card;
}
