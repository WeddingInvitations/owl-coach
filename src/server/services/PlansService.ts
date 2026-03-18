import { trainingPlansRepository } from '../repositories/TrainingPlansRepository';
import { entitlementsRepository } from '../repositories/EntitlementsRepository';
import { TrainingPlan, CreateTrainingPlanData, UpdateTrainingPlanData } from '@/types/training-plan';
import { requireCoach, requireCanEditPlan } from '@/lib/permissions/guards';
import { UserRole } from '@/types/user';

export class PlansService {
  async createPlan(
    planData: CreateTrainingPlanData,
    coachId: string,
    coachName: string,
    userRole: UserRole
  ): Promise<string> {
    requireCoach(userRole);

    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await trainingPlansRepository.createTrainingPlan(
      planId, 
      planData, 
      coachId, 
      coachName
    );

    return planId;
  }

  async updatePlan(
    planId: string,
    planData: UpdateTrainingPlanData,
    userId: string,
    userRole: UserRole
  ): Promise<TrainingPlan> {
    const existingPlan = await trainingPlansRepository.getById(planId);
    if (!existingPlan) {
      throw new Error('Plan not found');
    }

    requireCanEditPlan(userRole, existingPlan.coachId, userId);

    await trainingPlansRepository.updateTrainingPlan(planId, planData);
    
    const updatedPlan = await trainingPlansRepository.getById(planId);
    if (!updatedPlan) {
      throw new Error('Failed to update plan');
    }

    return updatedPlan;
  }

  async deletePlan(planId: string, userId: string, userRole: UserRole): Promise<void> {
    const plan = await trainingPlansRepository.getById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    requireCanEditPlan(userRole, plan.coachId, userId);

    await trainingPlansRepository.delete(planId);
  }

  async getPlanById(planId: string): Promise<TrainingPlan | null> {
    return await trainingPlansRepository.getById(planId);
  }

  async getPlanBySlug(slug: string): Promise<TrainingPlan | null> {
    return await trainingPlansRepository.getBySlug(slug);
  }

  async getPublishedPlans(): Promise<TrainingPlan[]> {
    return await trainingPlansRepository.getPublished();
  }

  async getPlansByCoach(coachId: string): Promise<TrainingPlan[]> {
    return await trainingPlansRepository.getByCoach(coachId);
  }

  async canUserAccessPlan(userId: string, planId: string, userRole: UserRole): Promise<boolean> {
    // Owners can access all plans
    if (userRole === 'owner') {
      return true;
    }

    // Check if user has purchased this plan
    const hasAccess = await entitlementsRepository.hasUserAccessToPlan(userId, planId);
    return hasAccess;
  }

  async getPlanWithAccessControl(
    planId: string, 
    userId?: string, 
    userRole?: UserRole
  ): Promise<TrainingPlan | null> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      return null;
    }

    // If no user is logged in, only return preview content
    if (!userId || !userRole) {
      return {
        ...plan,
        fullModules: [], // Block full content
      };
    }

    // Check if user has access to full content
    const hasAccess = await this.canUserAccessPlan(userId, planId, userRole);
    
    if (!hasAccess) {
      return {
        ...plan,
        fullModules: [], // Block full content
      };
    }

    return plan;
  }

  async searchPlans(searchTerm: string): Promise<TrainingPlan[]> {
    return await trainingPlansRepository.searchByTitle(searchTerm);
  }

  async getPlansByDifficulty(difficulty: string): Promise<TrainingPlan[]> {
    return await trainingPlansRepository.getByDifficulty(difficulty);
  }

  async togglePlanPublication(
    planId: string, 
    userId: string, 
    userRole: UserRole
  ): Promise<TrainingPlan> {
    const plan = await trainingPlansRepository.getById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    requireCanEditPlan(userRole, plan.coachId, userId);

    const updatedPlan = await this.updatePlan(
      planId,
      { isPublished: !plan.isPublished },
      userId,
      userRole
    );

    return updatedPlan;
  }
}

export const plansService = new PlansService();