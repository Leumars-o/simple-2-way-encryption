const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Function to encrypt the file
function encryptFile(inputFile, outputFile, encryptionKey) {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    const iv = crypto.randomBytes(16);

    // Convert the hex string to a Buffer
    const key = Buffer.from(encryptionKey, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(fileContent, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedData = iv.toString('hex') + ':' + encrypted;
    fs.writeFileSync(outputFile, encryptedData);
    console.log(`File encrypted and saved to ${outputFile}`);
}

// Function to generate a unique decryption key
function generateDecryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}

// Usage
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const encryptionKey = crypto.randomBytes(32).toString('hex');
const decryptionKey = generateDecryptionKey();

if (!inputFile || !outputFile) {
    console.log('Usage: node encrypt.js <inputFile> <outputFile>');
    process.exit(1);
}

encryptFile(inputFile, outputFile, encryptionKey);
console.log('One-time decryption key:', decryptionKey);

// Save the decryption key to a file
const keyData = {
    encryptionKey: encryptionKey,
    decryptionKey: decryptionKey,
    used: false
};

fs.writeFileSync(`${outputFile}.key`, JSON.stringify(keyData, null, 2));
console.log(`Decryption key saved to ${outputFile}.key`);
