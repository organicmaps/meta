export {};

import { getServersList } from './servers';
import { getLatestRelease } from './releases';

// Main entry point.
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request).catch((err) => new Response(err.stack, { status: 500 })));
});

export async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);

  switch (pathname) {
    case '/maps': // Public for map files.
    case '/resources': // Public for resources.
    case '/servers':
      return getServersList(request);
    case '/releases':
      return getLatestRelease(request);
  }
  return new Response('', { status: 404 });
}
