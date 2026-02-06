import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
  
  // En développement, utiliser l'email de test Resend
  // En production, utiliser le domaine vérifié dzairbox.com
  const fromEmail = process.env.NODE_ENV === 'production' 
    ? 'DzairBox <noreply@dzairbox.com>'
    : 'DzairBox <onboarding@resend.dev>'
  
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Vérifiez votre adresse email - DzairBox',
      html: getVerificationEmailTemplate(verificationUrl, name || 'Utilisateur'),
    })

    if (error) {
      console.error('Error sending verification email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}

function getVerificationEmailTemplate(verificationUrl: string, name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification Email - DzairBox</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header avec logo et gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <img src="https://dzairbox.com/logo-dzairbox.png" alt="DzairBox" style="height: 50px; width: auto; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Bienvenue sur DzairBox !
              </h1>
            </td>
          </tr>
          
          <!-- Corps du message -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Merci de vous être inscrit sur <strong>DzairBox</strong>, la plateforme qui met en valeur les entreprises algériennes.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Pour activer votre compte et commencer à créer votre page professionnelle, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
              </p>
              
              <!-- Bouton CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      Vérifier mon email
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Lien alternatif -->
              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px; font-weight: 600;">
                  Le bouton ne fonctionne pas ?
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Copiez et collez ce lien dans votre navigateur :
                </p>
                <p style="margin: 10px 0 0; word-break: break-all;">
                  <a href="${verificationUrl}" style="color: #10b981; text-decoration: none; font-size: 13px;">
                    ${verificationUrl}
                  </a>
                </p>
              </div>
              
              <!-- Informations de sécurité -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Important :</strong> Ce lien est valable pendant <strong>24 heures</strong>. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email en toute sécurité.
                </p>
              </div>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                À bientôt sur DzairBox !<br>
                L'équipe DzairBox
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 13px;">
                © ${new Date().getFullYear()} DzairBox. Tous droits réservés.
              </p>
              
              <!-- Liens sociaux -->
              <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://facebook.com/dzairbox" style="color: #10b981; text-decoration: none; font-size: 12px;">
                      Facebook
                    </a>
                  </td>
                  <td style="padding: 0 10px; color: #d1d5db;">|</td>
                  <td style="padding: 0 10px;">
                    <a href="https://instagram.com/dzairbox" style="color: #10b981; text-decoration: none; font-size: 12px;">
                      Instagram
                    </a>
                  </td>
                  <td style="padding: 0 10px; color: #d1d5db;">|</td>
                  <td style="padding: 0 10px;">
                    <a href="https://dzairbox.com/contact" style="color: #10b981; text-decoration: none; font-size: 12px;">
                      Contact
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px;">
                DzairBox - La vitrine des entreprises algériennes
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function sendContactEmail(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
) {
  const fromEmail = process.env.NODE_ENV === 'production' 
    ? 'DzairBox <noreply@dzairbox.com>'
    : 'DzairBox <onboarding@resend.dev>'

  const subjectMap: Record<string, string> = {
    general: 'Question générale',
    business: 'Inscription entreprise',
    support: 'Support technique',
    partnership: 'Partenariat',
    other: 'Autre'
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: 'contact@dzairbox.com',
      replyTo: email,
      subject: `[DzairBox Contact] ${subjectMap[subject] || subject}`,
      html: getContactEmailTemplate(name, email, phone, subject, message),
    })

    if (error) {
      console.error('Error sending contact email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending contact email:', error)
    return { success: false, error }
  }
}

function getContactEmailTemplate(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
): string {
  const subjectMap: Record<string, string> = {
    general: 'Question générale',
    business: 'Inscription entreprise',
    support: 'Support technique',
    partnership: 'Partenariat',
    other: 'Autre'
  }

  return `
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message de contact - DzairBox</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <img src="https://dzairbox.com/logo-dzairbox.png" alt="DzairBox" style="height: 50px; width: auto; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📧 Nouveau message de contact
              </h1>
            </td>
          </tr>
          
          <!-- Corps du message -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                  Type de demande : ${subjectMap[subject] || subject}
                </p>
              </div>

              <!-- Informations de contact -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">
                  Informations du contact
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">
                      <strong>Nom :</strong>
                    </td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                      ${name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                      <strong>Email :</strong>
                    </td>
                    <td style="padding: 8px 0;">
                      <a href="mailto:${email}" style="color: #10b981; text-decoration: none; font-size: 14px;">
                        ${email}
                      </a>
                    </td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                      <strong>Téléphone :</strong>
                    </td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                      <a href="tel:${phone}" style="color: #10b981; text-decoration: none;">
                        ${phone}
                      </a>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Message -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">
                  Message
                </h3>
                <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${message}
                  </p>
                </div>
              </div>

              <!-- Bouton de réponse -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="mailto:${email}?subject=Re: ${subjectMap[subject] || subject}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                      Répondre au message
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} DzairBox. Message reçu via le formulaire de contact.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export { resend }
