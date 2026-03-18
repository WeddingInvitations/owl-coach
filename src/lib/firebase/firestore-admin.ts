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
  const converted = { ...data };
  Object.keys(converted).forEach((key) => {
    const val = converted[key];
    if (val && typeof val === 'object' && val.toDate) {
      converted[key] = val.toDate().toISOString();
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      converted[key] = convertData(val);
    }
  });
  return converted;
}

export async function adminGetDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const docRef = getAdminDb().collection(collectionName).doc(docId);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return convertData({ id: snap.id, ...snap.data() }) as T;
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
  const docRef = getAdminDb().collection(collectionName).doc(docId);
  await docRef.update(data as FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>);
}

export async function adminDeleteDocument(collectionName: string, docId: string): Promise<void> {
  const docRef = getAdminDb().collection(collectionName).doc(docId);
  await docRef.delete();
}
