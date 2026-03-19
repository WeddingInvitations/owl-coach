import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function createExercise(exercise: { name: string; description: string }) {
  const now = new Date().toISOString();
  const ref = doc(collection(db, 'exercises'));
  await setDoc(ref, { ...exercise, createdAt: now, updatedAt: now });
  return { id: ref.id, ...exercise };
}

export async function listExercises() {
  const snap = await getDocs(collection(db, 'exercises'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateExercise(id: string, data: Partial<{ name: string; description: string }>) {
  const ref = doc(db, 'exercises', id);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteExercise(id: string) {
  const ref = doc(db, 'exercises', id);
  await deleteDoc(ref);
}
