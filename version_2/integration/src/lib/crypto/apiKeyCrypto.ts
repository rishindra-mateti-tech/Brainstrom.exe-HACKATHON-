// Server-only module. Uses Node's built-in `crypto` module (AES-256-GCM).
//
// IMPORTANT: Never import this from a 'use client' component or any code
// that ships to the browser. It reads a server-only secret
// (API_KEY_ENCRYPTION_SECRET) and is intended to be called only from Route
// Handlers / server-side code.

import crypto from 'crypto';

const IV_LENGTH = 12; // AES-GCM recommended IV length, in bytes
const AUTH_TAG_LENGTH = 16; // AES-GCM auth tag length, in bytes

function getEncryptionKey(): Buffer {
    const secret = process.env.API_KEY_ENCRYPTION_SECRET;

    if (!secret) {
        throw new Error(
            'API_KEY_ENCRYPTION_SECRET is not set. Refusing to encrypt/decrypt API keys without a real secret.'
        );
    }

    const key = Buffer.from(secret, 'hex');

    if (key.length !== 32) {
        throw new Error(
            `API_KEY_ENCRYPTION_SECRET must decode to exactly 32 bytes (64 hex characters). Got ${key.length} bytes.`
        );
    }

    return key;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a single base64 string containing iv + authTag + ciphertext.
 */
export function encryptApiKey(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypts a string produced by encryptApiKey back into the original plaintext.
 */
export function decryptApiKey(ciphertext: string): string {
    const key = getEncryptionKey();
    const data = Buffer.from(ciphertext, 'base64');

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
