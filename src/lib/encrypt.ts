import CryptoJS from 'crypto-js'

const SECRET = process.env.ENCRYPTION_SECRET || 'fallback_secret_key_32_chars!!'

export function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET).toString()
    return encrypted
  } catch {
    throw new Error('Encryption failed')
  }
}

export function decrypt(cipherText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    if (!decrypted) throw new Error('Decryption produced empty result')
    return decrypted
  } catch {
    throw new Error('Decryption failed — invalid cipher or secret')
  }
}
