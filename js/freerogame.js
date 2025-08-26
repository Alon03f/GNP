// freetogame.js
export async function getBrowserGames() {
    const res = await fetch('https://www.freetogame.com/api/games?platform=browser');
    if (!res.ok) throw new Error('API failed');
    const games = await res.json();
    return games; // מחזיר מערך של משחקים
}
