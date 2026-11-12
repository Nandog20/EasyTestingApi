/**
 * Calcula el SHA-256 de un texto y lo devuelve en hexadecimal en minúsculas
 * (64 caracteres, sin prefijo). Usa la Web Crypto API del navegador.
 */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
