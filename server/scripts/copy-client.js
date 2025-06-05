const fs = require('fs');
const path = require('path');

// Copy built client files (excluding images that Vite already copied)
const source = path.join(__dirname, '..', '..', 'client', 'dist');
const dest = path.join(__dirname, '..', 'public', 'client');

// Custom copy function that excludes image files
function copyWithoutImages(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src, { withFileTypes: true });
    items.forEach(item => {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);
        
        if (item.isDirectory()) {
            copyWithoutImages(srcPath, destPath);
        } else if (!item.name.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
            // Only copy non-image files
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

copyWithoutImages(source, dest);

// Copy public assets (images, etc.) ONLY to server's public root
const publicSource = path.join(__dirname, '..', '..', 'client', 'public');
const publicDest = path.join(__dirname, '..', 'public');

if (fs.existsSync(publicSource)) {
    const files = fs.readdirSync(publicSource);
    files.forEach(file => {
        const srcFile = path.join(publicSource, file);
        const destFile = path.join(publicDest, file);
        
        // Copy ONLY to server's public root
        fs.copyFileSync(srcFile, destFile);
    });
    console.log('Public assets copied to root successfully');
}

console.log('Client files copied successfully');