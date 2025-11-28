document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contact-modal');
  const openModalBtn = document.querySelector('[data-action="open-contact-modal"]');
  const closeModalBtns = document.querySelectorAll('[data-action="close-modal"]');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    });
  }

  if (closeModalBtns) {
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      });
    });
  }
});