/**
 * Scripts édition inline du footer
 * Fichier: public/js/footer-edit.js
 * 
 * @fileoverview Gestion des modales d'édition des éléments footer
 */

/* global document, confirm, window, fetch */

// ==========================================================================
// Gestion des modales footer
// ==========================================================================

/**
 * Ouvre une modale via l'attribut data-modal
 */
function openModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (modalEl) {
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Ferme une modale
 */
function closeModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (modalEl) {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Ferme toutes les modales au clavier (Esc)
 */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['aboutModal', 'contactModal', 'socialModal', 'linkModal'].forEach(modalId => {
      const modalEl = document.getElementById(modalId);
      if (modalEl && modalEl.classList.contains('active')) {
        closeModal(modalId);
      }
    });
  }
});

// Boutons de fermeture
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.dataset.closeModal + 'Modal';
    closeModal(modalId);
  });
});

// ==========================================================================
// Édition section À propos
// ==========================================================================

document.querySelectorAll('.edit-footer-section-btn[data-section="about"]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const blockId = e.currentTarget.dataset.blockId;
    const elementId = e.currentTarget.dataset.elementId;
    
    openModal('aboutModal');
    
    // Charger les données existantes
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/text`);
      const data = await resp.json();
      
      const form = document.getElementById('aboutForm');
      form.querySelector('[name="blockId"]').value = blockId;
      form.querySelector('[name="elementId"]').value = elementId || '';
      
      if (data.success && data.element) {
        const content = typeof data.element.content === 'string' ? JSON.parse(data.element.content) : data.element.content;
        document.getElementById('aboutContent').value = content.about_content || '';
      } else {
        document.getElementById('aboutContent').value = '';
      }
    } catch {
      window.alert('Erreur lors du chargement des données');
    }
  });
});

// Soumission formulaire À propos
const aboutForm = document.getElementById('aboutForm');
if (aboutForm) {
  aboutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const blockId = aboutForm.querySelector('[name="blockId"]').value;
    const aboutContent = document.getElementById('aboutContent').value.trim();
    
    if (!aboutContent) {
      window.alert('Le contenu est requis');
      document.getElementById('aboutContent').focus();
      return;
    }
    
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about_content: aboutContent })
      });
      const data = await resp.json();
      
      if (!data.success) throw new Error(data.message || 'Erreur');
      
      closeModal('aboutModal');
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
    }
  });
}

// ==========================================================================
// Édition section Contact
// ==========================================================================

document.querySelectorAll('.edit-footer-section-btn[data-section="contact"]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const blockId = e.currentTarget.dataset.blockId;
    const elementId = e.currentTarget.dataset.elementId;
    
    openModal('contactModal');
    
    // Charger les données existantes
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/contact`);
      const data = await resp.json();
      
      const form = document.getElementById('contactForm');
      form.querySelector('[name="blockId"]').value = blockId;
      form.querySelector('[name="elementId"]').value = elementId || '';
      
      if (data.success && data.element) {
        const content = typeof data.element.content === 'string' ? JSON.parse(data.element.content) : data.element.content;
        document.getElementById('contactPhone').value = content.phone || '';
        document.getElementById('contactEmail').value = content.email || '';
        document.getElementById('contactAddress').value = content.address || '';
      } else {
        document.getElementById('contactPhone').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactAddress').value = '';
      }
    } catch {
      window.alert('Erreur lors du chargement des données');
    }
  });
});

// Soumission formulaire Contact
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const blockId = contactForm.querySelector('[name="blockId"]').value;
    const phone = document.getElementById('contactPhone').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const address = document.getElementById('contactAddress').value.trim();
    
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_phone: phone, contact_email: email, contact_address: address })
      });
      const data = await resp.json();
      
      if (!data.success) throw new Error(data.message || 'Erreur');
      
      closeModal('contactModal');
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
    }
  });
}

// ==========================================================================
// Gestion des réseaux sociaux
// ==========================================================================

document.querySelectorAll('.edit-footer-section-btn[data-section="social"]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const blockId = e.currentTarget.dataset.blockId;
    
    openModal('socialModal');
    
    // Charger les liens existants
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/list/social`);
      const data = await resp.json();
      
      const form = document.getElementById('socialForm');
      form.querySelector('[name="blockId"]').value = blockId;
      
      const listContainer = document.getElementById('socialLinksList');
      listContainer.innerHTML = '';
      
      if (data.success && data.elements && data.elements.length > 0) {
        data.elements.forEach(element => {
          const content = typeof element.content === 'string' ? JSON.parse(element.content) : element.content;
          const links = content.links || [];
          
          links.forEach(link => {
            const item = document.createElement('div');
            item.className = 'social-item';
            item.innerHTML = `
              <div class="social-info">
                <strong>${link.network || link.platform}</strong>
                <a href="${link.url}" target="_blank" rel="noopener">${link.url}</a>
              </div>
              <button class="btn-icon btn-danger delete-social-link" data-element-id="${element.id}" data-block-id="${blockId}" aria-label="Supprimer ${link.network || link.platform}">
                <img src="/icons/trash.svg" alt="" role="presentation" class="icon" />
              </button>
            `;
            listContainer.appendChild(item);
          });
        });
        
        // Attacher les événements de suppression
        listContainer.querySelectorAll('.delete-social-link').forEach(deleteBtn => {
          deleteBtn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            if (!confirm('Supprimer ce réseau social ?')) return;
            
            const elemId = ev.currentTarget.dataset.elementId;
            const blkId = ev.currentTarget.dataset.blockId;
            
            try {
              const delResp = await fetch(`/api/blocks/${blkId}/footer-elements/${elemId}`, { method: 'DELETE' });
              const delData = await delResp.json();
              if (!delData.success) throw new Error(delData.message || 'Erreur suppression');
              
              closeModal('socialModal');
              window.location.reload();
            } catch (error) {
              window.alert(error.message);
            }
          });
        });
      } else {
        listContainer.innerHTML = '<p class="text-muted">Aucun réseau social configuré.</p>';
      }
    } catch {
      window.alert('Erreur lors du chargement des réseaux sociaux');
    }
  });
});

// Soumission formulaire Social (ajout)
const socialForm = document.getElementById('socialForm');
if (socialForm) {
  socialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const blockId = socialForm.querySelector('[name="blockId"]').value;
    const network = document.getElementById('socialNetwork').value;
    const url = document.getElementById('socialUrl').value.trim();
    
    if (!network || !url) {
      window.alert('Plateforme et URL sont requis');
      return;
    }
    
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social_network: network, social_url: url })
      });
      const data = await resp.json();
      
      if (!data.success) throw new Error(data.message || 'Erreur');
      
      closeModal('socialModal');
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
    }
  });
}

// ==========================================================================
// Gestion des liens externes
// ==========================================================================

document.querySelectorAll('.edit-footer-section-btn[data-section="link"]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const blockId = e.currentTarget.dataset.blockId;
    
    openModal('linkModal');
    
    // Charger les liens existants
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/list/link`);
      const data = await resp.json();
      
      const form = document.getElementById('linkForm');
      form.querySelector('[name="blockId"]').value = blockId;
      
      const listContainer = document.getElementById('externalLinksList');
      listContainer.innerHTML = '';
      
      if (data.success && data.elements && data.elements.length > 0) {
        data.elements.forEach(element => {
          const content = typeof element.content === 'string' ? JSON.parse(element.content) : element.content;
          
          const item = document.createElement('div');
          item.className = 'social-item';
          item.innerHTML = `
            <div class="social-info">
              <strong>${content.label || content.title}</strong>
              <a href="${content.url}" target="_blank" rel="noopener">${content.url}</a>
            </div>
            <button class="btn-icon btn-danger delete-external-link" data-element-id="${element.id}" data-block-id="${blockId}" aria-label="Supprimer ${content.label || 'ce lien'}">
              <img src="/icons/trash.svg" alt="" role="presentation" class="icon" />
            </button>
          `;
          listContainer.appendChild(item);
        });
        
        // Attacher les événements de suppression
        listContainer.querySelectorAll('.delete-external-link').forEach(deleteBtn => {
          deleteBtn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            if (!confirm('Supprimer ce lien externe ?')) return;
            
            const elemId = ev.currentTarget.dataset.elementId;
            const blkId = ev.currentTarget.dataset.blockId;
            
            try {
              const delResp = await fetch(`/api/blocks/${blkId}/footer-elements/${elemId}`, { method: 'DELETE' });
              const delData = await delResp.json();
              if (!delData.success) throw new Error(delData.message || 'Erreur suppression');
              
              closeModal('linkModal');
              window.location.reload();
            } catch (error) {
              window.alert(error.message);
            }
          });
        });
      } else {
        listContainer.innerHTML = '<p class="text-muted">Aucun lien externe.</p>';
      }
    } catch {
      window.alert('Erreur lors du chargement des liens externes');
    }
  });
});

// Soumission formulaire Liens externes (ajout)
const linkForm = document.getElementById('linkForm');
if (linkForm) {
  linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const blockId = linkForm.querySelector('[name="blockId"]').value;
    const label = document.getElementById('linkLabel').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    
    if (!label || !url) {
      window.alert('Libellé et URL sont requis');
      return;
    }
    
    try {
      const resp = await fetch(`/api/blocks/${blockId}/footer-elements/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_label: label, link_url: url })
      });
      const data = await resp.json();
      
      if (!data.success) throw new Error(data.message || 'Erreur');
      
      closeModal('linkModal');
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
    }
  });
}
