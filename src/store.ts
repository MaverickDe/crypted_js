import { Encryption } from ".";

export interface Store {
    store(data: { userKey: string; hash: string; version: number }): void;
    get(filter: Record<string, any>): { userKey: string; hash: string; version: number } | null;
    find(filter: Record<string, any>, limit?: number): { userKey: string; hash: string; version: number }[];
    delete(filter: Record<string, any>): void;
  }


  export class MemoryStore implements Store {
    public storage: { userKey: string; hash: string; version: number }[] |undefined|null = [];
  
    store(data: { userKey: string; hash: string; version: number }): void {
     if(this.storage){

         this.storage.push(data);
     } 
    }
  
    get(filter: Record<string, any>): { userKey: string; hash: string; version: number } | null {
      return this.storage&&this.storage.find(item =>
        Object.entries(filter).every(([key, value]) => item[key as keyof typeof item] === value)
      ) || null;
    }
  
    find(filter: Record<string, any>, limit?: number): { userKey: string; hash: string; version: number }[] {
      const results = this.storage && this.storage.filter(item =>
        Object.entries(filter).every(([key, value]) => item[key as keyof typeof item] === value)
      ) ||[];
      return limit ? results.slice(0, limit) : results;
    }
  
    delete(filter: Record<string, any>): void {
        if(this.storage){

            this.storage = this.storage.filter(item =>
              !Object.entries(filter).every(([key, value]) => item[key as keyof typeof item] === value)
            );
        }
    }
  }
  
  

  export class GeneralConfig {
    defaultKey: { key: string; v: number };
    key2?: { key: string; v: number };
    rotation: boolean;
    store?: Store;
    cron: boolean;
    private cronInterval?: NodeJS.Timeout;
  
    constructor({
      store,
      defaultKey,
      key2,
      rotation = false,
      cron = false,
    }: {
      store?: Store;
      defaultKey: { key: string; v: number };
      key2?: { key: string; v: number };
      rotation?: boolean;
      cron?: boolean;
    }) {
      this.defaultKey = defaultKey;
      
      this.key2 = key2;
      this.rotation = rotation;
      this.cron = cron;
      this.store = store;
  
      // ✅ If rotation or cron is enabled, store must be provided
      if ((rotation || cron) && !store) {
        throw new Error("Store must be provided when rotation or cron is enabled!");
      }
  
      if (this.cron && this.store) {
        this.startCronRotation();
      }
    }
  
    isRotationComplete(): boolean {
      if (!this.store || !this.key2) return true;
      return this.store.find({ version: 0 }, 1).length === 0;
    }
  
    finalizeRotation() {
      if (!this.isRotationComplete()) throw new Error("Rotation not complete!");
      this.defaultKey.key = this.key2.key;
      delete this.key2;
      this.rotation = false;
    }
  
    private startCronRotation() {
      if (!this.store) return;
      this.cronInterval = setInterval(() => {
        console.log("🔄 Running scheduled key rotation...");
        rotateKeys(this);
      }, 10 * 60 * 1000); // Every 10 minutes
    }
  
    stopCronRotation() {
      if (this.cronInterval) {
        clearInterval(this.cronInterval);
        this.cronInterval = undefined;
      }
    }
  }
  
  export function rotateKeys(config: GeneralConfig) {
    if (!config.rotation || !config.key2 || !config.store) return;
  
    console.log("🔄 Performing key rotation...");
  
    const oldRecords = config.store.find({ version: config.defaultKey.v }, 10);
  
    for (const record of oldRecords) {
      try {
        const decryptedData = Encryption.decrypt({ userKey: record.userKey,hash:record.hash, config });
  
        const newHash = Encryption.encrypt({ data: decryptedData, userKey: record.userKey, config });
  
        config.store.store({ userKey: record.userKey, hash: newHash, version: config.key2.v });
        config.store.delete({ userKey: record.userKey });
      } catch (err) {
        console.error(`❌ Failed to rotate key for ${record.userKey}:`, err);
      }
    }
  
    if (config.isRotationComplete()) {
      console.log("✅ Rotation complete! You can finalize it.");
    }
  }
  