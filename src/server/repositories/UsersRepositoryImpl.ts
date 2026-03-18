import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { BaseRepository } from './BaseRepository';

export class UsersRepository extends BaseRepository<User> {
  protected collectionName = 'users';

  async createUser(id: string, userData: CreateUserData): Promise<void> {
    const now = new Date();
    
    const user: Omit<User, 'id'> = {
      ...userData,
      role: userData.role || 'user', // Default to user role
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await this.create(id, user);
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<void> {
    const updateData: Partial<User> = {
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    await this.update(id, updateData);
  }

  async getUsersByRole(role: User['role']): Promise<User[]> {
    return await this.getByField('role', role);
  }

  async searchUsersByEmail(email: string): Promise<User[]> {
    const users = await this.getAll();
    return users.filter(user => 
      user.email.toLowerCase().includes(email.toLowerCase())
    );
  }

  async searchUsersByDisplayName(displayName: string): Promise<User[]> {
    const users = await this.getAll();
    return users.filter(user => 
      (user.displayName || '').toLowerCase().includes(displayName.toLowerCase())
    );
  }

  async updateUserRole(userId: string, newRole: User['role']): Promise<void> {
    await this.updateUser(userId, { role: newRole });
  }

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<User['role'], number>;
  }> {
    const users = await this.getAll();
    
    const stats = {
      total: users.length,
      byRole: {
        owner: 0,
        coach: 0,
        user: 0,
      } as Record<User['role'], number>
    };

    users.forEach(user => {
      stats.byRole[user.role]++;
    });

    return stats;
  }
}

export const usersRepository = new UsersRepository();