// Envoi du formulaire de contact vers /api/contact.
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('.form__status');
  const button = form.querySelector('button[type="submit"]');

  function show(text, isError) {
    status.textContent = text;
    status.classList.toggle('form__status--error', !!isError);
    status.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      show('Merci de renseigner votre nom et une adresse e-mail valide.', true);
      return;
    }
    button.disabled = true;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur ' + res.status);
      form.reset();
      show('Merci ! Je vous recontacte sous 48 h.');
    } catch (err) {
      show("L'envoi a échoué (" + err.message + '). Réessayez ou écrivez-moi directement.', true);
    } finally {
      button.disabled = false;
    }
  });
})();
