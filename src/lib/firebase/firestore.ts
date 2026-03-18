import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';

// Utility function to convert Firestore timestamp to Date
export function convertTimestamp(data: any): any {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (typeof converted[key] === 'object' && converted[key] !== null) {
      converted[key] = convertTimestamp(converted[key]);
    }
  });
  
  return converted;
}

// Utility function to convert Date to Firestore timestamp
export function convertToTimestamp(data: any): any {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Date) {
      converted[key] = Timestamp.fromDate(converted[key]);
    } else if (typeof converted[key] === 'object' && converted[key] !== null) {
      converted[key] = convertToTimestamp(converted[key]);
    }
  });
  
  return converted;
}

// Generic CRUD operations
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      return convertTimestamp(data) as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

export async function getDocuments<T>(
  collectionName: string, 
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);
    
    const documents: T[] = [];
    querySnapshot.forEach((doc: any) => {
      const data = { id: doc.id, ...doc.data() };
      documents.push(convertTimestamp(data) as T);
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

export async function createDocument<T>(
  collectionName: string, 
  docId: string, 
  data: Omit<T, 'id'>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    const timestampData = convertToTimestamp(data);
    await setDoc(docRef, timestampData);
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function updateDocument<T>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    const timestampData = convertToTimestamp(data);
    await updateDoc(docRef, timestampData);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}