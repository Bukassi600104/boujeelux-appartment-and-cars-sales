import { randomBytes, createHash } from 'node:crypto';

// New review-client identities are deliberately distinct from existing accounts.
export function setupRecords(purpose = 'admin') {
  if (!['admin', 'client'].includes(purpose)) throw new Error('Unsupported account purpose.');
  return ['chida', 'boujeelux'].map(site => {
    const bootstrapToken = randomBytes(32).toString('base64url');
    return {
      site, username: `${site}-${purpose}`,
      password: randomBytes(24).toString('base64url'), bootstrapToken,
      hash: createHash('sha256').update(bootstrapToken).digest('hex'),
    };
  });
}
