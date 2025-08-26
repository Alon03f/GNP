import { setUser, getUser, clearUser } from './storage.js';
import { EMAILJS } from './config.js';

// Initialize EmailJS only if configured
function emailEnabled() {
    return EMAILJS.PUBLIC_KEY && EMAILJS.SERVICE_ID && EMAILJS.TEMPLATE_ID && EMAILJS.PUBLIC_KEY !== "PASTE_EMAILJS_PUBLIC_KEY_OR_LEAVE_EMPTY";
}
if (emailEnabled()) {
    // load emailjs SDK
    const s = document.createElement('script');
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => window.emailjs.init({ publicKey: EMAILJS.PUBLIC_KEY });
    document.head.appendChild(s);
}

export async function handleSignup(form) {
    const data = Object.fromEntries(new FormData(form));
    const user = { name: data.name.trim(), email: data.email.trim().toLowerCase(), password: data.password, createdAt: Date.now() };
    setUser(user);

    // Send welcome email (best-effort)
    try {
        if (emailEnabled() && window.emailjs) {
            await window.emailjs.send(EMAILJS.SERVICE_ID, EMAILJS.TEMPLATE_ID, {
                to_email: user.email,
                to_name: user.name || 'Gamer',
                subject: 'sign-up success!',
                message: `Thanks for signing up to GNP — Game Night Picker!\n\nHow to use:\n• Explore games and save favorites\n• Use the Picker to get a tailored suggestion\n• Open store links or watch a trailer\n\nAll rights for this site are reserved to Alon Fridman.`
            });
        } else {
            // Silent fallback: prepare a mailto link without forcing a redirect
            console.info('EmailJS not configured. Skipping welcome email.');
        }
    } catch (e) { console.warn('Email send failed', e); }

    location.href = './profile.html';
}

export function handleLogin(form) {
    const data = Object.fromEntries(new FormData(form));
    const current = getUser();
    if (!current || current.email !== data.email.trim().toLowerCase() || current.password !== data.password) {
        throw new Error('Invalid email or password');
    }
    // already stored; redirect
    location.href = './profile.html';
}

export function handleLogout() {
    clearUser();
    location.href = './auth.html';
}
