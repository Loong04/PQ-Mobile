const fs = require('fs');

const files = [
  'C:/Users/loong/PQ-Mobile/modules/claims/options/travel-claim.html',
  'C:/Users/loong/PQ-Mobile/modules/claims/options/medical-claim.html',
  'C:/Users/loong/PQ-Mobile/modules/claims/options/entertainment-claim.html',
  'C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Replace space-between wrapper containing Draft and Submit with flex-end and gap: 12px
  content = content.replace(
    /<div style="display:\s*flex;\s*justify-content:\s*space-between;\s*align-items:\s*center;\s*margin-top:\s*18px;">\s*(<button[^>]*class="btn-draft-bright"[\s\S]*?<\/button>)\s*(<button[^>]*class="btn-submit-primary"[\s\S]*?<\/button>)\s*<\/div>/g,
    '<div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 18px;">\n          $1\n          $2\n        </div>'
  );

  // Also replace any draft + submit container in view 1 / main content
  content = content.replace(
    /<div style="display:\s*flex;\s*justify-content:\s*space-between;[^"]*">\s*(<button[^>]*class="btn-draft-bright"[\s\S]*?<\/button>)\s*(<button[^>]*class="btn-submit-primary"[\s\S]*?<\/button>)\s*<\/div>/g,
    '<div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 18px;">\n          $1\n          $2\n        </div>'
  );

  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed button positions in:', f);
});
