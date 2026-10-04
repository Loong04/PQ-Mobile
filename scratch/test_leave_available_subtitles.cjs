const fs = require('fs');
const path = require('path');

const leaveHtml = fs.readFileSync(path.resolve(__dirname, '..', 'leave.html'), 'utf8');

if (/\d+(?:\.\d+)?\s+days available/i.test(leaveHtml)) {
  throw new Error('Leave cards must not repeat numeric days available subtitles');
}

if (!leaveHtml.includes('Subject to Manager Approval')) {
  throw new Error('Leave approval guidance must remain visible');
}

console.log('Leave availability subtitles are removed while guidance remains.');
