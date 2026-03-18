import { TrainingPlanGroup, CreateTrainingPlanGroupData, UpdateTrainingPlanGroupData } from '@/types/training-plan-group';
import { BaseRepository } from './BaseRepository';

export class TrainingPlanGroupsRepository extends BaseRepository<TrainingPlanGroup> {
  protected collectionName = 'trainingPlanGroups';

  async createTrainingPlanGroup(
    id: string, 
    groupData: CreateTrainingPlanGroupData, 
    coachId: string, 
    coachName: string
  ): Promise<void> {
    const now = new Date();
    const slug = this.generateSlug(groupData.title);
    
    const group: Omit<TrainingPlanGroup, 'id'> = {
      ...groupData,
      slug,
      coachId,
      coachName,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.create(id, group);
  }

  async updateTrainingPlanGroup(id: string, groupData: UpdateTrainingPlanGroupData): Promise<void> {
    const updateData: Partial<TrainingPlanGroup> = {
      ...groupData,
      updatedAt: new Date(),
    };

    // Update slug if title changed
    if (groupData.title) {
      updateData.slug = this.generateSlug(groupData.title);
    }

    await this.update(id, updateData);
  }

  async getBySlug(slug: string): Promise<TrainingPlanGroup | null> {
    const groups = await this.getByField('slug', slug);
    return groups.length > 0 ? groups[0] : null;
  }

  async getByCoach(coachId: string): Promise<TrainingPlanGroup[]> {
    return await this.getByField('coachId', coachId);
  }

  async getPublished(): Promise<TrainingPlanGroup[]> {
    return await this.getAll({
      filters: [{ field: 'isPublished', operator: '==', value: true }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async getGroupsContainingPlan(planId: string): Promise<TrainingPlanGroup[]> {
    return await this.getAll({
      filters: [{ field: 'includedPlanIds', operator: 'array-contains', value: planId }],
    });
  }

  async searchByTitle(searchTerm: string): Promise<TrainingPlanGroup[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation - for production, use Algolia or similar
    const groups = await this.getPublished();
    return groups.filter(group => 
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
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

export const trainingPlanGroupsRepository = new TrainingPlanGroupsRepository();