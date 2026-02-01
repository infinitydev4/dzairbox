/**
 * Génère l'URL d'une entreprise selon l'environnement
 * Utilise toujours le format /business/[subdomain]
 */
export function getBusinessUrl(subdomain: string): string {
  return `/business/${subdomain}`
}

/**
 * Vérifie si nous sommes en mode développement
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         (typeof window !== 'undefined' && window.location.hostname === 'localhost')
}

/**
 * Génère l'URL complète d'une entreprise pour les partages et SEO
 */
export function getBusinessFullUrl(subdomain: string): string {
  if (isDevelopment()) {
    return `http://localhost:3000/business/${subdomain}`
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dzairbox.com'
  return `${baseUrl}/business/${subdomain}`
} 