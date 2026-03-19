import { getFirestore } from 'firebase-admin/firestore';
import adminApp from '@/lib/firebase-admin';
export async function createModule(module: { name: string; description: string }) {
  const db = getFirestore(adminApp);
  const now = new Date().toISOString();
  const ref = await db.collection('modules').add({ ...module, createdAt: now, updatedAt: now });
  return { id: ref.id, ...module };
}

export async function listModules() {
  const db = getFirestore(adminApp);
  const snap = await db.collection('modules').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateModule(id: string, data: Partial<{ name: string; description: string }>) {
  const db = getFirestore(adminApp);
  const ref = db.collection('modules').doc(id);
  await ref.update({ ...data, updatedAt: new Date().toISOString() });
}

export async function deleteModule(id: string) {
  const db = getFirestore(adminApp);
  const ref = db.collection('modules').doc(id);
  await ref.delete();
}
