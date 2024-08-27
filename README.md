## File Cryptography

### Description:

This is a simple file encryption/decryption script that uses the `cryptography` library to encrypt and decrypt files. It generates a one-time decryption key that can only be used once to decrypt the file. Once used, the key becomes invalid, making the encrypted file unusable.

### How it works:

- The encryption script generates both an encryption key and a one-time decryption key.
- It saves the encrypted file and creates a separate key file (with a .key extension) containing the encryption key, decryption key, and usage status.
- The decryption script asks for the one-time decryption key.
- It checks if the provided key matches the stored key and hasn't been used.
- If valid, it decrypts the file, marks the key as used, and updates the key file.
- Once used, the decryption key becomes invalid, making the encrypted file unusable.

### Usage:

1. Run the encryption script to encrypt a file:
   ```
   node encrypt.js <file_path> encrypted_output.enc
   ```
   - Replace `<file_path>` with the path to the file you want to encrypt.

2. Run the decryption script to decrypt the file:
   ```
    node decrypt.js <file_path> decrypted_output.js
    ```
    - Replace `<file_path>` with the path to the encrypted file you want to decrypt.
