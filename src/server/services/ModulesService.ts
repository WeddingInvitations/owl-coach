import { getFirestore } from 'firebase-admin/firestore';
import adminApp from '@/lib/firebase-admin';
export async function createModule(module: any) {
  const db = getFirestore(adminApp);
  const now = new Date().toISOString();
  const data = {
    name: module.name || '',
    description: module.description || '',
    estimatedDuration: typeof module.estimatedDuration === 'number' ? module.estimatedDuration : 0,
    exercises: Array.isArray(module.exercises)
      ? module.exercises.map((ex: any) => ({
          id: ex.id || '',
          name: ex.name || '',
          description: ex.description || '',
          sets: typeof ex.sets === 'number' ? ex.sets : 3,
          reps: typeof ex.reps === 'string' ? ex.reps : '',
          restTime: typeof ex.restTime === 'number' ? ex.restTime : 60,
          videoUrl: ex.videoUrl || '',
          imageUrl: ex.imageUrl || '',
          instructions: Array.isArray(ex.instructions) ? ex.instructions : [],
        }))
      : [],
    createdAt: now,
    updatedAt: now,
  };
  const ref = await db.collection('modules').add(data);
  return { id: ref.id, ...data };
}

export async function listModules() {
  const db = getFirestore(adminApp);
  const snap = await db.collection('modules').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateModule(id: string, data: Partial<{ name: string; description: string; estimatedDuration: number; exercises: any[] }>) {
  const db = getFirestore(adminApp);
  const ref = db.collection('modules').doc(id);
  await ref.update({ ...data, updatedAt: new Date().toISOString() });
}

import { trainingPlansRepository } from '@/server/repositories/TrainingPlansRepository';

export async function deleteModule(id: string) {
  const db = getFirestore(adminApp);
  // Check if module is part of any published plan
  const publishedPlans = await trainingPlansRepository.getPublished();
  const isInPublishedPlan = publishedPlans.some(plan => {
    // Check both previewModules and fullModules
    const allModules = [
      ...(plan.previewModules || []),
      ...(plan.fullModules || [])
    ];
    return allModules.some(module => module.id === id);
  });
  if (isInPublishedPlan) {
    throw new Error('No se puede eliminar el módulo porque está incluido en un plan publicado.');
  }
  const ref = db.collection('modules').doc(id);
  await ref.delete();
}
