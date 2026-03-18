/**
 * Script to set a user as 'owner' in Firestore by email.
 * 
 * Usage:
 *   npx ts-node -e "process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID='owl-coach'" scripts/set-owner.ts f14agui@gmail.com
 * 
 * Or with emulator:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx ts-node scripts/set-owner.ts f14agui@gmail.com
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('Usage: npx ts-node scripts/set-owner.ts <email>');
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'owl-coach' });
}

const db = getFirestore();

async function setOwner(email: string) {
  console.log(`Looking for user with email: ${email}`);

  const snapshot = await db.collection('users')
    .where('email', '==', email)
    .get();

  if (snapshot.empty) {
    console.error(`No user found with email "${email}".`);
    console.log('Make sure the user has logged in at least once so a Firestore profile was created.');
    process.exit(1);
  }

  for (const doc of snapshot.docs) {
    const before = doc.data();
    await doc.ref.update({ role: 'owner', updatedAt: new Date().toISOString() });
    console.log(`Updated user ${doc.id} (${before.email}): role "${before.role}" → "owner"`);
  }

  console.log('Done.');
}

setOwner(targetEmail).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
