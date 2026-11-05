import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "e02b1f23e46a4a",
    pass: "c5df071f1e0c8a",
  },
});

export const emailService = {
  async sendResetCode(to, code) {
    const info = await transporter.sendMail({
      from: '"AI Career Coach" <noreply@aicareercoach.com>',
      to,
      subject: "Votre code de réinitialisation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e2a78;">Code de réinitialisation</h2>
          <p>Voici votre code pour réinitialiser votre mot de passe :</p>
          
          <div style="background: #f5f5f4; border: 2px dashed #0ea5e9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <div style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #0a0a0a;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Ce code est valable <strong>10 minutes</strong> et ne peut être utilisé qu'une seule fois.
          </p>
          <p style="color: #999; font-size: 12px;">
            Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
          </p>
        </div>
      `,
    });

    console.log("📬 Code envoyé :", code);
    return info;
  },
};
