import { trainingPlanGroupsRepository } from '../repositories/TrainingPlanGroupsRepository';
import { entitlementsRepository } from '../repositories/EntitlementsRepository';
import { TrainingPlanGroup, CreateTrainingPlanGroupData, UpdateTrainingPlanGroupData } from '@/types/training-plan-group';
import { requireCoach, requireCanEditGroup } from '@/lib/permissions/guards';
import { UserRole } from '@/types/user';

export class GroupsService {
  async createGroup(
    groupData: CreateTrainingPlanGroupData,
    coachId: string,
    coachName: string,
    userRole: UserRole
  ): Promise<string> {
    requireCoach(userRole);

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await trainingPlanGroupsRepository.createTrainingPlanGroup(
      groupId, 
      groupData, 
      coachId, 
      coachName
    );

    return groupId;
  }

  async updateGroup(
    groupId: string,
    groupData: UpdateTrainingPlanGroupData,
    userId: string,
    userRole: UserRole
  ): Promise<TrainingPlanGroup> {
    const existingGroup = await trainingPlanGroupsRepository.getById(groupId);
    if (!existingGroup) {
      throw new Error('Group not found');
    }

    requireCanEditGroup(userRole, existingGroup.coachId, userId);

    await trainingPlanGroupsRepository.updateTrainingPlanGroup(groupId, groupData);
    
    const updatedGroup = await trainingPlanGroupsRepository.getById(groupId);
    if (!updatedGroup) {
      throw new Error('Failed to update group');
    }

    return updatedGroup;
  }

  async deleteGroup(groupId: string, userId: string, userRole: UserRole): Promise<void> {
    const group = await trainingPlanGroupsRepository.getById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    requireCanEditGroup(userRole, group.coachId, userId);

    await trainingPlanGroupsRepository.delete(groupId);
  }

  async getGroupById(groupId: string): Promise<TrainingPlanGroup | null> {
    return await trainingPlanGroupsRepository.getById(groupId);
  }

  async getGroupBySlug(slug: string): Promise<TrainingPlanGroup | null> {
    return await trainingPlanGroupsRepository.getBySlug(slug);
  }

  async getPublishedGroups(): Promise<TrainingPlanGroup[]> {
    return await trainingPlanGroupsRepository.getPublished();
  }

  async getGroupsByCoach(coachId: string): Promise<TrainingPlanGroup[]> {
    return await trainingPlanGroupsRepository.getByCoach(coachId);
  }

  async canUserAccessGroup(userId: string, groupId: string, userRole: UserRole): Promise<boolean> {
    // Owners can access all groups
    if (userRole === 'owner') {
      return true;
    }

    // Check if user has purchased this group
    const hasAccess = await entitlementsRepository.hasUserPurchasedProduct(userId, 'group', groupId);
    return hasAccess;
  }

  async searchGroups(searchTerm: string): Promise<TrainingPlanGroup[]> {
    return await trainingPlanGroupsRepository.searchByTitle(searchTerm);
  }

  async toggleGroupPublication(
    groupId: string, 
    userId: string, 
    userRole: UserRole
  ): Promise<TrainingPlanGroup> {
    const group = await trainingPlanGroupsRepository.getById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    requireCanEditGroup(userRole, group.coachId, userId);

    const updatedGroup = await this.updateGroup(
      groupId,
      { isPublished: !group.isPublished },
      userId,
      userRole
    );

    return updatedGroup;
  }

  async getGroupsContainingPlan(planId: string): Promise<TrainingPlanGroup[]> {
    return await trainingPlanGroupsRepository.getGroupsContainingPlan(planId);
  }
}

export const groupsService = new GroupsService();