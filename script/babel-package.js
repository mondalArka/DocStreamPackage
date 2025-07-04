const { copyFileSync } = require('fs');
const path = require('path');

copyFileSync(path.join(__dirname, '../package.json'), path.join(__dirname, '../dist/package.json'));