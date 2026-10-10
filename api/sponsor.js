const crypto = require('node:crypto');
const TO = 'ctf@rait.ac.in';
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const fail = (code, error) => res.status(code).json({ok:false,error});
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return fail(405,'Method not allowed.'); }
  const {RESEND_API_KEY, SPONSOR_FROM_EMAIL, TURNSTILE_SECRET_KEY, SITE_URL} = process.env;
  if (!RESEND_API_KEY || !SPONSOR_FROM_EMAIL || !TURNSTILE_SECRET_KEY || !SITE_URL) return fail(503,'Enquiries are temporarily unavailable. Please contact ctf@rait.ac.in.');
  let origin;
  try { origin = new URL(SITE_URL).origin; } catch { return fail(503,'Enquiries are temporarily unavailable.'); }
  if (req.headers.origin !== origin) return fail(403,'Request not allowed.');
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return fail(415,'JSON required.');
  if (+req.headers['content-length'] > 12000) return fail(413,'Submission too large.');
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return fail(400,'Invalid submission.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 12000) return fail(400,'Invalid submission.');
  const data = {};
  for (const [key,max] of Object.entries({name:100,company:120,email:160,phone:30,message:1500,tier:30})) {
    if (body[key] != null && typeof body[key] !== 'string') return fail(400,'Invalid field.');
    data[key]=(body[key] || '').trim();
    if (data[key].length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(data[key])) return fail(400,'Invalid field.');
  }
  if (body.website || body.consent !== 'on' || !data.name || !data.company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !['Radiant','Diamond','Gold',"Let's discuss"].includes(data.tier)) return fail(400,'Please check the required fields.');
  if (typeof body.token !== 'string' || !body.token || body.token.length>2048) return fail(400,'Complete the security check.');
  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:TURNSTILE_SECRET_KEY,response:body.token}),signal:AbortSignal.timeout(8000)});
    const challenge=await verification.json();
    if (!verification.ok || challenge.success !== true || challenge.hostname !== new URL(origin).hostname || challenge.action !== 'sponsor') return fail(400,'Security check expired or failed. Please try again.');
    const ref=crypto.randomUUID();
    const fields=[['Reference',ref],['Received (UTC)',new Date().toISOString()],['Contact name',data.name],['Company / organisation',data.company],['Email',data.email],['Phone',data.phone || 'Not provided'],['Interested tier',data.tier],['Message',data.message || 'No message'],['Consent','Agreed to sponsorship follow-up']];
    const html=`<div style="background:#edf2fa;padding:28px;font-family:Arial,sans-serif;color:#193154"><div style="max-width:640px;margin:auto;background:white;border:1px solid #cbd7e8"><div style="background:#175ac2;color:white;padding:24px"><h1 style="margin:0;font-size:23px">RAIT CTF · Sponsorship enquiry</h1><p>A new partner would like to connect.</p></div><table style="width:100%;border-collapse:collapse">${fields.map(([key,value])=>`<tr><th style="text-align:left;vertical-align:top;padding:14px;border-bottom:1px solid #e5ebf2;width:35%">${escapeHTML(key)}</th><td style="padding:14px;border-bottom:1px solid #e5ebf2;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHTML(value)}</td></tr>`).join('')}</table><p style="padding:20px;font-size:12px">Use Reply to respond directly to the sponsor. Submitted through the RAIT CTF website.</p></div></div>`;
    const delivery=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':crypto.createHash('sha256').update(body.token).digest('hex')},body:JSON.stringify({from:SPONSOR_FROM_EMAIL,to:[TO],reply_to:data.email,subject:`RAIT CTF sponsorship enquiry — ${data.tier}`,html,text:fields.map(([k,v])=>`${k}: ${v}`).join('\n\n')}),signal:AbortSignal.timeout(10000)});
    const receipt=await delivery.json();
    if (!delivery.ok || !receipt.id) return fail(502,'Unable to submit your enquiry. Please try again.');
    return res.status(200).json({ok:true});
  } catch { return fail(502,'Unable to submit your enquiry. Please try again.'); }
};
