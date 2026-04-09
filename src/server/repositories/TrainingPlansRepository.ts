import { TrainingPlan, CreateTrainingPlanData, UpdateTrainingPlanData } from '@/types/training-plan';
import { BaseRepository } from './BaseRepository';

export class TrainingPlansRepository extends BaseRepository<TrainingPlan> {
  protected collectionName = 'trainingPlans';

  async createTrainingPlan(
    id: string, 
    planData: CreateTrainingPlanData, 
    coachId: string, 
    coachName: string
  ): Promise<void> {
    const now = new Date();
    const slug = this.generateSlug(planData.title);
    
    const plan: Omit<TrainingPlan, 'id'> = {
      ...planData,
      slug,
      coachId,
      coachName,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.create(id, plan);
  }

  async updateTrainingPlan(id: string, planData: UpdateTrainingPlanData): Promise<void> {
    const updateData: Partial<TrainingPlan> = {
      ...planData,
      updatedAt: new Date(),
    };

    // Update slug if title changed
    if (planData.title) {
      updateData.slug = this.generateSlug(planData.title);
    }

    // Debug: Log what we're updating in Firestore
    console.log('TrainingPlansRepository - Updating plan:', id);
    console.log('Update data modules:', {
      previewModules: updateData.previewModules,
      fullModules: updateData.fullModules,
      hasPreview: !!updateData.previewModules,
      hasFull: !!updateData.fullModules,
      previewLength: Array.isArray(updateData.previewModules) ? updateData.previewModules.length : 'N/A',
      fullLength: Array.isArray(updateData.fullModules) ? updateData.fullModules.length : 'N/A',
    });

    await this.update(id, updateData);
    
    console.log('TrainingPlansRepository - Update completed');
  }

  async getBySlug(slug: string): Promise<TrainingPlan | null> {
    const plans = await this.getByField('slug', slug);
    return plans.length > 0 ? plans[0] : null;
  }

  async getByCoach(coachId: string): Promise<TrainingPlan[]> {
    return await this.getByField('coachId', coachId);
  }

  async getPublished(): Promise<TrainingPlan[]> {
    return await this.getAll({
      filters: [{ field: 'isPublished', operator: '==', value: true }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async getByCategory(categoryId: string): Promise<TrainingPlan[]> {
    return await this.getAll({
      filters: [
        { field: 'categoryIds', operator: 'array-contains', value: categoryId },
        { field: 'isPublished', operator: '==', value: true }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async getByDifficulty(difficulty: string): Promise<TrainingPlan[]> {
    return await this.getAll({
      filters: [
        { field: 'difficulty', operator: '==', value: difficulty },
        { field: 'isPublished', operator: '==', value: true }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async searchByTitle(searchTerm: string): Promise<TrainingPlan[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation - for production, use Algolia or similar
    const plans = await this.getPublished();
    return plans.filter(plan => 
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .trim();
  }
}

export const trainingPlansRepository = new TrainingPlansRepository();