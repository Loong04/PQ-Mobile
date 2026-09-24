const { execSync } = require('child_process');

const files = ['travel-claim.html', 'medical-claim.html', 'entertainment-claim.html', 'advance-claim.html'];

files.forEach(f => {
  console.log('================', f, '================');
  try {
    const raw = execSync('git show origin/main:modules/claims/options/' + f, { encoding: 'utf8' });
    
    // Find all titles, section headers, categories, tabs, etc.
    const sectionHeaders = raw.match(/class="section-title-text">([^<]+)</g) || [];
    console.log('Section Headers:', sectionHeaders.map(s => s.replace('class="section-title-text">', '')));

    const catTitles = raw.match(/class="[^"]*category[^"]*">[\s\S]*?<\/div>/g) || [];
    console.log('Cat Titles matches count:', catTitles.length);

    // Also look for stepper or tab titles
    const allH2H3 = raw.match(/<(h2|h3|h4)[^>]*>([^<]+)<\/(h2|h3|h4)>/g) || [];
    console.log('Headings:', allH2H3.map(h => h.replace(/<[^>]+>/g, '').trim()));
  } catch (e) {
    console.error(e.message);
  }
});
