const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"ZeroGaspi" <${process.env.SMTP_USER || "noreply@zerogaspi.fr"}>`;

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return; // skip if not configured
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[mailer]", err.message);
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

function orderConfirmation({ clientName, productName, quantity, total }) {
  return {
    subject: "Confirmation de votre réservation — ZeroGaspi",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#111827">
        <div style="background:#16a34a;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">🌿 ZeroGaspi</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 12px;color:#111827">Réservation confirmée ✓</h2>
          <p style="color:#4b5563">Bonjour <strong>${clientName}</strong>,</p>
          <p style="color:#4b5563">Votre réservation a bien été enregistrée :</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr style="background:#f9fafb">
              <td style="padding:10px 14px;font-weight:600;color:#374151">Produit</td>
              <td style="padding:10px 14px;color:#374151">${productName}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#374151">Quantité</td>
              <td style="padding:10px 14px;color:#374151">${quantity}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:10px 14px;font-weight:600;color:#374151">Total</td>
              <td style="padding:10px 14px;color:#16a34a;font-weight:700">${Number(total).toFixed(2)} €</td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px">Merci de contribuer à la lutte contre le gaspillage alimentaire.</p>
        </div>
      </div>`,
  };
}

function deliveryInProgress({ clientName, productName, livreurName }) {
  return {
    subject: "Votre livraison est en route — ZeroGaspi",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#111827">
        <div style="background:#16a34a;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">🌿 ZeroGaspi</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 12px;color:#111827">Votre livraison est en route 🚚</h2>
          <p style="color:#4b5563">Bonjour <strong>${clientName}</strong>,</p>
          <p style="color:#4b5563">
            Bonne nouvelle ! <strong>${livreurName}</strong> est en train de vous livrer
            votre commande de <strong>${productName}</strong>.
          </p>
          <p style="color:#6b7280;font-size:13px;margin-top:24px">
            Vous pouvez suivre la position du livreur en temps réel depuis votre espace client.
          </p>
        </div>
      </div>`,
  };
}

module.exports = { sendMail, orderConfirmation, deliveryInProgress };
