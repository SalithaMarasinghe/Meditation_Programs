import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MeditationProgram, ProgramPage, Video } from '../types';

export class FirebaseService {
  // Programs
  static async getPrograms(): Promise<MeditationProgram[]> {
    const q = query(collection(db, 'programs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as MeditationProgram[];
  }

  static async getProgram(id: string): Promise<MeditationProgram | null> {
    const docRef = doc(db, 'programs', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate() || new Date(),
      updatedAt: snapshot.data().updatedAt?.toDate() || new Date()
    } as MeditationProgram;
  }

  static async createProgram(program: Omit<MeditationProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'programs'), {
      ...program,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async updateProgram(id: string, updates: Partial<MeditationProgram>): Promise<void> {
    const docRef = doc(db, 'programs', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteProgram(id: string): Promise<void> {
    const docRef = doc(db, 'programs', id);
    await deleteDoc(docRef);
  }

  static onProgramsChange(callback: (programs: MeditationProgram[]) => void) {
    const q = query(collection(db, 'programs'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snapshot => {
      const programs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as MeditationProgram[];
      callback(programs);
    });
  }
}