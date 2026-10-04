const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const leaveHtml = fs.readFileSync(path.join(root, 'leave.html'), 'utf8');
const appCss = fs.readFileSync(path.join(root, 'css', 'app.css'), 'utf8');

for (const listId of [
  'uploadedFilesChipsList',
  'uploadedFilesChipsListCredit',
  'timeOffFilesChipsList'
]) {
  assert.match(
    leaveHtml,
    new RegExp(`id=["']${listId}["'][^>]*class=["'][^"']*form-attachment-list[^"']*["']`),
    `${listId} should use the shared form attachment list`
  );
}

assert.match(leaveHtml, /function createFormAttachmentItem\(file\)/);
assert.match(leaveHtml, /className = 'form-attachment-item'/);
assert.match(leaveHtml, /className = 'form-attachment-file-icon'/);
assert.match(leaveHtml, /className = 'form-attachment-file-name'/);
assert.match(leaveHtml, /className = 'form-attachment-remove'/);
assert.doesNotMatch(leaveHtml, /chip\.style\.cssText/);
assert.match(leaveHtml, /triggerFileUpload\('file', 'uploadedFilesChipsListCredit'\)/);

for (const className of [
  'form-attachment-list',
  'form-attachment-item',
  'form-attachment-file-icon',
  'form-attachment-file-name',
  'form-attachment-remove'
]) {
  assert.match(appCss, new RegExp(`\\.${className}\\b`), `Missing shared .${className} style`);
}

console.log('PASS: Leave forms use the consistent shared attachment design.');
