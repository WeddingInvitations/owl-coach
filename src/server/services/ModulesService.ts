import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function createModule(module: { name: string; description: string }) {
  const now = new Date().toISOString();
  const ref = doc(collection(db, 'modules'));
  await setDoc(ref, { ...module, createdAt: now, updatedAt: now });
  return { id: ref.id, ...module };
}

export async function listModules() {
  const snap = await getDocs(collection(db, 'modules'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateModule(id: string, data: Partial<{ name: string; description: string }>) {
  const ref = doc(db, 'modules', id);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteModule(id: string) {
  const ref = doc(db, 'modules', id);
  await deleteDoc(ref);
}
