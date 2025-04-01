

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

---

## Using the Store

The `store` method allows you to securely store and retrieve encrypted data. This functionality can be extended by creating a custom store that follows the `Store` interface. The `MemoryStore` class provided in the SDK is a simple in-memory implementation of this interface.

### Example: Default Memory Store

You can use the built-in `MemoryStore` as a simple solution for in-memory storage of encrypted data.

```ts
import { MemoryStore } from "cryptex-js";

const store = new MemoryStore();
```

### Example: Custom Store Implementation

If you want to persist the encrypted data in a custom storage solution (e.g., database), you can extend the `MemoryStore` class or implement your own `Store` class.

```ts

import { MemoryStore } from 'cryptex-js';

class CustomStore extends MemoryStore {
  store(data: { userKey: string; hash: string; version: number }): void {
    // Your custom logic to save data (e.g., in a database)
    console.log('Storing data:', data);
  }

  get(filter: Record<string, any>): { userKey: string; hash: string; version: number } | null {
    // Your custom logic to retrieve data
    return super.get(filter);
  }

  // Other methods can be implemented as needed
}
```

### Configuring Your Store

Once you have a custom store class or wish to use the default store, you can configure it in your encryption setup.

```ts
const config = {
  defaultKey: { key: "master-secret-key", v: 1 },
  store: new CustomStore(), // Use the custom store here
};
```

### Storing Encrypted Data

You can now store the encrypted data securely using your configured store:

```ts
const encryptedData = Encryption.encrypt({
  data: { message: "Sensitive Information" },
  userKey: "user-secret-key", // Important: DO NOT expose this key
  centralKey:"custom key to use"
  config,
});

// Store the encrypted data
config.store.store({ userKey: "user-secret-key", hash: encryptedData, version: 1 });
```

### Retrieving Encrypted Data

To retrieve the stored encrypted data, use the `get` or `find` methods of your store:

```ts
const storedData = config.store.get({ userKey: "user-secret-key" });
if (storedData) {
  console.log("Retrieved Encrypted Data:", storedData);
}
```

---

## Important: **Never Expose the `userKey` or `centralKey`**

- **Never Expose the `userKey`:** The `userKey` is a sensitive value and should **never** be exposed in the client-side code, logs, or publicly accessible places. Store it securely in a safe environment like a secure server, environment variable, or a key management service.
- **Never Misplace the `centralKey`:** The `centralKey` is critical for encryption and decryption processes. Losing access to this key will make it impossible to decrypt any stored data. Ensure you store it securely and in a location that is backed up and accessible only to authorized personnel.

**Best Practices:**

- **Store `userKey` and `centralKey` securely:** Avoid hardcoding both keys directly into your source code. Instead, retrieve them securely from a trusted location like environment variables or key management services.
- **Keep keys in a vault:** Consider using a secure key management vault (e.g., AWS KMS, Azure Key Vault) to store sensitive keys.

---

## Key Rotation

The SDK supports automatic key rotation for added security. When `rotation` is enabled, the SDK will automatically use `key2` if available. If `cron` is also enabled, keys will rotate automatically at defined intervals.

### Checking Rotation Status

You can use the `rotateKeys` function to manage and check if key rotation has been performed:

```ts
function rotateKeys(config: GeneralConfig) {
  if (config.rotation && !config.cron) {
    // Rotate keys manually
    const currentKeyVersion = config.defaultKey.v;
    const newKeyVersion = currentKeyVersion + 1;
    const newKey = { key: "new-encryption-key", v: newKeyVersion };
    config.defaultKey = newKey; // Update to new key
    console.log(`Keys rotated to version ${newKeyVersion}`);
  }
}
```

### Automating Key Rotation

When `cron` is enabled, key rotation will happen automatically at specified intervals. This reduces the manual effort needed to keep the keys secure.

```ts
if (config.cron) {
  // Automatically rotate keys based on a cron schedule
  setInterval(() => rotateKeys(config), 86400000); // Rotate every 24 hours
}
```

### Manual Rotation

If you have key rotation enabled but prefer to manually rotate the keys at a specific time, you can trigger `rotateKeys` yourself.

```ts
rotateKeys(config);
```

This helps ensure that encryption keys are periodically rotated to prevent the risk of key exposure over time.

---

## Security Considerations

- **Always verify HMAC integrity** before decrypting any data.
- Ensure that the `defaultKey` and `key2` are securely stored and rotated periodically.
- Keep your `userKey` and `centralKey` secure at all times, and never expose them in logs or publicly accessible places.
- Use strong, unique encryption keys and rotate them regularly for added security.

---

## Contributions

This project is open-source, and we welcome contributions from the community! If you have any suggestions, improvements, or bug fixes, feel free to:

- **Fork** the repository and create a pull request.
- **Open an issue** on GitHub if you encounter any bugs or need further clarification.

We value your input and encourage you to contribute to the development of this SDK.

---

