const fs = require('fs');
const files = ['advance-claim.html', 'medical-claim.html', 'entertainment-claim.html', 'travel-claim.html'];
files.forEach(f => {
  const content = fs.readFileSync('C:\\Users\\loong\\PQ-Mobile\\modules\\claims\\options\\' + f, 'utf8');
  const matches = [...content.matchAll(/class="[^"]*tab-item[^"]*"[^>]*>(.*?)<\/div>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log(f + ': ' + matches.join(', '));
});
