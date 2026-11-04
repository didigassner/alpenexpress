// Stellt Seiten-Pfaden den Basispfad voran (z. B. /dev beim Testbuild).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const u = (path: string) => base + path;

// true beim Vorschau-Build unter /dev/
export const isPreview = base !== '';
