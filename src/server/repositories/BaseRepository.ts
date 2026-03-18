import { 
  getDocument, 
  getDocuments, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} from '@/lib/firebase/firestore';
import { where, orderBy, limit, QueryConstraint } from 'firebase/firestore';

export interface QueryOptions {
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  filters?: Array<{ field: string; operator: any; value: any }>;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract collectionName: string;

  async getById(id: string): Promise<T | null> {
    return await getDocument<T>(this.collectionName, id);
  }

  async getAll(options: QueryOptions = {}): Promise<T[]> {
    const constraints: QueryConstraint[] = [];

    if (options.filters) {
      options.filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });
    }

    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
    }

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    return await getDocuments<T>(this.collectionName, constraints);
  }

  async create(id: string, data: Omit<T, 'id'>): Promise<void> {
    await createDocument<T>(this.collectionName, id, data);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await updateDocument<T>(this.collectionName, id, data);
  }

  async delete(id: string): Promise<void> {
    await deleteDocument(this.collectionName, id);
  }

  async getByField(field: string, value: any): Promise<T[]> {
    return await this.getAll({
      filters: [{ field, operator: '==', value }]
    });
  }

  async exists(id: string): Promise<boolean> {
    const doc = await this.getById(id);
    return doc !== null;
  }
}