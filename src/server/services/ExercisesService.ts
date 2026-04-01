import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';

const db = admin.firestore();

export async function createExercise(exercise: any) {
  const now = new Date().toISOString();
  const ref = db.collection('exercises').doc();
  await ref.set({
    name: exercise.name || '',
    description: exercise.description || '',
    tipo: exercise.tipo || '',
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

export async function updateExercise(id: string, data: Partial<{
  name: string;
  description: string;
  tipo: string;
  sets: number;
  reps: string;
  restTime: number;
  videoUrl: string;
  imageUrl: string;
  instructions: string[];
}>) {
  const ref = db.collection('exercises').doc(id);
  const updateData: any = { updatedAt: new Date().toISOString() };
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.tipo !== undefined) updateData.tipo = data.tipo;
  if (data.sets !== undefined) updateData.sets = data.sets;
  if (data.reps !== undefined) updateData.reps = data.reps;
  if (data.restTime !== undefined) updateData.restTime = data.restTime;
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.instructions !== undefined) updateData.instructions = data.instructions;
  
  // Actualizar el ejercicio principal
  await ref.update(updateData);
  
  // Actualizar también las copias del ejercicio en todos los módulos
  const modulesSnap = await db.collection('modules').get();
  const batch = db.batch();
  
  modulesSnap.docs.forEach(moduleDoc => {
    const moduleData = moduleDoc.data();
    if (moduleData.exercises && Array.isArray(moduleData.exercises)) {
      const exercises = moduleData.exercises.map((ex: any) => {
        if (ex.id === id) {
          // Actualizar este ejercicio con los nuevos datos
          return {
            ...ex,
            ...updateData
          };
        }
        return ex;
      });
      
      // Solo actualizar si hubo cambios
      const hasExercise = moduleData.exercises.some((ex: any) => ex.id === id);
      if (hasExercise) {
        batch.update(moduleDoc.ref, { 
          exercises, 
          updatedAt: new Date().toISOString() 
        });
      }
    }
  });
  
  // Ejecutar todas las actualizaciones de módulos en batch
  await batch.commit();
}

export async function deleteExercise(id: string) {
  // Eliminar el ejercicio principal
  const ref = db.collection('exercises').doc(id);
  await ref.delete();
  
  // Eliminar también las referencias del ejercicio en todos los módulos
  const modulesSnap = await db.collection('modules').get();
  const batch = db.batch();
  
  modulesSnap.docs.forEach(moduleDoc => {
    const moduleData = moduleDoc.data();
    if (moduleData.exercises && Array.isArray(moduleData.exercises)) {
      const exercises = moduleData.exercises.filter((ex: any) => ex.id !== id);
      
      // Solo actualizar si había el ejercicio en el módulo
      const hadExercise = moduleData.exercises.some((ex: any) => ex.id === id);
      if (hadExercise) {
        batch.update(moduleDoc.ref, { 
          exercises, 
          updatedAt: new Date().toISOString() 
        });
      }
    }
  });
  
  // Ejecutar todas las actualizaciones de módulos en batch
  await batch.commit();
}

export async function getExerciseUsageInModules(exerciseId: string) {
  const modulesSnap = await db.collection('modules').get();
  const modulesUsingExercise: Array<{ id: string; name: string; description: string }> = [];
  
  modulesSnap.docs.forEach(doc => {
    const moduleData = doc.data();
    if (moduleData.exercises && Array.isArray(moduleData.exercises)) {
      const hasExercise = moduleData.exercises.some((ex: any) => ex.id === exerciseId);
      if (hasExercise) {
        modulesUsingExercise.push({
          id: doc.id,
          name: moduleData.name || '',
          description: moduleData.description || ''
        });
      }
    }
  });
  
  return modulesUsingExercise;
}
