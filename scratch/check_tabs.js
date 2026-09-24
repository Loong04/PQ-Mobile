const fs = require('fs');
const files = ['advance-claim.html', 'medical-claim.html', 'entertainment-claim.html'];
files.forEach(f => {
  const content = fs.readFileSync('C:\\Users\\loong\\PQ-Mobile\\modules\\claims\\options\\' + f, 'utf8');
  const matches = [...content.matchAll(/class="step-title">([^<]+)/g)].map(m => m[1]);
  console.log(f + ': ' + matches.join(', '));
});
