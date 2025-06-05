const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', '..', 'client', 'dist');
const dest = path.join(__dirname, '..', 'public', 'client');

fs.cpSync(source, dest, { recursive: true, force: true });
console.log('Client files copied successfully');