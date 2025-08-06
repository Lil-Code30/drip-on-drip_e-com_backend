import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT) || 25,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

/**
 * Envoie un email en utilisant un template EJS avec un layout principal.
 *
 * @async
 * @function sendEmail
 * @param {Object} options - Options d'envoi de l'email.
 * @param {string} options.to - Adresse email du destinataire.
 * @param {string} options.subject - Sujet de l'email.
 * @param {string} options.template - Nom du fichier template EJS (sans l'extension `.ejs`), situé dans le dossier `views/`.
 * @param {Object} [options.context={}] - Données passées au template pour le rendu dynamique.
 * @returns {Promise<Object>} Résultat de l'envoi de l'email via le transporteur SMTP.
 *
 * @example
 * await sendEmail({
 *   to: 'utilisateur@example.com',
 *   subject: 'Bienvenue sur MonApp',
 *   template: 'welcome',
 *   context: {
 *     username: 'Jean',
 *     lienConfirmation: 'https://monapp.com/confirm?token=abc123'
 *   }
 * });
 *
 * @requires ejs
 * @requires path
 * @requires transporter (instance de nodemailer)
 */
async function sendEmail({ to, subject, template, context = {} }) {
  try {
    // Rendu du template
    const templatePath = path.resolve(
      __dirname,
      "..",
      "views",
      `${template}.ejs`
    );
    const contentHtml = await ejs.renderFile(templatePath, context);

    // Rendu du layout avec le contenu HTML injecté
    const layoutPath = path.resolve(
      __dirname,
      "..",
      "views",
      "layouts",
      "main.ejs"
    );
    const html = await ejs.renderFile(layoutPath, {
      ...context,
      body: contentHtml,
      subject,
    });

    // Envoi de l'email
    const mailOptions = {
      from: `"MonApp" <${process.env.SMTP_USERNAME}>`,
      to,
      subject,
      html,
    };

    return transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
}

export default sendEmail;
