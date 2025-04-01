import * as crypto from "crypto";
import { KeyManager } from "./keymanager"; // Key derivation logic
import { Logger } from "./logger";
import { GeneralConfig, rotateKeys } from "./store";








export class Encryption {



    static encrypt({ 
    data, 
    userKey, 
    centralKey, 
    expiresAt ,
    config
  }: { 
    expiresAt?: number, 
    data: string | Object | Array<any>, 
    userKey: string, 
    centralKey?: string ,
    config:GeneralConfig
  }): string {

    const keyInfo = config.key2 && config.rotation ? config.key2 : config.defaultKey; // Use key2 if rotating

    
    if (!config.defaultKey) throw new Error("Missing encryption key!");
    // 🔑 Derive encryption key
    const encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey:centralKey||keyInfo.key });

    Logger.info("Encryption starting", encryptionKey);

    // 🔀 Generate IV
    const iv = crypto.randomBytes(16);


    // 🔒 Encrypt using AES-256-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
    const encryptedPayload = JSON.stringify({ data, expiresAt, userKey }); // Store `userKey` inside
    let encrypted = cipher.update(encryptedPayload, "utf-8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag().toString("base64");

    // 🔏 Compute HMAC for integrity protection
    const hmacData = expiresAt !== undefined ? encrypted + expiresAt + userKey : encrypted + userKey;
    const hmac = crypto.createHmac("sha256", encryptionKey).update(hmacData).digest("hex");

    Logger.info("Data encrypted successfully");
let hash = Buffer.from(JSON.stringify({ encrypted, iv: iv.toString("base64"), authTag, hmac, expiresAt, userKey })).toString("base64");
    if (config.store) {
      config.store.store({ userKey, hash, version: keyInfo.v });

      // 🔄 Rotate keys only if cron is disabled and rotation is enabled
      if (config.rotation && !config.cron) {
        rotateKeys(config);
      }
    }
    
    return  hash
  }




  static decrypt({ hash,userKey:vb, centralKey,config }: { hash?: string,userKey?:string, centralKey?: string,config:GeneralConfig }): Object {
    // const decryptedObject = JSON.parse(Buffer.from(hash, "base64").toString("utf-8"));
    let encryptedData ;
    let version;

    if(hash){

      encryptedData =  JSON.parse(Buffer.from(hash, "base64").toString("utf-8"));
    }else{
      if (!config.store) throw new Error("No store available for decryption!");
      
      const record = config.store.get({ hash });
      if (!record) throw new Error("No data found!");
      
      const { hash:c, version:v } = record;
      encryptedData =  JSON.parse(Buffer.from(c, "base64").toString("utf-8"));
      version = v
    }
    const { encrypted, iv, authTag, hmac, expiresAt, userKey:vc } = encryptedData;

    let userKey = vb ||vc

    console.log("Decrypted Object:", encryptedData);

    // 🔑 Derive encryption key
    let encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey:centralKey||config.defaultKey.key });
    if(!encryptionKey &&  config.key2 && version === config.key2.v){
      encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey:config.key2.key });
    }


    // ✅ Verify HMAC integrity **before decryption**
    const hmacData = expiresAt !== undefined ? encrypted + expiresAt + userKey : encrypted + userKey;
    const derivedHmac = crypto.createHmac("sha256", encryptionKey).update(hmacData).digest("hex");

    if (derivedHmac !== hmac) {
      throw new Error("Data integrity check failed! Possible tampering detected.");
    }

    // 🔓 Skip expiration check if `expiresAt` is undefined
    if (expiresAt !== undefined && Date.now() > Number(expiresAt)) {
      throw new Error("Encryption key has expired!");
    }

    // 🛠 Convert IV & AuthTag
    const ivBuffer = Buffer.from(iv, "base64");
    const authTagBuffer = Buffer.from(authTag, "base64");

    // 🔓 Decrypt
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, "base64", "utf-8");
    decrypted += decipher.final("utf-8");
    if (config.rotation && !config.cron && config.store) {
      rotateKeys(config);
    }
    Logger.info("Data decrypted successfully");
    return JSON.parse(decrypted);
  }
}



