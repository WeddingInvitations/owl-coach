export type DifficultyLevel = 'principiante' | 'intermedio' | 'avanzado';
export type Currency = 'EUR' | 'USD';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  tipo?: string; // EMOM, EMOM 2', etc.
  sets: number;
  reps: string; // puede ser "10-12" o "30 seconds"
  restTime: number; // en segundos
  videoUrl?: string;
  imageUrl?: string;
  instructions: string[];
}

export interface TrainingPlan {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  coachId: string;
  coachName: string;
  difficulty: DifficultyLevel;
  duration: number; // en semanas
  estimatedDuration: number; // duración total estimada en minutos
  price: number;
  currency: Currency;
  isPublished: boolean;
  categoryIds: string[];
  exercises: Exercise[]; // ejercicios directamente en el plan
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrainingPlanData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  difficulty: DifficultyLevel;
  duration: number;
  estimatedDuration: number;
  price: number;
  currency: Currency;
  categoryIds: string[];
  exercises: Exercise[];
}

export interface UpdateTrainingPlanData extends Partial<CreateTrainingPlanData> {
  isPublished?: boolean;
}

// Kept for backward compatibility with existing Firestore documents
export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  estimatedDuration: number;
}