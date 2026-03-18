import { 
  adminGetDocument,
  adminGetDocuments,
  adminCreateDocument,
  adminUpdateDocument,
  adminDeleteDocument,
} from '@/lib/firebase/firestore-admin';

export interface QueryOptions {
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  filters?: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: unknown }>;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract collectionName: string;

  async getById(id: string): Promise<T | null> {
    return await adminGetDocument<T>(this.collectionName, id);
  }

  async getAll(options: QueryOptions = {}): Promise<T[]> {
    return await adminGetDocuments<T>(
      this.collectionName,
      options.filters,
      options.orderBy,
      options.limit,
    );
  }

  async getByField(field: string, value: unknown): Promise<T[]> {
    return await adminGetDocuments<T>(this.collectionName, [
      { field, operator: '==', value },
    ]);
  }

  async create(id: string, data: Omit<T, 'id'>): Promise<void> {
    await adminCreateDocument<T>(this.collectionName, id, data);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await adminUpdateDocument<T>(this.collectionName, id, data);
  }

  async delete(id: string): Promise<void> {
    await adminDeleteDocument(this.collectionName, id);
  }

  async exists(id: string): Promise<boolean> {
    const doc = await this.getById(id);
    return doc !== null;
  }
}