# Encryption SDK

This SDK provides AES-256-GCM encryption and decryption with key rotation, HMAC integrity checks, and expiration handling.

## Features
- AES-256-GCM encryption
- HMAC integrity protection
- Key rotation support
- Expiration-based encryption
- Configurable storage
- Cron-based automatic key rotation

## Installation
```sh
npm install cryptex-js
```

## Usage

### Encryption
```ts
import { Encryption } from "cryptex-js";

const config = {
  defaultKey: { key: "master-secret-key", v: 1 },
  key2: { key: "rotated-secret-key", v: 2 },
  rotation: true,
  cron: false, // Set to true if you want automatic key rotation
  store: yourStorageImplementation,
};

const encryptedData = Encryption.encrypt({
  data: { message: "Hello, world!" },
  userKey: "user-secret",
  config,
});
```

### Decryption
```ts
const decryptedData = Encryption.decrypt({ hash: encryptedData, userKey: "user-secret", config });
console.log(decryptedData); // { message: "Hello, world!" }
```

## Configuration Options
### GeneralConfig
```ts
interface GeneralConfig {
  defaultKey: { key: string; v: number };
  key2?: { key: string; v: number };
  rotation?: boolean;
  cron?: boolean;
  store?: StorageHandler;
}
```
- `defaultKey`: Primary encryption key.
- `key2`: Optional secondary key for rotation.
- `rotation`: If `true`, enables key rotation.
- `cron`: If `true`, enables automatic rotation at scheduled intervals.
- `store`: Storage system for managing encrypted data.

## Key Rotation
When `rotation` is enabled, the SDK will automatically use `key2` if available. If `cron` is also enabled, keys will rotate automatically at defined intervals.

```ts
if (config.rotation && !config.cron) {
  rotateKeys(config);
}
```

## Security Considerations
- Ensure `defaultKey` is securely stored and rotated periodically.
- Use a strong `userKey` for added security.
- Always verify HMAC integrity before decryption.

For more details, refer to the documentation.

