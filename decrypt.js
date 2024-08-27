const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to decrypt the file
function decryptFile(inputFile, outputFile, encryptionKey) {
    const encryptedData = fs.readFileSync(inputFile, 'utf8');
    const [ivHex, encryptedContent, timestamp] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(encryptionKey, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    fs.writeFileSync(outputFile, decrypted);
    console.log(`File decrypted and saved to ${outputFile}`);
    return crypto.createHash('sha256').update(encryptedData).digest('hex');
}

// Function to validate and use the one-time decryption key
function useDecryptionKey(inputFile, providedKey) {
    const keyFile = `${inputFile}.key`;
    if (!fs.existsSync(keyFile)) {
        return null;
    }

    const keyData = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    const encryptedData = fs.readFileSync(inputFile, 'utf8');
    const currentHash = crypto.createHash('sha256').update(encryptedData).digest('hex');


    if (keyData.decryptionKey === providedKey && 
        keyData.fileHash === currentHash && 
        Date.now() - keyData.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
        return keyData.encryptionKey;
    }
    return null;
}

// Main Function
function main() {
    const inputFile = process.argv[2];
    const outputFile = process.argv[3];

    if (!inputFile || !outputFile) {
        console.log('Usage: node decrypt.js <inputFile> <outputFile>');
        process.exit(1);
    }

    rl.question('Enter the decryption key: ', (decryptionKey) => {
        const encryptionKey = useDecryptionKey(inputFile, decryptionKey);
        if (encryptionKey) {
            const newHash = decryptFile(inputFile, outputFile, encryptionKey);

            // Update the file hash to prevent reusing the decryption key
            const keyFile = `${inputFile}.key`;
            const keyData = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
            keyData.fileHash = newHash;
            keyData.timestamp = 0; // Mark the key as used
            fs.writeFileSync(keyFile, JSON.stringify(keyData, null, 2));
        } else {
            console.log('Invalid or already used decryption key, or file has been tampered with');
        }

        rl.close();
    });
}

main();
