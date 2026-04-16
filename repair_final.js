const fs = require('fs');
const path = "c:\\Users\\ADMIN\\OneDrive\\Desktop\\celest nextjs app\\src\\app\\admin\\page.tsx";
let lines = fs.readFileSync(path, 'utf8').split('\n');
// Filter out the specific corrupted line exactly as shown in view_file
// (which had a leading space and then 0">)
lines = lines.filter(line => line.trim() !== '0">');
fs.writeFileSync(path, lines.join('\n'));
console.log('Final repair complete.');
