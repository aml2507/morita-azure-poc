import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
const ALGORITHM = 'aes-256-gcm';

export function encrypt(data: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encrypted,
    authTag: authTag.toString('hex')
  });
}

export function decrypt(encryptedData: string): any {
  const { iv, content, authTag } = JSON.parse(encryptedData);
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
} 