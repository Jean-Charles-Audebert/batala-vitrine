import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

/**
 * Envoie un email de contact
 * POST /contact
 */
export const sendContactEmail = async (req, res) => {
  const { nom, prenom, contact, message } = req.body;

  // Validation des champs requis
  if (!nom || !prenom || !contact || !message) {
    logger.warn("Validation échouée: champs manquants");
    return res.status(400).json({
      success: false,
      message: "Tous les champs sont requis.",
    });
  }

  // Validation basique du format email (si c'est un email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(contact)) {
    // C'est un email, on peut le valider
  } else if (contact.length < 5) {
    // Si ce n'est pas un email, vérifier la longueur minimale
    return res.status(400).json({
      success: false,
      message: "Le contact doit être un email valide ou un numéro de téléphone.",
    });
  }

  // Configuration du transporteur email
  const contactEmail = process.env.CONTACT_EMAIL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!contactEmail || !smtpHost || !smtpUser || !smtpPass) {
    logger.error("Configuration email manquante dans .env");
    return res.status(500).json({
      success: false,
      message: "Le formulaire de contact n'est pas configuré.",
    });
  }

  try {
    // Créer le transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Fonction pour échapper le HTML
    const escapeHtml = (text) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    // Contenu de l'email
    const mailOptions = {
      from: `"Formulaire Contact" <${contactEmail}>`,
      to: contactEmail,
      replyTo: `"${nom} ${prenom}" <${contact}>`,
      subject: `Nouveau message de contact de ${nom} ${prenom}`,
      text: `
Nouveau message de contact reçu :

Nom : ${nom}
Prénom : ${prenom}
Contact : ${contact}

Message :
${message}
      `,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
        <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
        <p><strong>Contact :</strong> ${escapeHtml(contact)}</p>
        <hr>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    logger.info(`Email de contact envoyé : ${nom} ${prenom} <${contact}>`);

    return res.json({
      success: true,
      message: "Message envoyé avec succès.",
    });
  } catch (error) {
    logger.error("Erreur lors de l'envoi de l'email de contact:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi du message. Veuillez réessayer.",
    });
  }
};
