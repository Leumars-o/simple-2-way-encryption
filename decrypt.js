const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to decrypt the file
function decryptFile(inputFile, outputFile, encryptionKey) {
    const encryptionData = fs.readFileSync(inputFile, 'utf8');
    const [ivHex, encryptedContent] = encryptionData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(encryptionKey, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    fs.writeFileSync(outputFile, decrypted);
    console.log(`File decrypted and saved to ${outputFile}`);
}

// Function to validate and use the one-time decryption key
function useDecryptionKey(inputFile, providedKey) {
    const keyFile = `${inputFile}.key`;
    if (!fs.existsSync(keyFile)) {
        return null;
    }

    const keyData = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    if (keyData.decryptionKey === providedKey && !keyData.used) {
        keyData.used = true;
        fs.writeFileSync(keyFile, JSON.stringify(keyData, null, 2));
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
            decryptFile(inputFile, outputFile, encryptionKey);
            console.log('Decryption key has been used successfully');
        } else {
            console.log('Invalid or already used  decryption key');
        }

        rl.close();
    });
}

main();