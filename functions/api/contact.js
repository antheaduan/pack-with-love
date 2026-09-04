// Cloudflare Pages Function: POST /api/contact
// Sends the contact form via Resend (https://resend.com).
//
// Required environment variable (Cloudflare dashboard → project → Settings →
// Environment variables):
//   RESEND_API_KEY  — a Resend API key with sending access
// Optional:
//   CONTACT_TO      — destination inbox   (default hello@packwithlove.org)
//   CONTACT_FROM    — verified sender     (default Pack with Love <hello@packwithlove.org>;
//                     until the domain is verified in Resend, set this to
//                     "Pack with Love <onboarding@resend.dev>")

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Bad request' }, 400);
  }

  // Honeypot: real visitors never fill this hidden field.
  if (data.company) return json({ ok: true });

  const name = (data.name || '').trim().slice(0, 200);
  const email = (data.email || '').trim().slice(0, 200);
  const reason = (data.reason || 'Message').trim().slice(0, 200);
  const message = (data.message || '').trim().slice(0, 5000);

  if (!name || !email || !message) return json({ ok: false, error: 'Please fill in your name, email, and message.' }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'That email address does not look right.' }, 400);
  if (!env.RESEND_API_KEY) return json({ ok: false, error: 'Mail service is not configured yet.' }, 503);

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'Pack with Love <contact@packwithlove.org>',
      to: [env.CONTACT_TO || 'hello@packwithlove.org'],
      reply_to: email,
      subject: `[packwithlove.org] ${reason} — ${name}`,
      html:
        `<p><b>Name:</b> ${esc(name)}<br>` +
        `<b>Email:</b> ${esc(email)}<br>` +
        `<b>About:</b> ${esc(reason)}</p>` +
        `<p style="white-space:pre-wrap">${esc(message)}</p>` +
        `<hr><p style="color:#888;font-size:12px">Sent from the packwithlove.org contact form.</p>`,
    }),
  });

  if (!resp.ok) return json({ ok: false, error: 'Sending failed — please email hello@packwithlove.org directly.' }, 502);
  return json({ ok: true });
}
