// src/services/storage/StorageService.ts

// Define the storage service interface
export interface StorageService {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  // Add method to clear data associated with a specific user/profile
  clearUserSpecificData(userId: string, profileId?: string): Promise<void>;
}

// Local Storage implementation
export class LocalStorageService implements StorageService {
private prefix: string;

constructor(prefix: string = 'acara_') {
  this.prefix = prefix;
}

private getKeyWithPrefix(key: string): string {
  return `${this.prefix}${key}`;
}

async getItem<T>(key: string): Promise<T | null> {
  try {
    // Ensure this runs only in the browser
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(this.getKeyWithPrefix(key));
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return null;
  }
}

async setItem<T>(key: string, value: T): Promise<void> {
  try {
      // Ensure this runs only in the browser
      if (typeof window === 'undefined') return;
    localStorage.setItem(this.getKeyWithPrefix(key), JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error);
    throw error;
  }
}

async removeItem(key: string): Promise<void> {
  try {
      // Ensure this runs only in the browser
      if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getKeyWithPrefix(key));
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
    throw error;
  }
}

async clear(): Promise<void> {
  try {
    // Ensure this runs only in the browser
    if (typeof window === 'undefined') return;
    // Only clear items with our prefix
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    throw error;
  }
}

// Method to clear data specifically for a user (profile and associated projects)
async clearUserSpecificData(userId: string, profileId?: string): Promise<void> {
  try {
    // Ensure this runs only in the browser
    if (typeof window === 'undefined') return;

    // 1. Clear Borrower Profile directly associated with userId
    const profiles = await this.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
    let userProfileId = profileId;
    const profileToRemove = profiles.find(p => p.userId === userId);
    if (profileToRemove) {
        userProfileId = profileToRemove.id; // Get the ID if not passed
        const updatedProfiles = profiles.filter(p => p.userId !== userId);
        await this.setItem('borrowerProfiles', updatedProfiles);
        console.log(`Cleared profile for user ${userId}`);
    }

    // 2. Clear Projects associated with the profileId
    if (userProfileId) {
        const projects = await this.getItem<ProjectProfile[]>('projects') || [];
        const updatedProjects = projects.filter(p => p.borrowerProfileId !== userProfileId);
        if (projects.length !== updatedProjects.length) {
            await this.setItem('projects', updatedProjects);
            console.log(`Cleared projects for profile ${userProfileId}`);
        }

         // 3. Clear other associated data like messages, principals, docs if needed
         // Example for messages (repeat for others if they exist and store projectId)
         const messages = await this.getItem<ProjectMessage[]>('projectMessages') || [];
         const projectsToClearIds = projects.filter(p => p.borrowerProfileId === userProfileId).map(p => p.id);
         if (projectsToClearIds.length > 0) {
             const updatedMessages = messages.filter(m => !projectsToClearIds.includes(m.projectId));
             if (messages.length !== updatedMessages.length) {
                 await this.setItem('projectMessages', updatedMessages);
                 console.log(`Cleared messages for projects associated with profile ${userProfileId}`);
             }
         }
    } else {
        console.log(`No profile ID found or provided for user ${userId}, cannot clear associated projects.`);
    }

  } catch (error) {
    console.error(`Error clearing user-specific data for ${userId}:`, error);
    throw error;
  }
}
}

// Encrypted Storage implementation (Placeholder - uses LocalStorage for now)
// NOTE: Real encryption requires 'secure-ls' package and browser environment.
export class EncryptedStorageService implements StorageService {
private storage: any; // Should be SecureLS instance
private prefix: string;

constructor(prefix: string = 'acara_') {
  this.prefix = prefix;
  // Use LocalStorage as a fallback for this mock implementation
  this.storage = typeof window !== 'undefined' ? localStorage : {
      getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {}, length: 0, key: () => null
  };
  if (typeof window !== 'undefined' && !localStorage) {
      console.warn("EncryptedStorageService: SecureLS not implemented, falling back to potentially insecure LocalStorage.");
  }
}

private getKeyWithPrefix(key: string): string {
  return `${this.prefix}${key}`;
}

async getItem<T>(key: string): Promise<T | null> {
   try {
      // Ensure this runs only in the browser
      if (typeof window === 'undefined') return null;
      const item = this.storage.getItem(this.getKeyWithPrefix(key));
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item ${key} from secure storage:`, error);
      return null;
    }
}

async setItem<T>(key: string, value: T): Promise<void> {
   try {
      // Ensure this runs only in the browser
      if (typeof window === 'undefined') return;
      this.storage.setItem(this.getKeyWithPrefix(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in secure storage:`, error);
      throw error;
    }
}

async removeItem(key: string): Promise<void> {
   try {
      // Ensure this runs only in the browser
      if (typeof window === 'undefined') return;
      this.storage.removeItem(this.getKeyWithPrefix(key));
    } catch (error) {
      console.error(`Error removing item ${key} from secure storage:`, error);
      throw error;
    }
}

async clear(): Promise<void> {
  try {
    // Ensure this runs only in the browser
    if (typeof window === 'undefined') return;
    const keysToRemove = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      this.storage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    throw error;
  }
}

 // Implement clearUserSpecificData for consistency (uses LocalStorageService logic)
 async clearUserSpecificData(userId: string, profileId?: string): Promise<void> {
  try {
    if (typeof window === 'undefined') return;

    const profiles = await this.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
    let userProfileId = profileId;
    const profileToRemove = profiles.find(p => p.userId === userId);
    if (profileToRemove) {
        userProfileId = profileToRemove.id;
        const updatedProfiles = profiles.filter(p => p.userId !== userId);
        await this.setItem('borrowerProfiles', updatedProfiles);
    }

    if (userProfileId) {
        const projects = await this.getItem<ProjectProfile[]>('projects') || [];
        const updatedProjects = projects.filter(p => p.borrowerProfileId !== userProfileId);
        await this.setItem('projects', updatedProjects);

        // Clear associated messages etc.
        const messages = await this.getItem<ProjectMessage[]>('projectMessages') || [];
         const projectsToClearIds = projects.filter(p => p.borrowerProfileId === userProfileId).map(p => p.id);
         if (projectsToClearIds.length > 0) {
             const updatedMessages = messages.filter(m => !projectsToClearIds.includes(m.projectId));
              await this.setItem('projectMessages', updatedMessages);
         }
    }
  } catch (error) {
    console.error(`Error clearing user-specific data for ${userId}:`, error);
    throw error;
  }
}
}

// Factory function
export function createStorageService(useEncryption: boolean = false, prefix: string = 'acara_'): StorageService {
if (useEncryption) {
  // In a real app, instantiate SecureLS here if available
  // console.warn("Encryption requested but not fully implemented, using LocalStorage fallback.");
  return new EncryptedStorageService(prefix); // Fallback for now
}
return new LocalStorageService(prefix);
}

// Import necessary types (adjust path if needed)
import { BorrowerProfile, ProjectProfile, ProjectMessage } from '../../../src/types/enhanced-types';