module.exports = (req,res) => {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({ok:false}); }
  const {TURNSTILE_SITE_KEY,TURNSTILE_SECRET_KEY,RESEND_API_KEY,SPONSOR_FROM_EMAIL,SITE_URL}=process.env;
  if (!TURNSTILE_SITE_KEY || !TURNSTILE_SECRET_KEY || !RESEND_API_KEY || !SPONSOR_FROM_EMAIL || !SITE_URL) return res.status(503).json({ok:false});
  return res.status(200).json({ok:true,siteKey:TURNSTILE_SITE_KEY});
};
