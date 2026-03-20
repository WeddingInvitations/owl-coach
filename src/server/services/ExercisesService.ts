import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';

const db = admin.firestore();

export async function createExercise(exercise: any) {
  const now = new Date().toISOString();
  const ref = db.collection('exercises').doc();
  await ref.set({
    name: exercise.name || '',
    description: exercise.description || '',
    sets: typeof exercise.sets === 'number' ? exercise.sets : 3,
    reps: typeof exercise.reps === 'string' ? exercise.reps : '',
    restTime: typeof exercise.restTime === 'number' ? exercise.restTime : 60,
    videoUrl: exercise.videoUrl || '',
    imageUrl: exercise.imageUrl || '',
    instructions: Array.isArray(exercise.instructions) ? exercise.instructions : [],
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, ...exercise };
}

export async function listExercises() {
  const snap = await db.collection('exercises').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateExercise(id: string, data: Partial<{ name: string; description: string }>) {
  const ref = db.collection('exercises').doc(id);
  await ref.update({ ...data, updatedAt: new Date().toISOString() });
}

export async function deleteExercise(id: string) {
  const ref = db.collection('exercises').doc(id);
  await ref.delete();
}
