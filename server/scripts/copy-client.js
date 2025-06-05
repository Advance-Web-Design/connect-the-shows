const fs = require('fs');
const path = require('path');

// Copy built client files
const source = path.join(__dirname, '..', '..', 'client', 'dist');
const dest = path.join(__dirname, '..', 'public', 'client');

fs.cpSync(source, dest, { recursive: true, force: true });

// Copy public assets (images, etc.) to BOTH locations
const publicSource = path.join(__dirname, '..', '..', 'client', 'public');
const publicDest = path.join(__dirname, '..', 'public');
const clientPublicDest = path.join(__dirname, '..', 'public', 'client');

if (fs.existsSync(publicSource)) {
    // Copy to server's public root
    const files = fs.readdirSync(publicSource);
    files.forEach(file => {
        const srcFile = path.join(publicSource, file);
        const destFile = path.join(publicDest, file);
        const clientDestFile = path.join(clientPublicDest, file);
        
        // Copy to both locations
        fs.copyFileSync(srcFile, destFile);
        fs.copyFileSync(srcFile, clientDestFile);
    });
    console.log('Public assets copied to both locations successfully');
}

console.log('Client files copied successfully');