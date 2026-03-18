import { Purchase, CreatePurchaseData } from '@/types/purchase';
import { BaseRepository } from './BaseRepository';

export class PurchasesRepository extends BaseRepository<Purchase> {
  protected collectionName = 'purchases';

  async createPurchase(id: string, purchaseData: CreatePurchaseData): Promise<void> {
    const purchase: Omit<Purchase, 'id'> = {
      ...purchaseData,
      status: 'pending',
      createdAt: new Date(),
    };

    await this.create(id, purchase);
  }

  async updatePurchaseStatus(id: string, status: Purchase['status']): Promise<void> {
    await this.update(id, { status });
  }

  async getByUser(userId: string): Promise<Purchase[]> {
    return await this.getAll({
      filters: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async getCompletedByUser(userId: string): Promise<Purchase[]> {
    return await this.getAll({
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'status', operator: '==', value: 'completed' }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async getByProduct(productType: Purchase['productType'], productId: string): Promise<Purchase[]> {
    return await this.getAll({
      filters: [
        { field: 'productType', operator: '==', value: productType },
        { field: 'productId', operator: '==', value: productId }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async hasUserPurchased(
    userId: string, 
    productType: Purchase['productType'], 
    productId: string
  ): Promise<boolean> {
    const purchases = await this.getAll({
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'productType', operator: '==', value: productType },
        { field: 'productId', operator: '==', value: productId },
        { field: 'status', operator: '==', value: 'completed' }
      ],
      limit: 1
    });

    return purchases.length > 0;
  }

  async getRecentPurchases(limit: number = 10): Promise<Purchase[]> {
    return await this.getAll({
      filters: [{ field: 'status', operator: '==', value: 'completed' }],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit
    });
  }

  async getPurchasesByStatus(status: Purchase['status']): Promise<Purchase[]> {
    return await this.getAll({
      filters: [{ field: 'status', operator: '==', value: status }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  async getTotalRevenue(): Promise<number> {
    const completedPurchases = await this.getPurchasesByStatus('completed');
    return completedPurchases.reduce((total, purchase) => total + purchase.amount, 0);
  }
}

export const purchasesRepository = new PurchasesRepository();