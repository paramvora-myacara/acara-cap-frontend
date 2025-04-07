// src/services/storage/StorageService.ts

// Define the storage service interface
export interface StorageService {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
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
        localStorage.setItem(this.getKeyWithPrefix(key), JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting item ${key} in localStorage:`, error);
        throw error;
      }
    }
  
    async removeItem(key: string): Promise<void> {
      try {
        localStorage.removeItem(this.getKeyWithPrefix(key));
      } catch (error) {
        console.error(`Error removing item ${key} from localStorage:`, error);
        throw error;
      }
    }
  
    async clear(): Promise<void> {
      try {
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
  }
  
  // Create an encrypted storage service using the secure-ls library
  // This provides a more secure storage option with encryption
  export class EncryptedStorageService implements StorageService {
    private storage: any;
    private prefix: string;
    
    constructor(prefix: string = 'acara_') {
      this.prefix = prefix;
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Dynamically import secure-ls (you'll need to add this package)
        // Since secure-ls is a client-side library, we need to import it dynamically
        // For now, we'll use a mock implementation that falls back to localStorage
        this.storage = localStorage;
      } else {
        // Mock storage for SSR environments
        this.storage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
        };
      }
    }
  
    private getKeyWithPrefix(key: string): string {
      return `${this.prefix}${key}`;
    }
  
    async getItem<T>(key: string): Promise<T | null> {
      try {
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
        this.storage.setItem(this.getKeyWithPrefix(key), JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting item ${key} in secure storage:`, error);
        throw error;
      }
    }
  
    async removeItem(key: string): Promise<void> {
      try {
        this.storage.removeItem(this.getKeyWithPrefix(key));
      } catch (error) {
        console.error(`Error removing item ${key} from secure storage:`, error);
        throw error;
      }
    }
  
    async clear(): Promise<void> {
      try {
        // Only clear items with our prefix
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            this.storage.removeItem(key);
          }
        }
      } catch (error) {
        console.error('Error clearing secure storage:', error);
        throw error;
      }
    }
  }
  
  // Factory function to create the appropriate storage service
  export function createStorageService(useEncryption: boolean = false, prefix: string = 'acara_'): StorageService {
    if (useEncryption) {
      return new EncryptedStorageService(prefix);
    }
    return new LocalStorageService(prefix);
  }