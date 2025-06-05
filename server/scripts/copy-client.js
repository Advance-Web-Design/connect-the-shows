const fs = require('fs');
const path = require('path');

// Copy built client files
const source = path.join(__dirname, '..', '..', 'client', 'dist');
const dest = path.join(__dirname, '..', 'public', 'client');

fs.cpSync(source, dest, { recursive: true, force: true });

// Copy public assets (images, etc.) to server's public root
const publicSource = path.join(__dirname, '..', '..', 'client', 'public');
const publicDest = path.join(__dirname, '..', 'public');

if (fs.existsSync(publicSource)) {
    // Copy each file from client/public to server/public
    const files = fs.readdirSync(publicSource);
    files.forEach(file => {
        const srcFile = path.join(publicSource, file);
        const destFile = path.join(publicDest, file);
        fs.copyFileSync(srcFile, destFile);
    });
    console.log('Public assets copied successfully');
}

console.log('Client files copied successfully');