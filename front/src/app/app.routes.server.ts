import { RenderMode, ServerRoute } from '@angular/ssr';

// Render-mode strategy per boundary:
// - public marketing/catalog pages are prerender-friendly and SEO-sensitive
//   -> Prerender where content is static, Server where it depends on a slug
//      that isn't known at build time.
// - transactional flows (booking/checkout/payment) depend on live server
//   state and must not be prerendered.
// - authenticated portals (account/b2b/admin) are personalized and gated by
//   a client-side guard, so they render client-side only.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  // Results depend on live query params (destination/dates/filters/sort/page)
  // — server-rendered per request, never prerendered as one static page.
  { path: 'hotels', renderMode: RenderMode.Server },
  { path: 'hotels/:slug', renderMode: RenderMode.Server },
  { path: 'voyages', renderMode: RenderMode.Prerender },
  { path: 'voyages/:slug', renderMode: RenderMode.Server },
  { path: 'circuits', renderMode: RenderMode.Prerender },
  { path: 'circuits/:slug', renderMode: RenderMode.Server },
  { path: 'offers', renderMode: RenderMode.Prerender },
  { path: 'ticket-request', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'booking/**', renderMode: RenderMode.Server },
  { path: 'checkout/**', renderMode: RenderMode.Server },
  { path: 'payment/**', renderMode: RenderMode.Server },
  { path: 'account/**', renderMode: RenderMode.Client },
  { path: 'b2b/**', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
