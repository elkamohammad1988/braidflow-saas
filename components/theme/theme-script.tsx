/**
 * Blocking theme-init script. Rendered as the first child of <body> so it runs
 * synchronously during HTML parse — before the browser paints any content — and
 * sets the `.dark` class + `color-scheme` from the stored preference (falling back
 * to the OS setting). This is what makes the theme flip flash-free: the correct
 * register is on <html> before the first pixel is drawn. The root <html> ships
 * with no theme class and `suppressHydrationWarning`, so React tolerates the class
 * this script adds.
 */
const script = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(_){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
