import { Encryption } from "./encryption";
import { KeyManager } from "./keymanager";
import { GeneralConfig } from "./store";
// import dotenv from "dotenv";

// dotenv.config();

export class AutoEncryption {
  /**
   * Encrypts data automatically
   * @param data - The data to be encrypted
   * @returns { hash: string, userKey: string }
   */

  static encrypt({ 
    data, 

    centralKey, 
    expiresAt ,
    config
  }: { 
    expiresAt?: number, 
    data: string | Object | Array<any>, 

    centralKey?: string ,
    config:GeneralConfig
  }): Record<string,any> {
    // Generate a new User Key
    const userKey = KeyManager.generateUserKey();

    // Encrypt data using the generated user key
    const hash = Encryption.encrypt({ data, userKey, config,expiresAt,centralKey});

    // Return encrypted data + user key
    return { hash, userKey };
  }

  /**
   * Decrypts data and rotates the key automatically
   * @param hash - The encrypted hash
   * @returns { decryptedData: string, newhash: string, newUserKey: string }
   */
  // static decrypt({ hash, centralKey, masterKey }: { hash: string, centralKey: string, masterKey?: string }): Record<string, any> {
    static decrypt({ hash,userKey:vb, centralKey,config,expiresAt:as }: { hash?: string,userKey?:string, centralKey?: string,config:GeneralConfig,expiresAt:number }): Object {
    let decryptedData;
    let userKey;

    try {
      // 🔓 Attempt decryption with the latest key
      decryptedData = Encryption.decrypt({ hash, centralKey,config });
      userKey = decryptedData.userKey; // Extract the key used

    } catch (error) {
      console.warn("⚠️ Decryption with latest key failed. Trying previous keys...");

    

    
      if (!decryptedData) {
        throw new Error("❌ Decryption failed with all known keys.");
      }
    }

    // 🔑 Generate a new User Key for rotation
    const newUserKey = KeyManager.generateUserKey();

    // 🔄 Re-encrypt the data with the new key
    const newhash = Encryption.encrypt({ data: decryptedData.data, userKey: newUserKey, centralKey,config,expiresAt:as||decryptedData.expiresAt });

    return { decryptedData, newhash, newUserKey };
  }
}
