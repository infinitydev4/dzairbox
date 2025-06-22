/**
 * Génère l'URL d'une entreprise selon l'environnement
 * En développement: /business/[subdomain]  
 * En production: https://[subdomain].dzbusiness.dz
 */
export function getBusinessUrl(subdomain: string): string {
  // En développement (localhost ou mode dev)
  if (process.env.NODE_ENV === 'development' || 
      (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    return `/business/${subdomain}`
  }
  
  // En production avec sous-domaines
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dzbusiness.dz'
  return `https://${subdomain}.${baseUrl.replace('https://', '')}`
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
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dzbusiness.dz'
  return `https://${subdomain}.${baseUrl.replace('https://', '')}`
} 