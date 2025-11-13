/* global document, fetch, FormData, setTimeout */
/**
 * Gestion du formulaire de contact dans le footer
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const statusEl = document.getElementById('contact-form-status');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Récupérer les données du formulaire
    const formData = new FormData(contactForm);
    const data = {
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      contact: formData.get('contact'),
      message: formData.get('message'),
    };

    // Validation basique
    if (!data.nom || !data.prenom || !data.contact || !data.message) {
      showStatus('error', 'Tous les champs sont requis.');
      return;
    }

    // Désactiver le bouton pendant l'envoi
    const submitBtn = contactForm.querySelector('.btn-submit-contact');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showStatus('success', 'Message envoyé avec succès ! Nous vous répondrons bientôt.');
        contactForm.reset();
      } else {
        showStatus('error', result.message || 'Erreur lors de l\'envoi du message.');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      showStatus('error', 'Erreur réseau. Veuillez réessayer plus tard.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function showStatus(type, message) {
    statusEl.className = `contact-status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';

    // Masquer après 5 secondes
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  }
});
