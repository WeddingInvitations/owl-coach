export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type Currency = 'USD' | 'EUR';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  estimatedDuration: number; // en minutos
}

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
  price: number;
  currency: Currency;
  isPublished: boolean;
  categoryIds: string[];
  previewModules: TrainingModule[]; // visible para todos
  fullModules: TrainingModule[]; // solo para compradores
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
  price: number;
  currency: Currency;
  categoryIds: string[];
  previewModules: TrainingModule[];
  fullModules: TrainingModule[];
}

export interface UpdateTrainingPlanData extends Partial<CreateTrainingPlanData> {
  isPublished?: boolean;
}