(function () {
  'use strict';
  const dialog = document.createElement('dialog');
  dialog.className = 'sponsor-dialog';
  dialog.setAttribute('aria-labelledby', 'sponsor-heading');
  dialog.innerHTML = `<div class="sponsor-dialog-title"><img src="assets/icons/community.png" alt=""><span>Sponsorship enquiry.exe</span><button type="button" aria-label="Close sponsor form">×</button></div>
  <form><h2 id="sponsor-heading">Let's build the next arena.</h2><p>Tell us about your organisation. Let’s find the right partnership for you.</p>
  <div class="sponsor-fields">
  <label>Contact name *<input name="name" autocomplete="name" required maxlength="100"></label>
  <label>Company / organisation *<input name="company" autocomplete="organization" required maxlength="120"></label>
  <label>Email address *<input name="email" type="email" autocomplete="email" required maxlength="160"></label>
  <label>Phone number (optional)<input name="phone" type="tel" autocomplete="tel" maxlength="30"></label>
  <label class="wide">Interested tier *<select name="tier" required><option value="">Select a tier</option><option>Radiant</option><option>Diamond</option><option>Gold</option><option>Let's discuss</option></select></label>
  <label class="wide">Anything you'd like us to know? (optional)<textarea name="message" rows="3" maxlength="1500"></textarea></label></div>
  <label class="sponsor-consent"><input type="checkbox" name="consent" required> I agree to be contacted about this sponsorship enquiry.</label><label class="sponsor-honeypot" aria-hidden="true">Leave empty<input name="website" tabindex="-1" autocomplete="off"></label><div id="sponsor-verification"></div><p>Your details will be emailed to ctf@rait.ac.in for sponsorship follow-up.</p><button class="sponsor-submit" type="submit">Submit →</button>
  <div class="sponsor-result" role="alert" hidden><p></p></div></form><div class="sponsor-thanks" hidden tabindex="-1"><div class="thanks-icon" aria-hidden="true">✓</div><h2>Thank you!</h2><p>Your enquiry has been submitted. Thank you for supporting RAIT CTF!</p><button type="button" class="sponsor-submit">Back to the event</button></div>`;
  document.body.appendChild(dialog);
  const form = dialog.querySelector('form');
  const result = dialog.querySelector('.sponsor-result');
  const thanks = dialog.querySelector('.sponsor-thanks');
  thanks.querySelector('button').addEventListener('click', () => { if (!busy) dialog.close(); });
  const submit = dialog.querySelector('.sponsor-submit');
  document.querySelectorAll('#lp-enter-btn, #lp-rules-btn').forEach(button => button.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); } }));
  let opener, widget, token = '', busy = false, widgetLoading;
  function report(message) { result.hidden=false; result.querySelector('p').textContent=message; }
  async function loadVerification() {
    if (widget !== undefined) { window.turnstile.reset(widget); return; }
    if (widgetLoading) return widgetLoading;
    widgetLoading=(async () => {
      const response=await fetch('/api/form-config');
      const config=await response.json();
      if (!response.ok || !config.ok) throw new Error('Unavailable');
      if (!window.turnstile) await new Promise((resolve,reject) => {
        const script=document.createElement('script');
        script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.onload=resolve; script.onerror=() => {script.remove();reject(new Error('Unavailable'));};
        document.head.appendChild(script);
      });
      widget=window.turnstile.render('#sponsor-verification',{sitekey:config.siteKey,action:'sponsor',size:'flexible',callback:value=>{token=value;},'expired-callback':()=>{token='';},'error-callback':()=>{token='';report('Security check could not load. Close and reopen the form to retry.');}});
    })();
    try { await widgetLoading; } finally { widgetLoading=null; }
  }
  function open(button) {
    if (busy) return;
    opener = button;
    token = "";
    result.hidden = true;
    thanks.hidden = true;
    form.hidden = false;
    const tier = button.getAttribute('data-sponsor');
    if (tier) form.elements.tier.value = tier;
    dialog.showModal();
    form.elements.name.focus();
    loadVerification().catch(() => report("The enquiry service is unavailable. Please contact ctf@rait.ac.in."));
  }
  document.querySelectorAll('[data-sponsor], #lp2-sponsor-mail-btn').forEach(button => {
    button.addEventListener('click', e => { e.preventDefault(); open(button); });
  });
  dialog.querySelector('[aria-label="Close sponsor form"]').addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (!busy && e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('cancel', e => { if(busy) e.preventDefault(); });
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    ['name','company','email'].forEach(key => { form.elements[key].value=form.elements[key].value.trim(); });
    if (!form.reportValidity()) return;
    if (!token) { report('Please complete the security check.'); return; }
    const data=Object.fromEntries(new FormData(form)); data.token=token;
    busy=true; submit.disabled=true; submit.textContent='Sending…'; result.hidden=true;
    dialog.setAttribute('aria-busy','true');
    try {
      const response=await fetch('/api/sponsor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(25000)});
      const receipt=await response.json();
      if (!response.ok || receipt.ok !== true) throw new Error(receipt.error || 'Unable to submit. Please try again.');
      form.reset(); form.hidden=true; thanks.hidden=false; thanks.focus();
    } catch (error) { report(error.name === 'TimeoutError' ? 'The request timed out; delivery could not be confirmed. Contact ctf@rait.ac.in before retrying.' : (error.message || 'Unable to submit. Please try again.')); }
    finally { busy=false;submit.disabled=false;submit.textContent='Submit →';dialog.removeAttribute('aria-busy');token='';if(widget!==undefined)window.turnstile.reset(widget); }
  });
})();
