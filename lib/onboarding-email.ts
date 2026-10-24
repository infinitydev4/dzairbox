import { Resend } from "resend"

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!))

export async function sendOnboardingVerification(email: string, token: string, name: string, language: "fr" | "ar" = "fr") {
  if (!process.env.RESEND_API_KEY || !process.env.NEXTAUTH_URL) return { success: false }
  const ar = language === "ar"
  const url = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${encodeURIComponent(token)}&lang=${language}`
  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.NODE_ENV === "production" ? "DzairBox <noreply@dzairbox.com>" : "DzairBox <onboarding@resend.dev>",
      to: email,
      subject: ar ? "فعّل حسابك على DzairBox" : "Activez votre compte DzairBox",
      html: `<html lang="${language}" dir="${ar ? "rtl" : "ltr"}"><body style="margin:0;background:#f7f6f0;color:#103832;font-family:Arial,sans-serif;padding:40px 20px"><div style="max-width:520px;margin:auto"><p style="font-size:25px;font-weight:bold">DzairBox</p><h1 style="font-size:28px">${ar ? "صفحتك جاهزة للخطوة التالية." : "Votre page est prête pour la suite."}</h1><p style="line-height:1.8">${ar ? "مرحباً" : "Bonjour"} ${escapeHtml(name)},</p><p style="line-height:1.8">${ar ? "أكد بريدك الإلكتروني لتفعيل حسابك والوصول إلى مساحتك. يتحقق فريقنا من نشاطك قبل نشر صفحتك." : "Vérifiez votre email pour activer votre compte et accéder à votre espace. Notre équipe validera votre activité avant la mise en ligne de votre page."}</p><a href="${escapeHtml(url)}" style="display:inline-block;padding:16px 24px;background:#103832;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">${ar ? "تأكيد بريدي الإلكتروني" : "Vérifier mon email"}</a><p style="font-size:13px;line-height:1.8">${ar ? "الرابط صالح لمدة 24 ساعة. إذا لم تطلب إنشاء هذا الحساب، يمكنك تجاهل الرسالة." : "Ce lien est valable 24 heures. Si vous n’avez pas demandé cette inscription, vous pouvez ignorer ce message."}</p><p style="font-size:12px;word-break:break-all" dir="ltr"><a href="${escapeHtml(url)}" style="color:#17745f">${escapeHtml(url)}</a></p></div></body></html>`,
    })
    return { success: !error }
  } catch { return { success: false } }
}
