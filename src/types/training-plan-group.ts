import { Currency } from './training-plan';

export interface TrainingPlanGroup {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  coachId: string;
  coachName: string;
  includedPlanIds: string[];
  price: number;
  currency: Currency;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrainingPlanGroupData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  includedPlanIds: string[];
  price: number;
  currency: Currency;
}

export interface UpdateTrainingPlanGroupData extends Partial<CreateTrainingPlanGroupData> {
  isPublished?: boolean;
}