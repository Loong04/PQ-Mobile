const { execSync } = require('child_process');

const files = ['travel-claim.html', 'medical-claim.html', 'entertainment-claim.html', 'advance-claim.html'];

files.forEach(f => {
  console.log('================', f, '================');
  try {
    const raw = execSync('git show origin/main:modules/claims/options/' + f, { encoding: 'utf8' });
    const titles = raw.match(/<div class="step-title">[\s\S]*?<\/div>/g) || [];
    console.log('Stepper step titles:', titles.map(t => t.replace(/<[^>]+>/g, '').trim()));
    const headers = raw.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) || [];
    console.log('H1 headers:', headers.map(h => h.replace(/<[^>]+>/g, '').trim()));
    const tabMatches = raw.match(/tab[A-Za-z0-9_-]*/g) || [];
    console.log('Tab references:', [...new Set(tabMatches)]);
  } catch (e) {
    console.error(e.message);
  }
});
