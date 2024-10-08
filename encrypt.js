const fs = require('fs');
const crypto = require('crypto');

// Function to encrypt the file
function encryptFile(inputFile, outputFile, encryptionKey) {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    const iv = crypto.randomBytes(16);

    // Convert the hex string to a Buffer
    const key = Buffer.from(encryptionKey, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(fileContent, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const timestamp = Date.now().toString();
    const encryptedData = `${iv.toString('hex')}:${encrypted}:${timestamp}`;
    fs.writeFileSync(outputFile, encryptedData);
    console.log(`File encrypted and saved to ${outputFile}`);
    return crypto.createHash('sha256').update(encryptedData).digest('hex');
}

// Function to generate a unique decryption key
function generateDecryptionKey() {
    return crypto.randomBytes(16).toString('hex');
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

const fileHash = encryptFile(inputFile, outputFile, encryptionKey);
console.log('One-time decryption key:', decryptionKey);

// Save the decryption key to a file
const keyData = {
    encryptionKey: encryptionKey,
    decryptionKey: decryptionKey,
    fileHash: fileHash,
    timestamp: Date.now()
};

fs.writeFileSync(`${outputFile}.key`, JSON.stringify(keyData, null, 2));
console.log(`Decryption key saved to ${outputFile}.key`);
