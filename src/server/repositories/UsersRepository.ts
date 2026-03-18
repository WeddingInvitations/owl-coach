import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { BaseRepository } from './BaseRepository';

export class UsersRepository extends BaseRepository<User> {
  protected collectionName = 'users';

  async createUser(id: string, userData: CreateUserData): Promise<void> {
    const now = new Date();
    const user: Omit<User, 'id'> = {
      ...userData,
      role: userData.role || 'user',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await this.create(id, user);
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<void> {
    const updateData = {
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    await this.update(id, updateData);
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getByField('email', email);
    return users.length > 0 ? users[0] : null;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await this.getByField('role', role);
  }

  async getCoaches(): Promise<User[]> {
    return await this.getUsersByRole('coach');
  }

  async getOwners(): Promise<User[]> {
    return await this.getUsersByRole('owner');
  }

  async getAllUsers(): Promise<User[]> {
    return await this.getAll({
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }
}

export const usersRepository = new UsersRepository();