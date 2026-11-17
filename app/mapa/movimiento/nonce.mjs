// getRandomValues también funciona en HTTP de la LAN; randomUUID exige contexto seguro.
// Separado de Math/RNG del juego. No es una credencial ni un formato de guardado.
export function uniqueToken(source=globalThis.crypto){return Array.from(source.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');}
