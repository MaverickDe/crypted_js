// import crypto from "crypto";
import * as crypto from "crypto";
import { GeneralConfig } from "./store";
import { Encryption } from "./encryption";

// import dotenv from "dotenv";

// dotenv.config();

// const CENTRAL_KEY = process.env.CENTRAL_KEY || crypto.randomBytes(32).toString("hex");
// const MASTER_KEY = process.env.MASTER_KEY || crypto.randomBytes(32).toString("hex");

export class KeyManager {
  static generateUserKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // static deriveEncryptionKey({userKey,centralKey}:{userKey: string,centralKey:string}): Buffer {
  //   // return crypto.createHash("sha256").update(userKey + CENTRAL_KEY).digest("hex");
  //   return crypto.hkdfSync("sha256", Buffer.from(userKey, "utf-8"), Buffer.from(centralKey, "utf-8"), Buffer.from("encryption-key", "utf-8"), 32);

  // }
  static deriveEncryptionKey({ userKey, centralKey }: { userKey: string; centralKey: string }): Buffer {
    const keyBuffer = crypto.hkdfSync(
      "sha256",
      Buffer.from(userKey, "utf-8"),
      Buffer.from(centralKey, "utf-8"),
      Buffer.from("encryption-key", "utf-8"),
      32
    );

    return Buffer.from(keyBuffer); // ✅ Convert to Buffer
  }

  static hashUserKey({userKey,masterKey:MASTER_KEY}:{userKey: string,masterKey:string}): string {
    return crypto.createHash("sha256").update(userKey + MASTER_KEY).digest("hex");
  }


  
}
