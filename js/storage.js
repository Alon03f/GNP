const LS_KEYS = {
    USER: 'gnp_user',
    FAVORITES: 'gnp_favorites'
};

export function getUser() { try { return JSON.parse(localStorage.getItem(LS_KEYS.USER)) || null; } catch { return null; } }
export function setUser(u) { localStorage.setItem(LS_KEYS.USER, JSON.stringify(u)); }
export function clearUser() { localStorage.removeItem(LS_KEYS.USER); }

export function requireAuth() {
    const u = getUser();
    if (!u) { location.href = './auth.html'; return false; }
    return true;
}

export function getFavorites() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.FAVORITES)) || []; } catch { return []; }
}
export function setFavorites(arr) { localStorage.setItem(LS_KEYS.FAVORITES, JSON.stringify(arr)); }
export function isFav(id) { return getFavorites().some(g => g.id === id); }
export function toggleFav(game) {
    const favs = getFavorites();
    const idx = favs.findIndex(g => g.id === game.id);
    if (idx >= 0) { favs.splice(idx, 1); setFavorites(favs); return false; }
    favs.unshift(game); setFavorites(favs); return true;
}
