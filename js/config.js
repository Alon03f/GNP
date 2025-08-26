// ==== REQUIRED: RAWG API KEY ====
// Get yours at https://rawg.io/apidocs  (must include ?key=... in every request)
// Free tier is enough for this project.  (20k req/mo typically)
export const RAWG_API_KEY = "PASTE_YOUR_RAWG_KEY_HERE";

// Optional: EmailJS (client-side email on sign-up). If left empty, the app will fallback to a 'mailto:' link silently.
export const EMAILJS = {
    PUBLIC_KEY: "PASTE_EMAILJS_PUBLIC_KEY_OR_LEAVE_EMPTY",
    SERVICE_ID: "PASTE_EMAILJS_SERVICE_ID",
    TEMPLATE_ID: "PASTE_EMAILJS_TEMPLATE_ID"
};
