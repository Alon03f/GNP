// Injects a consistent header/footer and handles active nav + hamburger drawer
function headerHTML(active = "home") {
    const link = (href, label, key) =>
        `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;
    return `
    <header class="site"><nav class="nav">
    <a class="brand" href="./index.html"><span class="logo"></span> GNP</a>
    <div class="menu">
        ${link('./picker.html', 'Picker', 'picker')}
        ${link('./explore.html', 'Explore', 'explore')}
        ${link('./favorites.html', 'Favorites', 'favorites')}
        ${link('./profile.html', 'Profile', 'profile')}
        ${link('./auth.html', 'Sign in', 'auth')}
    </div>
    <button class="btn hamburger" id="openDrawer"><i class="fa-solid fa-bars-staggered"></i> Menu</button>
    </nav></header>
    <aside class="drawer" id="drawer">
    ${link('./picker.html', 'Picker', 'picker')}
    ${link('./explore.html', 'Explore', 'explore')}
    ${link('./favorites.html', 'Favorites', 'favorites')}
    ${link('./profile.html', 'Profile', 'profile')}
    ${link('./auth.html', 'Sign in', 'auth')}
    </aside>`;
}
function footerHTML() {
    return `
    <footer class="site">
    <div class="footer-inner">
        <span class="footer-note">© ${new Date().getFullYear()} All rights reserved to Alon Fridman.</span>
        <div class="links">
        <a href="mailto:alon03f10@gmail.com" title="Email"><i class="fa-solid fa-envelope"></i></a>
        <a href="https://github.com/Alon03f" target="_blank" rel="noopener" title="GitHub"><i class="fa-brands fa-github"></i></a>
        <a href="https://www.linkedin.com/in/alon-fridman-16a917352?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener" title="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
        </div>
    </div>
    </footer>`;
}
(function inject() {
    const headerMount = document.getElementById('site-header');
    const active = headerMount?.dataset?.active || (location.pathname.includes('index') ? 'home' : '');
    if (headerMount) { headerMount.outerHTML = headerHTML(active); }
    const footerMount = document.getElementById('site-footer');
    if (footerMount) { footerMount.outerHTML = footerHTML(); }

    // drawer handlers
    const drawer = document.getElementById('drawer');
    document.getElementById('openDrawer')?.addEventListener('click', () => drawer.classList.add('open'));
    drawer?.addEventListener('click', (e) => { if (e.target.tagName === 'A' || e.target === drawer) drawer.classList.remove('open'); });
})();

// Mouse glow on cards
document.addEventListener('pointermove', e => {
    document.querySelectorAll('.shimmer').forEach(el => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    });
});
