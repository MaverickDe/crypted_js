import { KeyManager } from "./keymanager";
import * as crypto from "crypto";
export class Recovery {
  static recoverUserKey(storedHash: string, possibleKeys: string[]): string | null {
    for (const key of possibleKeys) {
      // if (KeyManager.hashUserKey({key}) === storedHash) {
        return key;
      // }
    }
    return null;
  }

  static recoverUserKeyWithHash(hashedUserKey: string, masterKey: string): string {
    // 🔄 Hash masterKey + hashedUserKey to regenerate userKey
    return crypto.createHmac("sha256", masterKey).update(hashedUserKey).digest("hex");
  }
}
