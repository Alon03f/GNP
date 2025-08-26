import { RAWG_API_KEY } from './config.js';

// Minimal RAWG client for browser
const BASE = 'https://api.rawg.io/api';

// Helpers to build query string
function qs(params) { return Object.entries(params).filter(([, v]) => v !== "" && v != null).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }

async function http(path, params = {}) {
    const url = `${BASE}${path}?${qs({ key: RAWG_API_KEY, ...params })}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RAWG ${res.status}`);
    return res.json();
}

/** Search & filter games (paged) */
export async function searchGames({ q = "", genre = "", platform = "", page = 1 } = {}) {
    const genres = (genre || "").toLowerCase();
    return http('/games', {
        search: q || undefined,
        genres: genres || undefined,       // RAWG supports `genres=action` etc.
        platforms: platform || undefined,  // IDs from platforms endpoint (e.g., 4=PC, 187=PS5)
        page, page_size: 24, ordering: '-rating'
    });
}

/** Recommend/pick: composes RAWG filters based on form */
export async function pickGames({ players, mood, length, platform, genre }) {
    const tags = [];
    if (players === 'co-op') tags.push('co-op', 'multiplayer');
    if (players === 'singleplayer') tags.push('singleplayer');

    if (mood === 'casual') tags.push('casual');
    if (mood === 'competitive') tags.push('competitive', 'pvp');
    if (mood === 'story') tags.push('story-rich');
    if (mood === 'horror') tags.push('horror', 'survival-horror');

    let ordering = '-metacritic';
    if (length === 'short') ordering = '-added'; // fresher light picks
    if (length === 'long') ordering = '-rating'; // long acclaimed

    return http('/games', {
        platforms: platform || undefined,
        genres: (genre || "").toLowerCase() || undefined,
        tags: tags.join(',') || undefined,  // RAWG allows comma-separated tags
        page_size: 30, ordering
    });
}

/** Get stores for a game to build a "Buy" button */
export async function getGameStores(id) {
    // RAWG endpoint: /games/{id}/stores — returns store domain + URL
    // (See SDK docs & wrappers) 
    // If not available, returns empty results.
    return http(`/games/${id}/stores`, {});
}

/** Single game details (optional usage) */
export async function getGame(id) {
    return http(`/games/${id}`, {});
}

// Fallback utilities (use mock data when API key missing)
export const apiAvailable = () => !!RAWG_API_KEY && RAWG_API_KEY !== "PASTE_YOUR_RAWG_KEY_HERE";
