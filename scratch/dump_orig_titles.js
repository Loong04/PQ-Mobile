const { execSync } = require('child_process');

const files = ['travel-claim.html', 'medical-claim.html', 'entertainment-claim.html', 'advance-claim.html'];

files.forEach(f => {
  console.log('====================================');
  console.log('FILE:', f);
  console.log('====================================');
  try {
    const raw = execSync('git show origin/main:modules/claims/options/' + f, { encoding: 'utf8' });
    
    // Find all titles, section headers, categories, tabs, etc.
    const matches = raw.match(/<[^>]+class="[^"]*(?:title|tab|category|header|label|accent)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi) || [];
    matches.forEach(m => {
      const clean = m.replace(/<[^>]+>/g, '').trim();
      if (clean && clean.length < 50) console.log('   - ', clean);
    });
  } catch (e) {
    console.error(e.message);
  }
});
