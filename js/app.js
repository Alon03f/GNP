import { searchGames, pickGames, getGameStores, apiAvailable } from './api.js';
import { renderGames, skeletonCards, toast } from './ui.js';
import { getFavorites, requireAuth, getUser } from './storage.js';
import { handleSignup, handleLogin, handleLogout } from './auth.js';
import { getBrowserGames } from './freetogame.js';

document.addEventListener('DOMContentLoaded', async () => {
    // רק לדוגמה: תביא 5 משחקים ראשונים ותדפיס
    try {
        const games = await getBrowserGames();
        console.log(games.slice(0, 5));
    } catch (err) {
        console.error(err);
    }
});

// Router-ish: run per page by DOM presence
document.addEventListener('DOMContentLoaded', () => {
    // Explore page
    const results = document.getElementById('results');
    if (results) {
        const form = document.getElementById('searchForm');
        const prev = document.getElementById('prevPage');
        const next = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');
        let state = { page: 1, q: '', genre: '', platform: '' };

        async function run() {
            results.innerHTML = ''; results.appendChild(skeletonCards(9));
            try {
                const { q, genre, platform, page } = state;
                let data;
                if (apiAvailable()) {
                    data = await searchGames({ q, genre, platform, page });
                } else {
                    // fallback from mock
                    const mock = await fetch('./data/mock-games.json').then(r => r.json());
                    data = { results: mock.slice((page - 1) * 24, page * 24), next: page < 3, previous: page > 1 };
                }
                renderGames(results, data.results || []);
                // attach buy events
                results.addEventListener('buy-game', async (ev) => {
                    try {
                        const stores = apiAvailable() ? await getGameStores(ev.detail.id) : { results: [] };
                        // ui.js will prefer Steam; we just dispatch a synthetic click:
                        const card = ev.target;
                        const fakeStores = stores;
                        const openStore = new Function('stores', '' + (function openStoreLink(stores) {
                            if (!stores?.results?.length) { alert('No store link found'); return; }
                            const steam = stores.results.find(s => /steam/i.test(s.store?.name || s.store?.slug || ''));
                            const first = steam || stores.results[0];
                            const url = first?.url || first?.store?.domain && ('https://' + first.store.domain);
                            if (url) window.open(url, '_blank', 'noopener'); else alert('No store link found');
                        }).toString().replace(/^function\s+\w+\(\w+\)\s*\{|\}$/g, ''));
                        openStore(fakeStores);
                    } catch { toast('No store link'); }
                }, { once: true });

                // pagination
                prev.disabled = !data.previous; next.disabled = !data.next;
                pageInfo.textContent = `Page ${page}`;
            } catch (e) {
                console.error(e); results.innerHTML = '<p class="muted">Failed to load games.</p>';
            }
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            state = { page: 1, q: fd.get('q').trim(), genre: fd.get('genre'), platform: fd.get('platform') };
            run();
        });
        prev.addEventListener('click', () => { state.page = Math.max(1, state.page - 1); run(); });
        next.addEventListener('click', () => { state.page += 1; run(); });
        run();
    }

    // Picker page
    const pickerForm = document.getElementById('pickerForm');
    const pickerResults = document.getElementById('pickerResults');
    if (pickerForm && pickerResults) {
        pickerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(pickerForm);
            pickerResults.innerHTML = ''; pickerResults.appendChild(skeletonCards(6));
            try {
                const res = apiAvailable()
                    ? await pickGames({
                        players: fd.get('players'), mood: fd.get('mood'), length: fd.get('length'),
                        platform: fd.get('platform'), genre: fd.get('genre')
                    })
                    : { results: (await (await fetch('./data/mock-games.json')).json()).slice(0, 12) };
                // Shuffle a bit for variety and show 6
                const arr = (res.results || []).sort(() => Math.random() - 0.5).slice(0, 6);
                renderGames(pickerResults, arr);
            } catch (e) {
                console.error(e); pickerResults.innerHTML = '<p class="muted">Could not pick games right now.</p>';
            }
        });
    }

    // Favorites page
    const favList = document.getElementById('favList');
    if (favList) {
        const items = getFavorites();
        if (!items.length) { document.getElementById('noFavs').style.display = 'block'; }
        // Fake RAWG-like shape to reuse renderer
        renderGames(favList, items);
    }

    // Profile page
    const profileView = document.getElementById('profileView');
    if (profileView) {
        if (!requireAuth()) return;
        const u = getUser();
        profileView.innerHTML = `
      <label>Name<input type="text" value="${u.name || ''}" disabled></label>
      <label>Email<input type="email" value="${u.email || ''}" disabled></label>
      <label>Password
        <div class="password-field">
          <input type="password" id="profilePass" value="${u.password || ''}" disabled>
          <button class="icon-btn" id="toggleProfilePass"><i class="fa-solid fa-eye"></i></button>
        </div>
      </label>
    `;
        document.getElementById('toggleProfilePass').addEventListener('click', () => {
            const input = document.getElementById('profilePass');
            input.type = (input.type === 'password' ? 'text' : 'password');
            setTimeout(() => input.type = 'password', 2500); // auto-hide back to ****
        });
        document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    }

    // Auth page
    const signup = document.getElementById('signupForm');
    const login = document.getElementById('loginForm');
    if (signup) {
        // toggle eye icons
        signup.querySelector('.toggle-pass')?.addEventListener('click', () => {
            const input = signup.querySelector('input[name="password"]');
            input.type = input.type === 'password' ? 'text' : 'password';
            setTimeout(() => input.type = 'password', 2500);
        });
        signup.addEventListener('submit', async (e) => {
            e.preventDefault();
            try { await handleSignup(signup); } catch (err) { alert(err.message); }
        });
    }
    if (login) {
        login.querySelector('.toggle-pass')?.addEventListener('click', () => {
            const input = login.querySelector('input[name="password"]');
            input.type = input.type === 'password' ? 'text' : 'password';
            setTimeout(() => input.type = 'password', 2500);
        });
        login.addEventListener('submit', (e) => {
            e.preventDefault();
            try { handleLogin(login); } catch (err) { alert(err.message); }
        });
    }
});
