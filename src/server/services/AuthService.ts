import { usersRepository } from '../repositories/UsersRepository';
import { User, CreateUserData, UserRole } from '@/types/user';
import { AuthUser } from '@/types/auth';

function resolveRole(email: string): UserRole {
  const ownerEmails = (process.env.OWNER_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return ownerEmails.includes(email.toLowerCase()) ? 'owner' : 'user';
}

export class AuthService {
  async createUserProfile(
    uid: string, 
    email: string, 
    firstName: string,
    lastName: string
  ): Promise<User> {
    const userData: CreateUserData = {
      email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role: resolveRole(email),
    };

    await usersRepository.createUser(uid, userData);
    
    const user = await usersRepository.getById(uid);
    if (!user) {
      throw new Error('Failed to create user profile');
    }

    return user;
  }

  async getUserProfile(uid: string): Promise<User | null> {
    return await usersRepository.getById(uid);
  }

  async updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
    await usersRepository.updateUser(uid, updates);
    
    const user = await usersRepository.getById(uid);
    if (!user) {
      throw new Error('User not found after update');
    }

    return user;
  }

  async ensureUserExists(uid: string, email: string, displayName: string): Promise<User> {
    let user = await this.getUserProfile(uid);
    
    if (!user) {
      // Split displayName into firstName and lastName
      const nameParts = displayName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      user = await this.createUserProfile(uid, email, firstName, lastName);
    } else {
      // Upgrade role if email is in OWNER_EMAILS but stored role is lower
      const expectedRole = resolveRole(email);
      if (expectedRole === 'owner' && user.role !== 'owner') {
        await usersRepository.updateUser(uid, { role: 'owner' });
        user = { ...user, role: 'owner' };
      }
    }

    return user;
  }

  toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      role: user.role,
    };
  }

  async deleteUserProfile(uid: string): Promise<void> {
    await usersRepository.delete(uid);
  }
}

export const authService = new AuthService();