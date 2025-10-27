// Script pour créer les éléments de blocs de démonstration
import { query } from '../src/config/db.js';

async function seedBlockElements() {
  try {
    // Éléments pour le bloc Actualités (id=6)
    await query(
      `INSERT INTO block_elements (block_id, type, position, content, media_path) VALUES
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10),
      ($11, $12, $13, $14, $15)
      ON CONFLICT DO NOTHING`,
      [
        6, 'card', 1, JSON.stringify({title: "Concert au Port", description: "Rejoignez-nous pour un concert exceptionnel au Vieux Port de La Rochelle le 15 juin."}), '/images/placeholder-1.svg',
        6, 'card', 2, JSON.stringify({title: "Atelier débutants", description: "Découvrez le batucada lors de notre atelier d'initiation gratuit chaque mercredi."}), '/images/placeholder-2.svg',
        6, 'card', 3, JSON.stringify({title: "Festival d'été", description: "Batala LR participera au Festival International des Rythmes du Monde cet été."}), '/images/placeholder-3.svg'
      ]
    );

    // Éléments pour le bloc Offres (id=3)
    await query(
      `INSERT INTO block_elements (block_id, type, position, content, media_path) VALUES
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10),
      ($11, $12, $13, $14, $15)
      ON CONFLICT DO NOTHING`,
      [
        3, 'card', 1, JSON.stringify({title: "Cours hebdomadaires", description: "Cours de batucada tous les mercredis de 19h à 21h pour tous niveaux."}), '/images/icon-drums.svg',
        3, 'card', 2, JSON.stringify({title: "Événements privés", description: "Animations musicales pour vos mariages, anniversaires et événements d'entreprise."}), '/images/icon-event.svg',
        3, 'card', 3, JSON.stringify({title: "Stages intensifs", description: "Stages de perfectionnement pendant les vacances scolaires avec nos maîtres percussionnistes."}), '/images/icon-training.svg'
      ]
    );

    // Éléments pour le header (id=1)
    await query(
      `INSERT INTO block_elements (block_id, type, position, content, media_path) VALUES
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10)
      ON CONFLICT DO NOTHING`,
      [
        1, 'image', 1, JSON.stringify({alt: "Logo Batala LR"}), '/images/logo.svg',
        1, 'image', 2, JSON.stringify({alt: "Image de fond header"}), '/images/header-bg.svg'
      ]
    );

    // Éléments pour le footer (id=4)
    await query(
      `INSERT INTO block_elements (block_id, type, position, content) VALUES
      ($1, $2, $3, $4),
      ($5, $6, $7, $8),
      ($9, $10, $11, $12)
      ON CONFLICT DO NOTHING`,
      [
        4, 'text', 1, JSON.stringify({about_title: "À propos de Batala La Rochelle", about_content: "Batala La Rochelle est une association de percussions brésiliennes créée en 2010. Nous pratiquons le batucada, un style de musique afro-brésilienne rythmé et festif. Notre groupe se produit régulièrement dans la région Nouvelle-Aquitaine."}),
        4, 'contact', 2, JSON.stringify({email: "contact@batala-lr.fr", phone: "+33 6 12 34 56 78"}),
        4, 'social', 3, JSON.stringify({links: [{network: "facebook", url: "https://facebook.com/batalalr"}, {network: "instagram", url: "https://instagram.com/batalalr"}, {network: "youtube", url: "https://youtube.com/@batalalr"}, {network: "tiktok", url: "https://tiktok.com/@batalalr"}]})
      ]
    );

    console.log('✅ Éléments de blocs créés avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seedBlockElements();
