'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Client-side navigations (router.push after booking, login, etc.) swap the page
// without any built-in announcement — screen-reader users are left on a now-empty
// focus with no cue that the view changed. This polite live region reads out the
// new page's title after each route change, restoring that cue. Visually hidden.
export function RouteAnnouncer() {
  const pathname = usePathname();
  const [message, setMessage] = useState('');
  // Skip the very first render (initial load is announced by the page itself).
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Let the new route's <title> resolve before reading it.
    const id = setTimeout(() => setMessage(document.title), 120);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" role="status" className="sr-only">
      {message}
    </div>
  );
}
