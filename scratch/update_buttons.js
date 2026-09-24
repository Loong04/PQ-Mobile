const fs = require('fs');

const files = [
  'C:/Users/loong/PQ-Mobile/modules/claims/options/travel-claim.html',
  'C:/Users/loong/PQ-Mobile/modules/claims/options/medical-claim.html',
  'C:/Users/loong/PQ-Mobile/modules/claims/options/entertainment-claim.html',
  'C:/Users/loong/PQ-Mobile/modules/claims/options/advance-claim.html'
];

const draftCss = `.btn-draft-bright {
      padding: 11px 24px;
      border-radius: 9999px;
      background: var(--bg-card);
      border: 1.5px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .btn-draft-bright:active {
      transform: scale(0.96);
    }`;

const submitCss = `.btn-submit-primary {
      padding: 11px 26px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border: none;
      color: #ffffff;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 4px 18px rgba(124, 58, 237, 0.45);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .btn-submit-primary:active {
      transform: scale(0.96);
      box-shadow: 0 2px 10px rgba(124, 58, 237, 0.35);
    }`;

const stepBackCss = `.btn-step-back {
      padding: 11px 22px;
      border-radius: 9999px;
      background: var(--bg-card);
      border: 1.5px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .btn-step-back:active {
      transform: scale(0.96);
    }`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  content = content.replace(/\.btn-draft-bright\s*\{[^}]*\}/g, draftCss);
  content = content.replace(/\.btn-submit-primary\s*\{[^}]*\}/g, submitCss);
  content = content.replace(/\.btn-step-back\s*\{[^}]*\}/g, stepBackCss);

  content = content.replace(/<span>Submit Claim<\/span>/g, '<span>Submit</span>');
  content = content.replace(/<span>Submit Request<\/span>/g, '<span>Submit</span>');

  fs.writeFileSync(f, content, 'utf8');
  console.log('Successfully updated:', f);
});
