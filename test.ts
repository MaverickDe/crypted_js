// const { encryptData, decryptData } = require('../src/encryption'); // Adjust path if needed

// const CENTRAL_KEY = 'central-secret-key';
// const MASTER_KEY = 'master-secret-key';

// describe('Encryption SDK', () => {
//   let encryptedData, userKey;

//   test('Encrypts data correctly', () => {
//     const originalData = 'Hello, Secure World!';
//     const result = encryptData(originalData, CENTRAL_KEY, MASTER_KEY);
    
//     expect(result).toHaveProperty('encryptedData');
//     expect(result).toHaveProperty('userKey');
    
//     encryptedData = result.encryptedData;
//     userKey = result.userKey;
//   });

//   test('Decrypts data correctly', () => {
//     const result = decryptData(encryptedData, userKey, CENTRAL_KEY, MASTER_KEY);
    
//     expect(result).toHaveProperty('decryptedData');
//     expect(result).toHaveProperty('newUserKey');
//     expect(result.decryptedData).toBe('Hello, Secure World!');
//   });

//   test('Key rotation works', () => {
//     const { newUserKey } = decryptData(encryptedData, userKey, CENTRAL_KEY, MASTER_KEY);
    
//     expect(newUserKey).not.toBe(userKey); // Ensure key is rotated
//   });
// });


// // export class Encryption {
// //   static encrypt({
// //     data,
// //     userKey,
// //     centralKey,
// //     masterKey,
// //   }: {
// //     data: string | Object | Array<any>;
// //     userKey: string;
// //     centralKey: string;
// //     masterKey?: string;
// //   }): string {
// //     try {
// //       // 🔑 Derive a strong encryption key (HKDF or PBKDF2)
// //       const encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey });

// //       // 🔀 Generate a secure random IV (Nonce)
// //       const iv = crypto.randomBytes(16);

// //       // 🔒 Encrypt using AES-256-GCM
// //       const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
// //       let encrypted = cipher.update(JSON.stringify({ data }), "utf-8", "base64");
// //       encrypted += cipher.final("base64");

// //       // 🛡️ Get the authentication tag for integrity
// //       const authTag = cipher.getAuthTag().toString("base64");

// //       // 📦 Create encryption object
// //       const encryptionObject = JSON.stringify({
// //         encryptedData: encrypted,
// //         iv: iv.toString("base64"),
// //         authTag,
// //         userKey,
// //       });

// //       // 🔐 Hash the encryption object into a compact Base64 string
// //       const hash = Buffer.from(encryptionObject).toString("base64");

// //       Logger.info("Data encrypted successfully");
// //       return hash;
// //     } catch (error) {
// //       Logger.error("Encryption failed:", error);
// //       throw new Error("Encryption process failed.");
// //     }
// //   }

// //   static decrypt({
// //     hash,
// //     centralKey,
// //     masterKey,
// //   }: {
// //     hash: string;
// //     centralKey: string;
// //     masterKey?: string;
// //   }): Object {
// //     try {
// //       // 🔓 Decode the Base64 hash to retrieve the original encryption object
// //       const decryptedObject = JSON.parse(Buffer.from(hash, "base64").toString("utf-8"));
// //       const { encryptedData, iv, authTag, userKey } = decryptedObject;

// //       // 🔑 Derive the same encryption key
// //       let encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey });

// //       // 🛠 Convert IV & AuthTag from Base64
// //       const ivBuffer = Buffer.from(iv, "base64");
// //       const authTagBuffer = Buffer.from(authTag, "base64");

// //       // 🔓 Decrypt using AES-256-GCM
// //       const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, ivBuffer);
// //       decipher.setAuthTag(authTagBuffer);

// //       let decrypted = decipher.update(encryptedData, "base64", "utf-8");
// //       decrypted += decipher.final("utf-8");

// //       Logger.info("Data decrypted successfully");
// //       return JSON.parse(decrypted);
// //     } catch (error) {
// //       Logger.error("Decryption failed:", error);

// //       // 🔄 Try master key if decryption fails with userKey
// //       if (masterKey) {
// //         try {
// //           Logger.warn("Attempting decryption using master key...");
// //           const masterDecryptionKey = KeyManager.deriveEncryptionKey({ userKey: masterKey, centralKey });
// //           return this.decrypt({ hash, centralKey, masterKey: masterDecryptionKey });
// //         } catch (masterError) {
// //           Logger.error("Master key decryption also failed:", masterError);
// //         }
// //       }

// //       throw new Error("Decryption failed: Invalid key or corrupted data.");
// //     }
// //   }

// //   static validateDecryption({
// //     hash,
// //     centralKey,
// //     masterKey,
// //   }: {
// //     hash: string;
// //     centralKey: string;
// //     masterKey?: string;
// //   }): boolean {
// //     try {
// //       this.decrypt({ hash, centralKey, masterKey });
// //       return true; // ✅ Decryption successful
// //     } catch {
// //       return false; // ❌ Decryption failed
// //     }
// //   }
// // }







// // export class Encryption {
// //   static encrypt({ 
// //     data, 
// //     userKey, 
// //     centralKey, 
// //     expiresAt 
// //   }: { 
// //     expiresAt?: number, 
// //     data: string | Object | Array<any>, 
// //     userKey: string, 
// //     centralKey: string 
// //   }): string {
    
// //     // 🔑 Derive encryption key
// //     const encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey });

// //     Logger.info("Encryption starting", encryptionKey);

// //     // 🔀 Generate IV
// //     const iv = crypto.randomBytes(16);

// //     // 🔒 Encrypt using AES-256-GCM
// //     const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
// //     const encryptedPayload = JSON.stringify({ data, expiresAt, userKey }); // Store `userKey` inside
// //     let encrypted = cipher.update(encryptedPayload, "utf-8", "base64");
// //     encrypted += cipher.final("base64");

// //     const authTag = cipher.getAuthTag().toString("base64");

// //     // 🔏 Compute HMAC for integrity protection
// //     const hmacData = expiresAt !== undefined ? encrypted + expiresAt + userKey : encrypted + userKey;
// //     const hmac = crypto.createHmac("sha256", encryptionKey).update(hmacData).digest("hex");

// //     Logger.info("Data encrypted successfully");
    
// //     return Buffer.from(JSON.stringify({ encrypted, iv: iv.toString("base64"), authTag, hmac, expiresAt, userKey })).toString("base64");
// //   }

// //   static decrypt({ hash, centralKey }: { hash: string, centralKey: string }): Object {
// //     const decryptedObject = JSON.parse(Buffer.from(hash, "base64").toString("utf-8"));
// //     const { encrypted, iv, authTag, hmac, expiresAt, userKey } = decryptedObject;

// //     console.log("Decrypted Object:", decryptedObject);

// //     // 🔑 Derive encryption key
// //     const encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey });

// //     // ✅ Verify HMAC integrity **before decryption**
// //     const hmacData = expiresAt !== undefined ? encrypted + expiresAt + userKey : encrypted + userKey;
// //     const derivedHmac = crypto.createHmac("sha256", encryptionKey).update(hmacData).digest("hex");

// //     if (derivedHmac !== hmac) {
// //       throw new Error("Data integrity check failed! Possible tampering detected.");
// //     }

// //     // 🔓 Skip expiration check if `expiresAt` is undefined
// //     if (expiresAt !== undefined && Date.now() > Number(expiresAt)) {
// //       throw new Error("Encryption key has expired!");
// //     }

// //     // 🛠 Convert IV & AuthTag
// //     const ivBuffer = Buffer.from(iv, "base64");
// //     const authTagBuffer = Buffer.from(authTag, "base64");

// //     // 🔓 Decrypt
// //     const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, ivBuffer);
// //     decipher.setAuthTag(authTagBuffer);

// //     let decrypted = decipher.update(encrypted, "base64", "utf-8");
// //     decrypted += decipher.final("utf-8");

// //     Logger.info("Data decrypted successfully");
// //     return JSON.parse(decrypted);
// //   }
// // }



// // export class Encryption {
// //   static encrypt({ data, userKey, centralKey,expiresAt }: {expiresAt?:string, data: string | Object | Array<any>, userKey: string, centralKey: string }): string {
// //     // const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiration

// //     // 🔑 Derive a strong encryption key
// //     const encryptionKey = KeyManager.deriveEncryptionKey({ userKey, centralKey });

// //     Logger.info("encryption starting",encryptionKey);
// //     // 🔀 Generate IV
// //     const iv = crypto.randomBytes(16);
// //     Logger.info("generated iv");

// //     // 🔒 Encrypt using AES-256-GCM
// //     const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
// //     const encryptedPayload = JSON.stringify({ data, expiresAt });
// //     Logger.info("generated cipher");
// //     let encrypted = cipher.update(encryptedPayload, "utf-8", "base64");
// //     encrypted += cipher.final("base64");

// //     const authTag = cipher.getAuthTag().toString("base64");

// //     // 🔏 Create a hash-based authentication code (HMAC) for tamper-proofing
// //     const hmac = crypto.createHmac("sha256", encryptionKey).update(encrypted + expiresAt).digest("hex");

// //     Logger.info("Data encrypted successfully");
// //     return Buffer.from(JSON.stringify({ encrypted, iv: iv.toString("base64"), authTag, hmac })).toString("base64");
// //   }

// //   static decrypt({ hash, centralKey }: { hash: string, centralKey: string }): Object {
// //     const decryptedObject = JSON.parse(Buffer.from(hash, "base64").toString("utf-8"));
// //     const { encrypted, iv, authTag, hmac } = decryptedObject;

    
// // console.log(decryptedObject,"decrypt")
// //     // Extract and validate expiration
// //     const encryptionKey = KeyManager.deriveEncryptionKey({ userKey: "1234", centralKey }); // UserKey will be extracted later
// //     const derivedHmac = crypto.createHmac("sha256", encryptionKey).update(encrypted + decryptedObject.expiresAt).digest("hex");

// //     if (derivedHmac !== hmac) {
// //       throw new Error("Data integrity check failed! Possible tampering detected.");
// //     }

// //     console.log(decryptedObject)



// //     // Convert IV & AuthTag
// //     const ivBuffer = Buffer.from(iv, "base64");
// //     const authTagBuffer = Buffer.from(authTag, "base64");

// //     // 🔓 Decrypt
// //     const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, ivBuffer);
// //     decipher.setAuthTag(authTagBuffer);

// //     let decrypted = decipher.update(encrypted, "base64", "utf-8");
// //     decrypted += decipher.final("utf-8");

// //     Logger.info("Data decrypted successfully");
// //     let v= JSON.parse(decrypted);
// //     if (v.expiresAt && Date.now() > v.expiresAt) {
// //       throw new Error("Encryption key has expired!");
// //     }

// //     return v
// //   }
// // }




// // let cnv =async({userKey,data,centralKey})=>{

// //   let en = await Encryption.encrypt({userKey,data,centralKey,})

// //   console.log(en)
// // let l ="eyJlbmNyeXB0ZWQiOiJ0Mi9JQVZwYTlMNnlPYXduNlM3OVpCZXdIOWEwNUtpeC82K0ZZUmpyREZZSW9LUEJiNDZUUW4ram9CV1NvNVpEVEhRYlJVSEFNVDJvK1RFPSIsIml2IjoiUTJ0Nks3cEhHaGtQMFIvR2J5NStpdz09IiwiYXV0aFRhZyI6ImFDd2ZvNnFDVndvblM5KzVLa1ZodWc9PSIsImhtYWMiOiIxMDkwMzg0NjkwNmZiMDJmNDEzNmI1OTExODk1YjkyMmUxZDg5ZDBhZDU2ZmVlMzgxZDdlOGM0N2U1N2U4MGI2IiwiZXhwaXJlc0F0IjoxNzQzNDI2MjcyMjg3LCJ1c2VyS2V5IjoiMTIzNCJ9"

// //   let dn = await Encryption.decrypt({hash:en,centralKey})
// //   console.log(dn)

// // }

// // cnv({userKey:"1234",data:"hello",centralKey:"sdfghffdssadfg"})


// // import crypto from "crypto";


// let cnv =async({userKey,data,centralKey,config})=>{

//   let en = await Encryption.encrypt({userKey,data,centralKey,config})

//   console.log(en)
// let l ="eyJlbmNyeXB0ZWQiOiJ0Mi9JQVZwYTlMNnlPYXduNlM3OVpCZXdIOWEwNUtpeC82K0ZZUmpyREZZSW9LUEJiNDZUUW4ram9CV1NvNVpEVEhRYlJVSEFNVDJvK1RFPSIsIml2IjoiUTJ0Nks3cEhHaGtQMFIvR2J5NStpdz09IiwiYXV0aFRhZyI6ImFDd2ZvNnFDVndvblM5KzVLa1ZodWc9PSIsImhtYWMiOiIxMDkwMzg0NjkwNmZiMDJmNDEzNmI1OTExODk1YjkyMmUxZDg5ZDBhZDU2ZmVlMzgxZDdlOGM0N2U1N2U4MGI2IiwiZXhwaXJlc0F0IjoxNzQzNDI2MjcyMjg3LCJ1c2VyS2V5IjoiMTIzNCJ9"

//   let dn = await Encryption.decrypt({hash:en,centralKey,config})
//   console.log(dn)

// }

// cnv({userKey:"123m4",data:"hello",centralKey:"sdfghffdssadfg",config:{
//   defaultKey:{key:"sdfghffdssadfg",v:0}
// }})





