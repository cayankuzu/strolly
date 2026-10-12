/**
 * ÖTE — the words printed in the set (pages, panels, screens, plaques) follow
 * the reader's language: the page's <html lang> (set by the game's settings)
 * when the set is drawn. Turkish is the original.
 */
export const english = () => typeof document !== 'undefined' && document.documentElement.lang === 'en'
/** A printed string in the reader's language. */
export const T = (tr: string, en: string) => (english() ? en : tr)
/** Thousands grouped the reader's way: 4.117 in Turkish, 4,117 in English. */
export const num = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, english() ? ',' : '.')
