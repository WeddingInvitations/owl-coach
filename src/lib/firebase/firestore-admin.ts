/**
 * Server-side Firestore helpers using Firebase Admin SDK.
 * These bypass Firestore security rules and should only be used in API routes / server code.
 */
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import adminApp from '@/lib/firebase-admin';

function getAdminDb() {
  return getFirestore(adminApp);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertData(data: any): any {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => convertData(item));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    // Check if it's a Firestore Timestamp
    if (data.toDate && typeof data.toDate === 'function') {
      return data.toDate().toISOString();
    }
    
    // Convert all properties recursively
    const converted: any = {};
    Object.keys(data).forEach((key) => {
      converted[key] = convertData(data[key]);
    });
    return converted;
  }
  
  // Return primitive values as-is
  return data;
}

export async function adminGetDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const docRef = getAdminDb().collection(collectionName).doc(docId);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  
  const rawData = snap.data();
  const converted = convertData({ id: snap.id, ...rawData }) as T;
  
  // Debug logging for training plans
  if (collectionName === 'trainingPlans') {
    console.log(`📖 Reading plan from Firestore: ${docId}`);
    console.log('Raw data keys:', Object.keys(rawData || {}));
    console.log('PreviewModules:', Array.isArray(rawData?.previewModules) ? `${rawData.previewModules.length} items` : 'N/A');
    console.log('FullModules:', Array.isArray(rawData?.fullModules) ? `${rawData.fullModules.length} items` : 'N/A');
    
    if (rawData?.fullModules && rawData.fullModules.length > 0) {
      console.log('First fullModule:', {
        ...rawData.fullModules[0],
        exercises: `${rawData.fullModules[0].exercises?.length || 0} exercises`
      });
    }
  }
  
  return converted;
}

export async function adminGetDocuments<T>(
  collectionName: string,
  constraints: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: unknown }> = [],
  orderByField?: { field: string; direction: 'asc' | 'desc' },
  limitCount?: number,
): Promise<T[]> {
  let q: FirebaseFirestore.Query = getAdminDb().collection(collectionName);

  for (const c of constraints) {
    q = q.where(c.field, c.operator, c.value);
  }
  if (orderByField) {
    q = q.orderBy(orderByField.field, orderByField.direction);
  }
  if (limitCount) {
    q = q.limit(limitCount);
  }

  const snap = await q.get();
  return snap.docs.map((d) => convertData({ id: d.id, ...d.data() }) as T);
}

export async function adminCreateDocument<T>(
  collectionName: string,
  docId: string,
  data: Omit<T, 'id'>,
): Promise<void> {
  const docRef = getAdminDb().collection(collectionName).doc(docId);
  await docRef.set(data as FirebaseFirestore.DocumentData);
}

export async function adminUpdateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
): Promise<void> {
  // Debug: Log what we're updating
  console.log(`adminUpdateDocument - Collection: ${collectionName}, Doc: ${docId}`);
  console.log('Data keys:', Object.keys(data));
  if ('previewModules' in data) {
    console.log('previewModules in data:', Array.isArray((data as any).previewModules) ? (data as any).previewModules.length : 'Not an array');
  }
  if ('fullModules' in data) {
    console.log('fullModules in data:', Array.isArray((data as any).fullModules) ? (data as any).fullModules.length : 'Not an array');
  }
  
  const docRef = getAdminDb().collection(collectionName).doc(docId);
  await docRef.update(data as FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>);
  
  console.log('adminUpdateDocument - Update completed successfully');
}

export async function adminDeleteDocument(collectionName: string, docId: string): Promise<void> {
  const docRef = getAdminDb().collection(collectionName).doc(docId);
  await docRef.delete();
}
