// Worker entry: handles POST /api/contact (Resend relay); everything else
// falls through to the static assets. The form logic lives in
// functions/api/contact.js and is reused here unchanged.

import { onRequestPost as contact } from '../functions/api/contact.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
      return contact({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
