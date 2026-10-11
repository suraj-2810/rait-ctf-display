(function () {
  'use strict';

  const WEB3FORMS_ACCESS_KEY = '00e75b01-f7c4-42da-9902-d896e0bfb269';
  const dialog = document.createElement('dialog');
  dialog.className = 'sponsor-dialog';
  dialog.setAttribute('aria-labelledby', 'sponsor-heading');
  dialog.innerHTML = `<div class="sponsor-dialog-title"><img src="assets/icons/community.png" alt=""><span id="sponsor-dialog-caption">Sponsorship enquiry.exe</span><button type="button" aria-label="Close form">×</button></div>
  <form novalidate>
  <input type="hidden" name="access_key" value="${WEB3FORMS_ACCESS_KEY}">
  <input type="hidden" name="from_name" value="RAIT CTF Website">
  <input type="hidden" name="subject" value="RAIT CTF sponsorship enquiry">
  <input type="hidden" name="enquiry_type" value="Sponsorship enquiry">
  <input type="checkbox" name="botcheck" tabindex="-1" aria-hidden="true" style="display:none">
  <h2 id="sponsor-heading">Let's build the next arena.</h2>
  <p data-form-description>Tell us about your organisation. Let’s find the right partnership for you.</p>
  <div class="sponsor-fields">
  <label>Contact name *<input name="name" autocomplete="name" required maxlength="100"></label>
  <label data-form-field="company">Company / organisation *<input name="company" autocomplete="organization" required maxlength="120"></label>
  <label>Email address *<input name="email" type="email" autocomplete="email" required maxlength="160"></label>
  <label>Phone number (optional)<input name="phone" type="tel" autocomplete="tel" maxlength="30"></label>
  <label class="wide" data-form-field="tier">Interested tier *<select name="tier" required><option value="">Select a tier</option><option>Radiant</option><option>Diamond</option><option>Gold</option><option>Let's discuss</option></select></label>
  <label class="wide">Message <textarea name="message" rows="3" maxlength="1500" data-message></textarea></label></div>
  <label class="sponsor-consent"><input type="checkbox" name="consent" required><span data-consent-text>I agree to be contacted about this sponsorship enquiry.</span></label>
  <label class="sponsor-honeypot" aria-hidden="true">Leave empty<input name="website" tabindex="-1" autocomplete="off"></label>
  <p data-form-note>Your details will be sent to ctf@rait.ac.in for sponsorship follow-up.</p>
  <button class="sponsor-submit" type="submit">Submit enquiry →</button>
  <div class="sponsor-result" role="alert" aria-live="polite" hidden><p></p></div></form>
  <div class="sponsor-thanks" hidden tabindex="-1"><div class="thanks-icon" aria-hidden="true">✓</div><h2 data-thanks-heading>Thank you!</h2><p data-thanks-text>Your enquiry has been submitted. Thank you for supporting RAIT CTF!</p><button type="button" class="sponsor-submit">Back to the event</button></div>`;
  document.body.appendChild(dialog);

  const form = dialog.querySelector('form');
  const result = dialog.querySelector('.sponsor-result');
  const thanks = dialog.querySelector('.sponsor-thanks');
  const submit = form.querySelector('.sponsor-submit');
  const companyField = form.querySelector('[data-form-field="company"]');
  const tierField = form.querySelector('[data-form-field="tier"]');
  const description = form.querySelector('[data-form-description]');
  const formNote = form.querySelector('[data-form-note]');
  const consentText = form.querySelector('[data-consent-text]');
  const messageField = form.elements.message;
  let opener = null;
  let mode = 'sponsor';
  let busy = false;

  function report(message) {
    result.hidden = false;
    result.querySelector('p').textContent = message;
  }

  function open(button, nextMode) {
    if (busy) return;
    opener = button;
    mode = nextMode;
    form.reset();
    result.hidden = true;
    thanks.hidden = true;
    form.hidden = false;
    form.elements.website.value = '';

    const isSponsor = mode === 'sponsor';
    dialog.querySelector('#sponsor-dialog-caption').textContent = isSponsor ? 'Sponsorship enquiry.exe' : 'Contact RAIT CTF.exe';
    dialog.querySelector('#sponsor-heading').textContent = isSponsor ? "Let's build the next arena." : 'Contact the RAIT CTF team.';
    description.textContent = isSponsor
      ? 'Tell us about your organisation. Let’s find the right partnership for you.'
      : 'Send us a message and the RAIT CTF team will get back to you.';
    companyField.hidden = !isSponsor;
    form.elements.company.required = isSponsor;
    tierField.hidden = !isSponsor;
    form.elements.tier.required = isSponsor;
    messageField.required = !isSponsor;
    form.elements.enquiry_type.value = isSponsor ? 'Sponsorship enquiry' : 'General contact';
    form.elements.subject.value = isSponsor ? 'RAIT CTF sponsorship enquiry' : 'RAIT CTF contact enquiry';
    consentText.textContent = isSponsor
      ? 'I agree to be contacted about this sponsorship enquiry.'
      : 'I agree to be contacted about this enquiry.';
    formNote.textContent = isSponsor
      ? 'Your details will be sent to ctf@rait.ac.in for sponsorship follow-up.'
      : 'Your message will be sent to ctf@rait.ac.in.';
    submit.textContent = isSponsor ? 'Submit enquiry →' : 'Send message →';

    const tier = button && button.getAttribute('data-sponsor');
    if (isSponsor && tier && tier !== 'true') form.elements.tier.value = tier;
    dialog.showModal();
    form.elements.name.focus();
  }

  document.querySelectorAll('[data-sponsor], #lp2-sponsor-mail-btn').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      open(button, 'sponsor');
    });
  });

  document.querySelectorAll('#x26-footer-contact, .x26-footer-social[href^="mailto:ctf@rait.ac.in"]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      open(button, 'contact');
    });
  });

  thanks.querySelector('button').addEventListener('click', () => {
    if (!busy) dialog.close();
  });
  dialog.querySelector('[aria-label="Close form"]').addEventListener('click', () => {
    if (!busy) dialog.close();
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (!busy && event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('cancel', event => {
    if (busy) event.preventDefault();
  });
  dialog.addEventListener('close', () => {
    if (opener) opener.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;

    ['name', 'company', 'email', 'phone', 'message'].forEach(key => {
      form.elements[key].value = form.elements[key].value.trim();
    });
    if (!form.reportValidity()) return;

    // Quietly reject submissions caught by the honeypot.
    if (form.elements.website.value || form.elements.botcheck.checked) {
      report('Unable to submit your enquiry right now. Please try again later.');
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    delete data.website;
    busy = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    result.hidden = true;
    dialog.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(25000)
      });
      let receipt = {};
      try { receipt = await response.json(); } catch { /* handled below */ }
      if (!response.ok || receipt.success !== true) {
        const message = receipt.message || (receipt.body && receipt.body.message);
        throw new Error(message || 'Unable to send your enquiry. Please try again.');
      }

      form.reset();
      form.hidden = true;
      thanks.querySelector('[data-thanks-heading]').textContent = mode === 'sponsor' ? 'Thank you!' : 'Message sent!';
      thanks.querySelector('[data-thanks-text]').textContent = mode === 'sponsor'
        ? 'Your sponsorship enquiry has been submitted. Thank you for supporting RAIT CTF!'
        : 'Your message has been sent to the RAIT CTF team. We’ll get back to you as soon as we can.';
      thanks.hidden = false;
      thanks.focus();
    } catch (error) {
      report(error.name === 'TimeoutError'
        ? 'The request timed out, so delivery could not be confirmed. Please check with ctf@rait.ac.in before retrying.'
        : (error.message || 'Unable to send your enquiry. Please try again.'));
    } finally {
      busy = false;
      submit.disabled = false;
      submit.textContent = mode === 'sponsor' ? 'Submit enquiry →' : 'Send message →';
      dialog.removeAttribute('aria-busy');
    }
  });
})();
